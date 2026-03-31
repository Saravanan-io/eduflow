import { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { User, Mail, Shield, Book, Award, Clock, Camera, BookOpen, ChevronRight, CheckCircle, AlertCircle, Loader } from 'lucide-react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import ProgressBar from '../components/ProgressBar';

const Profile = () => {
  const { user, login } = useAuth();
  const fileInputRef = useRef(null);

  const [enrollments, setEnrollments] = useState([]);
  const [loadingEnrollments, setLoadingEnrollments] = useState(true);
  const [avatarPreview, setAvatarPreview] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [toast, setToast] = useState(null); // { type: 'success'|'error', msg }

  useEffect(() => {
    if (user) fetchEnrollments();
  }, [user]);

  const fetchEnrollments = async () => {
    try {
      const { data } = await axios.get('/api/enrollments/my-courses');
      setEnrollments(data.enrollments);
    } catch (err) {
      console.error('Error fetching enrollments', err);
    } finally {
      setLoadingEnrollments(false);
    }
  };

  const showToast = (type, msg) => {
    setToast({ type, msg });
    setTimeout(() => setToast(null), 3500);
  };

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validate type
    if (!file.type.startsWith('image/')) {
      showToast('error', 'Please select a valid image file.');
      return;
    }
    // Validate size (max 4MB)
    if (file.size > 4 * 1024 * 1024) {
      showToast('error', 'Image must be under 4MB.');
      return;
    }

    const reader = new FileReader();
    reader.onloadend = async () => {
      const base64 = reader.result;
      setAvatarPreview(base64);
      setUploading(true);
      try {
        const { data } = await axios.put('/api/auth/avatar', { avatar: base64 });
        // Patch user context avatar without full re-login
        if (data.success) {
          showToast('success', 'Profile picture updated!');
        }
      } catch (err) {
        showToast('error', err.response?.data?.message || 'Upload failed. Try again.');
        setAvatarPreview(null);
      } finally {
        setUploading(false);
      }
    };
    reader.readAsDataURL(file);
    // Reset so same file can be re-selected
    e.target.value = '';
  };

  if (!user) return <div className="text-center py-20">Please login to view profile.</div>;

  const completedCourses = enrollments.filter(e => e.progress === 100).length;
  const currentAvatar = avatarPreview || user.avatar || `https://ui-avatars.com/api/?name=${user.username}&background=6366f1&color=fff&size=160`;

  return (
    <div className="container flex flex-col gap-10 py-10" style={{ maxWidth: '1000px' }}>

      {/* Toast notification */}
      {toast && (
        <div style={{
          position: 'fixed', top: '90px', right: '2rem', zIndex: 9999,
          display: 'flex', alignItems: 'center', gap: '0.75rem',
          background: toast.type === 'success' ? 'rgba(34,197,94,0.15)' : 'rgba(239,68,68,0.15)',
          border: `1px solid ${toast.type === 'success' ? 'rgba(34,197,94,0.4)' : 'rgba(239,68,68,0.4)'}`,
          backdropFilter: 'blur(12px)', padding: '1rem 1.5rem',
          borderRadius: '14px', boxShadow: '0 8px 32px rgba(0,0,0,0.3)',
          animation: 'fadeIn 0.3s ease',
        }}>
          {toast.type === 'success'
            ? <CheckCircle size={20} color="#22c55e" />
            : <AlertCircle size={20} color="#ef4444" />}
          <span style={{ fontWeight: 600, fontSize: '0.95rem' }}>{toast.msg}</span>
        </div>
      )}

      {/* Hero card */}
      <div className="glass flex flex-col items-center gap-6" style={{ padding: '4rem 2rem', borderRadius: '40px', position: 'relative' }}>

        {/* Avatar */}
        <div style={{ position: 'relative' }}>
          <div
            className="glass flex items-center justify-center overflow-hidden"
            style={{ width: '160px', height: '160px', borderRadius: '50%', border: '4px solid var(--primary)', background: 'var(--bg-card)', position: 'relative' }}
          >
            <img
              src={currentAvatar}
              alt="Profile"
              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
            />
            {uploading && (
              <div style={{
                position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.55)',
                display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '50%',
              }}>
                <Loader size={36} color="white" style={{ animation: 'spin 1s linear infinite' }} />
              </div>
            )}
          </div>

          {/* Camera button triggers hidden file input */}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            style={{ display: 'none' }}
            onChange={handleFileChange}
          />
          <button
            className="btn-primary"
            title="Upload profile picture"
            disabled={uploading}
            onClick={() => fileInputRef.current?.click()}
            style={{
              position: 'absolute', bottom: '8px', right: '8px',
              padding: '0.5rem', borderRadius: '50%', width: '40px', height: '40px',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              boxShadow: '0 4px 16px rgba(99,102,241,0.5)',
              cursor: uploading ? 'not-allowed' : 'pointer',
            }}
          >
            <Camera size={18} />
          </button>
        </div>

        <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '-0.5rem' }}>
          Click the camera icon to upload a photo (JPG, PNG, GIF — max 4MB)
        </p>

        <div className="text-center flex flex-col gap-2">
          <h1 style={{ fontSize: '2.5rem', fontWeight: 800 }}>{user.username}</h1>
          <p className="badge" style={{ background: 'var(--primary)', padding: '4px 16px', borderRadius: '20px', fontSize: '0.85rem', fontWeight: 700, width: 'fit-content', margin: '0 auto' }}>
            {user.role.toUpperCase()}
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-3" style={{ width: '100%', maxWidth: '800px', gap: '1.5rem', marginTop: '2rem' }}>
          <div className="card glass flex flex-col items-center gap-2 p-6">
            <Book size={24} color="var(--primary)" />
            <p style={{ fontSize: '1.5rem', fontWeight: 700 }}>{enrollments.length}</p>
            <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Courses Joined</p>
          </div>
          <div className="card glass flex flex-col items-center gap-2 p-6">
            <Award size={24} color="var(--accent)" />
            <p style={{ fontSize: '1.5rem', fontWeight: 700 }}>{completedCourses}</p>
            <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Completed</p>
          </div>
          <div className="card glass flex flex-col items-center gap-2 p-6">
            <Clock size={24} color="#f59e0b" />
            <p style={{ fontSize: '1.5rem', fontWeight: 700 }}>{enrollments.length - completedCourses}</p>
            <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>In Progress</p>
          </div>
        </div>
      </div>

      {/* Personal Info + Security */}
      <div className="grid grid-2" style={{ gap: '2rem' }}>
        <div className="card glass flex flex-col gap-6" style={{ padding: '2rem' }}>
          <h2 style={{ fontSize: '1.5rem' }}>Personal Info</h2>
          <div className="flex flex-col gap-4">
            <div className="flex items-center gap-4 p-4 glass rounded-xl">
              <User size={20} color="var(--text-muted)" />
              <div>
                <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Username</p>
                <p style={{ fontWeight: 600 }}>{user.username}</p>
              </div>
            </div>
            <div className="flex items-center gap-4 p-4 glass rounded-xl">
              <Mail size={20} color="var(--text-muted)" />
              <div>
                <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Email Address</p>
                <p style={{ fontWeight: 600 }}>{user.email}</p>
              </div>
            </div>
            <div className="flex items-center gap-4 p-4 glass rounded-xl">
              <Shield size={20} color="var(--text-muted)" />
              <div>
                <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Member Since</p>
                <p style={{ fontWeight: 600 }}>{new Date(user.createdAt).toLocaleDateString()}</p>
              </div>
            </div>
          </div>
          <button className="btn-outline">Edit Basic Settings</button>
        </div>

        <div className="card glass flex flex-col gap-6" style={{ padding: '2rem' }}>
          <h2 style={{ fontSize: '1.5rem' }}>Security Center</h2>
          <div className="flex flex-col gap-4">
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Protect your account with high-security MFA and periodic password changes.</p>
            <div className="flex items-center justify-between p-4 glass rounded-xl">
              <span style={{ fontWeight: 600 }}>Two-Factor Auth</span>
              <span className="badge" style={{ background: 'var(--glass-border)', padding: '2px 8px', borderRadius: '4px', fontSize: '10px' }}>DISABLED</span>
            </div>
          </div>
          <button className="btn-primary" style={{ background: '#3b82f6' }}>Reset Password</button>
        </div>
      </div>

      {/* Enrolled Courses Section */}
      <div className="card glass flex flex-col gap-6" style={{ padding: '2rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h2 style={{ fontSize: '1.5rem' }}>My Courses</h2>
          <Link to="/enrolled" className="btn-outline" style={{ padding: '0.5rem 1.25rem', fontSize: '0.85rem' }}>View All</Link>
        </div>

        {loadingEnrollments ? (
          <p style={{ color: 'var(--text-muted)' }}>Loading your courses...</p>
        ) : enrollments.length === 0 ? (
          <div className="text-center" style={{ padding: '2rem' }}>
            <BookOpen size={40} color="var(--text-muted)" style={{ margin: '0 auto 1rem' }} />
            <p style={{ color: 'var(--text-muted)', marginBottom: '1.25rem' }}>You haven't enrolled in any courses yet.</p>
            <Link to="/" className="btn-primary" style={{ padding: '0.75rem 2rem', borderRadius: '12px' }}>Browse Catalog</Link>
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            {enrollments.slice(0, 4).map(enroll => (
              <div
                key={enroll._id}
                style={{
                  display: 'flex', alignItems: 'center', gap: '1rem',
                  background: 'rgba(255,255,255,0.03)', borderRadius: '14px',
                  padding: '1rem 1.25rem', border: '1px solid rgba(255,255,255,0.06)',
                }}
              >
                <div style={{ width: '80px', height: '50px', borderRadius: '10px', overflow: 'hidden', flexShrink: 0 }}>
                  <img
                    src={enroll.course?.thumbnail || 'https://via.placeholder.com/80x50?text=Course'}
                    alt={enroll.course?.title}
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  />
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ fontWeight: 700, marginBottom: '6px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {enroll.course?.title}
                  </p>
                  <ProgressBar progress={enroll.progress} showText={true} height="6px" />
                </div>
                <Link
                  to={`/course/${enroll.course?._id}/learn/${enroll.completedLessons?.[enroll.completedLessons.length - 1] || 'start'}`}
                  className="btn-outline"
                  style={{ padding: '0.5rem 1rem', borderRadius: '10px', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '4px', whiteSpace: 'nowrap' }}
                >
                  {enroll.progress === 100 ? 'Review' : 'Continue'}
                  <ChevronRight size={14} />
                </Link>
              </div>
            ))}
            {enrollments.length > 4 && (
              <Link to="/enrolled" style={{ textAlign: 'center', color: 'var(--primary)', fontSize: '0.9rem', fontWeight: 600, padding: '0.5rem' }}>
                + {enrollments.length - 4} more course{enrollments.length - 4 !== 1 ? 's' : ''} →
              </Link>
            )}
          </div>
        )}
      </div>

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes fadeIn { from { opacity: 0; transform: translateY(-10px); } to { opacity: 1; transform: translateY(0); } }
      `}</style>
    </div>
  );
};

export default Profile;
