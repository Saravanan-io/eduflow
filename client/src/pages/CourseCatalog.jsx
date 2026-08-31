import { useState, useEffect } from 'react';
import axios from 'axios';
import CourseCard from '../components/CourseCard';
import Spinner from '../components/Spinner';
import { 
  Search, 
  Sparkles, 
  BookOpen, 
  Users, 
  TrendingUp, 
  Award,
  SlidersHorizontal,
  ChevronDown
} from 'lucide-react';

const CourseCatalog = () => {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('All');
  const [priceFilter, setPriceFilter] = useState('All');
  const [sortBy, setSortBy] = useState('popular');

  const categories = [
    'All',
    'Web Development',
    'Data Science',
    'UI/UX Design',
    'Mobile Development',
    'Cloud & DevOps',
    'Cybersecurity',
    'More'
  ];

  const defaultSampleCourses = [
    {
      _id: '1',
      title: 'React - The Complete Guide',
      category: 'Web Development',
      instructor: { username: 'John Doe', avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?q=80&w=150' },
      thumbnail: 'https://images.unsplash.com/photo-1633356122544-f134324a6cee?q=80&w=600&auto=format&fit=crop',
      rating: 4.8,
      totalRatings: '2.4K',
      students: Array(1200),
      lessons: Array(32),
      price: 49.99,
      level: 'Beginner',
      duration: '20 Hours'
    },
    {
      _id: '2',
      title: 'Full Stack Web Development',
      category: 'Web Development',
      instructor: { username: 'Jane Smith', avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=150' },
      thumbnail: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?q=80&w=600&auto=format&fit=crop',
      rating: 4.9,
      totalRatings: '1.8K',
      students: Array(950),
      lessons: Array(45),
      price: 89.99,
      level: 'Intermediate',
      duration: '30 Hours'
    },
    {
      _id: '3',
      title: 'UI/UX Design Fundamentals',
      category: 'UI/UX Design',
      instructor: { username: 'Alex Johnson', avatar: 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?q=80&w=150' },
      thumbnail: 'https://images.unsplash.com/photo-1561070791-2526d30994b5?q=80&w=600&auto=format&fit=crop',
      rating: 4.7,
      totalRatings: '1.2K',
      students: Array(640),
      lessons: Array(24),
      price: 39.99,
      level: 'Beginner',
      duration: '15 Hours'
    },
    {
      _id: '4',
      title: 'Python for Data Science',
      category: 'Data Science',
      instructor: { username: 'Mike Brown', avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=150' },
      thumbnail: 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?q=80&w=600&auto=format&fit=crop',
      rating: 4.8,
      totalRatings: '3.1K',
      students: Array(1400),
      lessons: Array(38),
      price: 59.99,
      level: 'Intermediate',
      duration: '25 Hours'
    }
  ];

  useEffect(() => {
    fetchCourses();
  }, [category]);

  const fetchCourses = async () => {
    setLoading(true);
    try {
      const { data } = await axios.get('/api/courses', {
        params: { category: category === 'All' ? '' : category }
      });
      if (data && Array.isArray(data.courses) && data.courses.length > 0) {
        setCourses(data.courses);
      } else {
        setCourses(defaultSampleCourses);
      }
    } catch (err) {
      console.error('Error fetching courses', err);
      setCourses(defaultSampleCourses);
    } finally {
      setLoading(false);
    }
  };

  const displayCourses = courses.length > 0 ? courses : defaultSampleCourses;

  const filteredCourses = displayCourses
    .filter(course => {
      const matchesSearch = 
        course.title.toLowerCase().includes(search.toLowerCase()) ||
        course.description?.toLowerCase().includes(search.toLowerCase()) ||
        course.category?.toLowerCase().includes(search.toLowerCase());
      
      const matchesPrice = 
        priceFilter === 'All' ? true :
        priceFilter === 'Free' ? course.price === 0 :
        priceFilter === 'Paid' ? course.price > 0 : true;

      return matchesSearch && matchesPrice;
    });

  const totalEnrolledStudents = displayCourses.reduce((acc, c) => acc + (c.students?.length || 0), 0);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem', paddingBottom: '3rem' }}>
      
      {/* Hero Banner Section */}
      <div className="hero-banner-card">
        
        {/* Left Column Text & Action */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', zIndex: 2, maxWidth: '600px' }}>
          
          <div className="hero-pill-badge">
            <Sparkles size={14} color="#fbbf24" />
            <span>EduFlow E-Learning Platform</span>
          </div>

          <h1 className="hero-heading">
            Learn Without Limits <br />
            on <span>EduFlow</span>
          </h1>

          <p className="hero-subtitle">
            Master in-demand skills with expert-led courses, real-world projects, and recognized certificates.
          </p>

          {/* Hero Search Box */}
          <div className="hero-search-box">
            <Search size={18} color="#94a3b8" />
            <input 
              type="text" 
              placeholder="What do you want to learn today?" 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            <button className="btn-hero-search">
              Search Courses
            </button>
          </div>

        </div>

        {/* Right Column: Hero Image & Floating Badge */}
        <div className="hero-image-container hide-mobile">
          <img 
            src="https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?q=80&w=800&auto=format&fit=crop" 
            alt="Learner Student"
          />
          
          {/* Floating Learners Badge */}
          <div className="floating-learners-badge">
            <div style={{ width: '38px', height: '38px', borderRadius: '50%', background: '#8b5cf6', color: '#ffffff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Users size={18} />
            </div>
            <div>
              <div style={{ fontWeight: 800, fontSize: '0.95rem', color: '#0f172a', lineHeight: 1.2 }}>10K+</div>
              <div style={{ fontSize: '0.75rem', color: '#64748b' }}>Happy Learners</div>
            </div>
            {/* Stacked avatars */}
            <div style={{ display: 'flex', marginLeft: '0.5rem' }}>
              <img src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=60" style={{ width: '22px', height: '22px', borderRadius: '50%', border: '2px solid #fff', marginLeft: '-6px' }} alt="avatar" />
              <img src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=60" style={{ width: '22px', height: '22px', borderRadius: '50%', border: '2px solid #fff', marginLeft: '-6px' }} alt="avatar" />
              <img src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=60" style={{ width: '22px', height: '22px', borderRadius: '50%', border: '2px solid #fff', marginLeft: '-6px' }} alt="avatar" />
            </div>
          </div>
        </div>

      </div>

      {/* 4 Metric Stats Cards */}
      <div className="stats-grid">
        
        <div className="stat-card">
          <div className="stat-icon-wrapper purple">
            <BookOpen size={22} />
          </div>
          <div>
            <div className="stat-value">{displayCourses.length}</div>
            <div className="stat-label">Published Courses</div>
            <div className="stat-subtext">High quality content</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon-wrapper green">
            <Users size={22} />
          </div>
          <div>
            <div className="stat-value">{totalEnrolledStudents}</div>
            <div className="stat-label">Enrolled Students</div>
            <div className="stat-subtext">Start learning now</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon-wrapper blue">
            <TrendingUp size={22} />
          </div>
          <div>
            <div className="stat-value">100%</div>
            <div className="stat-label">Real-Time Learning</div>
            <div className="stat-subtext">Engage & grow</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon-wrapper amber">
            <Award size={22} />
          </div>
          <div>
            <div className="stat-value">Certificates</div>
            <div className="stat-label">Earn & Showcase</div>
            <div className="stat-subtext">Boost your career</div>
          </div>
        </div>

      </div>

      {/* Categories Filter Tabs */}
      <div className="category-pills-row">
        {categories.map(cat => (
          <button
            key={cat}
            onClick={() => setCategory(cat)}
            className={`category-pill ${category === cat ? 'active' : ''}`}
          >
            {cat} {cat === 'More' && <ChevronDown size={14} style={{ display: 'inline', marginLeft: '2px' }} />}
          </button>
        ))}
      </div>

      {/* Section Header & Controls */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem', marginTop: '0.5rem' }}>
        <div>
          <h2 style={{ fontSize: '1.45rem', fontWeight: 800 }}>All Courses</h2>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
            Discover and enroll in the best courses
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <select 
            value={sortBy} 
            onChange={(e) => setSortBy(e.target.value)}
            style={{ 
              background: 'var(--bg-card)', 
              border: '1px solid var(--border-color)', 
              padding: '0.5rem 1rem', 
              fontSize: '0.85rem', 
              borderRadius: '10px',
              fontWeight: 600,
              width: 'auto'
            }}
          >
            <option value="popular">Most Popular</option>
            <option value="newest">Newest</option>
            <option value="price-low">Price: Low to High</option>
          </select>

          <button 
            className="btn-outline" 
            style={{ 
              borderRadius: '10px', 
              padding: '0.5rem 1rem', 
              fontSize: '0.85rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.4rem',
              fontWeight: 600
            }}
          >
            <SlidersHorizontal size={15} />
            <span>Filters</span>
          </button>
        </div>
      </div>

      {/* Course Cards Grid (4 Column Layout) */}
      {loading ? (
        <Spinner />
      ) : (
        <div className="courses-grid">
          {filteredCourses.map(course => (
            <CourseCard key={course._id} course={course} />
          ))}
        </div>
      )}

    </div>
  );
};

export default CourseCatalog;
