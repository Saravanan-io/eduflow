import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  BookOpen, LayoutGrid, Award, Trophy, Settings, 
  Crown, ChevronRight, GraduationCap, X, Bookmark,
  Calendar, Mail, SlidersHorizontal
} from 'lucide-react';

const Sidebar = ({ isOpen, toggleSidebar }) => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const currentPath = location.pathname.replace('/eduflow', '') || '/';

  const navLinks = [
    { to: '/dashboard',   label: 'Dashboard',    icon: <LayoutGrid size={18} /> },
    { to: '/enrolled',    label: 'My Courses',   icon: <BookOpen size={18} /> },
    { to: '/',            label: 'Catalog',      icon: <SlidersHorizontal size={18} /> },
    { to: '/awards',      label: 'Certificates', icon: <Award size={18} /> },
    { to: null,           label: 'Bookmarks',    icon: <Bookmark size={18} /> },
    { to: null,           label: 'Achievements', icon: <Trophy size={18} /> },
    { to: null,           label: 'Calendar',     icon: <Calendar size={18} /> },
    { to: null,           label: 'Messages',     icon: <Mail size={18} />, badge: '2' },
    { to: '/profile',     label: 'Settings',     icon: <Settings size={18} /> },
  ];

  const highlightedPaths = new Set();

  const isActive = (to) => {
    if (!to) return false;
    const path = to === '/' ? '/' : to;
    const matches = path === '/'
      ? (currentPath === '/' || currentPath === '')
      : currentPath.startsWith(path);
    if (matches && !highlightedPaths.has(path)) {
      highlightedPaths.add(path);
      return true;
    }
    return false;
  };

  const avatarUrl = user?.avatar ||
    `https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80`;

  return (
    <>
      {isOpen && (
        <div
          onClick={toggleSidebar}
          style={{
            position: 'fixed', inset: 0,
            background: 'rgba(0,0,0,0.55)',
            backdropFilter: 'blur(2px)',
            zIndex: 199,
          }}
        />
      )}

      <aside className={`sidebar-panel ${isOpen ? 'open' : ''}`}>

        {/* Logo Section */}
        <div className="sidebar-logo">
          <div className="sidebar-logo-icon">
            <GraduationCap size={22} color="#000000" />
          </div>
          <span className="sidebar-logo-text">EduFlow</span>
          <button
            onClick={toggleSidebar}
            className="sidebar-close-btn"
          >
            <X size={20} />
          </button>
        </div>

        {/* Nav Items */}
        <nav className="sidebar-nav-list">
          {navLinks.map((link, idx) => {
            if (!link.to) {
              return (
                <button key={`dummy-${idx}`} className="sidebar-nav-link">
                  <span className="nav-icon">{link.icon}</span>
                  <span className="nav-label">{link.label}</span>
                  {link.badge && <span className="nav-badge-yellow">{link.badge}</span>}
                </button>
              );
            }
            const active = isActive(link.to);
            return (
              <NavLink
                key={`${link.to}-${link.label}`}
                to={link.to}
                end={link.to === '/'}
                className={() => `sidebar-nav-link${active ? ' active' : ''}`}
                onClick={() => window.innerWidth < 900 && toggleSidebar()}
              >
                <span className="nav-icon">{link.icon}</span>
                <span className="nav-label">{link.label}</span>
                {link.badge && <span className="nav-badge-yellow">{link.badge}</span>}
              </NavLink>
            );
          })}
        </nav>

        {/* Go Premium Card */}
        <div className="sidebar-promo-card">
          <div className="crown-icon">
            <Crown size={20} color="#ffc107" />
          </div>
          <h4>Go Premium</h4>
          <p>Unlock unlimited access to all courses, certificates and premium resources.</p>
          <button className="btn-upgrade">
            <span>Upgrade to Pro</span>
            <span>→</span>
          </button>
        </div>

        {/* User Profile Footer */}
        {user && (
          <div className="sidebar-user-footer" onClick={() => navigate('/profile')}>
            <div className="user-footer-info">
              <img
                src={avatarUrl}
                alt="avatar"
                className="user-footer-avatar"
              />
              <div className="user-footer-text">
                <div className="user-footer-name">
                  {user.username || 'Saravanan'}
                </div>
                <div className="user-footer-sub">View Profile</div>
              </div>
            </div>
            <ChevronRight size={16} color="#94a3b8" />
          </div>
        )}

      </aside>
    </>
  );
};

export default Sidebar;
