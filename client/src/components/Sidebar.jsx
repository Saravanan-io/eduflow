import { NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
  Home, 
  BookOpen, 
  LayoutDashboard, 
  PlusCircle, 
  Settings, 
  History, 
  MessageSquare, 
  Trophy 
} from 'lucide-react';

const Sidebar = ({ isOpen, toggleSidebar }) => {
  const { user } = useAuth();

  const links = [
    { to: '/', name: 'Catalog', icon: <BookOpen size={20} /> },
    { to: '/dashboard', name: 'Dashboard', icon: <LayoutDashboard size={20} /> },
  ];

  if (user?.role === 'instructor') {
    links.push({ to: '/create-course', name: 'New Course', icon: <PlusCircle size={20} /> });
  }

  links.push(
    { to: '/profile', name: 'Profile', icon: <Settings size={20} /> },
    { to: '/enrolled', name: 'Enrolled', icon: <History size={20} /> },
    { to: '/awards', name: 'Awards', icon: <Trophy size={20} /> }
  );

  return (
    <>
      {isOpen && (
        <div 
          className="overlay" 
          onClick={toggleSidebar} 
          style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', background: 'rgba(0,0,0,0.5)', zIndex: 90 }}
        />
      )}
      <aside 
        className={`sidebar glass ${isOpen ? 'open' : ''}`}
        style={{
          width: '260px',
          height: 'calc(100vh - 70px)',
          position: 'sticky',
          top: '70px',
          padding: '2rem 1rem',
          transition: 'transform 0.3s ease',
          zIndex: 100,
          display: 'flex',
          flexDirection: 'column',
          gap: '1rem',
        }}
      >
        {links.map((link) => (
          <NavLink
            key={link.to}
            to={link.to}
            className={({ isActive }) => 
              `nav-link flex items-center gap-3 ${isActive ? 'active' : ''}`
            }
            onClick={() => (window.innerWidth < 768 ? toggleSidebar() : null)}
          >
            {link.icon}
            <span>{link.name}</span>
          </NavLink>
        ))}
        
        <style>{`
          .nav-link {
            padding: 0.85rem 1.25rem;
            border-radius: var(--radius);
            color: var(--text-muted);
            transition: all 0.3s ease;
          }
          .nav-link:hover {
            color: white;
            background: var(--glass);
          }
          .nav-link.active {
            color: white;
            background: var(--primary);
            box-shadow: 0 4px 12px rgba(99, 102, 241, 0.3);
          }
          @media (max-width: 767px) {
            .sidebar {
              position: fixed;
              left: 0;
              top: 0;
              height: 100vh;
              transform: translateX(-100%);
              background: var(--bg-dark);
            }
            .sidebar.open {
              transform: translateX(0);
            }
          }
        `}</style>
      </aside>
    </>
  );
};

export default Sidebar;
