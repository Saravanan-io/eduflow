import { useState, useEffect } from 'react';
import axios from 'axios';
import CourseCard from '../components/CourseCard';
import Spinner from '../components/Spinner';
import { Search, Filter } from 'lucide-react';

const CourseCatalog = () => {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('All');

  useEffect(() => {
    fetchCourses();
  }, [category]);

  const fetchCourses = async () => {
    setLoading(true);
    try {
      const { data } = await axios.get('/api/courses', {
        params: { category: category === 'All' ? '' : category }
      });
      setCourses(data.courses);
    } catch (err) {
      console.error('Error fetching courses', err);
    } finally {
      setLoading(false);
    }
  };

  const filteredCourses = courses.filter(course => 
    course.title.toLowerCase().includes(search.toLowerCase()) ||
    course.description.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="flex flex-col gap-10 animate-fade">
      {/* Hero Section */}
      <div className="glass" style={{ padding: 'clamp(2rem, 8vw, 5rem) 2rem', borderRadius: '40px', overflow: 'hidden', position: 'relative' }}>
        <div style={{ position: 'absolute', top: '-10%', right: '-10%', width: '40%', height: '120%', background: 'radial-gradient(circle, var(--primary) 0%, transparent 70%)', opacity: 0.15, filter: 'blur(60px)' }} />
        <div className="flex flex-col items-center text-center gap-6" style={{ maxWidth: '800px', margin: '0 auto', position: 'relative', zIndex: 1 }}>
          <h1 style={{ lineHeight: 1.1 }}>Unlock Your Potential with <span style={{ color: 'var(--primary)' }}>EduFlow</span></h1>
          <p style={{ fontSize: 'clamp(1rem, 3vw, 1.25rem)', color: 'var(--text-muted)', maxWidth: '600px' }}>
            Learn from industry experts and master new skills with our premium, real-time learning platform.
          </p>
          
          <div className="flex items-center gap-3 w-full max-w-lg mt-4 flex-nowrap" style={{ background: 'var(--bg-dark)', padding: '0.5rem', borderRadius: '20px', border: '1px solid var(--glass-border)' }}>
            <div className="flex-1 flex items-center gap-2 px-3">
              <Search size={20} className="text-muted" />
              <input 
                type="text" 
                placeholder="Search courses..." 
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                style={{ background: 'transparent', border: 'none', padding: '0.5rem 0', boxShadow: 'none' }}
              />
            </div>
            <button className="btn-primary hide-mobile" style={{ borderRadius: '15px', padding: '0.6rem 1.5rem' }}>Search</button>
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-8">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <h2 style={{ fontSize: '1.75rem' }}>Explore Our Courses</h2>
          <div className="flex items-center gap-3 w-full md:w-auto">
            <Filter size={20} className="text-muted" />
            <select 
              value={category} 
              onChange={(e) => setCategory(e.target.value)}
              style={{ minWidth: '200px', background: 'var(--bg-card)' }}
            >
              <option value="All">All Categories</option>
              <option value="Web Development">Web Development</option>
              <option value="Data Science">Data Science</option>
              <option value="Mobile Development">Mobile Development</option>
              <option value="UI/UX Design">UI/UX Design</option>
            </select>
          </div>
        </div>

        {loading ? (
          <Spinner />
        ) : filteredCourses.length > 0 ? (
          <div className="grid grid-2 grid-3 grid-4">
            {filteredCourses.map(course => (
              <CourseCard key={course._id} course={course} />
            ))}
          </div>
        ) : (
          <div className="glass text-center py-20" style={{ borderRadius: '20px' }}>
            <p style={{ color: 'var(--text-muted)', fontSize: '1.2rem' }}>No courses found matching your criteria.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default CourseCatalog;
