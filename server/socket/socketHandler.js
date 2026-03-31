const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Enrollment = require('../models/Enrollment');
const Course = require('../models/Course');
const Lesson = require('../models/Lesson');

const socketHandler = (io) => {
  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth.token;
      if (!token) return next(new Error('Authentication error: No token'));

      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await User.findById(decoded.id).select('-password');
      if (!user) return next(new Error('Authentication error: User not found'));

      socket.user = user;
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
        const enrollment = await Enrollment.findOne({
          student: socket.user.id,
          course: courseId,
        });

        if (enrollment && !enrollment.completedLessons.includes(lessonId)) {
          enrollment.completedLessons.push(lessonId);

          const totalLessons = await Lesson.countDocuments({ course: courseId });
          enrollment.progress = Math.round((enrollment.completedLessons.length / totalLessons) * 100);

          if (enrollment.progress === 100 && !enrollment.completedAt) {
            enrollment.completedAt = Date.now();
            socket.emit('certificate_unlock', { courseId });
          }

          await enrollment.save();

          // Broadcast updated progress back to student dashboard
          socket.emit('progress_updated', {
            courseId,
            progress: enrollment.progress,
            completedLessons: enrollment.completedLessons,
          });
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
