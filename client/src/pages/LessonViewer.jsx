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
    <div className="flex" style={{ height: 'calc(100vh - 70px)', overflow: 'hidden', margin: '-2rem' }}>
      {/* Sidebar: Course Playlist */}
      <div className={`glass ${sidebarOpen ? 'open' : 'closed'}`} style={{ 
        width: '350px', borderRight: '1px solid var(--glass-border)', display: 'flex', flexDirection: 'column',
        transition: 'transform 0.3s ease', transform: sidebarOpen ? 'translateX(0)' : 'translateX(-100%)'
      }}>
        <div style={{ padding: '1.5rem', borderBottom: '1px solid var(--glass-border)' }}>
          <h2 style={{ fontSize: '1.1rem', marginBottom: '1rem' }}>{course?.title}</h2>
          <ProgressBar progress={enrollment?.progress || 0} height="6px" />
          <div className="flex items-center gap-2 mt-3 text-muted" style={{ fontSize: '0.8rem' }}>
            <Users size={14} />
            <span>{participantCount} students viewing now</span>
          </div>
        </div>
        
        <div className="custom-scrollbar" style={{ flex: 1, overflowY: 'auto', padding: '1rem' }}>
          {lessons.map((lesson, idx) => (
            <Link 
              key={lesson._id} 
              to={`/course/${courseId}/learn/${lesson._id}`}
              className={`flex items-center justify-between gap-3 p-3 mb-2 rounded-xl transition-all ${lesson._id === currentLesson._id ? 'bg-primary' : 'hover-glass'}`}
              style={{
                background: lesson._id === currentLesson._id ? 'var(--primary)' : 'transparent',
                color: lesson._id === currentLesson._id ? 'white' : 'var(--text-muted)'
              }}
            >
              <div className="flex items-center gap-3 overflow-hidden">
                <span style={{ fontWeight: 700, opacity: 0.5 }}>{idx + 1}</span>
                <p style={{ fontSize: '0.9rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{lesson.title}</p>
              </div>
              {enrollment?.completedLessons?.includes(lesson._id) && <CheckCircle size={16} color="var(--accent)" />}
            </Link>
          ))}
        </div>
      </div>

      {/* Main content: Video & Content */}
      <div className="flex-1 overflow-y-auto custom-scrollbar" style={{ padding: '2rem' }}>
        <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
          <div className="flex items-center justify-between mb-6">
            <button onClick={() => setSidebarOpen(!sidebarOpen)} className="btn-outline" style={{ padding: '0.5rem 1rem' }}>
              <List size={20} />
            </button>
            <div className="flex items-center gap-4">
              <button onClick={handleComplete} className="btn-primary flex items-center gap-2" style={{ padding: '0.6rem 1.5rem' }}>
                <CheckCircle size={18} />
                <span>{isCompleted ? 'Next Lesson' : 'Mark as Complete'}</span>
              </button>
            </div>
          </div>

          <VideoPlayer url={currentLesson.videoUrl} onEnded={handleComplete} />

          <div className="mt-10 flex flex-col gap-6">
            <div className="flex items-center justify-between">
              <h1 style={{ fontSize: '2rem' }}>{currentLesson.title}</h1>
              <div className="flex gap-2">
                {currentLesson.resources?.map((res, i) => (
                  <a key={i} href={res} target="_blank" rel="noreferrer" className="btn-outline flex items-center gap-2" style={{ fontSize: '0.85rem' }}>
                    <Download size={16} />
                    <span>Resource {i+1}</span>
                  </a>
                ))}
              </div>
            </div>

            <div className="glass" style={{ padding: '2rem', borderRadius: '20px', lineHeight: 1.8 }}>
              <h3 className="flex items-center gap-2 mb-4" style={{ fontSize: '1.2rem' }}>
                <FileText size={20} color="var(--primary)" />
                Lesson Content
              </h3>
              <p style={{ color: 'var(--text-main)', whiteSpace: 'pre-wrap' }}>{currentLesson.content || 'No text content for this lesson.'}</p>
            </div>

            {/* Navigation controls */}
            <div className="flex items-center justify-between mt-8">
              <button 
                className="btn-outline flex items-center gap-2" 
                onClick={() => {
                  const idx = lessons.findIndex(l => l._id === currentLesson._id);
                  if (idx > 0) navigate(`/course/${courseId}/learn/${lessons[idx-1]._id}`);
                }}
                disabled={lessons.findIndex(l => l._id === currentLesson._id) === 0}
              >
                <ChevronLeft size={20} />
                <span>Previous</span>
              </button>
              <button 
                className="btn-outline flex items-center gap-2"
                onClick={() => {
                  const idx = lessons.findIndex(l => l._id === currentLesson._id);
                  if (idx < lessons.length - 1) navigate(`/course/${courseId}/learn/${lessons[idx+1]._id}`);
                }}
                disabled={lessons.findIndex(l => l._id === currentLesson._id) === lessons.length - 1}
              >
                <span>Next</span>
                <ChevronRight size={20} />
              </button>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        .bg-primary { background: var(--primary); }
        .hover-glass:hover { background: var(--glass); color: white !important; }
        .custom-scrollbar::-webkit-scrollbar { width: 6px; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: var(--glass-border); border-radius: 10px; }
        @media (max-width: 991px) {
          .glass.open { position: fixed; z-index: 1000; height: 100vh; top: 0; left: 0; }
        }
      `}</style>
    </div>
  );
};

export default LessonViewer;
