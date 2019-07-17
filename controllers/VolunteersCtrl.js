var User = require('../models/User')

module.exports = {
getVolunteersAvailability: function(callback){
    User.find({}, function(err, users){
      if(err){
        return callback(err)
      }
      else{
        var userAvailabilityMap = {}
        users.forEach(function(user) {
          if(user.hasSchedule && user.isVolunteer){
            userAvailabilityMap[user._id] = user.availability;
          }
        })
        return callback(userAvailabilityMap)
      }
    })
  },

  getVolunteers: function(callback){
    User.find({}, function(err, users){
        if(err){
            return callback(err)
        }
        else{
            var usersToReturn = {}
            users.forEach(function(user){
                if(user.isVolunteer){
                    usersToReturn[user._id] = user
                }
            })
            return callback(usersToReturn)
        }
    })
    }
}