# EduFlow — Modern Learning Management System (LMS)

EduFlow is a full-stack e-learning platform designed for interactive online education. It features student course enrollment, real-time progress tracking, video lesson streaming, instructor management dashboards, interactive quizzes, and achievement tracking.

## 🚀 Tech Stack

### Frontend
- **Framework**: React 18, Vite
- **Routing**: React Router v6
- **Styling**: Tailwind CSS, Framer Motion
- **Icons**: Lucide React
- **Video Player**: React Player

### Backend
- **Server**: Node.js, Express.js
- **Database**: Supabase (PostgreSQL)
- **Real-Time**: Socket.IO
- **Authentication**: JWT, bcryptjs
- **Media Storage**: Cloudinary, Multer

---

## 🛠️ Getting Started

### Prerequisites
- Node.js (v18+)
- npm

### Installation

1. **Clone the repository**:
   ```bash
   git clone https://github.com/Saravanan-io/eduflow.git
   cd eduflow
   ```

2. **Backend Setup**:
   ```bash
   cd server
   npm install
   # Add your .env file with database & JWT credentials
   npm run dev
   ```

3. **Frontend Setup**:
   ```bash
   cd client
   npm install
   npm run dev
   ```

---

## 💻 Features
- 🔐 Secure JWT Authentication with Role-Based Access (Student / Instructor)
- 📚 Course Catalog & Dynamic Filtering
- 📹 Interactive Lesson Viewer & Video Streaming
- 📊 Instructor Dashboard for Course Creation & Student Management
- 🏆 Student Progress Tracker & Awards System
- ⚡ Real-Time Notifications using Socket.IO
