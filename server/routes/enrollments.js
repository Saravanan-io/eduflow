const express = require('express');
const router = express.Router();
const { supabase } = require('../config/db');
const { protect } = require('../middleware/auth');

// Helper to format course object
const formatCourse = (c) => {
  if (!c) return null;
  const instructor = c.instructor
    ? {
        _id: c.instructor.id,
        id: c.instructor.id,
        username: c.instructor.username,
        avatar: c.instructor.avatar || '',
      }
    : c.instructor_id;

  return {
    _id: c.id,
    id: c.id,
    title: c.title,
    description: c.description || '',
    category: c.category,
    price: Number(c.price || 0),
    thumbnail: c.thumbnail || '',
    isPublished: Boolean(c.is_published),
    instructor,
    createdAt: c.created_at,
  };
};

// Helper to format enrollment object
const formatEnrollment = (e) => {
  if (!e) return null;
  return {
    _id: e.id,
    id: e.id,
    student: e.student_id,
    student_id: e.student_id,
    course: typeof e.course === 'object' && e.course ? formatCourse(e.course) : e.course_id,
    course_id: e.course_id,
    progress: Number(e.progress || 0),
    completedLessons: e.completed_lessons || [],
    completedAt: e.completed_at,
    enrolledAt: e.enrolled_at,
  };
};

// @desc    Enroll student in a course
// @route   POST /api/enrollments/:courseId/enroll
// @access  Private (Student only)
router.post('/:courseId/enroll', protect, async (req, res) => {
  try {
    const { data: course, error: courseErr } = await supabase
      .from('courses')
      .select('*')
      .eq('id', req.params.courseId)
      .maybeSingle();

    if (courseErr || !course) {
      return res.status(404).json({ message: 'Course not found' });
    }

    if (!course.is_published) {
      return res.status(400).json({ message: 'Cannot enroll in an unpublished course' });
    }

    const { data: existing } = await supabase
      .from('enrollments')
      .select('id')
      .eq('student_id', req.user.id)
      .eq('course_id', req.params.courseId)
      .maybeSingle();

    if (existing) {
      return res.status(400).json({ message: 'Already enrolled in this course' });
    }

    const { data: enrollment, error: insertErr } = await supabase
      .from('enrollments')
      .insert({
        student_id: req.user.id,
        course_id: req.params.courseId,
        progress: 0,
        completed_lessons: [],
      })
      .select()
      .single();

    if (insertErr || !enrollment) {
      return res.status(500).json({ message: insertErr ? insertErr.message : 'Error creating enrollment' });
    }

    res.status(201).json({ success: true, enrollment: formatEnrollment(enrollment) });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @desc    Get all courses student is enrolled in
// @route   GET /api/enrollments/my-courses
// @access  Private
router.get('/my-courses', protect, async (req, res) => {
  try {
    const { data: enrollments, error } = await supabase
      .from('enrollments')
      .select(`
        *,
        course:courses!course_id (
          *,
          instructor:users!instructor_id (id, username, avatar)
        )
      `)
      .eq('student_id', req.user.id)
      .order('enrolled_at', { ascending: false });

    if (error) {
      return res.status(500).json({ message: error.message });
    }

    const formattedEnrollments = (enrollments || []).map(formatEnrollment);
    res.json({ success: true, enrollments: formattedEnrollments });
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
    const { data: enrollment, error: fetchErr } = await supabase
      .from('enrollments')
      .select('*')
      .eq('student_id', req.user.id)
      .eq('course_id', req.params.courseId)
      .maybeSingle();

    if (fetchErr || !enrollment) {
      return res.status(404).json({ message: 'Enrollment not found' });
    }

    let completedLessons = Array.isArray(enrollment.completed_lessons) ? [...enrollment.completed_lessons] : [];
    
    if (!completedLessons.includes(lessonId)) {
      completedLessons.push(lessonId);

      const { count: totalLessons } = await supabase
        .from('lessons')
        .select('id', { count: 'exact', head: true })
        .eq('course_id', req.params.courseId);

      const count = totalLessons || 1;
      const progress = Math.min(100, Math.round((completedLessons.length / count) * 100));
      const completedAt = progress === 100 && !enrollment.completed_at ? new Date().toISOString() : enrollment.completed_at;

      const { data: updatedEnrollment, error: updateErr } = await supabase
        .from('enrollments')
        .update({
          completed_lessons: completedLessons,
          progress,
          completed_at: completedAt,
        })
        .eq('id', enrollment.id)
        .select()
        .single();

      if (updateErr) {
        return res.status(500).json({ message: updateErr.message });
      }

      return res.json({ success: true, enrollment: formatEnrollment(updatedEnrollment) });
    }

    res.json({ success: true, enrollment: formatEnrollment(enrollment) });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @desc    Get enrollment progress for a specific course
// @route   GET /api/enrollments/:courseId/progress
// @access  Private
router.get('/:courseId/progress', protect, async (req, res) => {
  try {
    const { data: enrollment, error } = await supabase
      .from('enrollments')
      .select('*')
      .eq('student_id', req.user.id)
      .eq('course_id', req.params.courseId)
      .maybeSingle();

    if (error || !enrollment) {
      return res.status(404).json({ message: 'Enrollment not found' });
    }

    res.json({ success: true, enrollment: formatEnrollment(enrollment) });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
