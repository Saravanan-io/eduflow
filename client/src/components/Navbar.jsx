import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { 
  Search, 
  Compass, 
  Bell, 
  Sun, 
  Moon, 
  ChevronDown, 
  Menu, 
  LogOut,
  User,
  BookOpen
} from 'lucide-react';
import { useState } from 'react';

const Navbar = ({ toggleSidebar }) => {
  const { user, logout } = useAuth();
  const { theme, setTheme } = useTheme();
  const navigate = useNavigate();
  const [showDropdown, setShowDropdown] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const toggleThemeMode = () => {
    setTheme(theme === 'obsidian' ? 'light' : 'obsidian');
  };

  const avatarUrl = user?.avatar ||
    `https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80`;

  return (
    <header className="top-navbar">
      <div className="navbar-container">
        
        {/* Left Section: Search Input + K Keyboard Badge + Black Explore Pill */}
        <div className="navbar-left-section">
          <button 
            className="btn-outline mobile-only" 
            onClick={toggleSidebar} 
            style={{ padding: '0.4rem 0.6rem', display: 'none' }}
          >
            <Menu size={20} />
          </button>

          {/* Search Bar with ⌘ K */}
          <div className="search-input-header">
            <Search size={18} className="search-icon" />
            <input 
              type="text" 
              placeholder="Search for courses, skills or topics..." 
            />
            <div className="search-kbd-badge">⌘ K</div>
          </div>

          {/* Black Explore Button */}
          <button className="navbar-explore-black-btn" onClick={() => navigate('/')}>
            <Compass size={18} />
            <span>Explore</span>
          </button>
        </div>

        {/* Right Section: Bell + Sun + User Profile */}
        <div className="navbar-right-section">
          
          {/* Notifications Bell */}
          <button className="navbar-icon-btn" title="Notifications">
            <Bell size={18} />
            <span className="notification-badge">3</span>
          </button>

          {/* Theme Toggle Button */}
          <button className="navbar-icon-btn" onClick={toggleThemeMode} title="Toggle theme">
            {theme === 'obsidian' ? <Moon size={18} /> : <Sun size={18} />}
          </button>

          {/* User Profile Badge */}
          {user ? (
            <div className="navbar-profile-wrapper">
              <div 
                className="modern-profile-pill"
                onClick={() => setShowDropdown(!showDropdown)}
              >
                <img 
                  src={avatarUrl} 
                  alt="avatar" 
                  className="modern-profile-avatar-circle"
                />

                <span className="modern-profile-name">
                  Hi, {user.username?.split(' ')[0] || 'Saravanan'}
                </span>

                <ChevronDown 
                  size={14} 
                  color="var(--text-muted)" 
                  className={`profile-chevron ${showDropdown ? 'open' : ''}`}
                />
              </div>

              {/* Profile Dropdown */}
              {showDropdown && (
                <div className="modern-profile-dropdown">
                  <div className="modern-dropdown-user-header">
                    <img src={avatarUrl} alt="avatar" className="modern-profile-avatar-circle" />
                    <div>
                      <div className="modern-dropdown-user-title">{user.username || 'Saravanan'}</div>
                      <span className="modern-dropdown-user-role">{user.role || 'Student'}</span>
                    </div>
                  </div>

                  <Link to="/profile" onClick={() => setShowDropdown(false)} className="modern-dropdown-item">
                    <User size={16} /> My Profile
                  </Link>

                  <Link to="/my-courses" onClick={() => setShowDropdown(false)} className="modern-dropdown-item">
                    <BookOpen size={16} /> Enrolled Courses
                  </Link>

                  <button onClick={handleLogout} className="modern-dropdown-item danger">
                    <LogOut size={16} /> Logout
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Link to="/login" style={{
                padding: '0.55rem 1.25rem', borderRadius: '20px', fontSize: '0.85rem',
                fontWeight: 600, border: '1px solid var(--border-color)',
                color: 'var(--text-main)', display: 'inline-flex', alignItems: 'center',
                background: 'var(--bg-card)'
              }}>Login</Link>
              <Link to="/register" style={{
                padding: '0.55rem 1.25rem', borderRadius: '20px', fontSize: '0.85rem',
                fontWeight: 700, background: '#ffc107',
                color: '#000000', display: 'inline-flex', alignItems: 'center',
                boxShadow: '0 4px 12px rgba(255, 193, 7, 0.3)'
              }}>Register</Link>
            </div>
          )}
        </div>

      </div>
    </header>
  );
};

export default Navbar;
