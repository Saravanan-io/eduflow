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
    <div className="flex flex-col gap-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 style={{ fontSize: '2rem' }}>Instructor Panel 🎓</h1>
          <p style={{ color: 'var(--text-muted)' }}>Manage your courses and interact with your students.</p>
        </div>
        <Link to="/create-course" className="btn-primary flex items-center gap-2">
          <Plus size={20} />
          <span>Create New Course</span>
        </Link>
      </div>

      <div className="grid grid-3">
        <div className="card glass flex items-center gap-4">
          <div style={{ padding: '1rem', background: 'rgba(99, 102, 241, 0.1)', borderRadius: '12px' }}>
            <BookMarked size={24} color="var(--primary)" />
          </div>
          <div>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Created Courses</p>
            <p style={{ fontSize: '1.25rem', fontWeight: 700 }}>{courses.length}</p>
          </div>
        </div>
        <div className="card glass flex items-center gap-4">
          <div style={{ padding: '1rem', background: 'rgba(34, 197, 94, 0.1)', borderRadius: '12px' }}>
            <Users size={24} color="var(--accent)" />
          </div>
          <div>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Total Students</p>
            <p style={{ fontSize: '1.25rem', fontWeight: 700 }}>{totalStudents}</p>
          </div>
        </div>
        <div className="card glass flex items-center gap-4">
          <div style={{ padding: '1rem', background: 'rgba(34, 211, 238, 0.1)', borderRadius: '12px' }}>
            <BarChart2 size={24} color="#22d3ee" />
          </div>
          <div>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Average Rating</p>
            <p style={{ fontSize: '1.25rem', fontWeight: 700 }}>4.9/5.0</p>
          </div>
        </div>
      </div>

      <div className="grid grid-2" style={{ gridTemplateColumns: 'minmax(0, 1fr) 350px', gap: '2rem' }}>
        {/* Course List */}
        <div className="flex flex-col gap-6">
          <h2 style={{ fontSize: '1.5rem' }}>Management Center</h2>
          <div className="flex flex-col gap-4">
            {courses.length > 0 ? (
              courses.map(course => (
                <div key={course._id} className="card glass flex items-center justify-between gap-4" style={{ padding: '1.25rem' }}>
                  <div className="flex items-center gap-4">
                    <img src={course.thumbnail} style={{ width: '80px', height: '50px', borderRadius: '8px', objectFit: 'cover' }} alt="thumb" />
                    <div>
                      <h3 style={{ fontSize: '1rem' }}>{course.title}</h3>
                      <div className="flex items-center gap-3 text-muted" style={{ fontSize: '0.75rem' }}>
                        <span className="flex items-center gap-1"><Users size={12} /> {course.students?.length} Students</span>
                        <span className={`badge ${course.isPublished ? 'published' : 'draft'}`} style={{ 
                          padding: '2px 8px', borderRadius: '4px', fontSize: '10px', 
                          background: course.isPublished ? 'rgba(34, 197, 94, 0.15)' : 'rgba(239, 68, 68, 0.15)',
                          color: course.isPublished ? 'var(--accent)' : 'var(--error)'
                        }}>
                          {course.isPublished ? 'Published' : 'Draft'}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button onClick={() => handleStartLive(course._id)} title="Go Live" className="btn-outline" style={{ padding: '0.5rem', color: 'var(--accent)', borderColor: 'var(--accent)' }}><Radio size={16} /></button>
                    <button onClick={() => navigate(`/edit-course/${course._id}`)} title="Edit" className="btn-outline" style={{ padding: '0.5rem' }}><Edit size={16} /></button>
                    <button onClick={() => handleTogglePublish(course._id)} title={course.isPublished ? 'Unpublish' : 'Publish'} className="btn-outline" style={{ padding: '0.5rem' }}><Eye size={16} /></button>
                    <button onClick={() => handleDeleteCourse(course._id)} title="Delete" className="btn-outline" style={{ padding: '0.5rem', color: 'var(--error)', borderColor: 'var(--error)' }}><Trash2 size={16} /></button>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-muted">No courses yet. Start by creating your first course.</p>
            )}
          </div>
        </div>

        {/* Sidebar Interactions */}
        <div className="flex flex-col gap-6">
          <div className="card glass flex flex-col gap-4">
            <h3 className="flex items-center gap-2" style={{ fontSize: '1.2rem' }}>
              <Megaphone size={18} color="var(--primary)" />
              Push Announcement
            </h3>
            <div className="flex flex-col gap-3">
              <select 
                value={selectedCourseId} 
                onChange={(e) => setSelectedCourseId(e.target.value)}
                style={{ fontSize: '0.85rem' }}
              >
                {courses.map(c => <option key={c._id} value={c._id}>{c.title}</option>)}
              </select>
              <textarea 
                placeholder="Write your announcement..." 
                value={announcement}
                onChange={(e) => setAnnouncement(e.target.value)}
                style={{ minHeight: '120px', fontSize: '0.9rem' }}
              />
              <button 
                onClick={handleSendAnnouncement}
                className="btn-primary" 
                style={{ width: '100%', padding: '0.75rem' }}
                disabled={!announcement || !selectedCourseId}
              >
                Broadcast to Students
              </button>
            </div>
          </div>

          <div className="card glass">
            <h3 style={{ fontSize: '1.2rem', marginBottom: '1rem' }}>Live Session Control</h3>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '1rem' }}>
              Click the radio icon <Radio size={14} style={{ display: 'inline', marginBottom: '-2px' }} /> next to a course to notify students you're live.
            </p>
            <div className="flex flex-col gap-2">
              <div className="flex items-center justify-between text-muted" style={{ fontSize: '0.8rem' }}>
                <span>Active Rooms</span>
                <span>0</span>
              </div>
              <div className="flex items-center justify-between text-muted" style={{ fontSize: '0.8rem' }}>
                <span>Peak Viewers</span>
                <span>0</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InstructorDashboard;
