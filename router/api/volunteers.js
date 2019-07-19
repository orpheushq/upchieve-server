var VolunteersCtrl = require('../../controllers/VolunteersCtrl')

module.exports = function (router) {
  router.get('/volunteers/availability/:certifiedSubject', function (req, res) {
    var certifiedSubject = req.params.certifiedSubject
    VolunteersCtrl.getVolunteersAvailability(
      {
        certifiedSubject: certifiedSubject
      },
      function (
        userAvailabilityMap,
        err
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

  router.get('/volunteers', function (req, res) {
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
}
