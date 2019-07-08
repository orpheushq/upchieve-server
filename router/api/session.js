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
  function addSession(usertype, session) {
    User.findById(usertype)
      .populate({
        path: 'pastSessions',
        model: Session
      })
      .exec(function (err, user) {
          if (err) {
            return handleError(err)
          }
          else if (Array.isArray(user.pastSessions)) {
            User.find({'pastSessions': session._id},
              function (err, results) {
                if (err) { 
                  throw err
                 }
                if (!results.length) {
                  console.log(results)
                  user.pastSessions.push(session._id)
                  user.save(function (err, user) {
                    if (err) {
                      throw err
                    }
                  });
                }
              })
          }
          else {
            user.pastSessions = [session._id];
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
          var student = session.student._id
          var volunteer = session.volunteer._id
          addSession(student, session)
          addSession(volunteer, session)
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
