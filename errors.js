var uid = require('node-uid')

var config = require('./config')

// Errors defined for the UPchieve app
var errors = {
  'EUIDNOTFOUND': 'No account with that id found.',
  'ESIDNOTFOUND': 'No session found',
  'ENOAUTH': 'Client has no authenticated session',
  'EBADDATA': 'Invalid request data'
}

// Appropriate response status codes for errors with properties with the given names
// matching the given values, including those not defined by UPchieve
var errorStatusCodes = {
  // User ID not found
  'code': {
    'EUIDNOTFOUND': 404,
    'ESIDNOTFOUND': 404,
    'ENOAUTH': 401,
    'EBADDATA': 400
  },
  // Mongoose validation failure
  'name': { 'ValidationError': 400 },
  '$allOthers': 500
}

// Error types that should not be reported to Sentry
var dontReport = [
  'ValidationError',
  'EUIDNOTFOUND',
  'ESIDNOTFOUND',
  'ENOAUTH',
  'EBADDATA'
]

// define a toJSON object that will serialize errors properly for transmission to client
if (!('toJSON' in Error.prototype)) {
  Object.defineProperty(Error.prototype, 'toJSON', {
    value: function () {
      var plainObj = {}

      if (config.NODE_ENV === 'dev') {
        Object.getOwnPropertyNames(this).forEach(function (key) {
          plainObj[key] = this[key]
        }, this)
      } else {
        plainObj.message = this.message
        plainObj.code = this.code
        plainObj.statusCode = this.statusCode
      }

      return plainObj
    }
  })
}

module.exports = {
  // codes, specific to the module that calls this function
  generateError: function (code, msg) {
    var err = new Error(msg || errors[code])
    err.code = code
    err.statusCode = this.statusFor(err)
    err._uid = uid()
    return err
  },

  statusFor: function (err) {
    return Object.entries(err).map(function (e1) {
      let [key1] = e1
      if (!errorStatusCodes[key1]) return undefined
      var statusCodeEntry = Object.entries(errorStatusCodes[key1]).find(function (e2) {
        let [key2] = e2
        return err[key1] === key2
      })
      if (statusCodeEntry) {
        return statusCodeEntry[1]
      } else {
        return undefined
      }
    }).find(function (c) {
      return (typeof (c)) !== 'undefined'
    }) || errorStatusCodes['$allOthers']
  },

  ERR_USER_NOT_FOUND: 'EUIDNOTFOUND',
  ERR_SESSION_NOT_FOUND: 'ESIDNOTFOUND',
  ERR_NOT_AUTHENTICATED: 'ENOAUTH',
  ERR_INVALID_DATA: 'EBADDATA',

  dontReport
}
