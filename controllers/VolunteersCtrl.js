var User = require('../models/User')

var daysOfWeek // column headers
var timesOfDay // row headers
var aggAvailabilities = {}

/**
 * Helper function that, given a single users's
 * availability, adds when they are free to the
 * aggAvailabilities object
 * @param {*} availability
 */
function aggregateAvailabilities (availability) {
  for (const day in availability) {
    for (const time in availability[day]) {
      // '$init' property and others are not skipped when nested
      if (time !== '$init' && availability[day].hasOwnProperty([time])) {
        // create headers based on the user's availability object
        if (!daysOfWeek) {
          daysOfWeek = Object.keys(availability)
          daysOfWeek.shift() // gets rid of $init enum param
        }
        if (!timesOfDay) {
          timesOfDay = Object.keys(availability[day])
          timesOfDay.shift() // gets rid of $init enum param
        }
        // adds 1 to leave room for headers
        let dayIndex = daysOfWeek.indexOf(day) + 1
        let timeIndex = timesOfDay.indexOf(time) + 1

        if (availability[day][time]) {
          aggAvailabilities.table[dayIndex][timeIndex]++
        }

        let dayTimeCell = aggAvailabilities.table[dayIndex][timeIndex]

        // tracks the min and max # of volunteers who signed up for any time this week
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

/**
 * Helper function to add headers to the table once table is created
 */
function addHeaders () {
  daysOfWeek.forEach(function (value, index) {
    aggAvailabilities.table[index + 1][0] = daysOfWeek[index]
  })
  timesOfDay.forEach(function (value, index) {
    aggAvailabilities.table[0][index + 1] = timesOfDay[index]
  })
}

module.exports = {
  /**
   * Gets all users who are volunteers, and who are certified in the
   * subject passed in, and aggregates their availability tables into
   * aggAvailabilities.table
   * @param {*} options
   * @param {*} callback
   */
  getVolunteersAvailability: function (options, callback) {
    var certifiedSubjectQuery = options.certifiedSubject + '.passed'
    User.find({ isVolunteer: true, hasSchedule: true, [certifiedSubjectQuery]: true }, function (err, users) {

      // defining and resetting variables
      aggAvailabilities.table = Array(8).fill(0).map(() => Array(25).fill(0))
      aggAvailabilities.min = null
      aggAvailabilities.max = 0
      aggAvailabilities.table[0][0] = ''

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

  /**
   * Gets all users who are volunteers
   * @param {*} callback
   */
  getVolunteers: function (callback) {
    User.find({ isVolunteer: true }, function (err, users) {
      if (err) {
        return callback(null, err)
      } else {
        return callback(users, null)
      }
    })
  }
}
