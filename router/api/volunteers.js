var VolunteersCtrl = require('../../controllers/VolunteersCtrl')

module.exports = function (router) {
  router.post('/volunteers/availability', function (req, res) {
    console.log(req.params.subject)
    VolunteersCtrl.getVolunteersAvailability({ subject: req.body.subject }, function (
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

  router.post('/volunteers', function (req, res) {
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
