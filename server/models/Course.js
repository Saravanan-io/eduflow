const mongoose = require('mongoose');

const courseSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Course title is required'],
    unique: true,
    trim: true,
    maxlength: [100, 'Title cannot exceed 100 characters'],
  },
  description: {
    type: String,
    maxlength: [500, 'Description cannot exceed 500 characters'],
  },
  instructor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  category: {
    type: String,
    required: [true, 'Category is required'],
    enum: [
      'Web Development',
      'Data Science',
      'Mobile Development',
      'UI/UX Design',
      'DevOps',
      'Cybersecurity',
      'Machine Learning',
      'Cloud Computing',
      'Business',
      'Other',
    ],
  },
  price: {
    type: Number,
    default: 0,
    min: [0, 'Price cannot be negative'],
  },
  thumbnail: {
    type: String,
    default: '',
  },
  isPublished: {
    type: Boolean,
    default: false,
  },
  students: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
  ],
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('Course', courseSchema);
