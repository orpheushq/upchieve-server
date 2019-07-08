var User = require('../models/User')

var errors = require('../errors')

module.exports = {
  get: function (options, callback) {
    var userId = options.userId
    User.findById(userId, function (err, user) {
      if (err) {
        callback(err)
      } else if (!user) {
        callback(errors.generateError(errors.ERR_USER_NOT_FOUND))
      } else {
        user.getProfile(callback)
      }
    })
  },
  update: function (options, callback) {
    var userId = options.userId

    var data = options.data || {}

    var update = {}

    var hasUpdate = false
    // Define and iterate through keys to add to update object

    ;[
      'firstname',
      'lastname',
      'nickname',
      'picture',
      'birthdate',
      'serviceInterests',
      'gender',
      'race',
      'groupIdentification',
      'computerAccess',
      'preferredTimes',
      'phone',
      'highschool',
      'currentGrade',
      'expectedGraduation',
      'difficultAcademicSubject',
      'difficultCollegeProcess',
      'highestLevelEducation',
      'hasGuidanceCounselor',
      'gpa',
      'college',
      'collegeApplicationsText',
      'commonCollegeDocs',
      'academicInterestsText',
      'testScoresText',
      'advancedCoursesText',
      'favoriteAcademicSubject',
      'extracurricularActivitesText',
      'referred',
      'heardFrom'
    ].forEach(function (key) {
      if (data[key]) {
        update[key] = data[key]
        hasUpdate = true
      }
    })
    if (!hasUpdate) {
      return callback(errors.generate(errors.ERR_INVALID_DATA, 'No fields defined to update'))
    }

    User.findByIdAndUpdate(userId, update, { new: true, runValidators: true }, function (err, user) {
      if (err) {
        return callback(err)
      } else {
        user.getProfile(callback)
      }
    })
  }
}
