var SessionCtrl = require('../../controllers/SessionCtrl')

var User = require('../../models/User')
var Session = require('../../models/Session')

var ObjectId = require('mongodb').ObjectId

module.exports = function (router) {
  router.route('/session/new').post(function (req, res) {
    var data = req.body || {}
    var sessionType = data.sessionType
    var sessionSubTopic = data.sessionSubTopic
    var user = req.user

    SessionCtrl.create(
      {
        user: user,
        type: sessionType,
        subTopic: sessionSubTopic
      },
      function (err, session) {
        if (err) {
          res.json({
            err: err
          })
        } else {
          res.json({
            sessionId: session._id
          })
        }
      }
    )
  })
  function addSession (usertype, session) {
    User.findById(usertype)
      .populate({
        path: 'pastSessions',
        model: Session
      })
      .exec(function (err, user) {
        if (err) {
          throw err
        } else if (Array.isArray(user.pastSessions)) {
          // find if the session already exists in pastSessions
          User.find({ 'pastSessions': session._id },
            function (err, results) {
              if (err) {
                throw err
              }
              // if the session doesn't exist, add it to pastSessions
              if (!results.length) {
                user.pastSessions.push(session._id)
                user.save(function (err, user) {
                  if (err) {
                    throw err
                  }
                })
              }
            })
        } else {
          // if the user has no sessions at all, initialize the array with the current session
          user.pastSessions = [session._id]
        }
      })
  }
  router.route('/session/end').post(function (req, res) {
    var data = req.body || {}
    var sessionId = data.sessionId
    SessionCtrl.get(
      {
        sessionId: sessionId
      },
      function (err, session) {
        if (err) {
          res.json({ err: err })
        } else if (!session) {
          res.json({ err: 'No session found' })
        } else {
          var student = session.student
          var volunteer = session.volunteer
          // add session to the student and volunteer's information
          addSession(student._id, session)
          if (volunteer) {
            addSession(volunteer._id, session)
          }
          session.endSession()
          res.json({ sessionId: session._id })
        }
      }
    )
  })

  router.route('/session/check').post(function (req, res) {
    var data = req.body || {}
    var sessionId = data.sessionId

    SessionCtrl.get(
      {
        sessionId: sessionId
      },
      function (err, session) {
        if (err) {
          res.json({
            err: err
          })
        } else if (!session) {
          res.json({
            err: 'No session found'
          })
        } else {
          res.json({
            sessionId: session._id,
            whiteboardUrl: session.whiteboardUrl
          })
        }
      }
    )
  })

  router.route('/session/current').post(function (req, res) {
    const data = req.body || {}
    const userId = data.user_id
    const isVolunteer = data.is_volunteer

    let studentId = null
    let volunteerId = null

    if (isVolunteer) {
      volunteerId = ObjectId(userId)
    } else {
      studentId = ObjectId(userId)
    }

    SessionCtrl.findLatest(
      {
        $and: [
          { endedAt: null },
          {
            $or: [{ student: studentId }, { volunteer: volunteerId }]
          }
        ]
      },
      function (err, session) {
        if (err) {
          res.json({ err: err })
        } else if (!session) {
          res.json({ err: 'No session found' })
        } else {
          res.json({
            sessionId: session._id,
            data: session
          })
        }
      }
    )
  })
}
