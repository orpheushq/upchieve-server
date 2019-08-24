var VolunteersCtrl = require('../../controllers/VolunteersCtrl')
var passport = require('../auth/passport')

module.exports = function (router) {
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
    function (req, res) {
      var data = req.body

      VolunteersCtrl.editVolunteer(
        {
          userId: data._id,
          data: data,
          isAdmin: req.user.isAdmin
        },
        function (err, volunteer) {
          if (err) {
            res.json({
              err: err
            })
          } else if (!volunteer) {
            res.json({
              err: 'No volunteer found with that ID'
            })
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

  router.get('/volunteers/availability/:certifiedSubject',
    passport.isAdmin,
    function (req, res) {
      var certifiedSubject = req.params.certifiedSubject
      VolunteersCtrl.getVolunteersAvailability(
        {
          certifiedSubject: certifiedSubject
        },
        function (
          aggAvailabilities,
          err
        ) {
          if (err) {
            res.json({ err: err })
          } else {
            res.json({
              msg: 'Users retreived from database',
              aggAvailabilities: aggAvailabilities
            })
          }
        })
    })
}
