const express = require('express');
const router = express.Router();
const Enrollment = require('../models/Enrollment');
const Course = require('../models/Course');
const Lesson = require('../models/Lesson');
const User = require('../models/User');
const { protect } = require('../middleware/auth');

// @desc    Enroll student in a course
// @route   POST /api/enrollments/:courseId/enroll
// @access  Private (Student only)
router.post('/:courseId/enroll', protect, async (req, res) => {
  try {
    const course = await Course.findById(req.params.courseId);
    if (!course) {
      return res.status(404).json({ message: 'Course not found' });
    }

    if (!course.isPublished) {
      return res.status(400).json({ message: 'Cannot enroll in an unpublished course' });
    }

    let enrollment = await Enrollment.findOne({
      student: req.user.id,
      course: req.params.courseId,
    });

    if (enrollment) {
      return res.status(400).json({ message: 'Already enrolled in this course' });
    }

    enrollment = await Enrollment.create({
      student: req.user.id,
      course: req.params.courseId,
    });

    await User.findByIdAndUpdate(req.user.id, {
      $push: { enrolledCourses: req.params.courseId },
    });

    await Course.findByIdAndUpdate(req.params.courseId, {
      $push: { students: req.user.id },
    });

    res.status(201).json({ success: true, enrollment });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @desc    Get all courses student is enrolled in
// @route   GET /api/enrollments/my-courses
// @access  Private
router.get('/my-courses', protect, async (req, res) => {
  try {
    const enrollments = await Enrollment.find({ student: req.user.id })
      .populate({
        path: 'course',
        populate: { path: 'instructor', select: 'username avatar' },
      })
      .sort('-enrolledAt');

    res.json({ success: true, enrollments });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @desc    Update progress
// @route   POST /api/enrollments/:courseId/progress
// @access  Private
router.post('/:courseId/progress', protect, async (req, res) => {
  const { lessonId } = req.body;

  try {
    const enrollment = await Enrollment.findOne({
      student: req.user.id,
      course: req.params.courseId,
    });

    if (!enrollment) {
      return res.status(404).json({ message: 'Enrollment not found' });
    }

    if (!enrollment.completedLessons.includes(lessonId)) {
      enrollment.completedLessons.push(lessonId);

      const totalLessons = await Lesson.countDocuments({ course: req.params.courseId });
      enrollment.progress = Math.round((enrollment.completedLessons.length / totalLessons) * 100);

      if (enrollment.progress === 100 && !enrollment.completedAt) {
        enrollment.completedAt = Date.now();
      }

      await enrollment.save();
    }

    res.json({ success: true, enrollment });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @desc    Get enrollment progress for a specific course
// @route   GET /api/enrollments/:courseId/progress
// @access  Private
router.get('/:courseId/progress', protect, async (req, res) => {
  try {
    const enrollment = await Enrollment.findOne({
      student: req.user.id,
      course: req.params.courseId,
    });

    if (!enrollment) {
      return res.status(404).json({ message: 'Enrollment not found' });
    }

    res.json({ success: true, enrollment });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
