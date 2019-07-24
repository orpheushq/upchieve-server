var User = require('../models/User')

/**
 * Helper function that, given a single users's
 * availability, adds when they are free to the
 * aggAvailabilities object
 * @param {*} availability
 */
function aggregateAvailabilities (availability, aggAvailabilities) {
  for (const day in availability) {
    for (const time in availability[day]) {
      // '$init' property and others are not skipped when nested
      if (time !== '$init' && availability[day].hasOwnProperty([time])) {
        // create headers based on the user's availability object
        if (!aggAvailabilities.daysOfWeek) {
          aggAvailabilities.daysOfWeek = Object.keys(availability)
          aggAvailabilities.daysOfWeek.shift() // gets rid of $init enum param
        }
        if (!aggAvailabilities.timesOfDay) {
          aggAvailabilities.timesOfDay = Object.keys(availability[day])
          aggAvailabilities.timesOfDay.shift() // gets rid of $init enum param
        }
        // adds 1 to leave room for headers
        let dayIndex = aggAvailabilities.daysOfWeek.indexOf(day) + 1
        let timeIndex = aggAvailabilities.timesOfDay.indexOf(time) + 1

        if (availability[day][time]) {
          aggAvailabilities.table[dayIndex][timeIndex]++
        }
      }
    }
  }
  return aggAvailabilities
}

function findMinAndMax (aggAvailabilities) {
  let flatTable = aggAvailabilities.table.flat()
  var filtered = flatTable.filter(function (item) {
    return !isNaN(item)
  })
  filtered.shift() // gets rid of top left empty cell
  aggAvailabilities.min = Math.min.apply(Math, filtered)
  aggAvailabilities.max = Math.max.apply(Math, filtered)
  return aggAvailabilities
}

/**
 * Helper function to add headers to the table once table is created
 */
function addHeaders (aggAvailabilities) {
  for (var dayIndex = 0; dayIndex < aggAvailabilities.daysOfWeek.length; dayIndex++) {
    aggAvailabilities.table[dayIndex + 1][0] = aggAvailabilities.daysOfWeek[dayIndex]
  }
  for (var timeIndex = 0; timeIndex < aggAvailabilities.timesOfDay.length; timeIndex++) {
    aggAvailabilities.table[0][timeIndex + 1] = aggAvailabilities.timesOfDay[timeIndex]
  }
  return aggAvailabilities
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
      var aggAvailabilities = {}
      aggAvailabilities.table = Array(8).fill(0).map(() => Array(25).fill(0))
      aggAvailabilities.min = null
      aggAvailabilities.max = 0
      aggAvailabilities.table[0][0] = ''

      if (err) {
        return callback(null, err)
      } else {
        users.forEach(function (user) {
          if (user.availability) {
            aggAvailabilities = aggregateAvailabilities(user.availability, aggAvailabilities)
          }
        })
        aggAvailabilities = addHeaders(aggAvailabilities)
        aggAvailabilities = findMinAndMax(aggAvailabilities)
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
