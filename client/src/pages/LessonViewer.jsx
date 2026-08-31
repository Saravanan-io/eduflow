import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { useSocket } from '../context/SocketContext';
import { useAuth } from '../context/AuthContext';
import VideoPlayer from '../components/VideoPlayer';
import Spinner from '../components/Spinner';
import ProgressBar from '../components/ProgressBar';
import { 
  ChevronLeft, ChevronRight, CheckCircle, FileText, Download, 
  PlayCircle, List, Users, Award, MessageSquare, Edit3, Sparkles 
} from 'lucide-react';

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
  const [activeTab, setActiveTab] = useState('overview');
  const [studyNote, setStudyNote] = useState('');
  const [savedNotes, setSavedNotes] = useState([]);

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
      
      const currentIndex = lessons.findIndex(l => l._id === currentLesson._id);
      if (currentIndex < lessons.length - 1) {
        navigate(`/course/${courseId}/learn/${lessons[currentIndex + 1]._id}`);
      } else {
        navigate(`/course/${courseId}/quiz`);
      }
    }
  };

  const handleAddNote = () => {
    if (!studyNote.trim()) return;
    setSavedNotes(prev => [...prev, { text: studyNote, time: new Date().toLocaleTimeString() }]);
    setStudyNote('');
  };

  if (loading) return <Spinner />;
  if (!currentLesson) return <div className="text-center py-20">Lesson not found</div>;

  const isCompleted = enrollment?.completedLessons?.includes(currentLesson._id);
  const isCourseFinished = enrollment?.progress === 100;

  return (
    <div className="flex animate-fade" style={{ height: 'calc(100vh - 70px)', overflow: 'hidden', margin: '-2rem' }}>
      
      {/* Sidebar: Syllabus Playlist Drawer */}
      <div className={`glass sidebar-playlist ${sidebarOpen ? 'open' : 'closed'}`} style={{ 
        width: 'clamp(300px, 22vw, 360px)', borderRight: '1px solid var(--glass-border)', display: 'flex', flexDirection: 'column',
        transition: 'transform 0.4s cubic-bezier(0.4, 0, 0.2, 1)', zIndex: 50, background: 'var(--bg-card)'
      }}>
        <div style={{ padding: '1.5rem', borderBottom: '1px solid var(--glass-border)' }}>
          <h2 style={{ fontSize: '1.05rem', marginBottom: '0.75rem', lineHeight: 1.3, fontWeight: 700 }}>{course?.title}</h2>
          <ProgressBar progress={enrollment?.progress || 0} height="8px" />
          
          <div className="flex items-center justify-between mt-3" style={{ fontSize: '0.8rem' }}>
            <span className="flex items-center gap-1.5 text-muted">
              <Users size={14} color="var(--primary)" />
              {participantCount} studying live
            </span>
            {isCourseFinished && (
              <span className="badge" style={{ background: 'var(--accent)', color: '#000', fontWeight: 800, padding: '2px 8px', borderRadius: '4px' }}>
                100% COMPLETE
              </span>
            )}
          </div>
        </div>
        
        {/* Lesson Items */}
        <div className="custom-scrollbar" style={{ flex: 1, overflowY: 'auto', padding: '1rem' }}>
          {lessons.map((lesson, idx) => {
            const active = lesson._id === currentLesson._id;
            const completed = enrollment?.completedLessons?.includes(lesson._id);

            return (
              <Link 
                key={lesson._id} 
                to={`/course/${courseId}/learn/${lesson._id}`}
                className="flex items-center justify-between gap-3 p-3.5 mb-2 rounded-xl transition-all"
                style={{
                  background: active ? 'var(--primary)' : 'transparent',
                  color: active ? 'white' : 'var(--text-muted)',
                  boxShadow: active ? '0 8px 20px var(--primary-glow)' : 'none',
                  border: active ? '1px solid var(--primary)' : '1px solid transparent'
                }}
              >
                <div className="flex items-center gap-3 overflow-hidden">
                  <span style={{ fontWeight: 800, opacity: 0.5, fontSize: '0.85rem' }}>{String(idx + 1).padStart(2, '0')}</span>
                  <div>
                    <p style={{ fontSize: '0.88rem', fontWeight: 600, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {lesson.title}
                    </p>
                    <span style={{ fontSize: '0.75rem', opacity: 0.7 }}>{lesson.duration || 15} mins</span>
                  </div>
                </div>
                {completed && <CheckCircle size={18} color={active ? 'white' : 'var(--accent)'} />}
              </Link>
            );
          })}
        </div>

        {/* Certificate Button if Finished */}
        {isCourseFinished && (
          <div style={{ padding: '1rem', borderTop: '1px solid var(--glass-border)' }}>
            <Link to="/awards" className="btn-primary flex items-center justify-center gap-2 w-full" style={{ padding: '0.75rem', borderRadius: '10px', fontSize: '0.88rem' }}>
              <Award size={18} />
              <span>Claim Certificate</span>
            </Link>
          </div>
        )}
      </div>

      {/* Main Content Viewport */}
      <div className="flex-1 overflow-y-auto custom-scrollbar" style={{ padding: 'clamp(1rem, 3vw, 2rem)', background: 'var(--bg-dark)' }}>
        <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
          
          {/* Top Player Action Bar */}
          <div className="flex items-center justify-between mb-6">
            <button onClick={() => setSidebarOpen(!sidebarOpen)} className="btn-outline" style={{ padding: '0.55rem 1rem', borderRadius: '10px', fontSize: '0.85rem' }}>
              <List size={20} />
              <span className="hide-mobile">Syllabus Drawer</span>
            </button>

            <div className="flex items-center gap-3">
              <button onClick={handleComplete} className="btn-primary" style={{ padding: '0.6rem 1.4rem', borderRadius: '10px', fontSize: '0.88rem' }}>
                <CheckCircle size={18} />
                <span>{isCompleted ? 'Marked Complete — Next' : 'Complete & Continue'}</span>
              </button>
            </div>
          </div>

          {/* Video Player Box */}
          <div style={{ borderRadius: '20px', overflow: 'hidden', boxShadow: '0 25px 60px rgba(0,0,0,0.6)', background: '#000', border: '1px solid var(--glass-border)' }}>
            <VideoPlayer url={currentLesson.videoUrl} onEnded={handleComplete} />
          </div>

          {/* Lesson Details & Interactive Tabs */}
          <div className="mt-8 flex flex-col gap-6">
            
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
              <div>
                <h1 style={{ fontSize: 'clamp(1.4rem, 4vw, 2rem)', fontWeight: 800 }}>{currentLesson.title}</h1>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>{course?.title} • Lecture {lessons.findIndex(l => l._id === currentLesson._id) + 1} of {lessons.length}</p>
              </div>

              {/* Download Resources */}
              {currentLesson.resources?.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {currentLesson.resources.map((res, i) => (
                    <a key={i} href={res} target="_blank" rel="noreferrer" className="btn-outline" style={{ padding: '0.5rem 1rem', fontSize: '0.82rem', borderRadius: '8px' }}>
                      <Download size={15} />
                      <span>Resource #{i + 1}</span>
                    </a>
                  ))}
                </div>
              )}
            </div>

            {/* Tab Controls */}
            <div className="flex items-center gap-6" style={{ borderBottom: '1px solid var(--glass-border)', paddingBottom: '0.5rem' }}>
              <button 
                onClick={() => setActiveTab('overview')}
                style={{ 
                  background: 'none', border: 'none', padding: '0.5rem 0',
                  color: activeTab === 'overview' ? 'var(--primary)' : 'var(--text-muted)',
                  borderBottom: activeTab === 'overview' ? '2px solid var(--primary)' : '2px solid transparent',
                  fontWeight: 700, fontSize: '0.92rem', cursor: 'pointer'
                }}
              >
                Overview & Content
              </button>
              <button 
                onClick={() => setActiveTab('notes')}
                style={{ 
                  background: 'none', border: 'none', padding: '0.5rem 0',
                  color: activeTab === 'notes' ? 'var(--primary)' : 'var(--text-muted)',
                  borderBottom: activeTab === 'notes' ? '2px solid var(--primary)' : '2px solid transparent',
                  fontWeight: 700, fontSize: '0.92rem', cursor: 'pointer'
                }}
              >
                Personal Notes ({savedNotes.length})
              </button>
            </div>

            {/* Tab 1: Overview */}
            {activeTab === 'overview' && (
              <div className="card glass flex flex-col gap-4" style={{ padding: '2rem', borderRadius: '20px', lineHeight: 1.7 }}>
                <h3 className="flex items-center gap-2" style={{ fontSize: '1.15rem', color: 'var(--primary)', fontWeight: 700 }}>
                  <FileText size={20} />
                  Lesson Explanation
                </h3>
                <div style={{ color: 'var(--text-main)', fontSize: '0.98rem' }}>
                  {currentLesson.content || 'In this lecture, you will practice the step-by-step application of core techniques shown in the video demonstration.'}
                </div>
              </div>
            )}

            {/* Tab 2: Personal Notes */}
            {activeTab === 'notes' && (
              <div className="card glass flex flex-col gap-6" style={{ padding: '2rem', borderRadius: '20px' }}>
                <h3 className="flex items-center gap-2" style={{ fontSize: '1.15rem', fontWeight: 700 }}>
                  <Edit3 size={20} color="var(--primary)" />
                  My Lesson Notes
                </h3>
                
                <div className="flex flex-col gap-3">
                  <textarea 
                    placeholder="Take notes while watching this lesson..."
                    value={studyNote}
                    onChange={(e) => setStudyNote(e.target.value)}
                    style={{ minHeight: '100px', borderRadius: '12px', resize: 'none' }}
                  />
                  <button onClick={handleAddNote} className="btn-primary" style={{ alignSelf: 'flex-end', padding: '0.6rem 1.4rem', borderRadius: '8px', fontSize: '0.88rem' }}>
                    Save Note
                  </button>
                </div>

                <div className="flex flex-col gap-3 mt-2">
                  {savedNotes.map((note, idx) => (
                    <div key={idx} className="glass p-4 rounded-xl flex flex-col gap-1" style={{ background: 'rgba(255, 255, 255, 0.03)' }}>
                      <span style={{ fontSize: '0.75rem', color: 'var(--primary)', fontWeight: 700 }}>{note.time}</span>
                      <p style={{ fontSize: '0.9rem', color: 'var(--text-main)' }}>{note.text}</p>
                    </div>
                  ))}
                  {savedNotes.length === 0 && (
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem' }}>No notes saved for this lesson yet.</p>
                  )}
                </div>
              </div>
            )}

            {/* Bottom Prev / Next Nav */}
            <div className="flex items-center justify-between mt-8 pt-6 border-t border-glass">
              <button 
                className="btn-outline flex items-center gap-2" 
                style={{ borderRadius: '12px', padding: '0.65rem 1.25rem', fontSize: '0.88rem' }}
                onClick={() => {
                  const idx = lessons.findIndex(l => l._id === currentLesson._id);
                  if (idx > 0) navigate(`/course/${courseId}/learn/${lessons[idx-1]._id}`);
                }}
                disabled={lessons.findIndex(l => l._id === currentLesson._id) === 0}
              >
                <ChevronLeft size={18} />
                <span>Previous Lesson</span>
              </button>
              <button 
                className="btn-outline flex items-center gap-2"
                style={{ borderRadius: '12px', padding: '0.65rem 1.25rem', fontSize: '0.88rem' }}
                onClick={() => {
                  const idx = lessons.findIndex(l => l._id === currentLesson._id);
                  if (idx < lessons.length - 1) navigate(`/course/${courseId}/learn/${lessons[idx+1]._id}`);
                }}
                disabled={lessons.findIndex(l => l._id === currentLesson._id) === lessons.length - 1}
              >
                <span>Next Lesson</span>
                <ChevronRight size={18} />
              </button>
            </div>

          </div>
        </div>
      </div>

    </div>
  );
};

export default LessonViewer;
