import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import Spinner from '../components/Spinner';
import ProgressBar from '../components/ProgressBar';
import { BookOpen, Clock, ChevronRight, GraduationCap, SearchX } from 'lucide-react';

const Enrolled = () => {
  const { user } = useAuth();
  const [enrollments, setEnrollments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) fetchEnrollments();
    else setLoading(false);
  }, [user]);

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

  if (!user) {
    return (
      <div className="glass text-center" style={{ padding: '5rem 2rem', borderRadius: '30px', maxWidth: '600px', margin: '4rem auto' }}>
        <GraduationCap size={56} color="var(--primary)" style={{ margin: '0 auto 1.5rem' }} />
        <h2 style={{ fontSize: '1.75rem', marginBottom: '1rem' }}>Login to See Your Courses</h2>
        <p style={{ color: 'var(--text-muted)', marginBottom: '2rem' }}>Please log in to view your enrolled courses.</p>
        <Link to="/login" className="btn-primary" style={{ padding: '0.9rem 2rem' }}>Login Now</Link>
      </div>
    );
  }

  const completed = enrollments.filter(e => e.progress === 100);
  const inProgress = enrollments.filter(e => e.progress < 100);

  return (
    <div className="flex flex-col gap-10" style={{ paddingBottom: '3rem' }}>
      {/* Header */}
      <div>
        <h1 style={{ fontSize: 'clamp(1.75rem, 5vw, 2.5rem)', marginBottom: '0.5rem' }}>My Enrolled Courses</h1>
        <p style={{ color: 'var(--text-muted)' }}>
          {enrollments.length} course{enrollments.length !== 1 ? 's' : ''} total — {completed.length} completed, {inProgress.length} in progress
        </p>
      </div>

      {enrollments.length === 0 ? (
        <div className="glass text-center" style={{ padding: '5rem 2rem', borderRadius: '30px' }}>
          <SearchX size={56} color="var(--text-muted)" style={{ margin: '0 auto 1.5rem' }} />
          <h2 style={{ fontSize: '1.5rem', marginBottom: '1rem' }}>No Courses Yet</h2>
          <p style={{ color: 'var(--text-muted)', marginBottom: '2rem' }}>You haven't enrolled in any courses. Start learning today!</p>
          <Link to="/" className="btn-primary" style={{ padding: '0.9rem 2.5rem', borderRadius: '14px' }}>Browse Catalog</Link>
        </div>
      ) : (
        <>
          {inProgress.length > 0 && (
            <section className="flex flex-col gap-4">
              <h2 style={{ fontSize: '1.4rem', fontWeight: 700 }}>
                <span style={{ color: 'var(--primary)' }}>● </span>In Progress
              </h2>
              {inProgress.map(enroll => (
                <EnrollCard key={enroll._id} enroll={enroll} />
              ))}
            </section>
          )}

          {completed.length > 0 && (
            <section className="flex flex-col gap-4">
              <h2 style={{ fontSize: '1.4rem', fontWeight: 700 }}>
                <span style={{ color: 'var(--accent)' }}>✓ </span>Completed
              </h2>
              {completed.map(enroll => (
                <EnrollCard key={enroll._id} enroll={enroll} />
              ))}
            </section>
          )}
        </>
      )}
    </div>
  );
};

const EnrollCard = ({ enroll }) => (
  <div
    className="card glass"
    style={{
      padding: '1.5rem 2rem',
      borderRadius: '20px',
      display: 'flex',
      flexWrap: 'wrap',
      alignItems: 'center',
      gap: '1.5rem',
    }}
  >
    {/* Thumbnail */}
    <div style={{ width: '110px', height: '70px', borderRadius: '12px', overflow: 'hidden', flexShrink: 0 }}>
      <img
        src={enroll.course?.thumbnail || 'https://via.placeholder.com/110x70?text=Course'}
        alt={enroll.course?.title}
        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
      />
    </div>

    {/* Info */}
    <div style={{ flex: 1, minWidth: '180px' }}>
      <h3 style={{ fontSize: '1.1rem', marginBottom: '0.4rem', fontWeight: 700 }}>{enroll.course?.title}</h3>
      <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
        <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
          <BookOpen size={13} /> {enroll.course?.lessons?.length || 0} lessons
        </span>
        <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
          <Clock size={13} /> Enrolled {new Date(enroll.enrolledAt).toLocaleDateString()}
        </span>
      </div>
    </div>

    {/* Progress + CTA */}
    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', minWidth: '160px' }}>
      <ProgressBar progress={enroll.progress} showText={true} height="8px" />
    </div>

    <Link
      to={`/course/${enroll.course?._id}/learn/${enroll.completedLessons?.[enroll.completedLessons.length - 1] || 'start'}`}
      className="btn-primary"
      style={{ padding: '0.65rem 1.4rem', borderRadius: '12px', display: 'flex', alignItems: 'center', gap: '6px', whiteSpace: 'nowrap' }}
    >
      {enroll.progress === 100 ? 'Review' : 'Continue'}
      <ChevronRight size={16} />
    </Link>
  </div>
);

export default Enrolled;
