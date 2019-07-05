// Dependencies
var http = require('http')
var express = require('express')
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

// Error tracking
var sentry = require('@sentry/node')

// A SentryErrorEvent contains an error object and associated Sentry event ID
var SentryErrorEvent = function (options) {
  this.errorId = options.errorId || options.err._uid
  this.eventId = options.eventId
}
var sentryErrorEvents = observableArray()

sentry.init({
  dsn: config.sentryDsn,
  environment: config.NODE_ENV,
  beforeSend (event, hint) {
    if (event.exception) {
      // don't report if error has a property matching one of those specified in errors.js
      if (errors.dontReport.some(function (e) {
        return event.exception.values[0].type === e
      })) {
        return null
      } else {
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

var server = http.createServer(app)

var port = app.get('port')
server.listen(port)
console.log('Listening on port ' + port)

// Load server router
require('./router')(app)

// Error handling middleware
function jsonErrorResponse(err, req, res, sentryEventId) {
  // respond with appropriate status code
  res.status(errors.statusFor(err)).json({
    err: err,
    sentryEventId: sentryEventId
  })
}

app.use(sentry.Handlers.errorHandler()) // this has to come before any other error middleware
app.use(['/api', '/auth'], function (err, req, res, next) {
  // look for the eventId in the observable array
  var filteredErrorEvents = sentryErrorEvents.filter(function(e) { return e.errorId === err._uid })
  if (filteredErrorEvents.length === 0) {
    if (errors.dontReport.some(function (e) { return err.name === e || err.code === e })) {
      jsonErrorResponse(err, req, res)
    } else {
      // wait for Sentry to prepare the event id before responding
      var pushHandler = function (event) {
        if (filteredErrorEvents.length > 0) {
          jsonErrorResponse(err, req, res, filteredErrorEvents[0].eventId)
          sentryErrorEvents.pop()
          filteredErrorEvents.off('change', pushHandler)
        }
      }
      filteredErrorEvents.on('change', pushHandler)
    }
  } else {
    jsonErrorResponse(err, req, res, filteredErrorEvents[0].eventId)
    sentryErrorEvents.pop()
  }
})
