import { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { User, Mail, Shield, Book, Award, Clock, Camera, BookOpen, ChevronRight, Loader2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import ProgressBar from '../components/ProgressBar';

const Profile = () => {
  const { user, setUser } = useAuth();
  const [enrollments, setEnrollments] = useState([]);
  const [loadingEnrollments, setLoadingEnrollments] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [preview, setPreview] = useState(null);
  const fileInputRef = useRef(null);

  useEffect(() => { if (user) fetchEnrollments(); }, [user]);

  const fetchEnrollments = async () => {
    try {
      const { data } = await axios.get('/api/enrollments/my-courses');
      setEnrollments(data.enrollments || []);
    } catch (err) {
      console.error('Error fetching enrollments', err);
    } finally {
      setLoadingEnrollments(false);
    }
  };

  const handleFileClick = () => fileInputRef.current?.click();

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => setPreview(reader.result);
    reader.readAsDataURL(file);
    setUploading(true);
    try {
      const base64String = await new Promise((resolve) => {
        const r = new FileReader();
        r.onload = () => resolve(r.result);
        r.readAsDataURL(file);
      });
      const { data } = await axios.put('/api/auth/avatar', { avatar: base64String });
      if (data.success) { setUser({ ...user, avatar: data.avatar }); setPreview(null); }
    } catch (err) {
      alert('Failed to upload profile picture');
    } finally {
      setUploading(false);
    }
  };

  if (!user) return <div style={{ textAlign: 'center', padding: '5rem', color: 'var(--text-muted)' }}>Please login to view profile.</div>;

  const completedCourses = enrollments.filter(e => e.progress === 100).length;
  const inProgress = enrollments.length - completedCourses;

  return (
    <div style={{ maxWidth: '900px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '1.5rem', paddingBottom: '3rem' }}>

      {/* Profile Header Card */}
      <div style={{
        background: 'var(--bg-card)',
        border: '1px solid var(--border-color)',
        borderRadius: '20px',
        overflow: 'hidden',
        boxShadow: 'var(--card-shadow)'
      }}>
        {/* Cover Banner */}
        <div style={{
          height: '120px',
          background: 'linear-gradient(135deg, #4f46e5 0%, #7c3aed 50%, #db2777 100%)',
          position: 'relative'
        }} />

        {/* Avatar + Info Row */}
        <div style={{ padding: '0 2rem 2rem 2rem', position: 'relative' }}>
          {/* Avatar */}
          <div style={{ position: 'relative', display: 'inline-block', marginTop: '-50px' }}>
            <div style={{
              width: '100px', height: '100px', borderRadius: '50%',
              border: '4px solid var(--bg-card)',
              overflow: 'hidden', background: 'var(--bg-card2)',
              boxShadow: '0 4px 20px rgba(0,0,0,0.15)'
            }}>
              <img
                src={preview || user.avatar || `https://ui-avatars.com/api/?name=${user.username}&background=6366f1&color=fff&size=200`}
                alt="Profile"
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              />
              {uploading && (
                <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '50%' }}>
                  <Loader2 size={28} color="#fff" style={{ animation: 'spin 1s linear infinite' }} />
                </div>
              )}
            </div>
            <button
              onClick={handleFileClick}
              disabled={uploading}
              title="Change photo"
              style={{
                position: 'absolute', bottom: '4px', right: '4px',
                width: '30px', height: '30px', borderRadius: '50%',
                background: 'var(--primary)', color: '#fff',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                border: '2px solid var(--bg-card)', cursor: 'pointer',
                boxShadow: '0 2px 8px rgba(79,70,229,0.4)'
              }}
            >
              <Camera size={14} />
            </button>
            <input type="file" ref={fileInputRef} hidden accept="image/*" onChange={handleFileChange} />
          </div>

          {/* Name + Role */}
          <div style={{ marginTop: '0.75rem', display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
            <div>
              <h1 style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--text-main)', marginBottom: '0.35rem' }}>{user.username}</h1>
              <span style={{
                display: 'inline-block',
                background: 'rgba(79,70,229,0.12)', color: 'var(--primary)',
                border: '1px solid rgba(79,70,229,0.3)',
                padding: '3px 14px', borderRadius: '20px',
                fontSize: '0.78rem', fontWeight: 700, letterSpacing: '0.06em'
              }}>
                {user.role?.toUpperCase()}
              </span>
            </div>

            {/* Quick Stats Row */}
            <div style={{ display: 'flex', gap: '2rem' }}>
              {[
                { icon: <Book size={18} />, val: enrollments.length, label: 'Courses Joined', color: '#6366f1' },
                { icon: <Award size={18} />, val: completedCourses, label: 'Completed', color: '#10b981' },
                { icon: <Clock size={18} />, val: inProgress, label: 'In Progress', color: '#f59e0b' },
              ].map((s, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <div style={{
                    width: '38px', height: '38px', borderRadius: '10px',
                    background: `${s.color}18`, color: s.color,
                    display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0
                  }}>
                    {s.icon}
                  </div>
                  <div>
                    <div style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--text-main)', lineHeight: 1.2 }}>{s.val}</div>
                    <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: 600 }}>{s.label}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Info + Security Row */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem' }}>
        {/* Personal Info */}
        <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: '16px', padding: '1.5rem', boxShadow: 'var(--card-shadow)' }}>
          <h2 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '1.25rem' }}>Personal Info</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
            {[
              { icon: <Mail size={17} />, label: 'Email Address', value: user.email },
              { icon: <Shield size={17} />, label: 'Member Since', value: new Date(user.createdAt).toLocaleDateString() },
            ].map((row, i) => (
              <div key={i} style={{
                display: 'flex', alignItems: 'center', gap: '1rem',
                background: 'var(--bg-card2)', borderRadius: '12px', padding: '0.85rem 1rem',
                border: '1px solid var(--border-color)'
              }}>
                <div style={{ color: 'var(--text-muted)', flexShrink: 0 }}>{row.icon}</div>
                <div>
                  <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: 600, marginBottom: '2px' }}>{row.label}</div>
                  <div style={{ fontSize: '0.92rem', fontWeight: 600, color: 'var(--text-main)' }}>{row.value}</div>
                </div>
              </div>
            ))}
          </div>
          <button style={{
            marginTop: '1.25rem', width: '100%', padding: '0.65rem',
            border: '1px solid var(--border-color)', borderRadius: '10px',
            background: 'transparent', color: 'var(--text-main)',
            fontSize: '0.88rem', fontWeight: 600, cursor: 'pointer',
            transition: 'all 0.2s'
          }}>
            Edit Basic Settings
          </button>
        </div>

        {/* Security */}
        <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: '16px', padding: '1.5rem', boxShadow: 'var(--card-shadow)' }}>
          <h2 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '0.5rem' }}>Security Center</h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.84rem', marginBottom: '1.25rem', lineHeight: 1.5 }}>
            Protect your account with high-security MFA and periodic password changes.
          </p>
          <div style={{
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            background: 'var(--bg-card2)', borderRadius: '12px', padding: '0.85rem 1rem',
            border: '1px solid var(--border-color)', marginBottom: '1.25rem'
          }}>
            <span style={{ fontSize: '0.9rem', fontWeight: 600 }}>Two-Factor Auth</span>
            <span style={{
              background: 'rgba(239,68,68,0.1)', color: '#ef4444',
              border: '1px solid rgba(239,68,68,0.2)',
              padding: '2px 10px', borderRadius: '6px', fontSize: '0.72rem', fontWeight: 700
            }}>DISABLED</span>
          </div>
          <button style={{
            width: '100%', padding: '0.65rem',
            background: 'linear-gradient(135deg, #3b82f6, #2563eb)',
            color: '#fff', border: 'none', borderRadius: '10px',
            fontSize: '0.88rem', fontWeight: 700, cursor: 'pointer',
            boxShadow: '0 4px 12px rgba(59,130,246,0.3)'
          }}>
            Reset Password
          </button>
        </div>
      </div>

      {/* My Learning Journey */}
      <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: '16px', padding: '1.5rem', boxShadow: 'var(--card-shadow)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
          <h2 style={{ fontSize: '1.1rem', fontWeight: 700 }}>My Learning Journey</h2>
          <Link to="/enrolled" style={{
            padding: '0.45rem 1rem', borderRadius: '8px',
            border: '1px solid var(--border-color)', fontSize: '0.82rem', fontWeight: 600,
            color: 'var(--text-main)'
          }}>View All</Link>
        </div>

        {loadingEnrollments ? (
          <div style={{ display: 'flex', justifyContent: 'center', padding: '2rem' }}>
            <Loader2 size={28} color="var(--primary)" style={{ animation: 'spin 1s linear infinite' }} />
          </div>
        ) : enrollments.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '2.5rem 1rem' }}>
            <BookOpen size={48} color="var(--text-muted)" style={{ opacity: 0.4, marginBottom: '0.75rem' }} />
            <p style={{ color: 'var(--text-muted)', marginBottom: '1.25rem' }}>You haven't enrolled in any courses yet.</p>
            <Link to="/" style={{
              display: 'inline-block', padding: '0.65rem 1.5rem',
              background: 'linear-gradient(135deg, var(--primary), var(--secondary, #6366f1))',
              color: '#fff', borderRadius: '10px', fontWeight: 700, fontSize: '0.88rem'
            }}>
              Start Learning Today
            </Link>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
            {enrollments.slice(0, 4).map(enroll => (
              <div key={enroll._id} style={{
                display: 'flex', alignItems: 'center', gap: '1rem',
                background: 'var(--bg-card2)', borderRadius: '12px',
                padding: '0.85rem 1rem', border: '1px solid var(--border-color)'
              }}>
                <div style={{ width: '72px', height: '48px', borderRadius: '8px', overflow: 'hidden', flexShrink: 0 }}>
                  <img
                    src={enroll.course?.thumbnail || 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?q=80&w=200'}
                    alt={enroll.course?.title}
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  />
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ fontWeight: 700, fontSize: '0.92rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', marginBottom: '6px' }}>
                    {enroll.course?.title}
                  </p>
                  <ProgressBar progress={enroll.progress} showText={true} height="6px" />
                </div>
                <Link
                  to={`/course/${enroll.course?._id}/learn/${enroll.completedLessons?.[enroll.completedLessons.length - 1] || 'start'}`}
                  style={{
                    padding: '0.45rem 1rem', borderRadius: '8px',
                    background: 'linear-gradient(135deg, var(--primary), #6366f1)',
                    color: '#fff', fontSize: '0.8rem', fontWeight: 700,
                    whiteSpace: 'nowrap', display: 'flex', alignItems: 'center', gap: '4px'
                  }}
                >
                  {enroll.progress === 100 ? 'Review' : 'Continue'}
                  <ChevronRight size={14} />
                </Link>
              </div>
            ))}
          </div>
        )}
      </div>

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        @media (max-width: 700px) {
          .profile-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </div>
  );
};

export default Profile;
