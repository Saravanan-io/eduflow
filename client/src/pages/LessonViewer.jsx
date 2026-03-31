import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { useSocket } from '../context/SocketContext';
import { useAuth } from '../context/AuthContext';
import VideoPlayer from '../components/VideoPlayer';
import Spinner from '../components/Spinner';
import ProgressBar from '../components/ProgressBar';
import { ChevronLeft, ChevronRight, CheckCircle, FileText, Download, Play, List, Users } from 'lucide-react';

const LessonViewer = () => {
  const { courseId, lessonId } = useParams();
  const navigate = useNavigate();
  const socket = useSocket();
  const { user } = useAuth();

  const [course, setCourse] = useState(null);
  const [lessons, setLessons] = useState([]);
  const [currentLesson, setCurrentLesson] = useState(null);
  const [enrollment, setEnrollment] = useState(null);
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [participantCount, setParticipantCount] = useState(0);

  useEffect(() => {
    fetchLessonData();
  }, [courseId, lessonId]);

  useEffect(() => {
    if (socket && courseId) {
      socket.emit('join_course_room', { courseId });
      
      socket.on('room_joined', ({ participantCount }) => {
        setParticipantCount(participantCount);
      });

      socket.on('progress_updated', ({ progress, completedLessons }) => {
        setEnrollment(prev => ({ ...prev, progress, completedLessons }));
      });

      return () => {
        socket.emit('leave_course_room', { courseId });
        socket.off('room_joined');
        socket.off('progress_updated');
      };
    }
  }, [socket, courseId]);

  const fetchLessonData = async () => {
    try {
      const [courseRes, lessonsRes, enrollRes] = await Promise.all([
        axios.get(`/api/courses/${courseId}`),
        axios.get(`/api/lessons/${courseId}`),
        axios.get(`/api/enrollments/${courseId}/progress`)
      ]);

      const foundLessons = lessonsRes.data.lessons;
      setCourse(courseRes.data.course);
      setLessons(foundLessons);
      setEnrollment(enrollRes.data.enrollment);

      const targetId = lessonId === 'start' ? foundLessons[0]?._id : lessonId;
      const lesson = foundLessons.find(l => l._id === targetId) || foundLessons[0];
      setCurrentLesson(lesson);
      
      if (lessonId === 'start') navigate(`/course/${courseId}/learn/${lesson._id}`, { replace: true });
    } catch (err) {
      console.error('Error loading lesson', err);
    } finally {
      setLoading(false);
    }
  };

  const handleComplete = () => {
    if (socket && currentLesson) {
      socket.emit('lesson_completed', { courseId, lessonId: currentLesson._id });
      
      // Move to next lesson if available
      const currentIndex = lessons.findIndex(l => l._id === currentLesson._id);
      if (currentIndex < lessons.length - 1) {
        navigate(`/course/${courseId}/learn/${lessons[currentIndex + 1]._id}`);
      } else {
        navigate(`/course/${courseId}/quiz`);
      }
    }
  };

  if (loading) return <Spinner />;
  if (!currentLesson) return <div className="text-center py-20">Lesson not found</div>;

  const isCompleted = enrollment?.completedLessons?.includes(currentLesson._id);

  return (
    <div className="flex animate-fade" style={{ height: 'calc(100vh - 70px)', overflow: 'hidden', margin: '-1.5rem' }}>
      {/* Sidebar: Course Playlist */}
      <div className={`glass sidebar-playlist ${sidebarOpen ? 'open' : 'closed'}`} style={{ 
        width: 'clamp(280px, 20vw, 350px)', borderRight: '1px solid var(--glass-border)', display: 'flex', flexDirection: 'column',
        transition: 'transform 0.4s cubic-bezier(0.4, 0, 0.2, 1)', zIndex: 50
      }}>
        <div style={{ padding: '1.5rem', borderBottom: '1px solid var(--glass-border)', background: 'rgba(255, 255, 255, 0.02)' }}>
          <h2 style={{ fontSize: '1.1rem', marginBottom: '0.75rem', lineHeight: 1.3 }}>{course?.title}</h2>
          <ProgressBar progress={enrollment?.progress || 0} height="8px" />
          <div className="flex items-center gap-2 mt-4 text-muted" style={{ fontSize: '0.8rem', fontWeight: 600 }}>
            <Users size={14} />
            <span>{participantCount} active learners</span>
          </div>
        </div>
        
        <div className="custom-scrollbar" style={{ flex: 1, overflowY: 'auto', padding: '1rem' }}>
          {lessons.map((lesson, idx) => (
            <Link 
              key={lesson._id} 
              to={`/course/${courseId}/learn/${lesson._id}`}
              className={`flex items-center justify-between gap-3 p-3.5 mb-2 rounded-xl transition-all ${lesson._id === currentLesson._id ? 'bg-primary' : 'hover-glass'}`}
              style={{
                background: lesson._id === currentLesson._id ? 'var(--primary)' : 'transparent',
                color: lesson._id === currentLesson._id ? 'white' : 'var(--text-muted)',
                boxShadow: lesson._id === currentLesson._id ? '0 8px 16px rgba(99, 102, 241, 0.3)' : 'none'
              }}
            >
              <div className="flex items-center gap-3 overflow-hidden">
                <span style={{ fontWeight: 800, opacity: 0.4 }}>{String(idx + 1).padStart(2, '0')}</span>
                <p style={{ fontSize: '0.9rem', fontWeight: 500, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{lesson.title}</p>
              </div>
              {enrollment?.completedLessons?.includes(lesson._id) && <CheckCircle size={16} color={lesson._id === currentLesson._id ? 'white' : 'var(--accent)'} />}
            </Link>
          ))}
        </div>
      </div>

      {/* Main content: Video & Content */}
      <div className="flex-1 overflow-y-auto custom-scrollbar" style={{ padding: 'clamp(1rem, 4vw, 2.5rem)', background: 'var(--bg-dark)' }}>
        <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
          <div className="flex items-center justify-between mb-8">
            <button onClick={() => setSidebarOpen(!sidebarOpen)} className="btn-outline" style={{ padding: '0.6rem 1rem', borderRadius: '12px' }}>
              <List size={22} />
              <span className="hide-mobile">Playlist</span>
            </button>
            <div className="flex items-center gap-4">
              <button onClick={handleComplete} className="btn-primary" style={{ padding: '0.6rem 1.5rem', borderRadius: '12px' }}>
                <CheckCircle size={20} />
                <span>{isCompleted ? 'Next Module' : 'Complete Lesson'}</span>
              </button>
            </div>
          </div>

          <div style={{ borderRadius: '24px', overflow: 'hidden', boxShadow: '0 20px 50px rgba(0,0,0,0.5)', background: '#000' }}>
            <VideoPlayer url={currentLesson.videoUrl} onEnded={handleComplete} />
          </div>

          <div className="mt-10 flex flex-col gap-8">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
              <h1 style={{ fontSize: 'clamp(1.5rem, 5vw, 2.25rem)', fontWeight: 800 }}>{currentLesson.title}</h1>
              <div className="flex flex-wrap gap-2">
                {currentLesson.resources?.map((res, i) => (
                  <a key={i} href={res} target="_blank" rel="noreferrer" className="btn-outline" style={{ padding: '0.5rem 1rem', fontSize: '0.85rem', borderRadius: '10px' }}>
                    <Download size={16} />
                    <span>Resource {i+1}</span>
                  </a>
                ))}
              </div>
            </div>

            <div className="glass" style={{ padding: '2.5rem', borderRadius: '28px', lineHeight: 1.7 }}>
              <h3 className="flex items-center gap-2 mb-6" style={{ fontSize: '1.3rem', color: 'var(--primary)' }}>
                <FileText size={22} />
                Lesson Notes
              </h3>
              <div style={{ color: 'var(--text-main)', fontSize: '1.05rem', opacity: 0.9 }}>
                {currentLesson.content || 'This lesson focuses on the core practical concepts. Follow the video instructions for a hands-on experience.'}
              </div>
            </div>

            {/* Navigation controls */}
            <div className="flex items-center justify-between mt-12 py-8 border-t border-glass">
              <button 
                className="btn-outline flex items-center gap-2" 
                style={{ borderRadius: '14px', padding: '0.75rem 1.25rem' }}
                onClick={() => {
                  const idx = lessons.findIndex(l => l._id === currentLesson._id);
                  if (idx > 0) navigate(`/course/${courseId}/learn/${lessons[idx-1]._id}`);
                }}
                disabled={lessons.findIndex(l => l._id === currentLesson._id) === 0}
              >
                <ChevronLeft size={22} />
                <span>Previous Lesson</span>
              </button>
              <button 
                className="btn-outline flex items-center gap-2"
                style={{ borderRadius: '14px', padding: '0.75rem 1.25rem' }}
                onClick={() => {
                  const idx = lessons.findIndex(l => l._id === currentLesson._id);
                  if (idx < lessons.length - 1) navigate(`/course/${courseId}/learn/${lessons[idx+1]._id}`);
                }}
                disabled={lessons.findIndex(l => l._id === currentLesson._id) === lessons.length - 1}
              >
                <span>Next Lesson</span>
                <ChevronRight size={22} />
              </button>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        .hover-glass:hover { background: rgba(255, 255, 255, 0.05); color: #fff !important; }
        .custom-scrollbar::-webkit-scrollbar { width: 5px; }
        @media (max-width: 991px) {
          .sidebar-playlist { position: fixed; height: 100%; top: 70px; left: 0; background: var(--bg-dark); }
          .sidebar-playlist.closed { transform: translateX(-100%); }
        }
      `}</style>
    </div>
  );
};


export default LessonViewer;
