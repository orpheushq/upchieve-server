const mongoose = require('mongoose')
const dbconnect = require('./dbconnect')

const Feedback = require('../models/Feedback')

dbconnect(mongoose, function () {
  Feedback.find({
    session: { $exists: false }
  }).then(feedbacks => {
    const feedbackUpdatePromises = feedbacks.map(f => {
      const fRawObj = f.toObject()

      console.log(`Migrating feedback submission ${f._id}`)

      // add "session" property
      f.set('session', fRawObj.sessionId ? mongoose.Types.ObjectId(fRawObj.sessionId) : undefined)

      // remove old "sessionId" property
      f.set('sessionId', undefined, { strict: false })

      // save
      return f.save()
    })

    return Promise.all(feedbackUpdatePromises)
  }).catch(err => {
    console.log(err)
  }).finally(() => {
    mongoose.disconnect()
  })
})
