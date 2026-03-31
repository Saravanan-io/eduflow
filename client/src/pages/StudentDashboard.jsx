import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { useSocket } from '../context/SocketContext';
import Spinner from '../components/Spinner';
import ProgressBar from '../components/ProgressBar';
import { Layout, BookOpen, Book, Clock, Award, ChevronRight, Activity } from 'lucide-react';

const StudentDashboard = () => {
  const { user } = useAuth();
  const socket = useSocket();
  const [enrollments, setEnrollments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchEnrollments();
  }, []);

  useEffect(() => {
    if (socket) {
      socket.on('progress_updated', ({ courseId, progress }) => {
        setEnrollments(prev => prev.map(enroll => 
          enroll.course._id === courseId ? { ...enroll, progress } : enroll
        ));
      });
      return () => socket.off('progress_updated');
    }
  }, [socket]);

  const fetchEnrollments = async () => {
    try {
      const { data } = await axios.get('/api/enrollments/my-courses');
      setEnrollments(data.enrollments);
    } catch (err) {
      console.error('Error fetching enrollments', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <Spinner />;

  const completedCourses = enrollments.filter(e => e.progress === 100).length;
  const inProgressCourses = enrollments.length - completedCourses;

  return (
    <div className="flex flex-col gap-10 animate-fade" style={{ paddingBottom: '3rem' }}>
      <div className="flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="text-center md:text-left">
          <h1 style={{ fontSize: 'clamp(1.75rem, 5vw, 2.5rem)', marginBottom: '0.5rem' }}>Welcome back, {user?.username}! 👋</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '1.05rem' }}>You've completed {completedCourses} courses so far. Keep it up!</p>
        </div>
        <div className="flex gap-4">
          <div className="glass text-center" style={{ padding: '1rem 1.5rem', borderRadius: '18px', minWidth: '100px' }}>
            <p style={{ fontSize: '1.75rem', fontWeight: 800 }}>{enrollments.length}</p>
            <p style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Enrolled</p>
          </div>
          <div className="glass text-center" style={{ padding: '1rem 1.5rem', borderRadius: '18px', minWidth: '100px', border: '1px solid var(--accent)' }}>
            <p style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--accent)' }}>{completedCourses}</p>
            <p style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Completed</p>
          </div>
        </div>
      </div>

      <div className="grid grid-2 grid-3" style={{ gap: '1.5rem' }}>
        <div className="card glass flex items-center gap-4" style={{ padding: '1.75rem' }}>
          <div style={{ padding: '1rem', background: 'rgba(99, 102, 241, 0.1)', borderRadius: '14px' }}>
            <Activity size={28} color="var(--primary)" />
          </div>
          <div>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 600 }}>Learning Hours</p>
            <p style={{ fontSize: '1.5rem', fontWeight: 800 }}>24.5h</p>
          </div>
        </div>
        <div className="card glass flex items-center gap-4" style={{ padding: '1.75rem' }}>
          <div style={{ padding: '1rem', background: 'rgba(34, 197, 94, 0.1)', borderRadius: '14px' }}>
            <Award size={28} color="var(--accent)" />
          </div>
          <div>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 600 }}>Certificates</p>
            <p style={{ fontSize: '1.5rem', fontWeight: 800 }}>{completedCourses}</p>
          </div>
        </div>
        <div className="card glass flex items-center gap-4" style={{ padding: '1.75rem' }}>
          <div style={{ padding: '1rem', background: 'rgba(245, 158, 11, 0.1)', borderRadius: '14px' }}>
            <BookOpen size={28} color="#f59e0b" />
          </div>
          <div>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 600 }}>Points</p>
            <p style={{ fontSize: '1.5rem', fontWeight: 800 }}>1,250</p>
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-6">
        <h2 style={{ fontSize: '1.75rem' }}>Your Learning Progress</h2>
        {enrollments.length > 0 ? (
          <div className="flex flex-col gap-4">
            {enrollments.map((enroll) => (
              <div key={enroll._id} className="card glass flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6" style={{ padding: '1.5rem 2rem', borderRadius: '24px' }}>
                <div className="flex items-center gap-6 flex-1 w-full">
                  <div className="hide-mobile" style={{ width: '120px', height: '70px', borderRadius: '12px', overflow: 'hidden', flexShrink: 0 }}>
                    <img src={enroll.course.thumbnail} style={{ width: '100%', height: '100%', objectFit: 'cover' }} alt="thumb" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 style={{ fontSize: '1.25rem', marginBottom: '0.5rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{enroll.course.title}</h3>
                    <div className="flex flex-wrap items-center gap-4 text-muted" style={{ fontSize: '0.85rem' }}>
                      <span className="flex items-center gap-1"><Book size={14} /> Enrolled: {new Date(enroll.enrolledAt).toLocaleDateString()}</span>
                      <span className="hide-mobile flex items-center gap-1"><Clock size={14} /> 12 Modules left</span>
                    </div>
                  </div>
                </div>
                
                <div className="flex flex-col sm:flex-row items-center gap-8 w-full sm:w-auto">
                  <div style={{ width: '100%', smBasis: '180px' }} className="sm:w-[180px]">
                    <ProgressBar progress={enroll.progress} showText={true} height="10px" />
                  </div>
                  <Link 
                    to={`/course/${enroll.course._id}/learn/${enroll.completedLessons[enroll.completedLessons.length - 1] || 'start'}`} 
                    className="btn-primary w-full sm:w-auto"
                    style={{ padding: '0.75rem 1.5rem', borderRadius: '14px' }}
                  >
                    <span>{enroll.progress === 100 ? 'Review' : 'Continue'}</span>
                    <ChevronRight size={18} />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="glass text-center py-24" style={{ borderRadius: '30px' }}>
            <p style={{ fontSize: '1.25rem', color: 'var(--text-muted)', marginBottom: '2rem' }}>You haven't started any courses yet.</p>
            <Link to="/courses" className="btn-primary" style={{ padding: '1rem 2.5rem', borderRadius: '16px' }}>Explore Catalog</Link>
          </div>
        )}
      </div>
    </div>
  );
};


export default StudentDashboard;
