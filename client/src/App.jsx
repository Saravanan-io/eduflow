import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { SocketProvider } from './context/SocketContext';
import Navbar from './components/Navbar';
import Sidebar from './components/Sidebar';
import ProtectedRoute from './components/ProtectedRoute';
import RoleRoute from './components/RoleRoute';
import AIChatbot from './components/AIChatbot';
import { ThemeProvider } from './context/ThemeContext';
import { useState } from 'react';

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

// Layout component to include Chatbot conditionally
const AppLayout = () => {
  const { user } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const toggleSidebar = () => setSidebarOpen(!sidebarOpen);

  return (
    <div className="app-container">
      <Navbar toggleSidebar={toggleSidebar} />
      <div className="flex" style={{ minHeight: 'calc(100vh - 70px)' }}>
        <Sidebar isOpen={sidebarOpen} toggleSidebar={toggleSidebar} />
        <main className="main-content" style={{ flex: 1 }}>
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<CourseCatalog />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
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
      
      {/* Global AI Chatbot for logged-in students */}
      {user && <AIChatbot />}
    </div>
  );
};

function App() {
  return (
    <ThemeProvider>
      <Router>
        <AuthProvider>
          <SocketProvider>
            <AppLayout />
          </SocketProvider>
        </AuthProvider>
        <style>{`
          .app-container {
            background-color: var(--bg-dark);
            color: white;
            min-height: 100vh;
          }
          .main-content {
            padding: 2rem;
            animation: fadeIn 0.5s ease-out;
          }
          @media (max-width: 767px) {
            .main-content { padding: 1rem !important; }
          }
        `}</style>
      </Router>
    </ThemeProvider>
  );
}

export default App;
