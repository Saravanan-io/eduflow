const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const Course = require('../models/Course');
const Lesson = require('../models/Lesson');
const { protect, authorize } = require('../middleware/auth');
const { upload } = require('../middleware/upload');

// @desc    Get all published courses
// @route   GET /api/courses
// @access  Public
router.get('/', async (req, res) => {
  const { category, price } = req.query;
  const filter = { isPublished: true };

  if (category) filter.category = category;
  if (price === 'free') filter.price = 0;
  if (price === 'paid') filter.price = { $gt: 0 };

  try {
    const courses = await Course.find(filter)
      .populate('instructor', 'username avatar')
      .sort({ createdAt: -1 });

    res.json({ success: true, courses });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @desc    Create new course
// @route   POST /api/courses
// @access  Private (Instructor only)
router.post(
  '/',
  protect,
  authorize('instructor'),
  upload.single('thumbnail'),
  async (req, res) => {
    const { title, description, category, price } = req.body;

    try {
      const existingCourse = await Course.findOne({ title });
      if (existingCourse) {
        return res.status(400).json({ message: 'Course title already exists' });
      }

      const course = await Course.create({
        title,
        description,
        category,
        price,
        instructor: req.user.id,
        thumbnail: req.file ? req.file.path : '',
      });

      res.status(201).json({ success: true, course });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }
);

// @desc    Get single course details
// @route   GET /api/courses/:id
// @access  Public
router.get('/:id', async (req, res) => {
  try {
    const course = await Course.findById(req.params.id)
      .populate('instructor', 'username email avatar')
      .lean();

    if (!course) {
      return res.status(404).json({ message: 'Course not found' });
    }

    const lessons = await Lesson.find({ course: req.params.id }).sort('order');
    course.lessons = lessons;

    res.json({ success: true, course });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @desc    Update course
// @route   PUT /api/courses/:id
// @access  Private (Instructor/Admin only)
router.put(
  '/:id',
  protect,
  authorize('instructor', 'admin'),
  upload.single('thumbnail'),
  async (req, res) => {
    try {
      let course = await Course.findById(req.params.id);
      if (!course) {
        return res.status(404).json({ message: 'Course not found' });
      }

      // Check ownership
      if (course.instructor.toString() !== req.user.id && req.user.role !== 'admin') {
        return res.status(403).json({ message: 'Not authorized to update this course' });
      }

      const updateData = { ...req.body };
      if (req.file) updateData.thumbnail = req.file.path;

      course = await Course.findByIdAndUpdate(req.params.id, updateData, {
        new: true,
        runValidators: true,
      });

      res.json({ success: true, course });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }
);

// @desc    Delete course
// @route   DELETE /api/courses/:id
// @access  Private (Instructor/Admin only)
router.delete('/:id', protect, authorize('instructor', 'admin'), async (req, res) => {
  try {
    const course = await Course.findById(req.params.id);
    if (!course) {
      return res.status(404).json({ message: 'Course not found' });
    }

    // Check ownership
    if (course.instructor.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized to delete this course' });
    }

    await Lesson.deleteMany({ course: req.params.id });
    await Course.findByIdAndDelete(req.params.id);

    res.json({ success: true, message: 'Course and its lessons deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @desc    Toggle publish status
// @route   POST /api/courses/:id/publish
// @access  Private (Instructor only)
router.post('/:id/publish', protect, authorize('instructor'), async (req, res) => {
  try {
    const course = await Course.findById(req.params.id);
    if (!course) {
      return res.status(404).json({ message: 'Course not found' });
    }

    if (course.instructor.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized to publish this course' });
    }

    course.isPublished = !course.isPublished;
    await course.save();

    res.json({ success: true, isPublished: course.isPublished });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
