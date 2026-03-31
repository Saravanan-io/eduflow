import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { useSocket } from '../context/SocketContext';
import Spinner from '../components/Spinner';
import ProgressBar from '../components/ProgressBar';
import { Layout, BookOpen, Clock, Award, ChevronRight, Activity } from 'lucide-react';

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
    <div className="flex flex-col gap-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 style={{ fontSize: '2rem' }}>Welcome back, {user?.username}! 👋</h1>
          <p style={{ color: 'var(--text-muted)' }}>You've completed {completedCourses} courses so far. Keep it up!</p>
        </div>
        <div className="flex gap-4 hide-mobile">
          <div className="glass text-center" style={{ padding: '0.75rem 1.5rem', borderRadius: '15px' }}>
            <p style={{ fontSize: '1.5rem', fontWeight: 700 }}>{enrollments.length}</p>
            <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Enrolled</p>
          </div>
          <div className="glass text-center" style={{ padding: '0.75rem 1.5rem', borderRadius: '15px' }}>
            <p style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--accent)' }}>{completedCourses}</p>
            <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Completed</p>
          </div>
        </div>
      </div>

      <div className="grid grid-3" style={{ gap: '1.5rem' }}>
        <div className="card glass flex items-center gap-4">
          <div style={{ padding: '1rem', background: 'rgba(99, 102, 241, 0.1)', borderRadius: '12px' }}>
            <Activity size={24} color="var(--primary)" />
          </div>
          <div>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Learning Hours</p>
            <p style={{ fontSize: '1.25rem', fontWeight: 700 }}>24.5h</p>
          </div>
        </div>
        <div className="card glass flex items-center gap-4">
          <div style={{ padding: '1rem', background: 'rgba(34, 197, 94, 0.1)', borderRadius: '12px' }}>
            <Award size={24} color="var(--accent)" />
          </div>
          <div>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Certificates</p>
            <p style={{ fontSize: '1.25rem', fontWeight: 700 }}>{completedCourses}</p>
          </div>
        </div>
        <div className="card glass flex items-center gap-4">
          <div style={{ padding: '1rem', background: 'rgba(245, 158, 11, 0.1)', borderRadius: '12px' }}>
            <BookOpen size={24} color="#f59e0b" />
          </div>
          <div>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Points</p>
            <p style={{ fontSize: '1.25rem', fontWeight: 700 }}>1,250</p>
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-6">
        <h2 style={{ fontSize: '1.5rem' }}>Your Courses</h2>
        {enrollments.length > 0 ? (
          <div className="flex flex-col gap-4">
            {enrollments.map((enroll) => (
              <div key={enroll._id} className="card glass flex items-center justify-between gap-6" style={{ padding: '1.5rem 2rem' }}>
                <div className="flex items-center gap-6 flex-1">
                  <div style={{ width: '100px', height: '60px', borderRadius: '8px', overflow: 'hidden' }}>
                    <img src={enroll.course.thumbnail} style={{ width: '100%', height: '100%', objectFit: 'cover' }} alt="thumb" />
                  </div>
                  <div className="flex-1">
                    <h3 style={{ fontSize: '1.1rem', marginBottom: '0.5rem' }}>{enroll.course.title}</h3>
                    <div className="flex items-center gap-4 text-muted" style={{ fontSize: '0.85rem' }}>
                      <span className="flex items-center gap-1"><User size={14} /> {enroll.course.instructor?.username}</span>
                      <span className="flex items-center gap-1"><Clock size={14} /> Enrolled on {new Date(enroll.enrolledAt).toLocaleDateString()}</span>
                    </div>
                  </div>
                </div>
                
                <div style={{ width: '200px' }} className="hide-mobile">
                  <ProgressBar progress={enroll.progress} showText={true} />
                </div>

                <Link to={`/course/${enroll.course._id}/learn/${enroll.completedLessons[enroll.completedLessons.length - 1] || 'start'}`} className="btn-outline flex items-center gap-2">
                  <span>{enroll.progress === 100 ? 'Review' : 'Continue'}</span>
                  <ChevronRight size={18} />
                </Link>
              </div>
            ))}
          </div>
        ) : (
          <div className="glass text-center py-20" style={{ borderRadius: '20px' }}>
            <p style={{ fontSize: '1.2rem', color: 'var(--text-muted)', marginBottom: '1.5rem' }}>You are not enrolled in any courses yet.</p>
            <Link to="/" className="btn-primary">Browse Catalog</Link>
          </div>
        )}
      </div>
    </div>
  );
};

export default StudentDashboard;
