import { useAuth } from '../context/AuthContext';
import { User, Mail, Shield, Book, Award, Clock, ArrowRight, Camera } from 'lucide-react';
import { Link } from 'react-router-dom';

const Profile = () => {
  const { user } = useAuth();

  if (!user) return <div className="text-center py-20">Please login to view profile.</div>;

  return (
    <div className="container flex flex-col gap-10 py-10" style={{ maxWidth: '1000px' }}>
      <div className="glass flex flex-col items-center gap-6" style={{ padding: '4rem 2rem', borderRadius: '40px', position: 'relative' }}>
        <div style={{ position: 'relative' }}>
          <div className="glass flex items-center justify-center overflow-hidden" 
               style={{ width: '160px', height: '160px', borderRadius: '50%', border: '4px solid var(--primary)', background: 'var(--bg-card)' }}>
            <img 
              src={user.avatar || `https://ui-avatars.com/api/?name=${user.username}&background=6366f1&color=fff&size=160`} 
              alt="Profile" 
              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
            />
          </div>
          <button className="btn-primary" style={{ position: 'absolute', bottom: '10px', right: '10px', padding: '0.5rem', borderRadius: '50%' }}>
            <Camera size={20} />
          </button>
        </div>

        <div className="text-center flex flex-col gap-2">
          <h1 style={{ fontSize: '2.5rem', fontWeight: 800 }}>{user.username}</h1>
          <p className="badge" style={{ background: 'var(--primary)', padding: '4px 16px', borderRadius: '20px', fontSize: '0.85rem', fontWeight: 700, width: 'fit-content', margin: '0 auto' }}>
            {user.role.toUpperCase()}
          </p>
        </div>

        <div className="grid grid-3" style={{ width: '100%', maxWidth: '800px', gap: '1.5rem', marginTop: '2rem' }}>
          <div className="card glass flex flex-col items-center gap-2 p-6">
            <Book size={24} color="var(--primary)" />
            <p style={{ fontSize: '1.5rem', fontWeight: 700 }}>{user.enrolledCourses?.length || 0}</p>
            <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Courses Joined</p>
          </div>
          <div className="card glass flex flex-col items-center gap-2 p-6">
            <Award size={24} color="var(--accent)" />
            <p style={{ fontSize: '1.5rem', fontWeight: 700 }}>12</p>
            <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Skill Badges</p>
          </div>
          <div className="card glass flex flex-col items-center gap-2 p-6">
            <Clock size={24} color="#f59e0b" />
            <p style={{ fontSize: '1.5rem', fontWeight: 700 }}>45h</p>
            <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Learning Time</p>
          </div>
        </div>
      </div>

      <div className="grid grid-2" style={{ gap: '2rem' }}>
        <div className="card glass flex flex-col gap-6" style={{ padding: '2rem' }}>
          <h2 style={{ fontSize: '1.5rem' }}>Personal Info</h2>
          <div className="flex flex-col gap-4">
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
    </div>
  );
};

export default Profile;
