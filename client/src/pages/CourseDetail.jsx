import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import Spinner from '../components/Spinner';
import { 
  CheckCircle2, Lock, PlayCircle, Star, Users, Globe, 
  Award, FileText, Smartphone, Infinity as InfinityIcon, ShieldCheck, 
  Clock, BookOpen, ChevronDown, ChevronUp
} from 'lucide-react';

const CourseDetail = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  
  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [enrolling, setEnrolling] = useState(false);
  const [isEnrolled, setIsEnrolled] = useState(false);
  const [openLessons, setOpenLessons] = useState({});

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
      if (course.lessons && course.lessons.length > 0) {
        navigate(`/course/${id}/learn/${course.lessons[0]._id}`);
      } else {
        navigate('/dashboard');
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Enrollment failed');
    } finally {
      setEnrolling(false);
    }
  };

  const toggleLessonAccordion = (lessonId) => {
    setOpenLessons(prev => ({ ...prev, [lessonId]: !prev[lessonId] }));
  };

  if (loading) return <Spinner />;
  if (!course) return <div className="text-center py-20">Course not found</div>;

  const fallbackImage = "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?q=80&w=1200";

  const totalDurationMinutes = course.lessons?.reduce((acc, l) => acc + (Number(l.duration) || 0), 0) || 0;
  const formattedHours = (totalDurationMinutes / 60).toFixed(1);
  const studentCount = course.students?.length || 0;

  return (
    <div className="animate-fade" style={{ paddingBottom: '4rem' }}>
      {/* Header Banner */}
      <section className="glass" style={{ background: 'var(--bg-card)', borderBottom: '1px solid var(--glass-border)', padding: '3rem 0' }}>
        <div className="container">
          <div className="grid grid-3 gap-8 items-start">
            
            {/* Left Header Column */}
            <div className="flex flex-col gap-4" style={{ gridColumn: 'span 2' }}>
              <div className="flex items-center gap-2 text-muted" style={{ fontSize: '0.85rem' }}>
                <Link to="/" style={{ color: 'var(--primary)', fontWeight: 600 }}>Courses</Link>
                <span>/</span>
                <span style={{ color: 'var(--text-muted)' }}>{course.category}</span>
              </div>

              <h1 style={{ fontSize: '2.4rem', fontWeight: 800, lineHeight: 1.2 }}>{course.title}</h1>
              <p style={{ color: 'var(--text-muted)', fontSize: '1.05rem', lineHeight: 1.6 }}>{course.description}</p>
              
              {/* Real Metadata */}
              <div className="flex items-center gap-4 flex-wrap" style={{ fontSize: '0.9rem' }}>
                {studentCount > 0 && (
                  <div className="flex items-center gap-1 text-muted">
                    <Users size={16} color="var(--primary)" />
                    <span>{studentCount} {studentCount === 1 ? 'student' : 'students'} enrolled</span>
                  </div>
                )}
                {course.rating > 0 && (
                  <div className="flex items-center gap-1">
                    <span style={{ fontWeight: 800, color: '#f59e0b' }}>{course.rating.toFixed(1)}</span>
                    <div className="flex items-center" style={{ color: '#f59e0b' }}>
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} size={14} fill={i < Math.floor(course.rating) ? '#f59e0b' : 'transparent'} stroke="#f59e0b" />
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Created By & Info */}
              <div className="flex items-center gap-6 flex-wrap mt-2" style={{ fontSize: '0.88rem' }}>
                <div className="flex items-center gap-2">
                  <img 
                    src={course.instructor?.avatar || `https://ui-avatars.com/api/?name=${course.instructor?.username || 'Instructor'}&background=6366f1&color=fff`} 
                    style={{ width: '32px', height: '32px', borderRadius: '50%' }}
                    alt="Instructor"
                  />
                  <span>Instructor: <strong style={{ color: 'var(--primary)' }}>{course.instructor?.username || 'Instructor'}</strong></span>
                </div>
                <div className="flex items-center gap-1 text-muted">
                  <Clock size={16} />
                  <span>Created {new Date(course.createdAt).toLocaleDateString()}</span>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* Main Content Area */}
      <div className="container mt-8">
        <div className="grid grid-3 gap-8 items-start relative">
          
          {/* Left Column: Course Content */}
          <div className="flex flex-col gap-8" style={{ gridColumn: 'span 2' }}>
            
            {/* Description Box */}
            <div className="card glass" style={{ padding: '2rem', borderRadius: '16px', border: '1px solid var(--glass-border)' }}>
              <h3 style={{ fontSize: '1.3rem', marginBottom: '1rem' }}>About this course</h3>
              <p style={{ fontSize: '0.95rem', color: 'var(--text-main)', lineHeight: 1.6 }}>{course.description}</p>
            </div>

            {/* Course Content / Curriculum Accordion */}
            <div className="flex flex-col gap-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 style={{ fontSize: '1.3rem' }}>Course syllabus</h3>
                  <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                    {course.lessons?.length || 0} lectures {totalDurationMinutes > 0 ? `• ${formattedHours} hours total` : ''}
                  </p>
                </div>
              </div>

              <div className="flex flex-col gap-3">
                {course.lessons?.map((lesson, index) => (
                  <div 
                    key={lesson._id} 
                    className="card glass" 
                    style={{ padding: '1rem 1.25rem', borderRadius: '12px', overflow: 'hidden' }}
                  >
                    <div 
                      className="flex items-center justify-between" 
                      onClick={() => toggleLessonAccordion(lesson._id)}
                      style={{ cursor: 'pointer' }}
                    >
                      <div className="flex items-center gap-3">
                        <PlayCircle size={20} color="var(--primary)" />
                        <span style={{ fontWeight: 600, fontSize: '0.95rem' }}>
                          Lecture {index + 1}: {lesson.title}
                        </span>
                      </div>
                      <div className="flex items-center gap-4">
                        {lesson.duration > 0 && (
                          <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
                            {lesson.duration} mins
                          </span>
                        )}
                        {openLessons[lesson._id] ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                      </div>
                    </div>

                    {/* Accordion Content */}
                    {openLessons[lesson._id] && (
                      <div className="mt-4 pt-3" style={{ borderTop: '1px solid var(--glass-border)', fontSize: '0.88rem', color: 'var(--text-muted)' }}>
                        <p>{lesson.content || 'Video lecture with downloadable resources.'}</p>
                        {lesson.resources?.length > 0 && (
                          <div className="flex items-center gap-2 mt-2" style={{ color: 'var(--primary)', fontWeight: 600 }}>
                            <FileText size={16} />
                            <span>{lesson.resources.length} Resource files</span>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                ))}

                {(!course.lessons || course.lessons.length === 0) && (
                  <div className="text-center py-10 glass" style={{ borderRadius: '12px' }}>
                    <p className="text-muted">Lessons are currently being added by the instructor.</p>
                  </div>
                )}
              </div>
            </div>

            {/* Instructor Section */}
            <div className="card glass flex flex-col gap-4" style={{ padding: '2rem', borderRadius: '16px' }}>
              <h3 style={{ fontSize: '1.3rem' }}>Instructor</h3>
              <div className="flex items-center gap-4">
                <img 
                  src={course.instructor?.avatar || `https://ui-avatars.com/api/?name=${course.instructor?.username || 'Instructor'}&background=6366f1&color=fff`} 
                  style={{ width: '60px', height: '60px', borderRadius: '50%', objectFit: 'cover' }}
                  alt="Instructor"
                />
                <div>
                  <h4 style={{ fontSize: '1.1rem', color: 'var(--primary)' }}>{course.instructor?.username || 'Instructor'}</h4>
                  <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>{course.instructor?.email || ''}</p>
                </div>
              </div>
            </div>

          </div>

          {/* Right Column: Sticky Purchase Card */}
          <div className="relative">
            <div 
              className="card glass" 
              style={{ 
                position: 'sticky', top: '90px', 
                padding: '1.5rem', borderRadius: '18px', 
                boxShadow: '0 20px 40px rgba(0,0,0,0.5)',
                border: '1px solid var(--glass-border)'
              }}
            >
              {/* Thumbnail */}
              <div style={{ position: 'relative', borderRadius: '12px', overflow: 'hidden', aspectRatio: '16/9', marginBottom: '1.25rem' }}>
                <img 
                  src={course.thumbnail || fallbackImage} 
                  alt={course.title} 
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
                />
              </div>

              {/* Price Row */}
              <div className="flex items-baseline gap-3 mb-4">
                <span style={{ fontSize: '2rem', fontWeight: 800 }}>
                  {course.price === 0 ? 'Free' : `$${course.price}`}
                </span>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col gap-3 mb-6">
                {isEnrolled ? (
                  <Link 
                    to={`/course/${id}/learn/${course.lessons[0]?._id || 'start'}`} 
                    className="btn-primary" 
                    style={{ padding: '0.9rem', width: '100%', fontSize: '1rem', borderRadius: '10px' }}
                  >
                    <PlayCircle size={20} />
                    Go to Course
                  </Link>
                ) : (
                  <button 
                    onClick={handleEnroll} 
                    disabled={enrolling}
                    className="btn-primary" 
                    style={{ padding: '0.9rem', width: '100%', fontSize: '1rem', borderRadius: '10px' }}
                  >
                    {enrolling ? 'Enrolling...' : course.price === 0 ? 'Enroll Now (Free)' : 'Buy Now'}
                  </button>
                )}
              </div>

              {/* Course Features */}
              <div className="flex flex-col gap-3" style={{ fontSize: '0.85rem', borderTop: '1px solid var(--glass-border)', paddingTop: '1.25rem' }}>
                <h4 style={{ fontSize: '0.95rem', fontWeight: 700, marginBottom: '0.25rem' }}>This course includes:</h4>
                <div className="flex items-center gap-3 text-muted">
                  <PlayCircle size={16} color="var(--primary)" />
                  <span>{course.lessons?.length || 0} video lectures</span>
                </div>
                <div className="flex items-center gap-3 text-muted">
                  <Smartphone size={16} color="var(--accent-amber)" />
                  <span>Access on Mobile & Desktop</span>
                </div>
                <div className="flex items-center gap-3 text-muted">
                  <Award size={16} color="var(--primary)" />
                  <span>Certificate of completion</span>
                </div>
              </div>

            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default CourseDetail;
