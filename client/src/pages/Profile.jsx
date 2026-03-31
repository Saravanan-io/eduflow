import { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { User, Mail, Shield, Book, Award, Clock, Camera, BookOpen, ChevronRight, Loader2, Save } from 'lucide-react';
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

  const handleFileClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Local preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setPreview(reader.result);
    };
    reader.readAsDataURL(file);

    // Upload
    setUploading(true);
    try {
      const base64String = await new Promise((resolve) => {
        const r = new FileReader();
        r.onload = () => resolve(r.result);
        r.readAsDataURL(file);
      });

      const { data } = await axios.put('/api/auth/avatar', { avatar: base64String });
      
      if (data.success) {
        setUser({ ...user, avatar: data.avatar });
        setPreview(null); // Clear preview once saved
      }
    } catch (err) {
      console.error('Upload failed', err);
      alert('Failed to upload profile picture');
    } finally {
      setUploading(false);
    }
  };

  if (!user) return <div className="text-center py-20">Please login to view profile.</div>;

  const completedCourses = enrollments.filter(e => e.progress === 100).length;

  return (
    <div className="container flex flex-col gap-10 py-10 animate-fade" style={{ maxWidth: '1000px' }}>
      {/* Hero card */}
      <div className="glass flex flex-col items-center gap-6" style={{ padding: '4rem 2rem', borderRadius: '40px', position: 'relative', overflow: 'hidden' }}>
        {/* Decorative background glow */}
        <div style={{ position: 'absolute', top: '-100px', left: '-100px', width: '300px', height: '300px', background: 'var(--primary)', filter: 'blur(150px)', opacity: 0.1, pointerEvents: 'none' }}></div>
        
        <div style={{ position: 'relative' }}>
          <div className="glass flex items-center justify-center overflow-hidden" 
               style={{ width: '160px', height: '160px', borderRadius: '50%', border: '4px solid var(--primary)', background: 'var(--bg-card)', boxShadow: '0 0 30px var(--primary-glow)' }}>
            <img 
              src={preview || user.avatar || `https://ui-avatars.com/api/?name=${user.username}&background=6366f1&color=fff&size=160`} 
              alt="Profile" 
              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
            />
            {uploading && (
              <div className="absolute inset-0 flex items-center justify-center bg-black/50 backdrop-blur-sm" style={{ position: 'absolute' }}>
                <Loader2 className="animate-spin text-white" size={32} />
              </div>
            )}
          </div>
          <button 
            onClick={handleFileClick} 
            disabled={uploading}
            className="btn-primary" 
            style={{ position: 'absolute', bottom: '10px', right: '10px', padding: '0.6rem', borderRadius: '50%', boxShadow: '0 4px 12px rgba(0,0,0,0.5)' }}
          >
            <Camera size={18} />
          </button>
          <input 
            type="file" 
            ref={fileInputRef} 
            hidden 
            accept="image/*" 
            onChange={handleFileChange} 
          />
        </div>

        <div className="text-center flex flex-col gap-2">
          <h1 className="gradient-text" style={{ fontSize: '2.5rem', fontWeight: 800 }}>{user.username}</h1>
          <p className="badge" style={{ background: 'var(--primary)', padding: '4px 16px', borderRadius: '20px', fontSize: '0.85rem', fontWeight: 700, width: 'fit-content', margin: '0 auto' }}>
            {user.role.toUpperCase()}
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-3 stagger" style={{ width: '100%', maxWidth: '800px', gap: '1.5rem', marginTop: '2rem' }}>
          <div className="card glass animate-fade flex flex-col items-center gap-2 p-6">
            <Book size={24} color="var(--primary)" />
            <p style={{ fontSize: '1.5rem', fontWeight: 700 }}>{enrollments.length}</p>
            <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Courses Joined</p>
          </div>
          <div className="card glass animate-fade flex flex-col items-center gap-2 p-6">
            <Award size={24} color="var(--accent)" />
            <p style={{ fontSize: '1.5rem', fontWeight: 700 }}>{completedCourses}</p>
            <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Completed</p>
          </div>
          <div className="card glass animate-fade flex flex-col items-center gap-2 p-6">
            <Clock size={24} color="#f59e0b" />
            <p style={{ fontSize: '1.5rem', fontWeight: 700 }}>{enrollments.length - completedCourses}</p>
            <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>In Progress</p>
          </div>
        </div>
      </div>

      {/* Personal Info + Security */}
      <div className="grid grid-2" style={{ gap: '2rem' }}>
        <div className="card glass flex flex-col gap-6" style={{ padding: '2rem' }}>
          <h2 style={{ fontSize: '1.5rem' }}>Personal Info</h2>
          <div className="flex flex-col gap-4">
            <div className="flex items-center gap-4 p-4 glass rounded-xl">
              <Mail size={20} color="var(--text-muted)" />
              <div className="flex-1">
                <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Email Address</p>
                <p style={{ fontWeight: 600 }}>{user.email}</p>
              </div>
            </div>
            <div className="flex items-center gap-4 p-4 glass rounded-xl">
              <Shield size={20} color="var(--text-muted)" />
              <div className="flex-1">
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
              <span className="badge" style={{ background: 'var(--glass-border)', padding: '4px 12px', borderRadius: '6px', fontSize: '10px', color: 'var(--error)' }}>DISABLED</span>
            </div>
          </div>
          <button className="btn-primary" style={{ background: 'linear-gradient(135deg, #3b82f6, #2563eb)' }}>Reset Password</button>
        </div>
      </div>

      {/* Enrolled Courses Section */}
      <div className="card glass flex flex-col gap-6" style={{ padding: '2rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h2 style={{ fontSize: '1.5rem' }}>My Learning Journey</h2>
          <Link to="/enrolled" className="btn-outline" style={{ padding: '0.5rem 1.25rem', fontSize: '0.85rem' }}>View Full Catalog</Link>
        </div>

        {loadingEnrollments ? (
          <div className="flex items-center justify-center p-12">
            <Loader2 className="animate-spin text-primary" size={32} />
          </div>
        ) : enrollments.length === 0 ? (
          <div className="text-center" style={{ padding: '3rem 2rem' }}>
            <div className="animate-float mb-6 inline-block">
              <BookOpen size={64} className="text-muted" opacity={0.5} />
            </div>
            <p style={{ color: 'var(--text-muted)', marginBottom: '1.5rem', fontSize: '1.1rem' }}>You haven't enrolled in any courses yet.</p>
            <Link to="/" className="btn-primary" style={{ padding: '0.85rem 2.5rem' }}>Start Learning Today</Link>
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            {enrollments.slice(0, 4).map(enroll => (
              <div
                key={enroll._id}
                className="glass-hover flex items-center gap-4"
                style={{
                  borderRadius: '16px',
                  padding: '1.25rem', border: '1px solid var(--glass-border)',
                  background: 'rgba(255,255,255,0.02)',
                  transition: 'background 0.3s'
                }}
              >
                {/* Thumbnail */}
                <div style={{ width: '100px', height: '60px', borderRadius: '12px', overflow: 'hidden', flexShrink: 0, border: '1px solid var(--glass-border)' }}>
                  <img
                    src={enroll.course?.thumbnail || 'https://via.placeholder.com/100x60?text=Course'}
                    alt={enroll.course?.title}
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  />
                </div>

                {/* Title + progress */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ fontWeight: 700, marginBottom: '8px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', fontSize: '1.05rem' }}>
                    {enroll.course?.title}
                  </p>
                  <ProgressBar progress={enroll.progress} showText={true} height="8px" />
                </div>

                {/* Continue link */}
                <Link
                  to={`/course/${enroll.course?._id}/learn/${enroll.completedLessons?.[enroll.completedLessons.length - 1] || 'start'}`}
                  className="btn-primary"
                  style={{ padding: '0.6rem 1.25rem', borderRadius: '10px', fontSize: '0.85rem', whiteSpace: 'nowrap' }}
                >
                  {enroll.progress === 100 ? 'Review' : 'Continue'}
                  <ChevronRight size={16} />
                </Link>
              </div>
            ))}
            {enrollments.length > 4 && (
              <Link to="/enrolled" style={{ textAlign: 'center', color: 'var(--primary)', fontSize: '0.95rem', fontWeight: 600, padding: '1rem', textDecoration: 'underline' }}>
                View all {enrollments.length} enrollments
              </Link>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Profile;
