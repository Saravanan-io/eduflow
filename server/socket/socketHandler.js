const jwt = require('jsonwebtoken');
const { supabase } = require('../config/db');

const socketHandler = (io) => {
  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth.token;
      if (!token) return next(new Error('Authentication error: No token'));

      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      
      const { data: user, error } = await supabase
        .from('users')
        .select('id, username, email, role, avatar')
        .eq('id', decoded.id)
        .maybeSingle();

      if (error || !user) return next(new Error('Authentication error: User not found'));

      socket.user = {
        _id: user.id,
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role,
        avatar: user.avatar,
      };
      next();
    } catch (err) {
      next(new Error('Authentication error: Invalid token'));
    }
  });

  io.on('connection', (socket) => {
    console.log(`📡 User connected: ${socket.user.username} (${socket.id})`);

    // Join a course room for real-time updates
    socket.on('join_course_room', async ({ courseId }) => {
      socket.join(courseId);
      console.log(`👤 ${socket.user.username} joined room: ${courseId}`);

      const room = io.sockets.adapter.rooms.get(courseId);
      const participantCount = room ? room.size : 0;

      io.to(courseId).emit('room_joined', { participantCount });
      io.to(courseId).emit('student_joined', {
        username: socket.user.username,
        avatar: socket.user.avatar,
      });
    });

    socket.on('leave_course_room', ({ courseId }) => {
      socket.leave(courseId);
      console.log(`👤 ${socket.user.username} left room: ${courseId}`);

      const room = io.sockets.adapter.rooms.get(courseId);
      const participantCount = room ? room.size : 0;
      io.to(courseId).emit('room_joined', { participantCount });
    });

    // Handle lesson completion
    socket.on('lesson_completed', async ({ courseId, lessonId }) => {
      try {
        const { data: enrollment } = await supabase
          .from('enrollments')
          .select('*')
          .eq('student_id', socket.user.id)
          .eq('course_id', courseId)
          .maybeSingle();

        if (enrollment) {
          let completedLessons = Array.isArray(enrollment.completed_lessons) ? [...enrollment.completed_lessons] : [];
          if (!completedLessons.includes(lessonId)) {
            completedLessons.push(lessonId);

            const { count: totalLessons } = await supabase
              .from('lessons')
              .select('id', { count: 'exact', head: true })
              .eq('course_id', courseId);

            const count = totalLessons || 1;
            const progress = Math.min(100, Math.round((completedLessons.length / count) * 100));
            const completedAt = progress === 100 && !enrollment.completed_at ? new Date().toISOString() : enrollment.completed_at;

            await supabase
              .from('enrollments')
              .update({
                completed_lessons: completedLessons,
                progress,
                completed_at: completedAt,
              })
              .eq('id', enrollment.id);

            if (progress === 100 && !enrollment.completed_at) {
              socket.emit('certificate_unlock', { courseId });
            }

            // Broadcast updated progress back to student dashboard
            socket.emit('progress_updated', {
              courseId,
              progress,
              completedLessons,
            });
          }
        }
      } catch (error) {
        socket.emit('error', { message: error.message });
      }
    });

    // Handle course announcements (Instructor only)
    socket.on('new_announcement', async ({ courseId, announcement }) => {
      if (socket.user.role !== 'instructor') return;
      io.to(courseId).emit('announcement_received', {
        announcement,
        instructor: socket.user.username,
      });
    });

    // Handle Quiz Submission
    socket.on('quiz_submitted', async ({ courseId, score, feedback }) => {
      socket.emit('quiz_result', {
        courseId,
        score,
        feedback,
        message: score >= 80 ? 'Excellent work!' : 'Good effort, keep it up!',
      });
    });

    // Notify when instructor starts a live session
    socket.on('start_live_session', ({ courseId }) => {
      if (socket.user.role !== 'instructor') return;
      io.to(courseId).emit('instructor_live', {
        courseId,
        instructor: socket.user.username,
        isLive: true,
      });
    });

    socket.on('disconnect', () => {
      console.log(`🔌 User disconnected: ${socket.id}`);
    });
  });
};

module.exports = socketHandler;
