import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { UserPlus, Mail, Lock, User, Briefcase, AlertCircle } from 'lucide-react';

const Register = () => {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    role: 'student'
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const data = await register(formData);
      if (data.user.role === 'instructor') {
        navigate('/instructor/dashboard');
      } else {
        navigate('/dashboard');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center animate-fade" style={{ minHeight: '90vh', padding: '2rem 1rem' }}>
      <div className="card glass" style={{ width: '100%', maxWidth: '440px', padding: '2rem 1.75rem', borderRadius: '16px' }}>
        <div className="flex flex-col items-center gap-2 mb-6">
          <div className="flex items-center justify-center" style={{ width: '48px', height: '48px', background: 'var(--primary)', borderRadius: '12px', marginBottom: '0.25rem', boxShadow: '0 6px 12px rgba(99, 102, 241, 0.25)' }}>
            <UserPlus size={24} color="white" />
          </div>
          <h2 style={{ fontSize: '1.5rem', textAlign: 'center' }}>Create Account</h2>
          <p style={{ color: 'var(--text-muted)', textAlign: 'center', fontSize: '0.85rem' }}>Join EduFlow and start your learning journey today</p>
        </div>

        {error && (
          <div className="flex items-center gap-2 mb-6" style={{ background: 'rgba(239, 68, 68, 0.1)', border: '1px solid var(--error)', padding: '0.75rem', borderRadius: 'var(--radius)', color: 'var(--error)', fontSize: '0.85rem' }}>
            <AlertCircle size={18} style={{ flexShrink: 0 }} />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
          <div className="flex flex-col gap-2">
            <label style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-muted)', marginLeft: '4px' }}>Username</label>
            <div className="flex items-center" style={{ position: 'relative' }}>
              <User size={18} color="var(--text-muted)" style={{ position: 'absolute', left: '16px' }} />
              <input 
                type="text" 
                placeholder="johndoe" 
                value={formData.username}
                onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                required
                style={{ paddingLeft: '48px', height: '46px' }}
              />
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <label style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-muted)', marginLeft: '4px' }}>Email Address</label>
            <div className="flex items-center" style={{ position: 'relative' }}>
              <Mail size={18} color="var(--text-muted)" style={{ position: 'absolute', left: '16px' }} />
              <input 
                type="email" 
                placeholder="you@example.com" 
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                required
                style={{ paddingLeft: '48px', height: '46px' }}
              />
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <label style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-muted)', marginLeft: '4px' }}>Password</label>
            <div className="flex items-center" style={{ position: 'relative' }}>
              <Lock size={18} color="var(--text-muted)" style={{ position: 'absolute', left: '16px' }} />
              <input 
                type="password" 
                placeholder="••••••••" 
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                required
                style={{ paddingLeft: '48px', height: '46px' }}
              />
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <label style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-muted)', marginLeft: '4px' }}>I want to be a...</label>
            <div className="grid grid-2" style={{ gap: '1rem' }}>
              <button 
                type="button"
                onClick={() => setFormData({ ...formData, role: 'student' })}
                className={`flex items-center justify-center gap-2 glass p-3 ${formData.role === 'student' ? 'active-role' : ''}`}
                style={{ borderRadius: '12px', borderColor: formData.role === 'student' ? 'var(--primary)' : 'var(--glass-border)' }}
              >
                Student
              </button>
              <button 
                type="button"
                onClick={() => setFormData({ ...formData, role: 'instructor' })}
                className={`flex items-center justify-center gap-2 glass p-3 ${formData.role === 'instructor' ? 'active-role' : ''}`}
                style={{ borderRadius: '12px', borderColor: formData.role === 'instructor' ? 'var(--primary)' : 'var(--glass-border)' }}
              >
                Instructor
              </button>
            </div>
          </div>

          <button 
            type="submit" 
            className="btn-primary" 
            disabled={loading}
            style={{ width: '100%', padding: '0.75rem', marginTop: '0.5rem', height: '46px' }}
          >
            {loading ? 'Creating Account...' : 'Sign Up'}
          </button>
        </form>

        <p className="text-center mt-8" style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>
          Already have an account? <Link to="/login" style={{ color: 'var(--primary)', fontWeight: 600, marginLeft: '4px' }}>Sign in</Link>
        </p>
      </div>
      <style>{`
        .active-role { background: rgba(99, 102, 241, 0.15) !important; color: var(--primary) !important; border: 2px solid var(--primary) !important; }
      `}</style>
    </div>
  );
};

export default Register;
