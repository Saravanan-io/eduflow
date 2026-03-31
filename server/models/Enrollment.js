const mongoose = require('mongoose');

const enrollmentSchema = new mongoose.Schema({
  student: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  course: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Course',
    required: true,
  },
  progress: {
    type: Number,
    default: 0,
    min: 0,
    max: 100,
  },
  completedLessons: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Lesson',
    },
  ],
  completedAt: {
    type: Date,
    default: null,
  },
  enrolledAt: {
    type: Date,
    default: Date.now,
  },
});

// Compound index to prevent duplicate enrollments
enrollmentSchema.index({ student: 1, course: 1 }, { unique: true });

module.exports = mongoose.model('Enrollment', enrollmentSchema);
