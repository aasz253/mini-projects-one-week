const mongoose = require('mongoose');

const courseSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  name: {
    type: String,
    required: [true, 'Please provide course name'],
    trim: true,
    maxlength: [100, 'Course name cannot exceed 100 characters']
  },
  code: {
    type: String,
    required: [true, 'Please provide course code'],
    trim: true,
    uppercase: true,
    maxlength: [20, 'Course code cannot exceed 20 characters']
  },
  color: {
    type: String,
    default: '#6366f1',
    match: [/^#[0-9A-Fa-f]{6}$/, 'Please provide a valid hex color']
  },
  instructor: {
    type: String,
    maxlength: [100, 'Instructor name cannot exceed 100 characters'],
    default: ''
  },
  schedule: [{
    day: {
      type: String,
      enum: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']
    },
    startTime: String,
    endTime: String,
    venue: String
  }],
  examDate: {
    type: Date,
    default: null
  },
  notes: {
    type: String,
    maxlength: [10000, 'Notes cannot exceed 10000 characters'],
    default: ''
  },
  credits: {
    type: Number,
    min: 0,
    max: 10,
    default: 3
  }
}, {
  timestamps: true
});

courseSchema.index({ user: 1 });
courseSchema.index({ user: 1, code: 1 });

module.exports = mongoose.model('Course', courseSchema);
