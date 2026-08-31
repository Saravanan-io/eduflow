const express = require('express');
const router = express.Router();
const { supabase } = require('../config/db');
const { protect, authorize } = require('../middleware/auth');
const { upload } = require('../middleware/upload');

// Helper to format lesson object
const formatLesson = (l) => {
  if (!l) return null;
  return {
    _id: l.id,
    id: l.id,
    title: l.title,
    course: l.course_id,
    course_id: l.course_id,
    videoUrl: l.video_url || '',
    content: l.content || '',
    duration: Number(l.duration || 0),
    order: Number(l.lesson_order || 0),
    resources: l.resources || [],
    createdAt: l.created_at,
  };
};

// @desc    Get all lessons for a course
// @route   GET /api/lessons/:courseId
// @access  Private (Enrolled students / Instructor / Admin)
router.get('/:courseId', protect, async (req, res) => {
  try {
    const { data: enrollment } = await supabase
      .from('enrollments')
      .select('id')
      .eq('student_id', req.user.id)
      .eq('course_id', req.params.courseId)
      .maybeSingle();

    const { data: course, error: courseErr } = await supabase
      .from('courses')
      .select('*')
      .eq('id', req.params.courseId)
      .maybeSingle();

    if (courseErr || !course) {
      return res.status(404).json({ message: 'Course not found' });
    }

    const isInstructor = course.instructor_id === req.user.id;
    const isAdmin = req.user.role === 'admin';

    if (!enrollment && !isInstructor && !isAdmin) {
      return res.status(403).json({ message: 'Not enrolled in this course' });
    }

    const { data: lessons, error: lessonErr } = await supabase
      .from('lessons')
      .select('*')
      .eq('course_id', req.params.courseId)
      .order('lesson_order', { ascending: true });

    if (lessonErr) {
      return res.status(500).json({ message: lessonErr.message });
    }

    const formattedLessons = (lessons || []).map(formatLesson);
    res.json({ success: true, lessons: formattedLessons });
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
      const { data: course, error: courseErr } = await supabase
        .from('courses')
        .select('*')
        .eq('id', req.params.courseId)
        .maybeSingle();

      if (courseErr || !course) {
        return res.status(404).json({ message: 'Course not found' });
      }

      if (course.instructor_id !== req.user.id) {
        return res.status(403).json({ message: 'Not authorized to add lessons to this course' });
      }

      const { title, content, duration, order } = req.body;
      
      let videoUrl = req.body.videoUrl || '';
      if (req.files && req.files['video'] && req.files['video'][0]) {
        videoUrl = `/uploads/${req.files['video'][0].filename}`;
      }

      let resources = [];
      if (req.files && req.files['resources']) {
        resources = req.files['resources'].map((file) => `/uploads/${file.filename}`);
      } else if (req.body.resources) {
        resources = Array.isArray(req.body.resources) ? req.body.resources : [req.body.resources];
      }

      const { data: lesson, error: insertErr } = await supabase
        .from('lessons')
        .insert({
          title,
          content: content || '',
          duration: duration ? parseInt(duration) : 0,
          lesson_order: parseInt(order) || 1,
          course_id: req.params.courseId,
          video_url: videoUrl,
          resources,
        })
        .select()
        .single();

      if (insertErr || !lesson) {
        return res.status(500).json({ message: insertErr ? insertErr.message : 'Error adding lesson' });
      }

      res.status(201).json({ success: true, lesson: formatLesson(lesson) });
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
      const { data: lesson, error: fetchErr } = await supabase
        .from('lessons')
        .select('*')
        .eq('id', req.params.lessonId)
        .maybeSingle();

      if (fetchErr || !lesson) {
        return res.status(404).json({ message: 'Lesson not found' });
      }

      const { data: course } = await supabase
        .from('courses')
        .select('instructor_id')
        .eq('id', lesson.course_id)
        .single();

      if (!course || course.instructor_id !== req.user.id) {
        return res.status(403).json({ message: 'Not authorized to update this lesson' });
      }

      const updateData = {};
      if (req.body.title) updateData.title = req.body.title;
      if (req.body.content !== undefined) updateData.content = req.body.content;
      if (req.body.duration !== undefined) updateData.duration = parseInt(req.body.duration);
      if (req.body.order !== undefined) updateData.lesson_order = parseInt(req.body.order);

      if (req.files && req.files['video']) {
        updateData.video_url = req.files['video'][0].path;
      }
      if (req.files && req.files['resources']) {
        updateData.resources = req.files['resources'].map((file) => file.path);
      }

      const { data: updatedLesson, error: updateErr } = await supabase
        .from('lessons')
        .update(updateData)
        .eq('id', req.params.lessonId)
        .select()
        .single();

      if (updateErr) {
        return res.status(500).json({ message: updateErr.message });
      }

      res.json({ success: true, lesson: formatLesson(updatedLesson) });
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
    const { data: lesson, error: fetchErr } = await supabase
      .from('lessons')
      .select('*')
      .eq('id', req.params.lessonId)
      .maybeSingle();

    if (fetchErr || !lesson) {
      return res.status(404).json({ message: 'Lesson not found' });
    }

    const { data: course } = await supabase
      .from('courses')
      .select('instructor_id')
      .eq('id', lesson.course_id)
      .maybeSingle();

    if (!course) {
      await supabase.from('lessons').delete().eq('id', req.params.lessonId);
      return res.json({ success: true, message: 'Orphaned lesson deleted' });
    }

    if (course.instructor_id !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized to delete this lesson' });
    }

    await supabase.from('lessons').delete().eq('id', req.params.lessonId);
    res.json({ success: true, message: 'Lesson deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
