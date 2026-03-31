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
    <div className="flex items-center justify-center" style={{ minHeight: '80vh' }}>
      <div className="card glass" style={{ width: '100%', maxWidth: '450px', padding: '2.5rem' }}>
        <div className="flex flex-col items-center gap-2 mb-8">
          <div className="flex items-center justify-center" style={{ width: '48px', height: '48px', background: 'var(--primary)', borderRadius: '12px', marginBottom: '1rem' }}>
            <UserPlus size={24} color="white" />
          </div>
          <h2 style={{ fontSize: '1.75rem' }}>Create Account</h2>
          <p style={{ color: 'var(--text-muted)' }}>Join thousands of learners worldwide</p>
        </div>

        {error && (
          <div className="flex items-center gap-2 mb-6" style={{ background: 'rgba(239, 68, 68, 0.1)', border: '1px solid var(--error)', padding: '0.75rem', borderRadius: 'var(--radius)', color: 'var(--error)', fontSize: '0.9rem' }}>
            <AlertCircle size={18} />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="grid grid-2" style={{ gap: '1rem' }}>
            <div className="flex flex-col gap-1">
              <label style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-muted)' }}>Username</label>
              <div className="flex items-center" style={{ position: 'relative' }}>
                <User size={18} color="var(--text-muted)" style={{ position: 'absolute', left: '12px' }} />
                <input 
                  type="text" 
                  name="username"
                  placeholder="johndoe" 
                  value={formData.username}
                  onChange={handleChange}
                  required
                  style={{ paddingLeft: '40px' }}
                />
              </div>
            </div>

            <div className="flex flex-col gap-1">
              <label style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-muted)' }}>I am a...</label>
              <div className="flex items-center" style={{ position: 'relative' }}>
                <Briefcase size={18} color="var(--text-muted)" style={{ position: 'absolute', left: '12px' }} />
                <select 
                  name="role"
                  value={formData.role}
                  onChange={handleChange}
                  style={{ paddingLeft: '40px' }}
                >
                  <option value="student">Student</option>
                  <option value="instructor">Instructor</option>
                </select>
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-1">
            <label style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-muted)' }}>Email Address</label>
            <div className="flex items-center" style={{ position: 'relative' }}>
              <Mail size={18} color="var(--text-muted)" style={{ position: 'absolute', left: '12px' }} />
              <input 
                type="email" 
                name="email"
                placeholder="you@example.com" 
                value={formData.email}
                onChange={handleChange}
                required
                style={{ paddingLeft: '40px' }}
              />
            </div>
          </div>

          <div className="flex flex-col gap-1">
            <label style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-muted)' }}>Password</label>
            <div className="flex items-center" style={{ position: 'relative' }}>
              <Lock size={18} color="var(--text-muted)" style={{ position: 'absolute', left: '12px' }} />
              <input 
                type="password" 
                name="password"
                placeholder="••••••••" 
                value={formData.password}
                onChange={handleChange}
                required
                style={{ paddingLeft: '40px' }}
              />
            </div>
          </div>

          <button 
            type="submit" 
            className="btn-primary" 
            disabled={loading}
            style={{ width: '100%', padding: '0.85rem', marginTop: '1rem' }}
          >
            {loading ? 'Creating account...' : 'Create Account'}
          </button>
        </form>

        <p className="text-center mt-6" style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>
          Already have an account? <Link to="/login" style={{ color: 'var(--primary)', fontWeight: 600 }}>Login here</Link>
        </p>
      </div>
    </div>
  );
};

export default Register;
