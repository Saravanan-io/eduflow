import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { useSocket } from '../context/SocketContext';
import Spinner from '../components/Spinner';
import { Plus, Edit, Trash2, Users, BookMarked, Eye, BarChart2, Radio, Megaphone } from 'lucide-react';

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
      const { data } = await axios.get('/api/courses');
      // Filter only instructor's courses
      const instructorCourses = data.courses.filter(c => c.instructor?._id === user?.id);
      setCourses(instructorCourses);
      if (instructorCourses.length > 0) setSelectedCourseId(instructorCourses[0]._id);
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
      alert('Live session started! Students in this course room will be notified.');
    }
  };

  const handleSendAnnouncement = () => {
    if (socket && announcement && selectedCourseId) {
      socket.emit('new_announcement', { courseId: selectedCourseId, announcement });
      alert('Announcement pushed to all active students!');
      setAnnouncement('');
    }
  };

  if (loading) return <Spinner />;

  const totalStudents = courses.reduce((acc, c) => acc + (c.students?.length || 0), 0);

  return (
    <div className="flex flex-col gap-10 animate-fade" style={{ paddingBottom: '3rem' }}>
      <div className="flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="text-center md:text-left">
          <h1 style={{ fontSize: 'clamp(1.75rem, 5vw, 2.5rem)', marginBottom: '0.5rem' }}>Instructor Panel 🎓</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '1.05rem' }}>Manage your courses and interact with your students.</p>
        </div>
        <Link to="/create-course" className="btn-primary" style={{ padding: '0.85rem 1.75rem', borderRadius: '14px' }}>
          <Plus size={22} />
          <span>Create New Course</span>
        </Link>
      </div>

      <div className="grid grid-2 grid-3" style={{ gap: '1.5rem' }}>
        <div className="card glass flex items-center gap-4" style={{ padding: '1.75rem' }}>
          <div style={{ padding: '1rem', background: 'rgba(99, 102, 241, 0.1)', borderRadius: '14px' }}>
            <BookMarked size={28} color="var(--primary)" />
          </div>
          <div>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 600 }}>Created Courses</p>
            <p style={{ fontSize: '1.5rem', fontWeight: 800 }}>{courses.length}</p>
          </div>
        </div>
        <div className="card glass flex items-center gap-4" style={{ padding: '1.75rem' }}>
          <div style={{ padding: '1rem', background: 'rgba(34, 197, 94, 0.1)', borderRadius: '14px' }}>
            <Users size={28} color="var(--accent)" />
          </div>
          <div>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 600 }}>Total Students</p>
            <p style={{ fontSize: '1.5rem', fontWeight: 800 }}>{totalStudents}</p>
          </div>
        </div>
        <div className="card glass flex items-center gap-4" style={{ padding: '1.75rem' }}>
          <div style={{ padding: '1rem', background: 'rgba(34, 211, 238, 0.1)', borderRadius: '14px' }}>
            <BarChart2 size={28} color="#22d3ee" />
          </div>
          <div>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 600 }}>Average Rating</p>
            <p style={{ fontSize: '1.5rem', fontWeight: 800 }}>4.9/5.0</p>
          </div>
        </div>
      </div>

      <div className="grid grid-2" style={{ gridTemplateColumns: 'minmax(0, 1fr) clamp(300px, 30%, 400px)', gap: '2.5rem' }}>
        {/* Course List */}
        <div className="flex flex-col gap-6">
          <h2 style={{ fontSize: '1.75rem' }}>Syllabus Management</h2>
          <div className="flex flex-col gap-4">
            {courses.length > 0 ? (
              courses.map(course => (
                <div key={course._id} className="card glass flex items-center justify-between gap-4" style={{ padding: '1.5rem', borderRadius: '20px' }}>
                  <div className="flex items-center gap-5 overflow-hidden">
                    <div className="hide-mobile" style={{ width: '80px', height: '50px', borderRadius: '10px', overflow: 'hidden', flexShrink: 0 }}>
                      <img src={course.thumbnail} style={{ width: '100%', height: '100%', objectFit: 'cover' }} alt="thumb" />
                    </div>
                    <div className="min-w-0">
                      <h3 style={{ fontSize: '1.15rem', marginBottom: '0.25rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{course.title}</h3>
                      <div className="flex items-center gap-3 text-muted" style={{ fontSize: '0.8rem' }}>
                        <span className="flex items-center gap-1"><Users size={14} /> {course.students?.length}</span>
                        <span className={`badge ${course.isPublished ? 'published' : 'draft'}`} style={{ 
                          padding: '3px 10px', borderRadius: '6px', fontSize: '11px', fontWeight: 700,
                          background: course.isPublished ? 'rgba(34, 197, 94, 0.1)' : 'rgba(239, 68, 68, 0.1)',
                          color: course.isPublished ? 'var(--accent)' : 'var(--error)'
                        }}>
                          {course.isPublished ? 'PUBLISHED' : 'DRAFT'}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button onClick={() => handleStartLive(course._id)} title="Go Live" className="btn-outline" style={{ padding: '0.6rem', color: 'var(--accent)', borderColor: 'rgba(34, 197, 94, 0.3)' }}><Radio size={18} /></button>
                    <button onClick={() => navigate(`/edit-course/${course._id}`)} title="Edit" className="btn-outline" style={{ padding: '0.6rem' }}><Edit size={18} /></button>
                    <button onClick={() => handleTogglePublish(course._id)} title={course.isPublished ? 'Unpublish' : 'Publish'} className="btn-outline" style={{ padding: '0.6rem' }}><Eye size={18} /></button>
                    <button onClick={() => handleDeleteCourse(course._id)} title="Delete" className="btn-outline" style={{ padding: '0.6rem', color: 'var(--error)', borderColor: 'rgba(239, 68, 68, 0.3)' }}><Trash2 size={18} /></button>
                  </div>
                </div>
              ))
            ) : (
              <div className="glass text-center py-16" style={{ borderRadius: '20px' }}>
                <p className="text-muted">You haven't created any courses yet.</p>
              </div>
            )}
          </div>
        </div>

        {/* Sidebar Interactions */}
        <div className="flex flex-col gap-6">
          <div className="card glass flex flex-col gap-6" style={{ padding: '2rem', borderRadius: '24px' }}>
            <h3 className="flex items-center gap-2" style={{ fontSize: '1.25rem' }}>
              <Megaphone size={20} color="var(--primary)" />
              Course Broadcast
            </h3>
            <div className="flex flex-col gap-4">
              <div className="flex flex-col gap-1">
                <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 600 }}>Select Course</label>
                <select 
                  value={selectedCourseId} 
                  onChange={(e) => setSelectedCourseId(e.target.value)}
                  style={{ background: 'var(--bg-dark)' }}
                >
                  {courses.map(c => <option key={c._id} value={c._id}>{c.title}</option>)}
                </select>
              </div>
              <div className="flex flex-col gap-1">
                <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 600 }}>Message</label>
                <textarea 
                  placeholder="Tell your students something..." 
                  value={announcement}
                  onChange={(e) => setAnnouncement(e.target.value)}
                  style={{ minHeight: '120px', resize: 'none' }}
                />
              </div>
              <button 
                onClick={handleSendAnnouncement}
                className="btn-primary" 
                style={{ width: '100%', padding: '1rem', borderRadius: '12px' }}
                disabled={!announcement || !selectedCourseId}
              >
                Send Announcement
              </button>
            </div>
          </div>

          <div className="card glass flex flex-col gap-4" style={{ borderRadius: '24px' }}>
            <h3 style={{ fontSize: '1.25rem' }}>Live Insights</h3>
            <div className="flex flex-col gap-3">
              <div className="flex items-center justify-between p-3 glass rounded-xl">
                <span className="text-muted" style={{ fontSize: '0.85rem' }}>Active Rooms</span>
                <span style={{ fontWeight: 800 }}>0</span>
              </div>
              <div className="flex items-center justify-between p-3 glass rounded-xl">
                <span className="text-muted" style={{ fontSize: '0.85rem' }}>Peak Viewers</span>
                <span style={{ fontWeight: 800 }}>0</span>
              </div>
            </div>
          </div>
        </div>
      </div>
      <style>{`
        @media (max-width: 1024px) {
          .grid-2 { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </div>
  );
};


export default InstructorDashboard;
