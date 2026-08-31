const express = require('express');
const router = express.Router();
const { supabase } = require('../config/db');
const { protect, authorize } = require('../middleware/auth');
const { upload } = require('../middleware/upload');

// Helper to format course object for frontend compatibility
const formatCourse = (c, lessons = []) => {
  if (!c) return null;
  const instructor = c.instructor
    ? {
        _id: c.instructor.id,
        id: c.instructor.id,
        username: c.instructor.username,
        email: c.instructor.email || '',
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
    instructor_id: c.instructor_id,
    lessons: lessons.map(formatLesson),
    createdAt: c.created_at,
  };
};

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

// @desc    Get all published courses
// @route   GET /api/courses
// @access  Public
router.get('/', async (req, res) => {
  const { category, price } = req.query;

  try {
    let query = supabase
      .from('courses')
      .select('*, instructor:users!instructor_id(id, username, avatar)')
      .eq('is_published', true)
      .order('created_at', { ascending: false });

    if (category) query = query.eq('category', category);
    if (price === 'free') query = query.eq('price', 0);
    if (price === 'paid') query = query.gt('price', 0);

    const { data: courses, error } = await query;

    if (error) {
      return res.status(500).json({ message: error.message });
    }

    const formattedCourses = (courses || []).map((c) => formatCourse(c));
    res.json({ success: true, courses: formattedCourses });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @desc    Get instructor's courses
// @route   GET /api/courses/instructor/my-courses
// @access  Private (Instructor only)
router.get('/instructor/my-courses', protect, authorize('instructor'), async (req, res) => {
  try {
    const { data: courses, error } = await supabase
      .from('courses')
      .select('*, instructor:users!instructor_id(id, username, avatar)')
      .eq('instructor_id', req.user.id)
      .order('created_at', { ascending: false });

    if (error) {
      return res.status(500).json({ message: error.message });
    }

    const formattedCourses = (courses || []).map((c) => formatCourse(c));
    res.json({ success: true, courses: formattedCourses });
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
    const { title, description, category, price, isPublished } = req.body;

    try {
      // Check duplicate title
      const { data: existingCourse } = await supabase
        .from('courses')
        .select('id')
        .eq('title', title)
        .maybeSingle();

      if (existingCourse) {
        return res.status(400).json({ message: 'Course title already exists' });
      }

      const { data: course, error } = await supabase
        .from('courses')
        .insert({
          title,
          description,
          category,
          price: parseFloat(price) || 0,
          is_published: isPublished === 'true' || isPublished === true,
          instructor_id: req.user.id,
          thumbnail: req.file ? `/uploads/${req.file.filename}` : '',
        })
        .select('*, instructor:users!instructor_id(id, username, avatar)')
        .single();

      if (error || !course) {
        return res.status(500).json({ message: error ? error.message : 'Error creating course' });
      }

      res.status(201).json({ success: true, course: formatCourse(course) });
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
    const { data: course, error } = await supabase
      .from('courses')
      .select('*, instructor:users!instructor_id(id, username, email, avatar)')
      .eq('id', req.params.id)
      .maybeSingle();

    if (error || !course) {
      return res.status(404).json({ message: 'Course not found' });
    }

    const { data: lessons } = await supabase
      .from('lessons')
      .select('*')
      .eq('course_id', req.params.id)
      .order('lesson_order', { ascending: true });

    res.json({ success: true, course: formatCourse(course, lessons || []) });
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
      const { data: existingCourse, error: fetchErr } = await supabase
        .from('courses')
        .select('*')
        .eq('id', req.params.id)
        .maybeSingle();

      if (fetchErr || !existingCourse) {
        return res.status(404).json({ message: 'Course not found' });
      }

      // Check ownership
      if (existingCourse.instructor_id !== req.user.id && req.user.role !== 'admin') {
        return res.status(403).json({ message: 'Not authorized to update this course' });
      }

      const updateData = {};
      if (req.body.title !== undefined) updateData.title = req.body.title;
      if (req.body.description !== undefined) updateData.description = req.body.description;
      if (req.body.category !== undefined) updateData.category = req.body.category;
      if (req.body.price !== undefined) updateData.price = parseFloat(req.body.price);
      if (req.body.isPublished !== undefined) {
        updateData.is_published = req.body.isPublished === 'true' || req.body.isPublished === true;
      }
      if (req.file) updateData.thumbnail = `/uploads/${req.file.filename}`;

      const { data: updatedCourse, error: updateErr } = await supabase
        .from('courses')
        .update(updateData)
        .eq('id', req.params.id)
        .select('*, instructor:users!instructor_id(id, username, avatar)')
        .single();

      if (updateErr) {
        return res.status(500).json({ message: updateErr.message });
      }

      res.json({ success: true, course: formatCourse(updatedCourse) });
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
    const { data: course, error: fetchErr } = await supabase
      .from('courses')
      .select('*')
      .eq('id', req.params.id)
      .maybeSingle();

    if (fetchErr || !course) {
      return res.status(404).json({ message: 'Course not found' });
    }

    // Check ownership
    if (course.instructor_id !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized to delete this course' });
    }

    // Cascade delete lessons and course
    await supabase.from('lessons').delete().eq('course_id', req.params.id);
    await supabase.from('courses').delete().eq('id', req.params.id);

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
    const { data: course, error: fetchErr } = await supabase
      .from('courses')
      .select('*')
      .eq('id', req.params.id)
      .maybeSingle();

    if (fetchErr || !course) {
      return res.status(404).json({ message: 'Course not found' });
    }

    if (course.instructor_id !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized to publish this course' });
    }

    const newPublishStatus = !course.is_published;
    const { error: updateErr } = await supabase
      .from('courses')
      .update({ is_published: newPublishStatus })
      .eq('id', req.params.id);

    if (updateErr) {
      return res.status(500).json({ message: updateErr.message });
    }

    res.json({ success: true, isPublished: newPublishStatus });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
