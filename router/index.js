var path = require('path')

var config = require('../config')

var errors = require('../errors')

module.exports = function (app) {
  console.log('Initializing server routing')

  require('./auth')(app)
  require('./api')(app)
  require('./edu')(app)
  require('./twiml')(app)

  // Determine if incoming request is a static asset
  var isStaticReq = function (req) {
    var whitelist = ['/auth', '/api', '/js', '/css', '/twiml']
    if (config.NODE_ENV === 'dev') {
      whitelist.push('/debug-sentry')
    }
    return whitelist.some(function (whitelisted) {
      return req.url.substr(0, whitelisted.length) === whitelisted
    })
  }

  // Check that Sentry is working
  if (config.NODE_ENV === 'dev') {
    app.get('/debug-sentry', function (req, res) {
      throw errors.generateError('ETEST', 'Test of Sentry')
    })
  }

  // Single page app routing
  app.use(function (req, res, next) {
    if (isStaticReq(req)) {
      return next()
    }
    res.sendFile(path.join(__dirname, '../dist/index.html'))
  })
}
