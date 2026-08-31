import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { SocketProvider } from './context/SocketContext';
import Navbar from './components/Navbar';
import Sidebar from './components/Sidebar';
import ProtectedRoute from './components/ProtectedRoute';
import RoleRoute from './components/RoleRoute';
import AIChatbot from './components/AIChatbot';
import { ThemeProvider } from './context/ThemeContext';
import { useState } from 'react';
import { MessageSquare } from 'lucide-react';

// Pages
import Login from './pages/Login';
import Register from './pages/Register';
import CourseCatalog from './pages/CourseCatalog';
import CourseDetail from './pages/CourseDetail';
import StudentDashboard from './pages/StudentDashboard';
import InstructorDashboard from './pages/InstructorDashboard';
import LessonViewer from './pages/LessonViewer';
import Quiz from './pages/Quiz';
import CourseForm from './pages/CourseForm';
import Profile from './pages/Profile';
import Enrolled from './pages/Enrolled';
import Awards from './pages/Awards';
import NotFound from './pages/NotFound';

import Footer from './components/Footer';

// Layout component to include Chatbot conditionally
const AppLayout = () => {
  const { user } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [showChatbot, setShowChatbot] = useState(false);
  const location = useLocation();
  const toggleSidebar = () => setSidebarOpen(!sidebarOpen);

  const isAuthPage = location.pathname === '/login' || location.pathname === '/register';

  if (isAuthPage) {
    return (
      <div className="auth-fullscreen-container">
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
        </Routes>
      </div>
    );
  }

  return (
    <div className="app-container">
      <Navbar toggleSidebar={toggleSidebar} />
      
      <div className="app-main-layout">
        <Sidebar isOpen={sidebarOpen} toggleSidebar={toggleSidebar} />
        
        <main className="main-content">
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<CourseCatalog />} />
            <Route path="/course/:id" element={<CourseDetail />} />

            {/* Protected Routes */}
            <Route 
              path="/dashboard" 
              element={
                <ProtectedRoute>
                  <StudentDashboard />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/profile" 
              element={
                <ProtectedRoute>
                  <Profile />
                </ProtectedRoute>
              } 
            />
            <Route path="/enrolled" element={<Enrolled />} />
            <Route path="/awards" element={<Awards />} />
            <Route 
              path="/course/:courseId/learn/:lessonId" 
              element={
                <ProtectedRoute>
                  <LessonViewer />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/course/:courseId/quiz" 
              element={
                <ProtectedRoute>
                  <Quiz />
                </ProtectedRoute>
              } 
            />

            {/* Instructor Routes */}
            <Route 
              path="/instructor/dashboard" 
              element={
                <RoleRoute roles={['instructor', 'admin']}>
                  <InstructorDashboard />
                </RoleRoute>
              } 
            />
            <Route 
              path="/create-course" 
              element={
                <RoleRoute roles={['instructor', 'admin']}>
                  <CourseForm />
                </RoleRoute>
              } 
            />
            <Route 
              path="/edit-course/:id" 
              element={
                <RoleRoute roles={['instructor', 'admin']}>
                  <CourseForm />
                </RoleRoute>
              } 
            />

            {/* 404 Route */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </main>
      </div>

      <Footer />
      
      {/* Floating Chat Action Button */}
      <div 
        className="floating-chat-btn"
        onClick={() => setShowChatbot(!showChatbot)}
        title="EduFlow AI Assistant"
      >
        <MessageSquare size={24} />
      </div>

      {/* Global AI Chatbot */}
      {showChatbot && <AIChatbot onClose={() => setShowChatbot(false)} />}
    </div>
  );
};

function App() {
  return (
    <ThemeProvider>
      <Router basename={import.meta.env.BASE_URL}>
        <AuthProvider>
          <SocketProvider>
            <AppLayout />
          </SocketProvider>
        </AuthProvider>
      </Router>
    </ThemeProvider>
  );
}

export default App;
