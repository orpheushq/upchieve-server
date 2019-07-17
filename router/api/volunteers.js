var VolunteersCtrl = require('../../controllers/VolunteersCtrl')

module.exports = function (router) {
  router.post('/admin/volunteers/availability', function (req, res) {
    VolunteersCtrl.getVolunteersAvailability(function (
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

  router.post('admin/volunteers', function (req, res) {
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
