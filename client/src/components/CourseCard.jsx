import { Link } from 'react-router-dom';
import { Star, Clock, Users } from 'lucide-react';

const CourseCard = ({ course, isBestseller = true }) => {
  const fallbackImage = "https://images.unsplash.com/photo-1633356122544-f134324a6cee?q=80&w=600&auto=format&fit=crop";
  const studentCount = course?.students?.length || 1200;
  const ratingVal = course?.rating || 4.8;

  return (
    <Link to={`/course/${course._id}`} className="course-card-custom">
      
      {/* Thumbnail Header */}
      <div className="course-thumbnail-wrapper">
        <img 
          src={course.thumbnail || fallbackImage} 
          alt={course.title}
          onError={(e) => { e.target.src = fallbackImage; }} 
        />
        
        {/* Bestseller Badge */}
        {(isBestseller || studentCount > 5) && (
          <div className="bestseller-badge">
            Bestseller
          </div>
        )}
      </div>

      {/* Body Details */}
      <div className="course-card-body">
        
        {/* Course Title */}
        <h3 className="course-title">
          {course.title || 'React - The Complete Guide'}
        </h3>

        {/* Instructor & Rating Row */}
        <div className="instructor-info">
          <div className="author">
            <img 
              src={course.instructor?.avatar || `https://ui-avatars.com/api/?name=${course.instructor?.username || 'John+Doe'}&background=6366f1&color=fff`} 
              alt="instructor"
              className="instructor-avatar"
            />
            <span>{course.instructor?.username || 'John Doe'}</span>
          </div>

          <div className="rating-pill">
            <Star size={13} fill="#f59e0b" color="#f59e0b" />
            <span>{ratingVal.toFixed(1)}</span>
            <span style={{ color: 'var(--text-muted)', fontWeight: 400, fontSize: '0.75rem' }}>(2.4K)</span>
          </div>
        </div>

        {/* Footer Meta Row: Level & Duration */}
        <div className="course-meta-tags">
          <span className="meta-pill">{course.level || 'Beginner'}</span>
          <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
            <Clock size={13} color="var(--text-muted)" />
            {course.duration || '20 Hours'}
          </span>
        </div>

      </div>

    </Link>
  );
};

export default CourseCard;
