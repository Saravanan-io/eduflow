import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { LogIn, Mail, Lock, AlertCircle } from 'lucide-react';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const data = await login(email, password);
      if (data.user.role === 'instructor') {
        navigate('/instructor/dashboard');
      } else {
        navigate('/dashboard');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center animate-fade" style={{ minHeight: '80vh', padding: '1rem' }}>
      <div className="card glass" style={{ width: '100%', maxWidth: '420px', padding: 'clamp(1.5rem, 5vw, 3rem)', borderRadius: '24px' }}>
        <div className="flex flex-col items-center gap-2 mb-8">
          <div className="flex items-center justify-center" style={{ width: '56px', height: '56px', background: 'var(--primary)', borderRadius: '16px', marginBottom: '0.5rem', boxShadow: '0 8px 16px rgba(99, 102, 241, 0.3)' }}>
            <LogIn size={28} color="white" />
          </div>
          <h2 style={{ fontSize: '1.75rem', textAlign: 'center' }}>Welcome Back</h2>
          <p style={{ color: 'var(--text-muted)', textAlign: 'center', fontSize: '0.95rem' }}>Login to continue your learning journey</p>
        </div>

        {error && (
          <div className="flex items-center gap-2 mb-6" style={{ background: 'rgba(239, 68, 68, 0.1)', border: '1px solid var(--error)', padding: '0.75rem', borderRadius: 'var(--radius)', color: 'var(--error)', fontSize: '0.85rem' }}>
            <AlertCircle size={18} style={{ flexShrink: 0 }} />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
          <div className="flex flex-col gap-2">
            <label style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-muted)', marginLeft: '4px' }}>Email Address</label>
            <div className="flex items-center" style={{ position: 'relative' }}>
              <Mail size={18} color="var(--text-muted)" style={{ position: 'absolute', left: '16px' }} />
              <input 
                type="email" 
                placeholder="you@example.com" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                style={{ paddingLeft: '48px', height: '52px' }}
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
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                style={{ paddingLeft: '48px', height: '52px' }}
              />
            </div>
          </div>

          <button 
            type="submit" 
            className="btn-primary" 
            disabled={loading}
            style={{ width: '100%', padding: '1rem', marginTop: '0.5rem', height: '52px' }}
          >
            {loading ? 'Logging in...' : 'Sign In'}
          </button>
        </form>

        <p className="text-center mt-8" style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>
          Don't have an account? <Link to="/register" style={{ color: 'var(--primary)', fontWeight: 600, marginLeft: '4px' }}>Create an account</Link>
        </p>
      </div>
    </div>
  );
};


export default Login;
