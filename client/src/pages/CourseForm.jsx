import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import Spinner from '../components/Spinner';
import { 
  Save, Plus, Trash2, Video, FileText, Image as ImageIcon, 
  Layout, ArrowLeft, Upload, FileUp, CheckCircle2, AlertCircle 
} from 'lucide-react';

const CourseForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = !!id;

  const [loading, setLoading] = useState(isEdit);
  const [savingCourse, setSavingCourse] = useState(false);
  const [addingLesson, setAddingLesson] = useState(false);
  const [uploadStatus, setUploadStatus] = useState('');
  
  // Course Metadata State
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
  
  // New Lesson Form State (supports files & URLs)
  const [newLesson, setNewLesson] = useState({
    title: '',
    content: '',
    duration: '',
    videoUrl: ''
  });
  const [videoFile, setVideoFile] = useState(null);
  const [resourceFiles, setResourceFiles] = useState([]);

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

  const handleThumbnailChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setCourseData({ ...courseData, thumbnail: e.target.files[0] });
    }
  };

  const handleSaveCourse = async (e) => {
    e.preventDefault();
    setSavingCourse(true);
    const formData = new FormData();
    formData.append('title', courseData.title);
    formData.append('description', courseData.description);
    formData.append('category', courseData.category);
    formData.append('price', courseData.price);
    formData.append('isPublished', courseData.isPublished);
    
    if (courseData.thumbnail) {
      formData.append('thumbnail', courseData.thumbnail);
    }

    try {
      let res;
      if (isEdit) {
        res = await axios.put(`/api/courses/${id}`, formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
      } else {
        res = await axios.post('/api/courses', formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
      }
      if (!isEdit) {
        navigate(`/edit-course/${res.data.course._id}`);
      } else {
        alert('🎉 Course details saved successfully!');
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Save failed');
    } finally {
      setSavingCourse(false);
    }
  };

  // Add Lesson with Education Files & Videos
  const handleAddLesson = async (e) => {
    e.preventDefault();
    if (!id) return alert('Please save the course details first before adding lessons.');
    if (!newLesson.title.trim()) return alert('Please enter a lesson title.');

    setAddingLesson(true);
    setUploadStatus('Uploading educational files...');

    const formData = new FormData();
    formData.append('title', newLesson.title);
    formData.append('content', newLesson.content);
    formData.append('duration', newLesson.duration || 15);
    formData.append('order', lessons.length + 1);

    if (newLesson.videoUrl) {
      formData.append('videoUrl', newLesson.videoUrl);
    }
    if (videoFile) {
      formData.append('video', videoFile);
    }
    if (resourceFiles && resourceFiles.length > 0) {
      Array.from(resourceFiles).forEach((file) => {
        formData.append('resources', file);
      });
    }

    try {
      const { data } = await axios.post(`/api/lessons/${id}`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      setLessons([...lessons, data.lesson]);
      
      // Reset lesson form inputs
      setNewLesson({ title: '', content: '', duration: '', videoUrl: '' });
      setVideoFile(null);
      setResourceFiles([]);
      setUploadStatus('');
      alert('✨ Lesson and educational files uploaded successfully!');
    } catch (err) {
      console.error('Error adding lesson', err);
      alert(err.response?.data?.message || 'File upload failed. Please try again.');
    } finally {
      setAddingLesson(false);
      setUploadStatus('');
    }
  };

  const handleDeleteLesson = async (lessonId) => {
    if (!window.confirm('Delete this lesson and attached files?')) return;
    try {
      await axios.delete(`/api/lessons/${lessonId}`);
      setLessons(lessons.filter(l => l._id !== lessonId));
    } catch (err) {
      alert(err.response?.data?.message || 'Delete failed');
    }
  };

  if (loading) return <Spinner />;

  return (
    <div className="container flex flex-col gap-8 py-6 animate-fade" style={{ maxWidth: '1050px', paddingBottom: '3rem' }}>
      
      {/* Top Header Navigation */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate('/instructor/dashboard')} className="btn-outline" style={{ padding: '0.5rem 1rem', borderRadius: '10px' }}>
            <ArrowLeft size={18} />
            <span>Studio</span>
          </button>
          <h1 style={{ fontSize: '1.8rem', fontWeight: 800 }}>{isEdit ? 'Edit Course Syllabus & Files' : 'Create New Course'}</h1>
        </div>
      </div>

      <div className="grid grid-2" style={{ gridTemplateColumns: '1fr 0.9fr', gap: '2rem', alignItems: 'start' }}>
        
        {/* Left Column: Course Metadata Form */}
        <form onSubmit={handleSaveCourse} className="card glass flex flex-col gap-6" style={{ padding: '2rem', borderRadius: '20px' }}>
          <h2 className="flex items-center gap-2" style={{ fontSize: '1.25rem', fontWeight: 700 }}>
            <Layout size={22} color="var(--primary)" />
            Course Essentials
          </h2>
          
          <div className="flex flex-col gap-1.5">
            <label style={{ fontSize: '0.82rem', color: 'var(--text-muted)', fontWeight: 600 }}>Course Title</label>
            <input 
              type="text" 
              name="title" 
              value={courseData.title} 
              onChange={handleCourseChange} 
              required 
              placeholder="e.g. Master React & Full-Stack Development" 
              style={{ borderRadius: '12px' }}
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label style={{ fontSize: '0.82rem', color: 'var(--text-muted)', fontWeight: 600 }}>Course Overview & Description</label>
            <textarea 
              name="description" 
              value={courseData.description} 
              onChange={handleCourseChange} 
              required 
              placeholder="Write a clear overview of what students will learn..." 
              style={{ minHeight: '110px', borderRadius: '12px', resize: 'none' }} 
            />
          </div>

          <div className="grid grid-2" style={{ gap: '1rem' }}>
            <div className="flex flex-col gap-1.5">
              <label style={{ fontSize: '0.82rem', color: 'var(--text-muted)', fontWeight: 600 }}>Category</label>
              <select name="category" value={courseData.category} onChange={handleCourseChange} style={{ borderRadius: '12px', background: 'var(--bg-dark)' }}>
                <option>Web Development</option>
                <option>Data Science</option>
                <option>Mobile Development</option>
                <option>UI/UX Design</option>
                <option>Cloud & DevOps</option>
                <option>Cybersecurity</option>
              </select>
            </div>

            <div className="flex flex-col gap-1.5">
              <label style={{ fontSize: '0.82rem', color: 'var(--text-muted)', fontWeight: 600 }}>Price ($ USD)</label>
              <input 
                type="number" 
                name="price" 
                value={courseData.price} 
                onChange={handleCourseChange} 
                min="0" 
                style={{ borderRadius: '12px' }}
              />
            </div>
          </div>

          {/* Thumbnail Image File Picker */}
          <div className="flex flex-col gap-1.5">
            <label style={{ fontSize: '0.82rem', color: 'var(--text-muted)', fontWeight: 600 }}>Course Cover Thumbnail</label>
            <div className="flex items-center gap-3 glass" style={{ padding: '0.75rem 1rem', borderRadius: '12px' }}>
              <ImageIcon size={22} color="var(--primary)" />
              <input 
                type="file" 
                onChange={handleThumbnailChange} 
                accept="image/*" 
                style={{ border: 'none', padding: 0, background: 'transparent', width: '100%' }} 
              />
            </div>
          </div>

          <div className="flex items-center gap-3 pt-2">
            <input 
              type="checkbox" 
              name="isPublished" 
              checked={courseData.isPublished} 
              onChange={handleCourseChange} 
              style={{ width: '20px', height: '20px', accentColor: 'var(--primary)' }} 
            />
            <label style={{ fontSize: '0.9rem', fontWeight: 600 }}>Publish on Course Catalog</label>
          </div>

          <button type="submit" className="btn-primary flex items-center justify-center gap-2 mt-2" disabled={savingCourse} style={{ padding: '0.85rem', borderRadius: '12px', fontSize: '0.95rem' }}>
            <Save size={20} />
            <span>{savingCourse ? 'Saving Course...' : isEdit ? 'Update Course Details' : 'Create Course & Continue'}</span>
          </button>
        </form>

        {/* Right Column: Educational File Upload & Lesson Manager */}
        <div className="flex flex-col gap-6">
          <div className="card glass flex flex-col gap-6" style={{ padding: '2rem', borderRadius: '20px' }}>
            <h2 className="flex items-center gap-2" style={{ fontSize: '1.25rem', fontWeight: 700 }}>
              <Video size={22} color="var(--primary)" />
              Course Syllabus ({lessons.length} Lectures)
            </h2>
            
            {/* Added Syllabus Items */}
            <div className="flex flex-col gap-3">
              {lessons.map((lesson, idx) => (
                <div key={lesson._id} className="glass flex items-center justify-between p-3.5 rounded-xl" style={{ fontSize: '0.88rem', background: 'rgba(255, 255, 255, 0.03)' }}>
                  <div className="flex items-center gap-3 overflow-hidden">
                    <span style={{ color: 'var(--primary)', fontWeight: 800 }}>{idx + 1}</span>
                    <div className="min-w-0">
                      <p style={{ fontWeight: 600, textOverflow: 'ellipsis', whiteSpace: 'nowrap', overflow: 'hidden' }}>{lesson.title}</p>
                      <div className="flex items-center gap-2 text-muted" style={{ fontSize: '0.75rem' }}>
                        <span>{lesson.duration || 15} mins</span>
                        {lesson.resources?.length > 0 && (
                          <span style={{ color: 'var(--accent)', fontWeight: 600 }}>• {lesson.resources.length} files attached</span>
                        )}
                      </div>
                    </div>
                  </div>
                  <button onClick={() => handleDeleteLesson(lesson._id)} style={{ background: 'transparent', color: 'var(--error)' }} title="Delete">
                    <Trash2 size={16} />
                  </button>
                </div>
              ))}

              {lessons.length === 0 && (
                <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', textAlign: 'center', padding: '1rem 0' }}>
                  No video lectures added yet. Fill the form below to upload files!
                </p>
              )}
            </div>

            <hr style={{ border: 'none', height: '1px', background: 'var(--glass-border)' }} />

            {/* Educational File & Video Upload Form */}
            <form onSubmit={handleAddLesson} className="flex flex-col gap-4">
              <h3 style={{ fontSize: '1rem', fontWeight: 700 }}>Add New Educational Lecture & Attachments</h3>
              
              <div className="flex flex-col gap-1">
                <label style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontWeight: 600 }}>Lecture Title *</label>
                <input 
                  type="text" 
                  placeholder="e.g. Introduction to Data Structures & Algorithms" 
                  value={newLesson.title} 
                  onChange={(e) => setNewLesson({ ...newLesson, title: e.target.value })} 
                  style={{ fontSize: '0.88rem', borderRadius: '10px' }} 
                  required
                />
              </div>

              {/* Upload Video File */}
              <div className="flex flex-col gap-1">
                <label style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontWeight: 600 }}>Upload Video Lecture File (.mp4, .webm)</label>
                <div className="flex items-center gap-3 glass" style={{ padding: '0.65rem 0.85rem', borderRadius: '10px' }}>
                  <Video size={18} color="var(--primary)" />
                  <input 
                    type="file" 
                    onChange={(e) => setVideoFile(e.target.files[0])} 
                    accept="video/*" 
                    style={{ border: 'none', padding: 0, background: 'transparent', width: '100%', fontSize: '0.82rem' }} 
                  />
                </div>
              </div>

              {/* Video URL fallback */}
              <div className="flex flex-col gap-1">
                <label style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontWeight: 600 }}>Or External Video Stream URL</label>
                <input 
                  type="text" 
                  placeholder="https://commondatastorage.googleapis.com/..." 
                  value={newLesson.videoUrl} 
                  onChange={(e) => setNewLesson({ ...newLesson, videoUrl: e.target.value })} 
                  style={{ fontSize: '0.85rem', borderRadius: '10px' }} 
                />
              </div>

              {/* Upload Educational Documents (PDF, PPT, DOC, ZIP) */}
              <div className="flex flex-col gap-1">
                <label style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontWeight: 600 }}>Upload Educational Materials (PDF, PPT, DOC, ZIP)</label>
                <div className="flex items-center gap-3 glass" style={{ padding: '0.65rem 0.85rem', borderRadius: '10px' }}>
                  <FileUp size={18} color="var(--accent)" />
                  <input 
                    type="file" 
                    onChange={(e) => setResourceFiles(e.target.files)} 
                    multiple 
                    accept=".pdf,.doc,.docx,.ppt,.pptx,.txt,.zip" 
                    style={{ border: 'none', padding: 0, background: 'transparent', width: '100%', fontSize: '0.82rem' }} 
                  />
                </div>
              </div>

              <div className="flex flex-col gap-1">
                <label style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontWeight: 600 }}>Duration (minutes)</label>
                <input 
                  type="number" 
                  placeholder="15" 
                  value={newLesson.duration} 
                  onChange={(e) => setNewLesson({ ...newLesson, duration: e.target.value })} 
                  style={{ fontSize: '0.85rem', borderRadius: '10px' }} 
                />
              </div>

              <div className="flex flex-col gap-1">
                <label style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontWeight: 600 }}>Lesson Content / Explanation</label>
                <textarea 
                  placeholder="Detailed lesson explanation..." 
                  value={newLesson.content} 
                  onChange={(e) => setNewLesson({ ...newLesson, content: e.target.value })} 
                  style={{ fontSize: '0.85rem', minHeight: '75px', borderRadius: '10px', resize: 'none' }} 
                />
              </div>

              {uploadStatus && (
                <div className="flex items-center gap-2 text-muted" style={{ fontSize: '0.82rem', color: 'var(--primary)' }}>
                  <Upload size={16} className="animate-spin" />
                  <span>{uploadStatus}</span>
                </div>
              )}
              
              <button 
                type="submit"
                className="btn-outline flex items-center justify-center gap-2 mt-1" 
                style={{ width: '100%', padding: '0.75rem', borderRadius: '10px', fontSize: '0.88rem' }}
                disabled={addingLesson || !newLesson.title}
              >
                <Plus size={18} />
                <span>{addingLesson ? 'Uploading Files...' : 'Upload & Add Lesson to Syllabus'}</span>
              </button>
            </form>
          </div>

          {!isEdit && (
            <div className="glass text-center p-4 rounded-xl" style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
              ℹ️ Click "Create Course & Continue" to save course metadata before uploading files.
            </div>
          )}
        </div>

      </div>
    </div>
  );
};

export default CourseForm;
