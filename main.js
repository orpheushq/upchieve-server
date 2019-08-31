// Dependencies
var http = require('http')
var express = require('express')
const expressLayouts = require('express-ejs-layouts')
var path = require('path')
var logger = require('morgan')
var cookieParser = require('cookie-parser')
var bodyParser = require('body-parser')
var busboy = require('connect-busboy')
var cors = require('cors')
var mongoose = require('mongoose')
var observableArray = require('observable-array')

// Configuration
var config = require('./config')

var errors = require('./errors')

// Database
mongoose.connect(config.database, { useNewUrlParser: true })
var db = mongoose.connection
db.on('error', console.error.bind(console, 'connection error:'))
db.once('open', function () {
  console.log('Connected to database')
})

var app = express()
app.set('port', process.env.PORT || 3000)
app.set('view engine', 'ejs')
app.use(expressLayouts)

// Error tracking
const sentry = require('@sentry/node')

// A SentryErrorEvent contains an error object and associated Sentry event ID
var SentryErrorEvent = function (options) {
  this.errorId = options.errorId || options.err._uid
  this.eventId = options.eventId
}
const sentryErrorEvents = observableArray()

sentry.init({
  dsn: config.sentryDsn,
  environment: config.NODE_ENV,
  beforeSend (event, hint) {
    if (event.exception) {
      // don't report if error has a property matching one of those specified in errors.js
      if (errors.dontReport.some(function (e) {
        return event.exception.values[0].type === e
      }) || errors.statusCode === 422) {
        return null
      } else {
        console.log('errorId: ' + hint.originalException._uid + ', eventId: ' + event.event_id)
        sentryErrorEvents.push(new SentryErrorEvent({
          errorId: hint.originalException._uid,
          eventId: event.event_id
        }))
      }
    }

    return event
  }
})

// Setup middleware
// error handling
app.use(sentry.Handlers.requestHandler()) // this has to come before any other middleware

app.use(logger('dev'))
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: true }))
app.use(cookieParser(config.sessionSecret))
app.use(express.static(path.join(__dirname, 'dist')))
app.use(busboy())
app.use(
  cors({
    origin: true,
    credentials: true
  })
)
// see https://stackoverflow.com/questions/51023943/nodejs-getting-username-of-logged-in-user-within-route
app.use(function (req, res, next) {
  res.locals.user = req.user || null
  next()
})

var server = http.createServer(app)

var port = app.get('port')
server.listen(port)
console.log('Listening on port ' + port)

// Load server router
require('./router')(app)

// Error handling middleware
// function for processing errors in API routes when the Sentry ID is obtained
function processErrorEvent (err, req, res, sentryEvent, cb) {
  // respond with appropriate status code
  cb(err, req, res.status(errors.statusFor(err)), sentryEvent)

  // remove the event from the observable array
  if (sentryEvent) {
    sentryErrorEvents.splice(sentryErrorEvents.findIndex(function (e) {
      return e === sentryEvent
    }), 1)
  }
}

// Respond to an error with the appropriate callback and the sentryEventId
function respondError (err, req, res, next, cb) {
  //look for the eventId in the observable array
  var filteredErrorEvents = sentryErrorEvents.filter(function (e) { return e.errorId === err._uid })
  if (filteredErrorEvents.length === 0) {
    if (!errors.shouldReport(err)) {
      processErrorEvent(err, req, res, undefined, cb)
    } else {
      // wait for Sentry to prepare the event id before responding
      var pushHandler = function (event) {
        if (event.type === 'push') {
          processErrorEvent(err, req, res, event.values[0], cb)
          filteredErrorEvents.off('change', pushHandler)
        }
      }
      filteredErrorEvents.on('change', pushHandler)
    }
  } else {
    processErrorEvent(err, req, res, filteredErrorEvents[0], cb)
  }
}

app.use(sentry.Handlers.errorHandler()) // this has to come before any other error middleware
app.use(['/api', '/auth'], function (err, req, res, next) {
  respondError(err, req, res, next, (e, rq, rs, sentryEvent) => { 
    rs.json({
      err: e,
      sentryEventId: sentryEvent ? sentryEvent.eventId : undefined
    })
  })
})
app.use('/edu', function (err, req, res, next) {
  if (err.isApi) {
    respondError(err, req, res, next, (e, rq, rs, sentryEvent) => { 
      rs.json({
        err: e,
        sentryEventId: sentryEvent ? sentryEvent.eventId : undefined
      })
    })
  } else {
    respondError(err, req, res, next, (e, rq, rs, sentryEvent) => { 
      rs.render('edu/error', {
        layout: 'layouts/edu',
        error: e,
        homeLink: config.NODE_ENV === 'dev' ? 'http://localhost:8080' : '/',
        isActive: navUrl => false,
        statusMessage: 'Internal Server Error',
        sentryDsn: config.sentryDsn,
        sentryEventId: sentryEvent ? sentryEvent.eventId : undefined
      })
    })
  }
})
