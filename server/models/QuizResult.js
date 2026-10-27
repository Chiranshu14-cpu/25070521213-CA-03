const mongoose = require('mongoose');

const quizResultSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null,
    index: true
  },
  answers: {
    dailyDistance: Number,
    budgetRange: String,
    seatingNeeds: Number,
    homeCharging: String,
    topPriority: String
  },
  rankedResults: [{
    vehicle: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Vehicle',
      required: true
    },
    vehicleSlug: String,
    vehicleName: String,
    manufacturer: String,
    score: Number,
    matchPercentage: Number,
    reason: String
  }]
}, {
  timestamps: true
});

module.exports = mongoose.model('QuizResult', quizResultSchema);
