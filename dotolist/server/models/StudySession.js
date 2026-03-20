const mongoose = require('mongoose');

const studySessionSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  course: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Course',
    default: null
  },
  type: {
    type: String,
    enum: ['focus', 'shortBreak', 'longBreak'],
    default: 'focus'
  },
  duration: {
    type: Number,
    default: 25
  },
  completedAt: {
    type: Date,
    default: Date.now
  },
  sessionsCompleted: {
    type: Number,
    default: 1
  }
}, {
  timestamps: true
});

studySessionSchema.index({ user: 1, completedAt: -1 });

module.exports = mongoose.model('StudySession', studySessionSchema);
