import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import Spinner from '../components/Spinner';
import { BookOpen, User, Calendar, Tag, Shield, CheckCircle2, Lock } from 'lucide-react';

const CourseDetail = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  
  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [enrolling, setEnrolling] = useState(false);
  const [isEnrolled, setIsEnrolled] = useState(false);

  useEffect(() => {
    fetchCourseDetails();
  }, [id]);

  const fetchCourseDetails = async () => {
    try {
      const { data } = await axios.get(`/api/courses/${id}`);
      setCourse(data.course);
      
      if (user) {
        const enrollRes = await axios.get(`/api/enrollments/${id}/progress`).catch(() => null);
        if (enrollRes?.data?.success) setIsEnrolled(true);
      }
    } catch (err) {
      console.error('Error fetching course details', err);
    } finally {
      setLoading(false);
    }
  };

  const handleEnroll = async () => {
    if (!user) return navigate('/login');
    setEnrolling(true);
    try {
      await axios.post(`/api/enrollments/${id}/enroll`);
      setIsEnrolled(true);
      navigate(`/course/${id}/learn/${course.lessons[0]?._id}`);
    } catch (err) {
      alert(err.response?.data?.message || 'Enrollment failed');
    } finally {
      setEnrolling(false);
    }
  };

  if (loading) return <Spinner />;
  if (!course) return <div className="text-center py-20">Course not found</div>;

  return (
    <div className="container flex flex-col gap-8 py-8">
      <div className="glass grid grid-2 items-center" style={{ padding: '3rem', borderRadius: '30px', gap: '4rem' }}>
        <div className="flex flex-col gap-6">
          <div className="flex items-center gap-2 text-muted" style={{ fontSize: '0.9rem', fontWeight: 600 }}>
            <Shield size={18} color="var(--primary)" />
            <span>Certified Course</span>
          </div>
          <h1 style={{ fontSize: '3rem', lineHeight: 1.1 }}>{course.title}</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '1.1rem', lineHeight: 1.6 }}>{course.description}</p>
          
          <div className="flex items-center gap-6 flex-wrap">
            <div className="flex items-center gap-2">
              <User size={20} className="text-muted" />
              <div>
                <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Instructor</p>
                <p style={{ fontWeight: 600 }}>{course.instructor?.username}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Calendar size={20} className="text-muted" />
              <div>
                <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Last Updated</p>
                <p style={{ fontWeight: 600 }}>{new Date(course.createdAt).toLocaleDateString()}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Tag size={20} className="text-muted" />
              <div>
                <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Category</p>
                <p style={{ fontWeight: 600 }}>{course.category}</p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-4 mt-4">
            {isEnrolled ? (
              <Link to={`/course/${id}/learn/${course.lessons[0]?._id}`} className="btn-primary" style={{ padding: '1rem 2.5rem' }}>
                Continue Learning
              </Link>
            ) : (
              <button 
                onClick={handleEnroll} 
                disabled={enrolling}
                className="btn-primary" 
                style={{ padding: '1rem 2.5rem' }}
              >
                {enrolling ? 'Enrolling...' : `Enroll Now — ${course.price === 0 ? 'Free' : `$${course.price}`}`}
              </button>
            )}
            <button className="btn-outline" style={{ padding: '1rem 2rem' }}>Preview Syllabus</button>
          </div>
        </div>

        <div style={{ position: 'relative' }}>
          <div style={{ borderRadius: '24px', overflow: 'hidden', boxShadow: '0 30px 60px rgba(0,0,0,0.5)', aspectRatio: '16/9', background: 'var(--bg-card)' }}>
            <img 
              src={course.thumbnail} 
              alt={course.title} 
              style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} 
            />
          </div>
          <div className="glass flex items-center gap-2" style={{ position: 'absolute', bottom: '-20px', left: '40px', padding: '1rem 2rem', borderRadius: '15px' }}>
            <BookOpen size={20} color="var(--primary)" />
            <span style={{ fontWeight: 700 }}>{course.lessons?.length || 0} Lessons</span>
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-10 mt-8">
        <div style={{ maxWidth: '800px' }}>
          <h2 style={{ fontSize: '2rem', marginBottom: '2rem' }}>Course Content</h2>
          <div className="flex flex-col gap-3">
            {course.lessons?.map((lesson, index) => (
              <div 
                key={lesson._id} 
                className="glass flex items-center justify-between" 
                style={{ padding: '1.25rem 1.5rem', borderRadius: '15px', opacity: isEnrolled ? 1 : 0.7 }}
              >
                <div className="flex items-center gap-4">
                  <span style={{ color: 'var(--text-muted)', fontWeight: 700, width: '24px' }}>{(index+1).toString().padStart(2, '0')}</span>
                  <p style={{ fontWeight: 600 }}>{lesson.title}</p>
                </div>
                {isEnrolled ? (
                  <CheckCircle2 size={20} color="var(--accent)" />
                ) : (
                  <Lock size={18} className="text-muted" />
                )}
              </div>
            ))}
            {course.lessons?.length === 0 && <p className="text-muted">No lessons added yet.</p>}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CourseDetail;
