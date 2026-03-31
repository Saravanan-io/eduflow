const express = require('express');
const router = express.Router();
const Lesson = require('../models/Lesson');
const Course = require('../models/Course');
const Enrollment = require('../models/Enrollment');
const { protect, authorize } = require('../middleware/auth');
const { upload } = require('../middleware/upload');

// @desc    Get all lessons for a course
// @route   GET /api/lessons/:courseId
// @access  Private (Enrolled students only)
router.get('/:courseId', protect, async (req, res) => {
  const enrollment = await Enrollment.findOne({
    student: req.user.id,
    course: req.params.courseId,
  });

  const course = await Course.findById(req.params.courseId);
  if (!course) {
    return res.status(404).json({ message: 'Course not found' });
  }

  const isInstructor = course.instructor.toString() === req.user.id;
  const isAdmin = req.user.role === 'admin';

  if (!enrollment && !isInstructor && !isAdmin) {
    return res.status(403).json({ message: 'Not enrolled in this course' });
  }

  try {
    const lessons = await Lesson.find({ course: req.params.courseId }).sort('order');
    res.json({ success: true, lessons });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @desc    Add lesson to a course
// @route   POST /api/lessons/:courseId
// @access  Private (Instructor only)
router.post(
  '/:courseId',
  protect,
  authorize('instructor'),
  upload.fields([{ name: 'video' }, { name: 'resources' }]),
  async (req, res) => {
    try {
      const course = await Course.findById(req.params.courseId);
      if (!course) {
        return res.status(404).json({ message: 'Course not found' });
      }

      if (course.instructor.toString() !== req.user.id) {
        return res.status(403).json({ message: 'Not authorized to add lessons to this course' });
      }

      const { title, content, duration, order } = req.body;
      const lesson = await Lesson.create({
        title,
        content,
        duration,
        order,
        course: req.params.courseId,
        videoUrl: req.files['video'] ? req.files['video'][0].path : '',
        resources: req.files['resources']
          ? req.files['resources'].map((file) => file.path)
          : [],
      });

      res.status(201).json({ success: true, lesson });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }
);

// @desc    Update lesson
// @route   PUT /api/lessons/:lessonId
// @access  Private (Instructor only)
router.put(
  '/:lessonId',
  protect,
  authorize('instructor'),
  upload.fields([{ name: 'video' }, { name: 'resources' }]),
  async (req, res) => {
    try {
      let lesson = await Lesson.findById(req.params.lessonId);
      if (!lesson) {
        return res.status(404).json({ message: 'Lesson not found' });
      }

      const course = await Course.findById(lesson.course);
      if (course.instructor.toString() !== req.user.id) {
        return res.status(403).json({ message: 'Not authorized to update this lesson' });
      }

      const updateData = { ...req.body };
      if (req.files['video']) updateData.videoUrl = req.files['video'][0].path;
      if (req.files['resources']) {
        updateData.resources = req.files['resources'].map((file) => file.path);
      }

      lesson = await Lesson.findByIdAndUpdate(req.params.lessonId, updateData, {
        new: true,
      });

      res.json({ success: true, lesson });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }
);

// @desc    Delete lesson
// @route   DELETE /api/lessons/:lessonId
// @access  Private (Instructor/Admin only)
router.delete('/:lessonId', protect, authorize('instructor', 'admin'), async (req, res) => {
  try {
    const lesson = await Lesson.findById(req.params.lessonId);
    if (!lesson) {
      return res.status(404).json({ message: 'Lesson not found' });
    }

    const course = await Course.findById(lesson.course);
    if (!course) {
      await Lesson.findByIdAndDelete(req.params.lessonId);
      return res.json({ success: true, message: 'Orphaned lesson deleted' });
    }

    if (course.instructor.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized to delete this lesson' });
    }

    await Lesson.findByIdAndDelete(req.params.lessonId);
    res.json({ success: true, message: 'Lesson deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
