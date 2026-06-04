import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import Spinner from '../components/Spinner';
import { Trophy, Medal, Star, GraduationCap, BookOpen, Lock } from 'lucide-react';

const Awards = () => {
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
      <div className="glass text-center" style={{ padding: '5rem 2rem', borderRadius: '30px', maxWidth: '600px', margin: '4rem auto' }}>
        <Trophy size={56} color="var(--primary)" style={{ margin: '0 auto 1.5rem' }} />
        <h2 style={{ fontSize: '1.75rem', marginBottom: '1rem' }}>Login to View Awards</h2>
        <p style={{ color: 'var(--text-muted)', marginBottom: '2rem' }}>Please log in to see your achievements and certificates.</p>
        <Link to="/login" className="btn-primary" style={{ padding: '0.9rem 2rem' }}>Login Now</Link>
      </div>
    );
  }

  const completed = enrollments.filter(e => e.progress === 100);

  // Static badge definitions — unlocked based on completed count
  const badges = [
    { id: 1, title: 'First Step', desc: 'Complete your first course', icon: <Star size={32} color="#f59e0b" />, unlocked: completed.length >= 1, color: '#f59e0b' },
    { id: 2, title: 'On a Roll', desc: 'Complete 3 courses', icon: <Medal size={32} color="#6366f1" />, unlocked: completed.length >= 3, color: '#6366f1' },
    { id: 3, title: 'Knowledge Seeker', desc: 'Complete 5 courses', icon: <BookOpen size={32} color="#22c55e" />, unlocked: completed.length >= 5, color: '#22c55e' },
    { id: 4, title: 'Master Learner', desc: 'Complete 10 courses', icon: <GraduationCap size={32} color="#ec4899" />, unlocked: completed.length >= 10, color: '#ec4899' },
    { id: 5, title: 'Champion', desc: 'Complete 20 courses', icon: <Trophy size={32} color="#f97316" />, unlocked: completed.length >= 20, color: '#f97316' },
  ];

  return (
    <div className="flex flex-col gap-10" style={{ paddingBottom: '3rem' }}>
      {/* Header */}
      <div>
        <h1 style={{ fontSize: 'clamp(1.75rem, 5vw, 2.5rem)', marginBottom: '0.5rem' }}>My Awards & Achievements</h1>
        <p style={{ color: 'var(--text-muted)' }}>{completed.length} course{completed.length !== 1 ? 's' : ''} completed — keep going to unlock more badges!</p>
      </div>

      {/* Stats row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '1.25rem' }}>
        <StatCard icon={<Trophy size={26} color="#f59e0b" />} value={completed.length} label="Certificates Earned" />
        <StatCard icon={<Star size={26} color="#6366f1" />} value={badges.filter(b => b.unlocked).length} label="Badges Unlocked" />
        <StatCard icon={<BookOpen size={26} color="#22c55e" />} value={enrollments.length} label="Courses Enrolled" />
      </div>

      {/* Certificates */}
      <section className="flex flex-col gap-6">
        <h2 style={{ fontSize: '1.4rem', fontWeight: 700 }}>Certificates</h2>
        {completed.length === 0 ? (
          <div className="glass text-center" style={{ padding: '3rem', borderRadius: '20px' }}>
            <GraduationCap size={48} color="var(--text-muted)" style={{ margin: '0 auto 1rem' }} />
            <p style={{ color: 'var(--text-muted)', marginBottom: '1.5rem' }}>Complete a course to earn your first certificate!</p>
            <Link to="/" className="btn-primary" style={{ padding: '0.8rem 2rem', borderRadius: '12px' }}>Browse Courses</Link>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1.25rem' }}>
            {completed.map(enroll => (
              <div
                key={enroll._id}
                className="glass"
                style={{
                  borderRadius: '20px',
                  overflow: 'hidden',
                  border: '1px solid rgba(99, 102, 241, 0.3)',
                  transition: 'transform 0.2s ease, box-shadow 0.2s ease',
                }}
                onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-4px)'; e.currentTarget.style.boxShadow = '0 12px 40px rgba(99,102,241,0.25)'; }}
                onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = ''; }}
              >
                {/* Certificate visual */}
                <div style={{
                  background: 'linear-gradient(135deg, rgba(99,102,241,0.15), rgba(167,139,250,0.1))',
                  padding: '2rem',
                  textAlign: 'center',
                  borderBottom: '1px solid rgba(99,102,241,0.2)',
                }}>
                  <GraduationCap size={48} color="var(--primary)" style={{ margin: '0 auto 0.75rem' }} />
                  <p style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '0.4rem' }}>Certificate of Completion</p>
                  <p style={{ fontSize: '0.85rem', fontWeight: 700, color: 'white' }}>{enroll.course?.title}</p>
                </div>
                <div style={{ padding: '1.25rem 1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.8rem' }}>
                  <span style={{ color: 'var(--text-muted)' }}>
                    Completed: {enroll.completedAt ? new Date(enroll.completedAt).toLocaleDateString() : 'Recently'}
                  </span>
                  <span style={{ background: 'rgba(34,197,94,0.15)', color: '#22c55e', padding: '2px 10px', borderRadius: '20px', fontWeight: 700 }}>
                    ✓ Done
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Badges */}
      <section className="flex flex-col gap-6">
        <h2 style={{ fontSize: '1.4rem', fontWeight: 700 }}>Badges</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: '1.25rem' }}>
          {badges.map(badge => (
            <div
              key={badge.id}
              className="glass flex flex-col items-center"
              style={{
                padding: '2rem 1.25rem',
                borderRadius: '20px',
                textAlign: 'center',
                opacity: badge.unlocked ? 1 : 0.45,
                border: badge.unlocked ? `1px solid ${badge.color}40` : '1px solid rgba(255,255,255,0.05)',
                transition: 'transform 0.2s ease',
                position: 'relative',
              }}
            >
              {!badge.unlocked && (
                <div style={{ position: 'absolute', top: '10px', right: '10px' }}>
                  <Lock size={14} color="var(--text-muted)" />
                </div>
              )}
              <div style={{
                width: '64px', height: '64px', borderRadius: '50%',
                background: badge.unlocked ? `${badge.color}20` : 'rgba(255,255,255,0.05)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                marginBottom: '1rem',
              }}>
                {badge.icon}
              </div>
              <p style={{ fontWeight: 700, marginBottom: '0.4rem' }}>{badge.title}</p>
              <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{badge.desc}</p>
              {badge.unlocked && (
                <span style={{
                  marginTop: '0.75rem', fontSize: '0.7rem', fontWeight: 700,
                  background: `${badge.color}20`, color: badge.color,
                  padding: '2px 10px', borderRadius: '20px',
                }}>UNLOCKED</span>
              )}
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};

const StatCard = ({ icon, value, label }) => (
  <div className="card glass flex items-center gap-4" style={{ padding: '1.5rem' }}>
    <div style={{ padding: '0.9rem', background: 'rgba(255,255,255,0.05)', borderRadius: '12px' }}>
      {icon}
    </div>
    <div>
      <p style={{ fontSize: '1.6rem', fontWeight: 800 }}>{value}</p>
      <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{label}</p>
    </div>
  </div>
);

export default Awards;
