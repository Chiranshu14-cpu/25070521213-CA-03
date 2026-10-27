const mongoose = require('mongoose');

const testDriveRequestSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },
  vehicle: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Vehicle',
    required: true
  },
  name: {
    type: String,
    required: [true, 'Name is required'],
    trim: true
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    trim: true,
    lowercase: true,
    match: [/^\S+@\S+\.\S+$/, 'Please provide a valid email']
  },
  preferredDate: {
    type: Date,
    required: [true, 'Preferred date is required']
  },
  timeWindow: {
    type: String,
    required: [true, 'Preferred time window is required'],
    enum: ['Morning (09:00 - 12:00)', 'Afternoon (12:00 - 16:00)', 'Evening (16:00 - 19:00)']
  },
  message: {
    type: String,
    trim: true,
    default: ''
  },
  status: {
    type: String,
    enum: ['pending', 'contacted', 'cancelled'],
    default: 'pending'
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('TestDriveRequest', testDriveRequestSchema);
