const completeCtrl = require('../../controllers/CompleteCtrl')

module.exports = router => {
  router.post('/complete', (req, res, next) => {
    completeCtrl.getSuggestions(req.body.query, (err, suggestions) => {
      if (err) {
        next(err)
      } else {
        res.json({ suggestions })
      }
    })
  })
}
