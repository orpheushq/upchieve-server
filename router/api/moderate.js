const sentry = require('@sentry/node')

const ModerationCtrl = require('../../controllers/ModerationCtrl')

module.exports = router => {
  router.route('/moderate/message').post((req, res) => {
    ModerationCtrl.moderateMessage(req.body, (err, isClean) => {
      if (err) {
        sentry.captureException(err)
        res.json({ err })
      } else {
        res.json({ isClean })
      }
    })
  })
}
