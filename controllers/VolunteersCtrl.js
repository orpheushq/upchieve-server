var User = require('../models/User')

module.exports = {
  getVolunteersAvailability: function (callback) {
    User.find({ hasSchedule: { $exists: true } }, function (err, users) {
      if (err) {
        return callback(err)
      } else {
        return callback(users)
      }
    })
  },

  getVolunteers: function (callback) {
    User.find({ isVolunteer: true }, function (err, volunteers) {
      if (err) {
        return callback(err)
      } else {
        return callback(volunteers)
      }
    })
  },

  editVolunteer: function (options, callback) {
    var userId = options.userId

    var data = options.data || {}

    var update = {}
    var hasUpdate = false
    if (data['isVolunteerApproved']) {
      update['isVolunteerApproved'] = data['isVolunteerApproved']
      hasUpdate = true
    }
    if (!hasUpdate) {
      callback('No fields defined to update')
    } else {
      User.findByIdAndUpdate(userId, update, { new: true, runValidators: true }, callback)
    }
  }
}
