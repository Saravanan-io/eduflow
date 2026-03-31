import { Link } from 'react-router-dom';
import { Ghost, Home, ArrowLeft } from 'lucide-react';

const NotFound = () => {
  return (
    <div className="container flex flex-col items-center justify-center text-center py-20" style={{ minHeight: '80vh' }}>
      <div className="glass flex items-center justify-center" style={{ width: '120px', height: '120px', borderRadius: '50%', background: 'rgba(239, 68, 68, 0.1)', marginBottom: '2rem' }}>
        <Ghost size={64} color="var(--error)" />
      </div>
      <h1 style={{ fontSize: '6rem', lineHeight: 1, marginBottom: '1rem', background: 'linear-gradient(45deg, var(--error), #fb923c)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>404</h1>
      <h2 style={{ fontSize: '2rem', marginBottom: '1rem' }}>Page Not Found</h2>
      <p style={{ color: 'var(--text-muted)', marginBottom: '2.5rem', maxWidth: '500px' }}>
        The lesson you're looking for might have been moved or deleted. Let's get you back on track!
      </p>
      <div className="flex gap-4">
        <Link to="/" className="btn-primary flex items-center gap-2">
          <Home size={20} />
          <span>Home Catalog</span>
        </Link>
        <button onClick={() => window.history.back()} className="btn-outline flex items-center gap-2">
          <ArrowLeft size={20} />
          <span>Go Back</span>
        </button>
      </div>
    </div>
  );
};

export default NotFound;
