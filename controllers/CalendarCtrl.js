var User = require('../models/User')

var errors = require('../errors')

module.exports = {
  initAvailability: function (options, callback) {
    var userid = options.userid
    var availability = {
      Sunday: {
        '12a': false,
        '1a': false,
        '2a': false,
        '3a': false,
        '4a': false,
        '5a': false,
        '6a': false,
        '7a': false,
        '8a': false,
        '9a': false,
        '10a': false,
        '11a': false,
        '12p': false,
        '1p': false,
        '2p': false,
        '3p': false,
        '4p': false,
        '5p': false,
        '6p': false,
        '7p': false,
        '8p': false,
        '9p': false,
        '10p': false,
        '11p': false
      },
      Monday: {
        '12a': false,
        '1a': false,
        '2a': false,
        '3a': false,
        '4a': false,
        '5a': false,
        '6a': false,
        '7a': false,
        '8a': false,
        '9a': false,
        '10a': false,
        '11a': false,
        '12p': false,
        '1p': false,
        '2p': false,
        '3p': false,
        '4p': false,
        '5p': false,
        '6p': false,
        '7p': false,
        '8p': false,
        '9p': false,
        '10p': false,
        '11p': false
      },
      Tuesday: {
        '12a': false,
        '1a': false,
        '2a': false,
        '3a': false,
        '4a': false,
        '5a': false,
        '6a': false,
        '7a': false,
        '8a': false,
        '9a': false,
        '10a': false,
        '11a': false,
        '12p': false,
        '1p': false,
        '2p': false,
        '3p': false,
        '4p': false,
        '5p': false,
        '6p': false,
        '7p': false,
        '8p': false,
        '9p': false,
        '10p': false,
        '11p': false
      },
      Wednesday: {
        '12a': false,
        '1a': false,
        '2a': false,
        '3a': false,
        '4a': false,
        '5a': false,
        '6a': false,
        '7a': false,
        '8a': false,
        '9a': false,
        '10a': false,
        '11a': false,
        '12p': false,
        '1p': false,
        '2p': false,
        '3p': false,
        '4p': false,
        '5p': false,
        '6p': false,
        '7p': false,
        '8p': false,
        '9p': false,
        '10p': false,
        '11p': false
      },
      Thursday: {
        '12a': false,
        '1a': false,
        '2a': false,
        '3a': false,
        '4a': false,
        '5a': false,
        '6a': false,
        '7a': false,
        '8a': false,
        '9a': false,
        '10a': false,
        '11a': false,
        '12p': false,
        '1p': false,
        '2p': false,
        '3p': false,
        '4p': false,
        '5p': false,
        '6p': false,
        '7p': false,
        '8p': false,
        '9p': false,
        '10p': false,
        '11p': false
      },
      Friday: {
        '12a': false,
        '1a': false,
        '2a': false,
        '3a': false,
        '4a': false,
        '5a': false,
        '6a': false,
        '7a': false,
        '8a': false,
        '9a': false,
        '10a': false,
        '11a': false,
        '12p': false,
        '1p': false,
        '2p': false,
        '3p': false,
        '4p': false,
        '5p': false,
        '6p': false,
        '7p': false,
        '8p': false,
        '9p': false,
        '10p': false,
        '11p': false
      },
      Saturday: {
        '12a': false,
        '1a': false,
        '2a': false,
        '3a': false,
        '4a': false,
        '5a': false,
        '6a': false,
        '7a': false,
        '8a': false,
        '9a': false,
        '10a': false,
        '11a': false,
        '12p': false,
        '1p': false,
        '2p': false,
        '3p': false,
        '4p': false,
        '5p': false,
        '6p': false,
        '7p': false,
        '8p': false,
        '9p': false,
        '10p': false,
        '11p': false
      }
    }

    User.findOne({ _id: userid }, function (err, user) {
      if (err) {
        return callback(err)
      }
      if (!user) {
        return callback(errors.generateError(errors.ERR_USER_NOT_FOUND))
      }
      user.availability = availability
      user.hasSchedule = true
      user.timezone = ''
      user.save(function (err, user) {
        if (err) {
          callback(err, null)
        } else {
          callback(null, availability)
        }
      })
    })
  },

  getAvailability: function (options, callback) {
    var userid = options.userid
    User.findOne({ _id: userid }, function (err, user) {
      if (err) {
        return callback(err)
      }
      if (!user) {
        return callback(errors.generateError(errors.ERR_USER_NOT_FOUND))
      }
      callback(null, user.availability)
    })
  },

  updateAvailability: function (options, callback) {
    var userid = options.userid
    var availability = options.availability
    User.findOne({ _id: userid }, function (err, user) {
      if (err) {
        return callback(err)
      }
      if (!user) {
        return callback(errors.generateError(errors.ERR_USER_NOT_FOUND))
      }
      user.availability = availability
      user.save(function (err, user) {
        if (err) {
          callback(err, null)
        } else {
          callback(null, availability)
        }
      })
    })
  },

  updateTimezone: function (options, callback) {
    var userid = options.userid
    var tz = options.tz
    User.findOne({ _id: userid }, function (err, user) {
      if (err) {
        return callback(err)
      }
      if (!user) {
        return callback(errors.generateError(errors.ERR_USER_NOT_FOUND))
      }
      user.timezone = tz
      user.save(function (err, user) {
        if (err) {
          callback(err, null)
        } else {
          callback(null, tz)
        }
      })
    })
  },

  getTimezone: function (options, callback) {
    var userid = options.userid
    User.findOne({ _id: userid }, function (err, user) {
      if (err) {
        return callback(err)
      }
      if (!user) {
        return callback(errors.generateError(errors.ERR_USER_NOT_FOUND))
      }
      callback(null, user.timezone)
    })
  }
}
