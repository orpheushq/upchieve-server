var VolunteersCtrl = require('../../controllers/VolunteersCtrl')
var passport = require('../auth/passport')

module.exports = function (router) {
  router.get('/volunteers/availability',
    passport.isAdmin,
    function (req, res) {
      VolunteersCtrl.getVolunteersAvailability(function (
        err,
        userAvailabilityMap
      ) {
        if (err) {
          res.json({ err: err })
        } else {
          res.json({
            msg: 'Users retreived from database',
            userAvailabilityMap: userAvailabilityMap
          })
        }
      })
    })

  router.get('/volunteers',
    passport.isAdmin,
    function (req, res) {
      VolunteersCtrl.getVolunteers(function (
        volunteers,
        err
      ) {
        if (err) {
          res.json({ err: err })
        } else {
          res.json({
            msg: 'Users retreived from database',
            volunteers: volunteers
          })
        }
      })
    })

  router.post('/volunteers/:id',
    passport.isAdmin,
    function (req, res) {
      var data = req.body
      VolunteersCtrl.editVolunteer(
        {
          userId: data._id,
          data: data
        },
        function (volunteer, err) {
          if (err) {
            res.json({ err: err })
          } else {
            res.json({
              volunteer: volunteer
            })
          }
        })
    })
  router.get('/volunteers/:id',
    passport.isAdmin,
    function (req, res) {
      var data = req.params
      VolunteersCtrl.getVolunteer(
        {
          userId: data.id
        },
        function (volunteer, err) {
          if (err) {
            res.json({ err: err })
          } else {
            res.json({
              volunteer: volunteer
            })
          }
        })
    })
}
