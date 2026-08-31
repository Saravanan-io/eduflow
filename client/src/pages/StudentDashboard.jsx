import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { useSocket } from '../context/SocketContext';
import Spinner from '../components/Spinner';
import { 
  BookOpen, 
  CheckCircle2, 
  PlayCircle, 
  ArrowRight, 
  Hourglass, 
  Clock, 
  Bookmark, 
  Filter, 
  ChevronDown, 
  MoreVertical,
  Code,
  Brain,
  Figma,
  ChevronRight,
  Sparkles
} from 'lucide-react';

const StudentDashboard = () => {
  const { user } = useAuth();
  const socket = useSocket();
  const navigate = useNavigate();
  const [enrollments, setEnrollments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('all');

  useEffect(() => {
    fetchEnrollments();
  }, []);

  useEffect(() => {
    if (socket) {
      socket.on('progress_updated', ({ courseId, progress }) => {
        setEnrollments(prev => prev.map(enroll => 
          enroll.course?._id === courseId ? { ...enroll, progress } : enroll
        ));
      });
      return () => socket.off('progress_updated');
    }
  }, [socket]);

  const fetchEnrollments = async () => {
    try {
      const { data } = await axios.get('/api/enrollments/my-courses');
      setEnrollments(data && Array.isArray(data.enrollments) ? data.enrollments : []);
    } catch (err) {
      console.error('Error fetching enrollments', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <Spinner />;

  const completedCourses = enrollments.filter(e => e.progress === 100);
  const inProgressCourses = enrollments.filter(e => e.progress < 100);

  // Default featured course if available, or mock Data Science course
  const primaryEnrollment = enrollments[0] || {
    _id: 'default_1',
    progress: 35,
    enrolledAt: '2026-08-27T00:00:00.000Z',
    course: {
      _id: 'ds_1',
      title: 'Data Science Fundamentals',
      category: 'Data Science',
      description: 'Learn the core concepts of data science, data analysis, and machine learning.',
      totalLessons: 12,
      thumbnail: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?q=80&w=600&auto=format&fit=crop'
    }
  };

  return (
    <div className="dashboard-page-container">
      
      {/* ── TOP SECTION: Hero Banner (Left) & 4 Stats Cards (Right) ── */}
      <div className="dashboard-top-grid">
        
        {/* Hero Banner Card */}
        <div className="hero-banner-card">
          <div className="hero-banner-content">
            <span className="hero-greeting">
              Good morning, {user?.username?.split(' ')[0] || 'Saravanan'}! 👋
            </span>
            <h1 className="hero-title">
              Learn new skills.<br />
              Achieve <span className="highlight-yellow">your goals.</span>
            </h1>
            <p className="hero-subtitle">
              Track your progress and continue your learning journey.
            </p>
            <button 
              className="btn-continue-black"
              onClick={() => {
                const targetId = primaryEnrollment.course?._id;
                if (targetId) navigate(`/course/${targetId}/learn/start`);
                else navigate('/enrolled');
              }}
            >
              <span>Continue Learning</span>
              <ArrowRight size={16} />
            </button>
          </div>

          {/* Hero Illustration Graphic */}
          <div className="hero-illustration-wrapper">
            <div className="hero-lamp-graphic">
              {/* Lamp & Laptop Composite Illustration */}
              <svg width="220" height="180" viewBox="0 0 220 180" fill="none" xmlns="http://www.w3.org/2000/svg">
                {/* Background Dots Matrix */}
                <pattern id="dots" x="0" y="0" width="12" height="12" patternUnits="userSpaceOnUse">
                  <circle cx="2" cy="2" r="1.5" fill="#cbd5e1" />
                </pattern>
                <rect x="120" y="10" width="90" height="90" fill="url(#dots)" />

                {/* Soft Lamp Glow */}
                <path d="M70 45 L150 140 L40 140 Z" fill="#fef08a" opacity="0.35" />

                {/* Yellow Desk Lamp */}
                <path d="M120 15 C100 15 85 25 80 45 L65 40 L60 48 L78 54 L85 46 C90 32 100 25 118 25 Z" fill="#f59e0b" />
                <circle cx="110" cy="18" r="14" fill="#fbbf24" />
                <path d="M110 32 L75 80 L70 120" stroke="#1e293b" strokeWidth="4" strokeLinecap="round" />
                <ellipse cx="70" cy="122" rx="14" ry="4" fill="#1e293b" />

                {/* Black Laptop */}
                <rect x="80" y="85" width="85" height="52" rx="6" fill="#0f172a" stroke="#334155" strokeWidth="2" />
                <polygon points="70,137 175,137 180,143 65,143" fill="#1e293b" />
                {/* Laptop Logo */}
                <path d="M122 105 L128 102 L134 105 L128 108 Z" fill="#ffc107" />
                
                {/* Potted Plant */}
                <path d="M175 110 L185 110 L188 135 L172 135 Z" fill="#f59e0b" />
                <path d="M180 110 Q170 95 165 90 Q175 92 180 110 Z" fill="#22c55e" />
                <path d="M180 110 Q190 92 195 88 Q187 92 180 110 Z" fill="#16a34a" />
              </svg>
            </div>
          </div>
        </div>

        {/* 4 Stats Cards Grid */}
        <div className="stats-cards-grid">
          
          {/* Card 1: Enrolled */}
          <div className="stat-card">
            <div className="stat-icon-badge yellow-badge">
              <BookOpen size={20} color="#000000" />
            </div>
            <div className="stat-number">{enrollments.length || 1}</div>
            <div className="stat-info">
              <span className="stat-label">Enrolled</span>
              <span className="stat-sub">Total Courses</span>
            </div>
          </div>

          {/* Card 2: In Progress */}
          <div className="stat-card">
            <div className="stat-icon-badge black-badge">
              <Hourglass size={20} color="#ffffff" />
            </div>
            <div className="stat-number">{inProgressCourses.length || 1}</div>
            <div className="stat-info">
              <span className="stat-label">In Progress</span>
              <span className="stat-sub">Keep it up!</span>
            </div>
          </div>

          {/* Card 3: Completed */}
          <div className="stat-card">
            <div className="stat-icon-badge black-badge">
              <CheckCircle2 size={20} color="#ffffff" />
            </div>
            <div className="stat-number">{completedCourses.length || 0}</div>
            <div className="stat-info">
              <span className="stat-label">Completed</span>
              <span className="stat-sub">Way to go!</span>
            </div>
          </div>

          {/* Card 4: Learning Hours */}
          <div className="stat-card">
            <div className="stat-icon-badge yellow-badge">
              <Clock size={20} color="#000000" />
            </div>
            <div className="stat-number">4h 30m</div>
            <div className="stat-info">
              <span className="stat-label">Learning Hours</span>
              <span className="stat-sub">This week</span>
            </div>
          </div>

        </div>

      </div>

      {/* ── MIDDLE SECTION: Course Progress (Left 8) & Right Widgets (Right 4) ── */}
      <div className="dashboard-middle-grid">
        
        {/* Left Column: Course Progress & Tabs */}
        <div className="course-progress-column">
          
          {/* Tabs Bar */}
          <div className="course-tabs-header">
            <div className="course-tabs">
              <button 
                className={`tab-btn ${activeTab === 'all' ? 'active' : ''}`}
                onClick={() => setActiveTab('all')}
              >
                All Courses
              </button>
              <button 
                className={`tab-btn ${activeTab === 'progress' ? 'active' : ''}`}
                onClick={() => setActiveTab('progress')}
              >
                In Progress
              </button>
              <button 
                className={`tab-btn ${activeTab === 'completed' ? 'active' : ''}`}
                onClick={() => setActiveTab('completed')}
              >
                Completed
              </button>
              <button 
                className={`tab-btn ${activeTab === 'saved' ? 'active' : ''}`}
                onClick={() => setActiveTab('saved')}
              >
                Saved
              </button>
            </div>

            <div className="course-tab-actions">
              <div className="tab-dropdown">
                <span>Recently Accessed</span>
                <ChevronDown size={14} color="#64748b" />
              </div>
              <button className="tab-filter-btn" title="Filter">
                <Filter size={16} color="#64748b" />
              </button>
            </div>
          </div>

          {/* Main Course Progress Banner Card */}
          <div className="course-wide-progress-card">
            
            {/* Thumbnail Box */}
            <div className="course-thumb-container">
              <img 
                src={primaryEnrollment.course?.thumbnail || "https://images.unsplash.com/photo-1551288049-bebda4e38f71?q=80&w=600&auto=format&fit=crop"} 
                alt="course thumbnail" 
                className="course-thumb-img"
              />
              <span className="status-badge-yellow">In Progress</span>
              <div className="play-overlay-circle">
                <PlayCircle size={28} color="#000000" fill="#ffffff" />
              </div>
            </div>

            {/* Middle Course Details */}
            <div className="course-details-middle">
              <span className="course-category-tag">
                {primaryEnrollment.course?.category || 'Data Science'}
              </span>
              <h3 className="course-main-title">
                {primaryEnrollment.course?.title || 'Data Science Fundamentals'}
              </h3>
              <p className="course-desc-text">
                {primaryEnrollment.course?.description || 'Learn the core concepts of data science, data analysis, and machine learning.'}
              </p>

              <div className="course-meta-row">
                <span className="meta-item">
                  <BookOpen size={14} />
                  <span>{primaryEnrollment.course?.totalLessons || 12} Lessons</span>
                </span>
                <span className="meta-divider">•</span>
                <span className="meta-item">
                  <Clock size={14} />
                  <span>Enrolled on Aug 27, 2026</span>
                </span>
              </div>
            </div>

            {/* Right Action & Progress Bar */}
            <div className="course-action-right">
              <div className="more-menu-btn">
                <MoreVertical size={18} color="#94a3b8" />
              </div>

              <div className="progress-bar-wrapper">
                <div className="progress-text-row">
                  <span className="progress-label">Progress</span>
                  <span className="progress-value">{primaryEnrollment.progress || 35}%</span>
                </div>
                <div className="progress-track">
                  <div 
                    className="progress-fill-yellow" 
                    style={{ width: `${primaryEnrollment.progress || 35}%` }}
                  />
                </div>
              </div>

              <button 
                className="btn-continue-black"
                onClick={() => {
                  const targetId = primaryEnrollment.course?._id;
                  if (targetId) navigate(`/course/${targetId}/learn/start`);
                  else navigate('/enrolled');
                }}
              >
                <span>Continue Learning</span>
                <ArrowRight size={16} />
              </button>
            </div>

          </div>

        </div>

        {/* Right Column: Weekly Goal & Recent Activity Widgets */}
        <div className="widgets-column">
          
          {/* Widget 1: Weekly Goal */}
          <div className="widget-card">
            <div className="widget-header">
              <h3 className="widget-title">Weekly Goal</h3>
              <span className="widget-link-yellow">View all</span>
            </div>

            <div className="weekly-goal-body">
              {/* SVG Circular Donut Chart */}
              <div className="donut-chart-wrapper">
                <svg width="90" height="90" viewBox="0 0 100 100">
                  <circle cx="50" cy="50" r="40" stroke="#f1f5f9" strokeWidth="10" fill="none" />
                  <circle 
                    cx="50" cy="50" r="40" 
                    stroke="#ffc107" 
                    strokeWidth="10" 
                    fill="none" 
                    strokeDasharray="251.2" 
                    strokeDashoffset="100.48"
                    strokeLinecap="round"
                    transform="rotate(-90 50 50)"
                  />
                </svg>
                <span className="donut-center-text">60%</span>
              </div>

              <div className="weekly-goal-stats">
                <div className="goal-hours-primary">3 of 5 hours</div>
                <div className="goal-sub-label">This week</div>
                <div className="goal-remaining-muted">2 hours remaining</div>
              </div>
            </div>
          </div>

          {/* Widget 2: Recent Activity */}
          <div className="widget-card">
            <div className="widget-header">
              <h3 className="widget-title">Recent Activity</h3>
            </div>

            <div className="activity-list">
              
              {/* Item 1 */}
              <div className="activity-item">
                <div className="activity-icon-circle yellow">
                  <PlayCircle size={16} color="#000000" />
                </div>
                <div className="activity-info">
                  <div className="activity-title">Data Science Fundamentals</div>
                  <div className="activity-sub">Last accessed 2h ago</div>
                  <div className="activity-progress-mini">
                    <div className="activity-progress-fill" style={{ width: '35%' }} />
                  </div>
                </div>
                <span className="activity-percent">35%</span>
              </div>

              {/* Item 2 */}
              <div className="activity-item">
                <div className="activity-icon-circle grey">
                  <Bookmark size={16} color="#475569" />
                </div>
                <div className="activity-info">
                  <div className="activity-title">UI/UX Design Basics</div>
                  <div className="activity-sub">Added to bookmarks</div>
                </div>
                <span className="activity-time">1d ago</span>
              </div>

              {/* Item 3 */}
              <div className="activity-item">
                <div className="activity-icon-circle grey">
                  <CheckCircle2 size={16} color="#475569" />
                </div>
                <div className="activity-info">
                  <div className="activity-title">Python for Data Science</div>
                  <div className="activity-sub">Enrolled</div>
                </div>
                <span className="activity-time">2d ago</span>
              </div>

            </div>

            <div className="widget-footer-link">
              <span>View all activity</span>
              <ArrowRight size={14} />
            </div>
          </div>

        </div>

      </div>

      {/* ── BOTTOM SECTION: Recommended For You Carousel ── */}
      <div className="recommended-section">
        <div className="recommended-header">
          <h2 className="recommended-title">Recommended for you</h2>
          <span className="widget-link-yellow flex-items">
            <span>View all</span>
            <ArrowRight size={14} />
          </span>
        </div>

        <div className="recommended-cards-grid">
          
          {/* Card 1: Python */}
          <div className="rec-card">
            <div className="rec-card-header">
              <div className="rec-icon-box python-color">
                <Code size={20} color="#38bdf8" />
              </div>
              <Bookmark size={16} color="#94a3b8" className="bookmark-icon-btn" />
            </div>
            <div className="rec-card-content">
              <h4 className="rec-course-title">Python for Data Science</h4>
              <span className="rec-level">Intermediate</span>
            </div>
            <div className="rec-card-footer">
              <span className="rating-star">★ 4.8</span>
              <span className="rating-count">(2.1K)</span>
            </div>
          </div>

          {/* Card 2: UI/UX Design */}
          <div className="rec-card">
            <div className="rec-card-header">
              <div className="rec-icon-box figma-color">
                <Figma size={20} color="#ec4899" />
              </div>
              <Bookmark size={16} color="#94a3b8" className="bookmark-icon-btn" />
            </div>
            <div className="rec-card-content">
              <h4 className="rec-course-title">UI/UX Design Fundamentals</h4>
              <span className="rec-level">Beginner</span>
            </div>
            <div className="rec-card-footer">
              <span className="rating-star">★ 4.6</span>
              <span className="rating-count">(1.8K)</span>
            </div>
          </div>

          {/* Card 3: Web Dev */}
          <div className="rec-card">
            <div className="rec-card-header">
              <div className="rec-icon-box code-color">
                <Code size={20} color="#6366f1" />
              </div>
              <Bookmark size={16} color="#94a3b8" className="bookmark-icon-btn" />
            </div>
            <div className="rec-card-content">
              <h4 className="rec-course-title">Web Development Bootcamp</h4>
              <span className="rec-level">Intermediate</span>
            </div>
            <div className="rec-card-footer">
              <span className="rating-star">★ 4.9</span>
              <span className="rating-count">(3.2K)</span>
            </div>
          </div>

          {/* Card 4: Machine Learning */}
          <div className="rec-card">
            <div className="rec-card-header">
              <div className="rec-icon-box ml-color">
                <Brain size={20} color="#f59e0b" />
              </div>
              <Bookmark size={16} color="#94a3b8" className="bookmark-icon-btn" />
            </div>
            <div className="rec-card-content">
              <h4 className="rec-course-title">Machine Learning A-Z</h4>
              <span className="rec-level">Advanced</span>
            </div>
            <div className="rec-card-footer">
              <span className="rating-star">★ 4.7</span>
              <span className="rating-count">(2.7K)</span>
            </div>
          </div>

          {/* Navigation Scroll Arrow */}
          <div className="rec-carousel-next-btn">
            <ChevronRight size={18} color="#0f172a" />
          </div>

        </div>
      </div>

    </div>
  );
};

export default StudentDashboard;
