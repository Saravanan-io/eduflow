import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { LogOut, User, Menu, GraduationCap, Moon, Sun, Leaf } from 'lucide-react';

const Navbar = ({ toggleSidebar }) => {
  const { user, logout } = useAuth();
  const { theme, setTheme } = useTheme();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const themes = [
    { name: 'obsidian', icon: <Moon size={18} />, color: '#6366f1' },
    { name: 'emerald', icon: <Leaf size={18} />, color: '#10b981' },
    { name: 'sunset', icon: <Sun size={18} />, color: '#f59e0b' }
  ];

  return (
    <nav className="glass sticky-top" style={{ padding: '0.75rem 1.5rem', zIndex: 100, position: 'sticky', top: 0 }}>
      <div className="flex items-center justify-between mx-auto flex-nowrap" style={{ maxWidth: '1400px' }}>
        <div className="flex items-center gap-4 flex-nowrap">
          <button className="btn-outline mobile-only" onClick={toggleSidebar} style={{ padding: '0.5rem', minWidth: '40px' }}>
            <Menu size={20} />
          </button>
          <Link to="/" className="flex items-center gap-2 flex-nowrap" style={{ fontSize: '1.5rem', fontWeight: 800 }}>
            <GraduationCap size={32} className="primary-text" color="var(--primary)" />
            <span style={{ 
              background: 'linear-gradient(45deg, var(--primary), #a78bfa)', 
              WebkitBackgroundClip: 'text', 
              WebkitTextFillColor: 'transparent',
              whiteSpace: 'nowrap'
            }}>
              EduFlow
            </span>
          </Link>
        </div>

        <div className="flex items-center gap-4 sm:gap-8">
          {/* Theme Switcher */}
          <div className="flex items-center gap-1 glass" style={{ padding: '4px', borderRadius: '30px' }}>
            {themes.map((t) => (
              <button
                key={t.name}
                onClick={() => setTheme(t.name)}
                className={`flex items-center justify-center`}
                title={`Switch to ${t.name}`}
                style={{
                  width: '32px', height: '32px', borderRadius: '50%',
                  background: theme === t.name ? t.color : 'transparent',
                  color: theme === t.name ? '#fff' : 'var(--text-muted)',
                  boxShadow: theme === t.name ? `0 0 10px ${t.color}` : 'none',
                  transition: 'all 0.3s'
                }}
              >
                {t.icon}
              </button>
            ))}
          </div>

          <Link to="/" className="text-muted hover-primary hide-mobile" style={{ marginRight: '0', fontWeight: 500 }}>All Courses</Link>
          
          {user ? (
            <div className="flex items-center gap-3">
              <Link to="/profile" className="flex items-center gap-2 glass" style={{ padding: '0.5rem 1rem', borderRadius: '20px' }}>
                <User size={18} />
                <span className="hide-mobile" style={{ fontWeight: 600 }}>{user.username}</span>
              </Link>
              <button 
                onClick={handleLogout} 
                className="btn-outline flex items-center gap-2"
                style={{ padding: '0.5rem 1rem' }}
              >
                <LogOut size={18} />
                <span className="hide-mobile">Logout</span>
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-3">
              <Link to="/login" className="btn-outline" style={{ padding: '0.5rem 1.25rem' }}>Login</Link>
              <Link to="/register" className="btn-primary" style={{ padding: '0.5rem 1.25rem' }}>Register</Link>
            </div>
          )}
        </div>
      </div>
      <style>{`
        .primary-text { color: var(--primary); }
        .text-muted { color: var(--text-muted); }
        .hover-primary:hover { color: var(--primary); }
        @media (min-width: 769px) { .mobile-only { display: none; } }
        @media (max-width: 480px) { 
          .container { padding: 0 0.75rem; }
          .btn { padding: 0.5rem 0.75rem; font-size: 0.85rem; }
        }
      `}</style>
    </nav>
  );
};


export default Navbar;
