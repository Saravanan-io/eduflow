const mongoose = require('mongoose');

const lessonSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Lesson title is required'],
    trim: true,
  },
  course: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Course',
    required: true,
  },
  videoUrl: {
    type: String,
    default: '',
  },
  content: {
    type: String,
    default: '',
  },
  duration: {
    type: Number,
    default: 0,
  },
  order: {
    type: Number,
    required: [true, 'Lesson order is required'],
  },
  resources: [
    {
      type: String,
    },
  ],
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('Lesson', lessonSchema);
