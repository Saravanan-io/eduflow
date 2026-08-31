import { Link } from 'react-router-dom';
import { GraduationCap, Globe, Github, Twitter, Linkedin } from 'lucide-react';

const Footer = () => {
  const year = new Date().getFullYear();

  const cols = [
    {
      heading: 'Top Categories',
      links: [
        { label: 'Web Development', to: '/' },
        { label: 'Data Science & AI', to: '/' },
        { label: 'UI/UX Design', to: '/' },
        { label: 'Mobile App Dev', to: '/' },
        { label: 'Cloud & DevOps', to: '/' },
      ],
    },
    {
      heading: 'For Instructors',
      links: [
        { label: 'Become an Instructor', to: '/register' },
        { label: 'Instructor Studio', to: '/instructor/dashboard' },
        { label: 'Teaching Academy', to: '#' },
        { label: 'Course Quality Checklist', to: '#' },
      ],
    },
    {
      heading: 'Platform',
      links: [
        { label: 'About EduFlow', to: '#' },
        { label: 'Careers & Team', to: '#' },
        { label: 'Help & Support', to: '#' },
        { label: 'Privacy & Terms', to: '#' },
      ],
    },
  ];

  return (
    <footer style={{
      background: 'var(--bg-card)',
      borderTop: '1px solid var(--border-color)',
      marginTop: '3rem',
    }}>
      <div style={{ maxWidth: '1400px', margin: '0 auto', padding: '3rem 2rem 1.5rem 2rem' }}>

        {/* Main grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: '1.6fr 1fr 1fr 1fr',
          gap: '2.5rem',
          marginBottom: '2.5rem',
        }}>

          {/* Brand column */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', textDecoration: 'none' }}>
              <div style={{
                width: '38px', height: '38px',
                background: 'linear-gradient(135deg, #f59e0b, #fbbf24)',
                borderRadius: '10px',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                boxShadow: '0 4px 12px rgba(245,158,11,0.3)',
                flexShrink: 0,
              }}>
                <GraduationCap size={22} color="#0f172a" />
              </div>
              <span style={{
                fontSize: '1.3rem', fontWeight: 800, color: 'var(--text-main)',
                background: 'linear-gradient(135deg, var(--primary), #6366f1)',
                WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
              }}>
                EduFlow
              </span>
            </Link>

            <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', lineHeight: 1.65, maxWidth: '260px' }}>
              Empowering millions of learners worldwide with top-tier video courses, hands-on quizzes, and real-time live learning sessions.
            </p>

            {/* Social icons */}
            <div style={{ display: 'flex', gap: '0.6rem', marginTop: '0.25rem' }}>
              {[
                { icon: <Github size={16} />, href: '#' },
                { icon: <Twitter size={16} />, href: '#' },
                { icon: <Linkedin size={16} />, href: '#' },
              ].map((s, i) => (
                <a
                  key={i}
                  href={s.href}
                  style={{
                    width: '34px', height: '34px', borderRadius: '8px',
                    background: 'var(--bg-card2)',
                    border: '1px solid var(--border-color)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    color: 'var(--text-muted)',
                    transition: 'all 0.2s',
                    textDecoration: 'none',
                  }}
                  onMouseEnter={e => {
                    e.currentTarget.style.borderColor = 'var(--primary)';
                    e.currentTarget.style.color = 'var(--primary)';
                  }}
                  onMouseLeave={e => {
                    e.currentTarget.style.borderColor = 'var(--border-color)';
                    e.currentTarget.style.color = 'var(--text-muted)';
                  }}
                >
                  {s.icon}
                </a>
              ))}
            </div>
          </div>

          {/* Link columns */}
          {cols.map((col) => (
            <div key={col.heading} style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
              <h4 style={{
                fontSize: '0.88rem', fontWeight: 700,
                color: 'var(--text-main)',
                textTransform: 'uppercase', letterSpacing: '0.06em',
                marginBottom: '0.35rem'
              }}>
                {col.heading}
              </h4>
              {col.links.map((l) => (
                <Link
                  key={l.label}
                  to={l.to}
                  style={{
                    fontSize: '0.87rem',
                    color: 'var(--text-muted)',
                    textDecoration: 'none',
                    transition: 'color 0.18s',
                  }}
                  onMouseEnter={e => { e.currentTarget.style.color = 'var(--primary)'; }}
                  onMouseLeave={e => { e.currentTarget.style.color = 'var(--text-muted)'; }}
                >
                  {l.label}
                </Link>
              ))}
            </div>
          ))}
        </div>

        {/* Bottom bar */}
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          flexWrap: 'wrap', gap: '0.75rem',
          paddingTop: '1.5rem',
          borderTop: '1px solid var(--border-color)',
        }}>
          <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
            © {year} EduFlow Inc. All rights reserved. Built with passion for world-class education.
          </p>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.82rem', color: 'var(--text-muted)' }}>
            <Globe size={15} />
            <span>English (US)</span>
          </div>
        </div>

      </div>

      {/* Responsive: stack columns on small screens */}
      <style>{`
        @media (max-width: 900px) {
          .footer-grid { grid-template-columns: 1fr 1fr !important; }
        }
        @media (max-width: 580px) {
          .footer-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </footer>
  );
};

export default Footer;
