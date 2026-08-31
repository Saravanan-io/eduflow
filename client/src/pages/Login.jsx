import { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import { 
  Mail, 
  Lock, 
  Eye, 
  EyeOff, 
  AlertCircle, 
  ArrowRight, 
  GraduationCap, 
  Award, 
  Clock, 
  Users, 
  Play, 
  Star, 
  ShieldCheck,
  BookOpen,
  Search,
  X,
  ChevronDown,
  Sparkles
} from 'lucide-react';
import './Login.css';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  // Interactive Menu States
  const [showCoursesMenu, setShowCoursesMenu] = useState(false);
  const [courseSearch, setCourseSearch] = useState('');
  const [coursesList, setCoursesList] = useState([]);
  const [cardHighlighted, setCardHighlighted] = useState(false);

  const emailInputRef = useRef(null);
  const dropdownRef = useRef(null);

  const { login } = useAuth();
  const navigate = useNavigate();

  // Sample fallback courses
  const sampleCourses = [
    { _id: '1', title: 'Full Stack Web Development', category: 'Web Development', rating: 4.9, price: '$89.99', icon: '💻' },
    { _id: '2', title: 'React - The Complete Guide', category: 'Web Development', rating: 4.8, price: '$49.99', icon: '⚛️' },
    { _id: '3', title: 'UI/UX Design Masterclass', category: 'Design', rating: 4.9, price: '$59.99', icon: '🎨' },
    { _id: '4', title: 'Python for Data Science & AI', category: 'Data Science', rating: 4.8, price: '$69.99', icon: '🐍' },
    { _id: '5', title: 'Mobile App Dev with Flutter', category: 'Mobile', rating: 4.7, price: '$54.99', icon: '📱' },
    { _id: '6', title: 'Cloud Computing & DevOps Essentials', category: 'DevOps', rating: 4.9, price: '$79.99', icon: '☁️' },
    { _id: '7', title: 'Cybersecurity Fundamentals', category: 'Security', rating: 4.8, price: '$64.99', icon: '🛡️' },
  ];

  useEffect(() => {
    fetchCourses();
  }, []);

  const fetchCourses = async () => {
    try {
      const { data } = await axios.get('/api/courses');
      if (data && Array.isArray(data.courses) && data.courses.length > 0) {
        // Merge API courses with sample courses to ensure a rich list of course names
        const combined = [...data.courses, ...sampleCourses];
        // Deduplicate by title
        const unique = Array.from(new Map(combined.map(item => [item.title, item])).values());
        setCoursesList(unique);
      } else {
        setCoursesList(sampleCourses);
      }
    } catch {
      setCoursesList(sampleCourses);
    }
  };

  const handleToggleCoursesMenu = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setShowCoursesMenu(!showCoursesMenu);
  };

  const handleMenuClickGoToLogin = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setShowCoursesMenu(false);
    
    // Focus email input and highlight login card
    setCardHighlighted(true);
    if (emailInputRef.current) {
      emailInputRef.current.focus();
    }
    setTimeout(() => {
      setCardHighlighted(false);
    }, 1200);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const data = await login(email, password);
      if (data.user?.role === 'instructor') {
        navigate('/instructor/dashboard');
      } else {
        navigate('/dashboard');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  const filteredCourses = coursesList.filter(c => 
    c.title.toLowerCase().includes(courseSearch.toLowerCase()) ||
    c.category?.toLowerCase().includes(courseSearch.toLowerCase())
  );

  return (
    <div className="eduflow-landing-login-wrapper" onClick={() => setShowCoursesMenu(false)}>
      <div className="eduflow-split-container">
        
        {/* ── LEFT HERO SECTION ───────────────────────────────────── */}
        <div className="eduflow-hero-section">
          
          {/* Top Brand Navigation Header */}
          <header className="eduflow-landing-header">
            <Link to="/" className="eduflow-brand-logo">
              <div className="eduflow-logo-badge">
                <BookOpen size={20} strokeWidth={2.5} />
              </div>
              <span className="eduflow-brand-name">
                Edu<span>Flow</span>
              </span>
            </Link>

            <nav className="eduflow-header-nav">
              <a 
                href="#courses" 
                className={`eduflow-nav-link ${showCoursesMenu ? 'active' : ''}`}
                onClick={handleToggleCoursesMenu}
                style={{ display: 'flex', alignItems: 'center', gap: '4px' }}
              >
                <span>Courses</span>
                <ChevronDown size={14} style={{ transform: showCoursesMenu ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }} />
              </a>
              
              <a href="#pricing" className="eduflow-nav-link" onClick={handleMenuClickGoToLogin}>
                Pricing
              </a>
              
              <a href="#business" className="eduflow-nav-link" onClick={handleMenuClickGoToLogin}>
                For Business
              </a>
              
              <a href="#about" className="eduflow-nav-link" onClick={handleMenuClickGoToLogin}>
                About Us
              </a>
            </nav>

            <button 
              className="eduflow-explore-btn"
              onClick={handleToggleCoursesMenu}
            >
              <span>Explore Courses</span>
              <ArrowRight size={16} />
            </button>

            {/* Interactive Courses Dropdown Panel */}
            {showCoursesMenu && (
              <div 
                className="eduflow-courses-dropdown-panel" 
                ref={dropdownRef}
                onClick={(e) => e.stopPropagation()}
              >
                <div className="eduflow-dropdown-header">
                  <div className="eduflow-dropdown-title">
                    <Sparkles size={18} color="#6366f1" />
                    <span>Popular EduFlow Courses</span>
                  </div>
                  <button 
                    onClick={() => setShowCoursesMenu(false)}
                    style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: '#64748b' }}
                  >
                    <X size={18} />
                  </button>
                </div>

                {/* Course Search Filter */}
                <div className="eduflow-dropdown-search">
                  <Search size={16} className="search-icon" />
                  <input 
                    type="text" 
                    placeholder="Search courses by name or topic..."
                    value={courseSearch}
                    onChange={(e) => setCourseSearch(e.target.value)}
                    autoFocus
                  />
                </div>

                {/* Scrollable Course Names List */}
                <div className="eduflow-courses-scroll-list">
                  {filteredCourses.map((c) => (
                    <div 
                      key={c._id || c.title} 
                      className="eduflow-course-row-card"
                      onClick={handleMenuClickGoToLogin}
                      title="Click to login and access course"
                    >
                      <div className="eduflow-course-row-left">
                        <div className="eduflow-course-avatar-icon">
                          {c.icon || '📚'}
                        </div>
                        <div>
                          <div className="eduflow-course-meta-title">{c.title}</div>
                          <div className="eduflow-course-meta-category">{c.category || 'General'}</div>
                        </div>
                      </div>

                      <div className="eduflow-course-row-right">
                        <div className="eduflow-course-rating-pill">
                          <Star size={12} fill="#d97706" color="#d97706" />
                          <span>{c.rating || 4.8}</span>
                        </div>
                        <div className="eduflow-course-price-tag">{c.price || '$49.99'}</div>
                      </div>
                    </div>
                  ))}

                  {filteredCourses.length === 0 && (
                    <div style={{ textAlignment: 'center', padding: '1rem', color: '#64748b', fontSize: '0.85rem' }}>
                      No matching courses found
                    </div>
                  )}
                </div>
              </div>
            )}
          </header>

          {/* Main Hero Header Text */}
          <div className="eduflow-hero-header-content">
            <div className="eduflow-welcome-tag">WELCOME TO EDUFLOW</div>
            <h1 className="eduflow-hero-headline">
              Learn. Grow.<br />
              <span className="eduflow-headline-accent">Succeed.</span>
            </h1>
            <p className="eduflow-hero-subtext">
              Discover expert-led courses, real-world projects, and certificates that help you advance your career.
            </p>
          </div>

          {/* Lower Hero Grid: Features on Left, Illustration + Stats on Right */}
          <div className="eduflow-hero-bottom-grid">
            
            {/* Feature Highlights Column */}
            <div className="eduflow-features-column">
              <div className="eduflow-feature-item">
                <div className="eduflow-feature-icon-box">
                  <GraduationCap size={20} />
                </div>
                <div className="eduflow-feature-info">
                  <h4>Expert-Led Courses</h4>
                  <p>Learn from industry professionals</p>
                </div>
              </div>

              <div className="eduflow-feature-item">
                <div className="eduflow-feature-icon-box">
                  <Award size={20} />
                </div>
                <div className="eduflow-feature-info">
                  <h4>Recognized Certificates</h4>
                  <p>Earn certificates that matter</p>
                </div>
              </div>

              <div className="eduflow-feature-item">
                <div className="eduflow-feature-icon-box">
                  <Clock size={20} />
                </div>
                <div className="eduflow-feature-info">
                  <h4>Learn at Your Pace</h4>
                  <p>Flexible learning anytime, anywhere</p>
                </div>
              </div>
            </div>

            {/* Student Illustration Composite with Desk & Stats */}
            <div className="eduflow-illustration-container">
              
              {/* Organic Curved Purple Shape */}
              <div className="eduflow-purple-shape-backdrop"></div>

              {/* Arc Line Graphic */}
              <svg className="eduflow-arc-line-decor" viewBox="0 0 100 100" fill="none">
                <path d="M10 80 Q 50 10 90 80" stroke="#818cf8" strokeWidth="1.5" strokeDasharray="3 3" />
              </svg>

              {/* Student Photo & Desk Composite */}
              <div className="eduflow-student-desk-wrapper">
                <img 
                  src="https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?q=80&w=700&auto=format&fit=crop" 
                  alt="Student at desk with laptop" 
                  className="eduflow-student-photo-cutout"
                />
                
                {/* Wooden Desk Bar Surface */}
                <div className="eduflow-desk-surface">
                  {/* Potted Plant */}
                  <svg className="eduflow-desk-plant" viewBox="0 0 40 50">
                    <path d="M10 30 L30 30 L26 48 L14 48 Z" fill="#ffffff" stroke="#cbd5e1" strokeWidth="1.5"/>
                    <path d="M20 30 Q 10 15 5 20 Q 15 25 20 30" fill="#22c55e" />
                    <path d="M20 30 Q 30 15 35 20 Q 25 25 20 30" fill="#16a34a" />
                    <path d="M20 30 Q 20 5 16 10 Q 22 18 20 30" fill="#15803d" />
                  </svg>
                  
                  {/* Silver Laptop Top */}
                  <div style={{ width: '130px', height: '12px', background: '#e2e8f0', borderRadius: '4px 4px 0 0', border: '1px solid #cbd5e1', boxShadow: '0 -2px 6px rgba(0,0,0,0.06)' }}></div>

                  {/* Desk Notebook */}
                  <div className="eduflow-desk-notebook"></div>
                </div>
              </div>

              {/* Floating Stat Cards */}
              <div className="eduflow-stats-stack">
                <div className="eduflow-stat-card">
                  <div className="eduflow-stat-icon-square purple">
                    <Users size={18} />
                  </div>
                  <div className="eduflow-stat-info">
                    <h3>10,000+</h3>
                    <span>Active Learners</span>
                  </div>
                </div>

                <div className="eduflow-stat-card">
                  <div className="eduflow-stat-icon-square purple">
                    <Play size={16} fill="currentColor" />
                  </div>
                  <div className="eduflow-stat-info">
                    <h3>500+</h3>
                    <span>Courses</span>
                  </div>
                </div>

                <div className="eduflow-stat-card">
                  <div className="eduflow-stat-icon-square amber">
                    <Star size={18} fill="#f59e0b" color="#f59e0b" />
                  </div>
                  <div className="eduflow-stat-info">
                    <h3>98%</h3>
                    <span>Satisfaction Rate</span>
                  </div>
                </div>
              </div>

              {/* Dot Grid Matrix Decor */}
              <div className="eduflow-stats-dots-matrix"></div>

            </div>

          </div>

        </div>

        {/* ── RIGHT AUTHENTICATION SECTION ──────────────────────── */}
        <div className="eduflow-auth-section">
          
          {/* Decorative Grid Matrix & Circles */}
          <div className="eduflow-dots-pattern-top"></div>
          <div className="eduflow-rings-pattern-bottom"></div>

          <div className="eduflow-login-card-container">
            <div className={`eduflow-login-card ${cardHighlighted ? 'highlight-focus' : ''}`}>
              
              <div className="eduflow-card-header">
                <h2>Welcome Back!</h2>
                <p>Log in to continue your learning journey</p>
              </div>

              {error && (
                <div className="eduflow-error-box">
                  <AlertCircle size={16} />
                  <span>{error}</span>
                </div>
              )}

              <form onSubmit={handleSubmit}>
                
                {/* Email Field */}
                <div className="eduflow-form-group">
                  <label className="eduflow-input-label">Email Address</label>
                  <div className="eduflow-input-wrapper">
                    <Mail size={17} className="eduflow-input-icon" />
                    <input 
                      type="email" 
                      ref={emailInputRef}
                      className="eduflow-text-input" 
                      placeholder="Enter your email" 
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                    />
                  </div>
                </div>

                {/* Password Field */}
                <div className="eduflow-form-group">
                  <div className="eduflow-field-label-row">
                    <label className="eduflow-input-label">Password</label>
                    <a href="#forgot" onClick={(e) => { e.preventDefault(); alert('Password reset link sent to your email.'); }} className="eduflow-forgot-link">
                      Forgot Password?
                    </a>
                  </div>
                  <div className="eduflow-input-wrapper">
                    <Lock size={17} className="eduflow-input-icon" />
                    <input 
                      type={showPassword ? 'text' : 'password'} 
                      className="eduflow-text-input has-right-icon" 
                      placeholder="Enter your password" 
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                    />
                    <button 
                      type="button" 
                      className="eduflow-password-toggle"
                      onClick={() => setShowPassword(!showPassword)}
                      title={showPassword ? "Hide password" : "Show password"}
                    >
                      {showPassword ? <EyeOff size={17} /> : <Eye size={17} />}
                    </button>
                  </div>
                </div>

                {/* Remember Me Checkbox */}
                <div className="eduflow-remember-row">
                  <input 
                    type="checkbox" 
                    id="rememberMe" 
                    className="eduflow-checkbox" 
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                  />
                  <label htmlFor="rememberMe" className="eduflow-remember-label">
                    Remember me
                  </label>
                </div>

                {/* Submit Button */}
                <button 
                  type="submit" 
                  className="eduflow-submit-btn" 
                  disabled={loading}
                >
                  {loading ? 'Logging In...' : 'Log In'}
                </button>
              </form>

              {/* Divider */}
              <div className="eduflow-divider">
                <span className="eduflow-divider-text">or continue with</span>
              </div>

              {/* Social Login Row */}
              <div className="eduflow-social-row">
                <button type="button" className="eduflow-social-btn">
                  <svg width="18" height="18" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/>
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/>
                  </svg>
                  <span>Google</span>
                </button>

                <button type="button" className="eduflow-social-btn">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="#0f172a">
                    <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z"/>
                  </svg>
                  <span>GitHub</span>
                </button>

                <button type="button" className="eduflow-social-btn">
                  <svg width="18" height="18" viewBox="0 0 23 23">
                    <path fill="#f35325" d="M1 1h10v10H1z"/>
                    <path fill="#81bc06" d="M12 1h10v10H12z"/>
                    <path fill="#05a6f0" d="M1 12h10v10H1z"/>
                    <path fill="#ffba08" d="M12 12h10v10H12z"/>
                  </svg>
                  <span>Microsoft</span>
                </button>
              </div>

              {/* Card Footer */}
              <div className="eduflow-card-footer">
                <span>Don't have an account?</span>
                <Link to="/register" className="eduflow-signup-link">Sign up</Link>
              </div>

            </div>

            {/* Bottom Security Info Badge */}
            <div className="eduflow-security-badge">
              <ShieldCheck size={17} color="#64748b" />
              <span>Your data is safe with us. We never share your information.</span>
            </div>

          </div>

        </div>

      </div>
    </div>
  );
};

export default Login;
