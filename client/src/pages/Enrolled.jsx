import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import Spinner from '../components/Spinner';
import ProgressBar from '../components/ProgressBar';
import { BookOpen, Clock, ChevronRight, GraduationCap, SearchX, CheckCircle2, PlayCircle } from 'lucide-react';

const Enrolled = () => {
  const { user } = useAuth();
  const [enrollments, setEnrollments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('all');

  useEffect(() => {
    if (user) fetchEnrollments();
    else setLoading(false);
  }, [user]);

  const fetchEnrollments = async () => {
    try {
      const { data } = await axios.get('/api/enrollments/my-courses');
      setEnrollments(data && Array.isArray(data.enrollments) ? data.enrollments : []);
    } catch (err) {
      console.error('Error fetching enrollments', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <Spinner />;

  if (!user) {
    return (
      <div style={{
        maxWidth: '480px', margin: '4rem auto', textAlign: 'center',
        background: 'var(--bg-card)', border: '1px solid var(--border-color)',
        borderRadius: '20px', padding: '3rem 2rem', boxShadow: 'var(--card-shadow)'
      }}>
        <GraduationCap size={52} color="var(--primary)" style={{ marginBottom: '1rem' }} />
        <h2 style={{ fontSize: '1.4rem', marginBottom: '0.5rem' }}>Login to See Your Courses</h2>
        <p style={{ color: 'var(--text-muted)', marginBottom: '1.5rem', fontSize: '0.9rem' }}>Please log in to view your enrolled courses.</p>
        <Link to="/login" className="btn-primary">Login Now</Link>
      </div>
    );
  }

  const completed = enrollments.filter(e => e.progress === 100);
  const inProgress = enrollments.filter(e => e.progress < 100);

  const tabMap = { all: enrollments, 'in-progress': inProgress, completed };
  const displayed = tabMap[activeTab] || enrollments;

  const tabs = [
    { key: 'all', label: `All (${enrollments.length})` },
    { key: 'in-progress', label: `In Progress (${inProgress.length})` },
    { key: 'completed', label: `Completed (${completed.length})` },
  ];

  return (
    <div style={{ maxWidth: '900px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '1.5rem', paddingBottom: '3rem' }}>

      {/* Page Header */}
      <div>
        <h1 style={{ fontSize: '1.75rem', fontWeight: 800, marginBottom: '0.35rem' }}>My Enrolled Courses</h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
          {enrollments.length} course{enrollments.length !== 1 ? 's' : ''} total — {completed.length} completed, {inProgress.length} in progress
        </p>
      </div>

      {/* Summary Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem' }}>
        {[
          { label: 'Total Enrolled', value: enrollments.length, color: '#6366f1', bg: 'rgba(99,102,241,0.1)' },
          { label: 'In Progress', value: inProgress.length, color: '#f59e0b', bg: 'rgba(245,158,11,0.1)' },
          { label: 'Completed', value: completed.length, color: '#10b981', bg: 'rgba(16,185,129,0.1)' },
        ].map((s, i) => (
          <div key={i} style={{
            background: 'var(--bg-card)', border: '1px solid var(--border-color)',
            borderRadius: '14px', padding: '1.25rem',
            display: 'flex', alignItems: 'center', gap: '1rem',
            boxShadow: 'var(--card-shadow)'
          }}>
            <div style={{
              width: '46px', height: '46px', borderRadius: '12px',
              background: s.bg, color: s.color,
              display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0
            }}>
              <BookOpen size={22} />
            </div>
            <div>
              <div style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--text-main)', lineHeight: 1.2 }}>{s.value}</div>
              <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontWeight: 600 }}>{s.label}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Tab Filter Bar */}
      {enrollments.length > 0 && (
        <div style={{
          display: 'flex', gap: '0.5rem',
          borderBottom: '2px solid var(--border-color)',
          paddingBottom: '0'
        }}>
          {tabs.map(tab => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              style={{
                padding: '0.6rem 1.25rem',
                background: 'none',
                border: 'none',
                borderBottom: activeTab === tab.key ? '2px solid var(--primary)' : '2px solid transparent',
                marginBottom: '-2px',
                fontWeight: 700,
                fontSize: '0.88rem',
                color: activeTab === tab.key ? 'var(--primary)' : 'var(--text-muted)',
                cursor: 'pointer',
                transition: 'all 0.2s',
                whiteSpace: 'nowrap'
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>
      )}

      {/* Course List */}
      {enrollments.length === 0 ? (
        <div style={{
          textAlign: 'center', padding: '4rem 2rem',
          background: 'var(--bg-card)', border: '1px solid var(--border-color)',
          borderRadius: '20px', boxShadow: 'var(--card-shadow)'
        }}>
          <SearchX size={52} color="var(--text-muted)" style={{ opacity: 0.4, marginBottom: '1rem' }} />
          <h2 style={{ fontSize: '1.3rem', marginBottom: '0.5rem' }}>No Courses Yet</h2>
          <p style={{ color: 'var(--text-muted)', marginBottom: '1.5rem', fontSize: '0.9rem' }}>
            You haven't enrolled in any courses. Start learning today!
          </p>
          <Link to="/" className="btn-primary">Browse Catalog</Link>
        </div>
      ) : displayed.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
          No courses in this category yet.
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {displayed.map(enroll => (
            <EnrollCard key={enroll._id} enroll={enroll} />
          ))}
        </div>
      )}

    </div>
  );
};

const EnrollCard = ({ enroll }) => {
  const isDone = enroll.progress === 100;
  const lessonCount = enroll.course?.lessons?.length || 0;
  const fallbackThumb = 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?q=80&w=300';

  return (
    <div style={{
      background: 'var(--bg-card)',
      border: '1px solid var(--border-color)',
      borderRadius: '16px',
      padding: '1.25rem 1.5rem',
      display: 'flex',
      alignItems: 'center',
      gap: '1.25rem',
      boxShadow: 'var(--card-shadow)',
      flexWrap: 'wrap',
      transition: 'all 0.2s'
    }}>

      {/* Thumbnail */}
      <div style={{
        width: '100px', height: '64px', borderRadius: '10px',
        overflow: 'hidden', flexShrink: 0,
        background: 'var(--bg-card2)',
        border: '1px solid var(--border-color)'
      }}>
        <img
          src={enroll.course?.thumbnail || fallbackThumb}
          alt={enroll.course?.title}
          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
          onError={e => { e.target.src = fallbackThumb; }}
        />
      </div>

      {/* Title & Meta */}
      <div style={{ flex: 1, minWidth: '160px' }}>
        <h3 style={{
          fontSize: '1rem', fontWeight: 700, marginBottom: '0.35rem',
          color: 'var(--text-main)',
          overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap'
        }}>
          {enroll.course?.title || 'Course Title'}
        </h3>
        <div style={{ display: 'flex', gap: '1rem', fontSize: '0.78rem', color: 'var(--text-muted)', flexWrap: 'wrap' }}>
          <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            <BookOpen size={13} /> {lessonCount} lessons
          </span>
          <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            <Clock size={13} /> Enrolled {new Date(enroll.enrolledAt).toLocaleDateString()}
          </span>
        </div>
      </div>

      {/* Progress Bar */}
      <div style={{ minWidth: '180px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '4px' }}>
          <span>Progress</span>
          <span style={{ fontWeight: 700, color: isDone ? '#10b981' : 'var(--primary)' }}>{enroll.progress}%</span>
        </div>
        <div style={{
          height: '7px', background: 'var(--bg-card2)',
          borderRadius: '10px', overflow: 'hidden',
          border: '1px solid var(--border-color)'
        }}>
          <div style={{
            height: '100%',
            width: `${enroll.progress}%`,
            background: isDone
              ? 'linear-gradient(90deg, #10b981, #34d399)'
              : 'linear-gradient(90deg, var(--primary), #6366f1)',
            borderRadius: '10px',
            transition: 'width 0.4s ease'
          }} />
        </div>
      </div>

      {/* CTA Button */}
      <Link
        to={`/course/${enroll.course?._id}/learn/${enroll.completedLessons?.[enroll.completedLessons.length - 1] || 'start'}`}
        style={{
          display: 'inline-flex', alignItems: 'center', gap: '6px',
          padding: '0.55rem 1.15rem', borderRadius: '10px',
          background: isDone
            ? 'linear-gradient(135deg, #10b981, #059669)'
            : 'linear-gradient(135deg, var(--primary), #6366f1)',
          color: '#ffffff', fontWeight: 700, fontSize: '0.85rem',
          whiteSpace: 'nowrap', textDecoration: 'none',
          boxShadow: isDone ? '0 4px 12px rgba(16,185,129,0.3)' : '0 4px 12px var(--primary-glow)',
          transition: 'all 0.2s'
        }}
      >
        {isDone ? <><CheckCircle2 size={15} /> Review</> : <><PlayCircle size={15} /> Continue</>}
      </Link>

    </div>
  );
};

export default Enrolled;
