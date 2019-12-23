var mongoose = require('mongoose')

var feedbackSchema = new mongoose.Schema({
  session: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Session'
  },

  type: {
    type: String,
    default: ''
  },

  subTopic: {
    type: String,
    default: ''
  },

  responseData: {
    type: Object,
    default: ''
  },

  userType: {
    type: String,
    default: ''
  },

  studentId: {
    type: String,
    default: ''
  },

  volunteerId: {
    type: String,
    default: ''
  },

  createdAt: {
    type: Date,
    default: Date.now
  }
})

module.exports = mongoose.model('Feedback', feedbackSchema)
