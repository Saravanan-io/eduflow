import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import Spinner from '../components/Spinner';
import { Save, Plus, Trash2, Video, FileText, Image as ImageIcon, Layout, MoveUp, MoveDown, CheckCircle } from 'lucide-react';

const CourseForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = !!id;

  const [loading, setLoading] = useState(isEdit);
  const [saving, setSaving] = useState(false);
  
  // Course State
  const [courseData, setCourseData] = useState({
    title: '',
    description: '',
    category: 'Web Development',
    price: 0,
    thumbnail: null,
    isPublished: true
  });

  // Lessons State
  const [lessons, setLessons] = useState([]);
  const [newLesson, setNewLesson] = useState({ title: '', content: '', duration: '', order: 1 });

  useEffect(() => {
    if (isEdit) fetchCourseData();
  }, [id]);

  const fetchCourseData = async () => {
    try {
      const { data } = await axios.get(`/api/courses/${id}`);
      const { title, description, category, price, isPublished } = data.course;
      setCourseData({ title, description, category, price, isPublished, thumbnail: null });
      setLessons(data.course.lessons || []);
    } catch (err) {
      console.error('Error fetching course', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCourseChange = (e) => {
    const { name, value, type, checked } = e.target;
    setCourseData({
      ...courseData,
      [name]: type === 'checkbox' ? checked : value
    });
  };

  const handleFileChange = (e) => {
    setCourseData({ ...courseData, thumbnail: e.target.files[0] });
  };

  const handleSaveCourse = async (e) => {
    e.preventDefault();
    setSaving(true);
    const formData = new FormData();
    Object.keys(courseData).forEach(key => {
      if (courseData[key] !== null) formData.append(key, courseData[key]);
    });

    try {
      let res;
      if (isEdit) {
        res = await axios.put(`/api/courses/${id}`, formData);
      } else {
        res = await axios.post('/api/courses', formData);
      }
      if (!isEdit) navigate(`/edit-course/${res.data.course._id}`);
      else alert('Course updated successfully!');
    } catch (err) {
      alert(err.response?.data?.message || 'Save failed');
    } finally {
      setSaving(false);
    }
  };

  const handleAddLesson = async () => {
    if (!id) return alert('Please save the course first before adding lessons');
    try {
      const { data } = await axios.post(`/api/lessons/${id}`, { 
        ...newLesson, 
        order: lessons.length + 1 
      });
      setLessons([...lessons, data.lesson]);
      setNewLesson({ title: '', content: '', duration: '', order: lessons.length + 2 });
    } catch (err) {
      alert(err.response?.data?.message || 'Lesson add failed');
    }
  };

  const handleDeleteLesson = async (lessonId) => {
    if (!window.confirm('Delete this lesson?')) return;
    try {
      await axios.delete(`/api/lessons/${lessonId}`);
      setLessons(lessons.filter(l => l._id !== lessonId));
    } catch (err) {
      alert(err.response?.data?.message || 'Delete failed');
    }
  };

  if (loading) return <Spinner />;

  return (
    <div className="container flex flex-col gap-10 py-6" style={{ maxWidth: '1000px' }}>
      <div className="flex items-center justify-between">
        <h1 style={{ fontSize: '2rem' }}>{isEdit ? 'Edit Course' : 'Create New Course'} 🛠️</h1>
        <button onClick={() => navigate('/instructor/dashboard')} className="btn-outline">Back to Dashboard</button>
      </div>

      <div className="grid grid-2" style={{ gridTemplateColumns: '1fr 0.8fr', gap: '2rem', alignItems: 'start' }}>
        {/* Main Content: Course Info */}
        <form onSubmit={handleSaveCourse} className="card glass flex flex-col gap-6" style={{ padding: '2rem' }}>
          <h2 className="flex items-center gap-2" style={{ fontSize: '1.25rem' }}>
            <Layout size={20} color="var(--primary)" />
            Course Essentials
          </h2>
          
          <div className="flex flex-col gap-1">
            <label style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Course Title</label>
            <input type="text" name="title" value={courseData.title} onChange={handleCourseChange} required placeholder="Ex: Advanced React Masterclass" />
          </div>

          <div className="flex flex-col gap-1">
            <label style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Description</label>
            <textarea name="description" value={courseData.description} onChange={handleCourseChange} required placeholder="What will students learn?" style={{ minHeight: '100px' }} />
          </div>

          <div className="grid grid-2" style={{ gap: '1rem' }}>
            <div className="flex flex-col gap-1">
              <label style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Category</label>
              <select name="category" value={courseData.category} onChange={handleCourseChange}>
                <option>Web Development</option>
                <option>Data Science</option>
                <option>Mobile Development</option>
                <option>UI/UX Design</option>
                <option>Cybersecurity</option>
                <option>Business</option>
              </select>
            </div>
            <div className="flex flex-col gap-1">
              <label style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Price ($)</label>
              <input type="number" name="price" value={courseData.price} onChange={handleCourseChange} min="0" />
            </div>
          </div>

          <div className="flex flex-col gap-1">
            <label style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Thumbnail Image</label>
            <div className="flex items-center gap-4 glass" style={{ padding: '0.75rem', borderRadius: 'var(--radius)' }}>
              <ImageIcon size={24} className="text-muted" />
              <input type="file" onChange={handleFileChange} accept="image/*" style={{ border: 'none', padding: 0 }} />
            </div>
          </div>

          <div className="flex items-center gap-2">
            <input type="checkbox" name="isPublished" checked={courseData.isPublished} onChange={handleCourseChange} style={{ width: '20px', height: '20px' }} />
            <label style={{ fontSize: '0.9rem', fontWeight: 600 }}>Publish course immediately</label>
          </div>

          <button type="submit" className="btn-primary flex items-center justify-center gap-2" disabled={saving} style={{ padding: '1rem' }}>
            <Save size={20} />
            <span>{saving ? 'Saving...' : isEdit ? 'Update Course Details' : 'Create Course & Continue'}</span>
          </button>
        </form>

        {/* Sidebar: Lessons Management */}
        <div className="flex flex-col gap-6">
          <div className="card glass flex flex-col gap-6" style={{ padding: '2rem' }}>
            <h2 className="flex items-center gap-2" style={{ fontSize: '1.25rem' }}>
              <Video size={20} color="var(--primary)" />
              Course Syllabus
            </h2>
            
            <div className="flex flex-col gap-3">
              {lessons.map((lesson, idx) => (
                <div key={lesson._id} className="glass flex items-center justify-between" style={{ padding: '0.75rem 1rem', borderRadius: '12px', fontSize: '0.9rem' }}>
                  <div className="flex items-center gap-3 overflow-hidden">
                    <span style={{ color: 'var(--text-muted)', fontWeight: 700 }}>{idx + 1}</span>
                    <p style={{ textOverflow: 'ellipsis', whiteSpace: 'nowrap', overflow: 'hidden' }}>{lesson.title}</p>
                  </div>
                  <div className="flex items-center gap-1">
                    <button onClick={() => handleDeleteLesson(lesson._id)} className="text-muted hover-error" style={{ background: 'transparent' }}><Trash2 size={16} /></button>
                  </div>
                </div>
              ))}

              {lessons.length === 0 && <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', textAlign: 'center' }}>No lessons added yet.</p>}
            </div>

            <hr style={{ border: 'none', height: '1px', background: 'var(--glass-border)' }} />

            <div className="flex flex-col gap-4">
              <h3 style={{ fontSize: '1rem' }}>Add New Lesson</h3>
              <input type="text" placeholder="Lesson Title" value={newLesson.title} onChange={(e) => setNewLesson({ ...newLesson, title: e.target.value })} style={{ fontSize: '0.85rem' }} />
              <input type="number" placeholder="Duration (min)" value={newLesson.duration} onChange={(e) => setNewLesson({ ...newLesson, duration: e.target.value })} style={{ fontSize: '0.85rem' }} />
              <textarea placeholder="Lesson Content / Summary" value={newLesson.content} onChange={(e) => setNewLesson({ ...newLesson, content: e.target.value })} style={{ fontSize: '0.85rem', minHeight: '80px' }} />
              <button 
                onClick={handleAddLesson} 
                className="btn-outline flex items-center justify-center gap-2" 
                style={{ width: '100%', padding: '0.75rem' }}
                disabled={!newLesson.title}
              >
                <Plus size={18} />
                <span>Add Lesson</span>
              </button>
            </div>
          </div>

          {!isEdit && (
            <div className="glass text-center" style={{ padding: '1.5rem', borderRadius: '20px', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
              ⚠️ You'll be able to add video files and resources after the initial course creation.
            </div>
          )}
        </div>
      </div>
      <style>{`
        .hover-error:hover { color: var(--error) !important; }
        .published { background: var(--accent); }
        .draft { background: var(--text-muted); }
      `}</style>
    </div>
  );
};

export default CourseForm;
