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
sentry.init({
  dsn: config.sentryDsn,
  environment: config.NODE_ENV,
  beforeSend (event) {
    // don't report if error has a property matching one of those specified in errors.js
    if (errors.dontReport.some(function (e) {
      return event.exception[e[0]] === e[1]
    })) {
      return null
    }

    return event
  }
})

// Setup middleware
// error handling
app.use(sentry.Handlers.requestHandler()) // this has to come before any other middleware
app.use(['/api', '/auth'], function (err, req, res, next) {
  // respond with appropriate status code
  res.status(errors.statusFor(err)).json({
    err: err
  })
})

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
app.use(sentry.Handlers.errorHandler()) // this has to come before any other error middleware
