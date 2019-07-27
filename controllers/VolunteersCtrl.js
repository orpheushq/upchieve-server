var User = require('../models/User')
var UserCtrl = require('../controllers/UserCtrl')
// helper to check for errors before getting user profile

function getProfileIfSuccessful (volunteer, callback) {
  return function (err, volunteer) {
    if (err) {
      return callback(err)
    } else {
      volunteer.getProfile(callback)
    }
  }
}
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

    // Keys to virtual properties
    var virtualProps = ['phonePretty']

    // if updating a virtual property
    if (virtualProps.some(function (key) { return data[key] })) {
      // load model object into memory
      User.findById(userId, function (err, user) {
        if (err) {
          callback(err)
        } else {
          if (!user) {
            update = new User()
          } else {
            update = user
          }
          UserCtrl.iterateKeys(update, data, function (err, update) {
            if (err) {
              return callback(err)
            }
            // save the model that was loaded into memory, processing the virtuals
            update.save(getProfileIfSuccessful(user, callback))
          })
        }
      })
    } else {
      UserCtrl.iterateKeys(update, data, function (err, update) {
        if (err) {
          return callback('No fields defined to update')
        }
        console.log(update)
        // update the document directly (more efficient, but ignores virtual props)
        User.findByIdAndUpdate(userId, update, { new: true, runValidators: true }, getProfileIfSuccessful(user, callback))
      })
    }
  },

  getVolunteer: function (options, callback) {
    var userId = options.userId
    User.findById(userId, function (err, volunteer) {
      if (err || !volunteer) {
        callback('Could not get volunteer')
      } else {
        return callback(volunteer)
      }
    })
  }
}
