var VolunteersCtrl = require('../../controllers/VolunteersCtrl')

module.exports = function (router) {
  router.get('/admin/volunteers/availability/:certifiedSubject', function (req, res) {
    console.log(req.params)
    var certifiedSubject = req.params.certifiedSubject
    VolunteersCtrl.getVolunteersAvailability(
      {
        certifiedSubject: certifiedSubject
      },
      function (err, userAvailabilityMap) {
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

  router.get('admin/volunteers', function (req, res) {
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
