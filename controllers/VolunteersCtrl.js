var User = require('../models/User')

module.exports = {
  getVolunteersAvailability: function (options, callback) {
    var certifiedSubjectQuery = options.certifiedSubject + '.passed'
    User.find({ isVolunteer: true, hasSchedule: true, [certifiedSubjectQuery]: true }, function (err, users) {
      if (err) {
        return callback(err, null)
      } else {
        var userAvailabilityMap = {}
        users.forEach(function (user) {
          // if (user[certifiedSubject].passed) {
          userAvailabilityMap[user._id] = user.availability
          // }
        })
        return callback(null, userAvailabilityMap)
      }
    })
  },

  getVolunteers: function (callback) {
    User.find({}, function (err, users) {
      if (err) {
        return callback(err)
      } else {
        var usersToReturn = {}
        users.forEach(function (user) {
          if (user.isVolunteer) {
            usersToReturn[user._id] = user
          }
        })
        return callback(usersToReturn)
      }
    })
  }
}
