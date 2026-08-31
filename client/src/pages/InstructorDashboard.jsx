import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { useSocket } from '../context/SocketContext';
import Spinner from '../components/Spinner';
import { Plus, Edit, Trash2, Users, BookMarked, Eye, Radio, Megaphone, DollarSign, Star, CheckCircle, Sparkles } from 'lucide-react';

const InstructorDashboard = () => {
  const { user } = useAuth();
  const socket = useSocket();
  const navigate = useNavigate();
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [announcement, setAnnouncement] = useState('');
  const [selectedCourseId, setSelectedCourseId] = useState('');

  useEffect(() => {
    fetchInstructorCourses();
  }, []);

  const fetchInstructorCourses = async () => {
    try {
      const { data } = await axios.get('/api/courses/instructor/my-courses');
      const coursesData = data && Array.isArray(data.courses) ? data.courses : [];
      setCourses(coursesData);
      if (coursesData.length > 0) setSelectedCourseId(coursesData[0]._id);
    } catch (err) {
      console.error('Error fetching courses', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteCourse = async (id) => {
    if (!window.confirm('Are you sure you want to delete this course and all its lessons?')) return;
    try {
      await axios.delete(`/api/courses/${id}`);
      setCourses(courses.filter(c => c._id !== id));
    } catch (err) {
      alert(err.response?.data?.message || 'Delete failed');
    }
  };

  const handleTogglePublish = async (id) => {
    try {
      const { data } = await axios.post(`/api/courses/${id}/publish`);
      setCourses(courses.map(c => c._id === id ? { ...c, isPublished: data.isPublished } : c));
    } catch (err) {
      alert(err.response?.data?.message || 'Update failed');
    }
  };

  const handleStartLive = (courseId) => {
    if (socket) {
      socket.emit('start_live_session', { courseId });
      alert('📡 Live session started! All enrolled students joined in the room will be notified instantly.');
    }
  };

  const handleSendAnnouncement = () => {
    if (socket && announcement && selectedCourseId) {
      socket.emit('new_announcement', { courseId: selectedCourseId, announcement });
      alert('📣 Broadcast announcement pushed to all active students!');
      setAnnouncement('');
    }
  };

  if (loading) return <Spinner />;

  const totalStudents = courses.reduce((acc, c) => acc + (c.students?.length || 0), 0);
  const totalEstRevenue = courses.reduce((acc, c) => acc + ((c.students?.length || 0) * (Number(c.price) || 0)), 0);
  const publishedCount = courses.filter(c => c.isPublished).length;

  return (
    <div className="flex flex-col gap-8 animate-fade" style={{ paddingBottom: '3rem' }}>
      
      {/* Header Banner */}
      <div className="glass flex flex-col md:flex-row items-start md:items-center justify-between gap-6" style={{ padding: '2rem', borderRadius: '20px', background: 'var(--bg-card)', border: '1px solid var(--glass-border)' }}>
        <div className="flex items-center gap-4">
          <img 
            src={user?.avatar || `https://ui-avatars.com/api/?name=${user?.username || 'Instructor'}&background=6366f1&color=fff`} 
            style={{ width: '64px', height: '64px', borderRadius: '50%', border: '2px solid var(--primary)' }}
            alt="avatar"
          />
          <div>
            <div className="flex items-center gap-2">
              <h1 style={{ fontSize: '1.75rem', fontWeight: 800 }}>Instructor Studio</h1>
              <span className="badge" style={{ background: 'var(--primary-glow)', color: 'var(--primary)', padding: '2px 10px', borderRadius: '20px', fontSize: '0.75rem', fontWeight: 700 }}>INSTRUCTOR</span>
            </div>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
              Welcome back, <strong>{user?.username}</strong>! Manage your courses, build video lectures, and broadcast live announcements.
            </p>
          </div>
        </div>

        <Link to="/create-course" className="btn-primary" style={{ padding: '0.85rem 1.6rem', borderRadius: '12px', fontSize: '0.95rem' }}>
          <Plus size={20} />
          <span>Create New Course</span>
        </Link>
      </div>

      {/* Real Database Metrics Row */}
      <div className="grid grid-2 grid-3" style={{ gap: '1.25rem' }}>
        <div className="card glass flex items-center gap-4" style={{ padding: '1.5rem', borderRadius: '16px' }}>
          <div className="flex items-center justify-center" style={{ width: '52px', height: '52px', background: 'rgba(99, 102, 241, 0.15)', borderRadius: '14px', flexShrink: 0 }}>
            <BookMarked size={26} color="var(--primary)" />
          </div>
          <div>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 600 }}>Created Courses</p>
            <p style={{ fontSize: '1.5rem', fontWeight: 800 }}>{courses.length} <span style={{ fontSize: '0.8rem', color: 'var(--accent)' }}>({publishedCount} published)</span></p>
          </div>
        </div>

        <div className="card glass flex items-center gap-4" style={{ padding: '1.5rem', borderRadius: '16px' }}>
          <div className="flex items-center justify-center" style={{ width: '52px', height: '52px', background: 'rgba(34, 197, 94, 0.15)', borderRadius: '14px', flexShrink: 0 }}>
            <Users size={26} color="var(--accent)" />
          </div>
          <div>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 600 }}>Total Student Enrollments</p>
            <p style={{ fontSize: '1.5rem', fontWeight: 800 }}>{totalStudents}</p>
          </div>
        </div>

        <div className="card glass flex items-center gap-4" style={{ padding: '1.5rem', borderRadius: '16px' }}>
          <div className="flex items-center justify-center" style={{ width: '52px', height: '52px', background: 'rgba(245, 158, 11, 0.15)', borderRadius: '14px', flexShrink: 0 }}>
            <DollarSign size={26} color="var(--accent-amber)" />
          </div>
          <div>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 600 }}>Total Revenue</p>
            <p style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--accent-amber)' }}>${totalEstRevenue.toFixed(2)}</p>
          </div>
        </div>
      </div>

      {/* Content Columns */}
      <div className="grid grid-3" style={{ gap: '1.5rem' }}>
        
        {/* Left Column: Course Management List */}
        <div className="flex flex-col gap-6" style={{ gridColumn: 'span 2' }}>
          <div className="flex items-center justify-between">
            <h2 style={{ fontSize: '1.4rem', fontWeight: 800 }}>My Courses ({courses.length})</h2>
          </div>

          <div className="flex flex-col gap-4">
            {courses.length > 0 ? (
              courses.map(course => (
                <div key={course._id} className="card glass flex items-center justify-between gap-4" style={{ padding: '1.25rem', borderRadius: '16px' }}>
                  <div className="flex items-center gap-4 overflow-hidden">
                    <div style={{ width: '90px', height: '58px', borderRadius: '10px', overflow: 'hidden', flexShrink: 0, background: 'var(--bg-card2)' }}>
                      <img src={course.thumbnail || "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?q=80&w=400"} style={{ width: '100%', height: '100%', objectFit: 'cover' }} alt="thumb" />
                    </div>
                    <div className="min-w-0 flex flex-col gap-1">
                      <h3 style={{ fontSize: '1.1rem', fontWeight: 700, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {course.title}
                      </h3>
                      <div className="flex items-center gap-4 text-muted" style={{ fontSize: '0.82rem' }}>
                        <span className="flex items-center gap-1"><Users size={14} color="var(--primary)" /> {course.students?.length || 0} enrolled</span>
                        <span className="flex items-center gap-1"><BookMarked size={14} color="var(--accent)" /> {course.lessons?.length || 0} lessons</span>
                        <span style={{ color: course.price === 0 ? 'var(--accent)' : 'var(--text-main)', fontWeight: 700 }}>
                          {course.price === 0 ? 'Free' : `$${course.price}`}
                        </span>
                        <span className={`badge ${course.isPublished ? 'published' : 'draft'}`} style={{ 
                          padding: '2px 8px', borderRadius: '6px', fontSize: '11px', fontWeight: 700,
                          background: course.isPublished ? 'rgba(34, 197, 94, 0.15)' : 'rgba(239, 68, 68, 0.15)',
                          color: course.isPublished ? 'var(--accent)' : 'var(--error)'
                        }}>
                          {course.isPublished ? 'PUBLISHED' : 'DRAFT'}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2">
                    <button onClick={() => handleStartLive(course._id)} title="Go Live" className="btn-outline" style={{ padding: '0.55rem 0.75rem', fontSize: '0.8rem', color: 'var(--accent)', borderColor: 'rgba(34, 197, 94, 0.3)' }}>
                      <Radio size={16} />
                      <span className="hide-mobile">Live</span>
                    </button>
                    <button onClick={() => navigate(`/edit-course/${course._id}`)} title="Edit Syllabus" className="btn-outline" style={{ padding: '0.55rem 0.75rem', fontSize: '0.8rem' }}>
                      <Edit size={16} />
                      <span className="hide-mobile">Edit</span>
                    </button>
                    <button onClick={() => handleTogglePublish(course._id)} title={course.isPublished ? 'Unpublish' : 'Publish'} className="btn-outline" style={{ padding: '0.55rem 0.75rem', fontSize: '0.8rem' }}>
                      <Eye size={16} />
                    </button>
                    <button onClick={() => handleDeleteCourse(course._id)} title="Delete" className="btn-outline" style={{ padding: '0.55rem 0.75rem', fontSize: '0.8rem', color: 'var(--error)', borderColor: 'rgba(239, 68, 68, 0.3)' }}>
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <div className="glass text-center py-20 flex flex-col items-center gap-3" style={{ borderRadius: '20px' }}>
                <Sparkles size={40} color="var(--primary)" />
                <h3 style={{ fontSize: '1.2rem' }}>You haven't created any courses yet</h3>
                <p className="text-muted" style={{ fontSize: '0.9rem' }}>Share your expertise with learners on EduFlow.</p>
                <Link to="/create-course" className="btn-primary mt-2" style={{ padding: '0.75rem 1.5rem', fontSize: '0.9rem' }}>
                  Create Your First Course
                </Link>
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Broadcast Center */}
        <div className="flex flex-col gap-6">
          <div className="card glass flex flex-col gap-4" style={{ padding: '1.5rem', borderRadius: '18px' }}>
            <h3 className="flex items-center gap-2" style={{ fontSize: '1.15rem', fontWeight: 700 }}>
              <Megaphone size={20} color="var(--primary)" />
              Broadcast Center
            </h3>
            <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
              Send real-time announcement popups directly to active students in your course rooms.
            </p>

            <div className="flex flex-col gap-4">
              <div className="flex flex-col gap-1">
                <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 600 }}>Select Target Course</label>
                <select 
                  value={selectedCourseId} 
                  onChange={(e) => setSelectedCourseId(e.target.value)}
                  style={{ background: 'var(--bg-dark)', borderRadius: '10px' }}
                >
                  {courses.map(c => <option key={c._id} value={c._id}>{c.title}</option>)}
                </select>
              </div>

              <div className="flex flex-col gap-1">
                <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 600 }}>Announcement Note</label>
                <textarea 
                  placeholder="e.g. New live Q&A session starts in 10 minutes!" 
                  value={announcement}
                  onChange={(e) => setAnnouncement(e.target.value)}
                  style={{ minHeight: '110px', resize: 'none', borderRadius: '10px' }}
                />
              </div>

              <button 
                onClick={handleSendAnnouncement}
                className="btn-primary" 
                style={{ width: '100%', padding: '0.75rem', borderRadius: '10px', fontSize: '0.9rem' }}
                disabled={!announcement || !selectedCourseId}
              >
                Push Real-Time Announcement
              </button>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default InstructorDashboard;
