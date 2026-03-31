# EduFlow — Online Learning Management System

EduFlow is a full-stack, premium Learning Management System (LMS) built with the MERN stack (MongoDB, Express, React, Node.js) and real-time capabilities via Socket.IO. It features a modern, responsive user interface with glassmorphism, dark mode, and a suite of interactive features for both students and instructors.

## 🚀 Key Features

- **Real-Time Synchronisation**: Live lesson progress tracking and instant student notifications via Socket.IO.
- **Premium UI/UX**: High-end dark mode design using glassmorphism, smooth animations, and responsive layouts.
- **Role-Based Portals**:
    - **Students**: Interactive dashboard, course catalog, real-time video player, and quizzes.
    - **Instructors**: Course creation, syllabus management, live session controls, and student announcements.
- **Media Management**: Cloudinary integration for course thumbnails, lesson videos, and downloadable resources.
- **Secure Authentication**: JWT-based authentication with role-based routing and bcrypt password hashing.

---

## 🛠️ Tech Stack

- **Frontend**: React 18, Vite, React Router v6, Axios, Socket.IO Client, Lucide React, Framer Motion.
- **Backend**: Node.js, Express.js, MongoDB + Mongoose, Socket.IO, Multer, Cloudinary, JWT, bcryptjs.

---

## 📦 Prerequisites

Ensure you have the following installed:
- [Node.js](https://nodejs.org/) (v16.x or higher)
- [MongoDB](https://www.mongodb.com/try/download/community) (Local or Atlas)
- [Cloudinary Account](https://cloudinary.com/) (For image and video uploads)

---

## 🔧 Installation & Setup

Follow these steps to run the project locally:

### 1. Project Structure
The project is split into two main directories: `/server` and `/client`.

### 2. Configure Environment Variables
Create a `.env` file in the `/server` directory and add your credentials:
```env
PORT=5000
MONGO_URI=mongodb://localhost:27017/eduflow
JWT_SECRET=your_jwt_secret_key
JWT_EXPIRE=7d
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
CLIENT_URL=http://localhost:5173
```

### 3. Backend Setup
1. Open a terminal and navigate to the `server` directory:
   ```bash
   cd server
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the development server:
   ```bash
   npm run dev
   ```

### 4. Frontend Setup
1. Open a new terminal and navigate to the `client` directory:
   ```bash
   cd client
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the development server:
   ```bash
   npm run dev
   ```

---

## 🏗️ Folder Structure
```bash
/client           # React frontend
  /src
    /api          # Axios configuration
    /assets       # Static assets
    /components   # Reusable UI components
    /context      # Auth & Socket contexts
    /pages        # Application pages
/server           # Node.js backend
  /config         # DB configuration
  /middleware     # Auth & Upload middlewares
  /models         # Mongoose schemas
  /routes         # API endpoints
  /socket         # Socket.IO event handlers
```

## 📄 License
This project is for demonstration purposes.

---
*Created with ❤️ by Antigravity.*
