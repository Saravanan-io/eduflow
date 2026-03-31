import { useState, useEffect } from 'react';
import axios from 'axios';
import CourseCard from '../components/CourseCard';
import Spinner from '../components/Spinner';
import { Search, Filter, SlidersHorizontal } from 'lucide-react';

const CourseCatalog = () => {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');
  const [priceFilter, setPriceFilter] = useState('');

  useEffect(() => {
    fetchCourses();
  }, [category, priceFilter]);

  const fetchCourses = async () => {
    setLoading(true);
    try {
      const { data } = await axios.get('/api/courses', {
        params: { category, price: priceFilter }
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

  const categories = [
    'Web Development', 'Data Science', 'Mobile Development', 
    'UI/UX Design', 'DevOps', 'Cybersecurity', 'Machine Learning', 
    'Cloud Computing', 'Business'
  ];

  return (
    <div className="container" style={{ paddingBottom: '4rem' }}>
      <div className="flex flex-col gap-8">
        {/* Hero Section */}
        <div className="hero glass flex flex-col items-center text-center" style={{ padding: '4rem 2rem', borderRadius: '30px', marginTop: '1rem' }}>
          <h1 style={{ fontSize: '3.5rem', marginBottom: '1rem', lineHeight: 1.1 }}>
            Unlock Your <span style={{ color: 'var(--primary)' }}>Potential</span>
          </h1>
          <p style={{ color: 'var(--text-muted)', maxWidth: '600px', fontSize: '1.2rem', marginBottom: '2.5rem' }}>
            Choose from over 1,000+ online courses with real-time tracking, intermediate quizzes, and expert instructors.
          </p>
          
          <div className="flex items-center glass" style={{ width: '100%', maxWidth: '600px', padding: '0.5rem', borderRadius: '50px' }}>
            <Search size={22} className="text-muted" style={{ marginLeft: '1rem' }} />
            <input 
              type="text" 
              placeholder="Search for courses..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{ background: 'transparent', border: 'none', padding: '0.75rem 1rem' }} 
            />
            <button className="btn-primary" style={{ borderRadius: '40px', padding: '0.75rem 2rem' }}>Search</button>
          </div>
        </div>

        {/* Filters and Grid */}
        <div className="flex flex-col gap-6">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <h2 style={{ fontSize: '1.5rem' }}>Explore Courses</h2>
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 glass" style={{ padding: '0.5rem 1rem', borderRadius: '12px' }}>
                <Filter size={18} />
                <select 
                  value={category} 
                  onChange={(e) => setCategory(e.target.value)}
                  style={{ background: 'transparent', border: 'none', padding: 0, width: 'auto' }}
                >
                  <option value="">All Categories</option>
                  {categories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                </select>
              </div>

              <div className="flex items-center gap-2 glass" style={{ padding: '0.5rem 1rem', borderRadius: '12px' }}>
                <SlidersHorizontal size={18} />
                <select 
                  value={priceFilter} 
                  onChange={(e) => setPriceFilter(e.target.value)}
                  style={{ background: 'transparent', border: 'none', padding: 0, width: 'auto' }}
                >
                  <option value="">All Prices</option>
                  <option value="free">Free Only</option>
                  <option value="paid">Paid Only</option>
                </select>
              </div>
            </div>
          </div>

          {loading ? (
            <Spinner size="60px" />
          ) : (
            <>
              {filteredCourses.length > 0 ? (
                <div className="grid grid-3">
                  {filteredCourses.map(course => (
                    <CourseCard key={course._id} course={course} />
                  ))}
                </div>
              ) : (
                <div className="text-center py-12 glass" style={{ borderRadius: '20px' }}>
                  <p style={{ fontSize: '1.2rem', color: 'var(--text-muted)' }}>No courses found. Try adjusting your filters.</p>
                </div>
              )}
            </>
          )}
        </div>
      </div>
      <style>{`
        .hero h1 { background: linear-gradient(to right, #fff, #6366f1); -webkit-background-clip: text; -webkit-text-fill-color: transparent; }
        @media (max-width: 768px) {
          .hero h1 { font-size: 2.5rem !important; }
        }
      `}</style>
    </div>
  );
};

export default CourseCatalog;
