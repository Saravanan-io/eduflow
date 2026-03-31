import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import Spinner from '../components/Spinner';
import { BookOpen, User, Calendar, Tag, Shield, CheckCircle2, Lock, PlayCircle } from 'lucide-react';

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

  const fallbackImage = "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?q=80&w=1200";

  return (
    <div className="container flex flex-col gap-8 py-8 animate-fade">
      <div className="glass grid grid-2 items-center" style={{ padding: '3.5rem', borderRadius: '40px', gap: '4rem', position: 'relative', overflow: 'hidden' }}>
        {/* Glow decoration */}
        <div style={{ position: 'absolute', top: '-150px', right: '-150px', width: '400px', height: '400px', background: 'var(--primary)', filter: 'blur(180px)', opacity: 0.15, pointerEvents: 'none' }}></div>
        
        <div className="flex flex-col gap-6 animate-fade-left">
          <div className="flex items-center gap-2 text-muted" style={{ fontSize: '0.9rem', fontWeight: 600 }}>
            <Shield size={18} color="var(--accent)" />
            <span style={{ color: 'var(--accent)' }}>Certified Learning Program</span>
          </div>
          <h1 className="gradient-text" style={{ fontSize: '3.5rem', lineHeight: 1.1, fontWeight: 800 }}>{course.title}</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '1.2rem', lineHeight: 1.6, maxWidth: '600px' }}>{course.description}</p>
          
          <div className="flex items-center gap-8 flex-wrap mt-2">
            <div className="flex items-center gap-3">
              <div className="glass flex items-center justify-center" style={{ width: '45px', height: '45px', borderRadius: '12px' }}>
                <User size={22} className="text-primary" />
              </div>
              <div>
                <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Lead Instructor</p>
                <p style={{ fontWeight: 700 }}>{course.instructor?.username}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="glass flex items-center justify-center" style={{ width: '45px', height: '45px', borderRadius: '12px' }}>
                <Tag size={22} color="var(--accent-amber)" />
              </div>
              <div>
                <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Specialization</p>
                <p style={{ fontWeight: 700 }}>{course.category}</p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-5 mt-6">
            {isEnrolled ? (
              <Link to={`/course/${id}/learn/${course.lessons[0]?._id}`} className="btn-primary" style={{ padding: '1.1rem 3rem', fontSize: '1.1rem' }}>
                <PlayCircle size={20} />
                Resume Learning
              </Link>
            ) : (
              <button 
                onClick={handleEnroll} 
                disabled={enrolling}
                className="btn-primary" 
                style={{ padding: '1.1rem 3rem', fontSize: '1.1rem' }}
              >
                {enrolling ? 'Processing...' : `Start Learning — ${course.price === 0 ? 'Free' : `$${course.price}`}`}
              </button>
            )}
            <button className="btn-outline" style={{ padding: '1.1rem 2.2rem', fontSize: '1.1rem' }}>Syllabus Guide</button>
          </div>
        </div>

        <div className="relative animate-fade-right" style={{ perspective: '1000px' }}>
          <div style={{ 
            borderRadius: '30px', 
            overflow: 'hidden', 
            boxShadow: '0 40px 80px rgba(0,0,0,0.6)', 
            aspectRatio: '16/9', 
            background: 'var(--bg-card)',
            border: '1px solid var(--glass-border)',
            transform: 'rotateY(-5deg) rotateX(2deg)',
            transition: 'transform 0.5s'
          }}>
            <img 
              src={course.thumbnail || fallbackImage} 
              alt={course.title} 
              style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} 
            />
          </div>
          {/* Floating Lesson Count Chip */}
          <div className="glass animate-float flex items-center gap-3" style={{ position: 'absolute', bottom: '-25px', left: '40px', padding: '1.25rem 2.5rem', borderRadius: '20px', boxShadow: '0 15px 35px rgba(0,0,0,0.4)' }}>
            <BookOpen size={24} color="var(--primary)" />
            <span style={{ fontWeight: 800, fontSize: '1.1rem' }}>{course.lessons?.length || 0} Professional Lessons</span>
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-10 mt-12">
        <div style={{ maxWidth: '900px' }}>
          <h2 style={{ fontSize: '2.2rem', marginBottom: '2.5rem' }} className="flex items-center gap-4">
            Curriculum Structure
            <span className="badge" style={{ fontSize: '0.9rem', background: 'var(--glass-border)', padding: '6px 12px' }}>{course.lessons?.length || 0} Modules</span>
          </h2>
          <div className="flex flex-col gap-4 stagger">
            {course.lessons?.map((lesson, index) => (
              <div 
                key={lesson._id} 
                className="glass flex items-center justify-between" 
                style={{ 
                  padding: '1.5rem 2rem', 
                  borderRadius: '20px', 
                  opacity: isEnrolled ? 1 : 0.75,
                  transition: 'transform 0.3s, background 0.3s',
                  cursor: isEnrolled ? 'pointer' : 'default'
                }}
              >
                <div className="flex items-center gap-6">
                  <span style={{ color: 'var(--primary)', fontWeight: 800, fontSize: '1.2rem', width: '30px' }}>{(index+1).toString().padStart(2, '0')}</span>
                  <div>
                    <p style={{ fontWeight: 700, fontSize: '1.1rem' }}>{lesson.title}</p>
                    <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Video Lecture • 12 mins</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  {isEnrolled ? (
                    <CheckCircle2 size={24} color="var(--accent)" />
                  ) : (
                    <div className="flex items-center gap-2 text-muted" style={{ fontSize: '0.85rem' }}>
                      <Lock size={18} />
                      <span className="hide-mobile">Enroll to Unlock</span>
                    </div>
                  )}
                </div>
              </div>
            ))}
            {course.lessons?.length === 0 && (
              <div className="text-center py-12 glass" style={{ borderRadius: '20px' }}>
                <p className="text-muted">High-quality content is being prepared for this course.</p>
              </div>
            )}
          </div>
        </div>
      </div>
      
      <style>{`
        .glass:hover {
          background: rgba(255, 255, 255, 0.06);
        }
      `}</style>
    </div>
  );
};

export default CourseDetail;
