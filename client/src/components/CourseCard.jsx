import { Link } from 'react-router-dom';
import { Users, Clock, Tag } from 'lucide-react';

const CourseCard = ({ course }) => {
  return (
    <Link to={`/course/${course._id}`} className="card glass flex flex-col" style={{ overflow: 'hidden', padding: 0 }}>
      <div className="thumbnail" style={{ height: '180px', position: 'relative' }}>
        <img 
          src={course.thumbnail || 'https://via.placeholder.com/400x225?text=No+Thumbnail'} 
          alt={course.title} 
          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
        />
        <div 
          className="badge" 
          style={{ 
            position: 'absolute', top: '12px', right: '12px', 
            background: 'var(--primary)', padding: '4px 12px', 
            borderRadius: '20px', fontSize: '0.75rem', fontWeight: 700 
          }}
        >
          {course.category}
        </div>
      </div>
      
      <div className="content" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem', flex: 1 }}>
        <h3 style={{ fontSize: '1.25rem', lineHeight: 1.3 }}>{course.title}</h3>
        
        <div className="flex items-center gap-2" style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>
          <img 
            src={course.instructor?.avatar || `https://ui-avatars.com/api/?name=${course.instructor?.username || 'User'}`} 
            style={{ width: '24px', height: '24px', borderRadius: '50%' }}
            alt="avatar"
          />
          <span>{course.instructor?.username}</span>
        </div>

        <div className="flex items-center justify-between" style={{ marginTop: 'auto' }}>
          <div className="flex items-center gap-4 text-muted" style={{ fontSize: '0.8rem' }}>
            <span className="flex items-center gap-1"><Users size={14} /> {course.students?.length || 0}</span>
            <span className="flex items-center gap-1"><Tag size={14} /> {course.price === 0 ? 'Free' : `$${course.price}`}</span>
          </div>
          <button className="btn-primary" style={{ padding: '6px 16px', fontSize: '0.85rem' }}>View Course</button>
        </div>
      </div>
    </Link>
  );
};

export default CourseCard;
