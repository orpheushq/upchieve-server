var User = require('../models/User')

var daysOfWeek
var timesOfDay
var aggAvailabilities = {}

function aggregateAvailabilities (availability) {
  for (const day in availability) {
    for (const time in availability[day]) {
      // '$init' property and others are not skipped when nested
      if (time !== '$init' && availability[day].hasOwnProperty([time])) {
        if (!daysOfWeek) {
          daysOfWeek = Object.keys(availability)
          daysOfWeek.shift() // gets rid of $init enum param
        }
        if (!timesOfDay) {
          timesOfDay = Object.keys(availability[day])
          timesOfDay.shift() // gets rid of $init enum param
        }
        let dayIndex = daysOfWeek.indexOf(day) + 1
        let timeIndex = timesOfDay.indexOf(time) + 1
        if (availability[day][time]) {
          aggAvailabilities.table[dayIndex][timeIndex]++
        }

        let dayTimeCell = aggAvailabilities.table[dayIndex][timeIndex]
        if (aggAvailabilities.min === null || (dayTimeCell < aggAvailabilities.min)) {
          aggAvailabilities.min = dayTimeCell
        }
        if (dayTimeCell > aggAvailabilities.max) {
          aggAvailabilities.max = dayTimeCell
        }
      }
    }
  }
}

function addHeaders () {
  daysOfWeek.forEach(function (value, index) {
    aggAvailabilities.table[index + 1][0] = daysOfWeek[index]
  })
  timesOfDay.forEach(function (value, index) {
    aggAvailabilities.table[0][index + 1] = timesOfDay[index]
  })
}

module.exports = {
  getVolunteersAvailability: function (options, callback) {
    // resetting variables
    aggAvailabilities.table = Array(8).fill(0).map(() => Array(25).fill(0))
    aggAvailabilities.min = null
    aggAvailabilities.max = 0

    var certifiedSubjectQuery = options.certifiedSubject + '.passed'
    User.find({ isVolunteer: true, hasSchedule: true, [certifiedSubjectQuery]: true }, function (err, users) {
      if (err) {
        return callback(null, err)
      } else {
        users.forEach(function (user) {
          if (user.availability) aggregateAvailabilities(user.availability)
        })
        addHeaders()
        return callback(aggAvailabilities, null)
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
