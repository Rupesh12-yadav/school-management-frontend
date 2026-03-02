// React library import kar rahe hain - frontend banane ke liye
import React from "react";
// React Router components import kar rahe hain - page navigation ke liye
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";

// Custom components import kar rahe hain
import AuthProvider from "./context/AuthProvider";     // Authentication context provider
import PrivateRoute from "./Route/PrivateRoute";       // Protected routes ke liye

// UI Components import kar rahe hain
import Navbar from "./Components/Navbar";              // Navigation bar
import Home from "./page/Homepage/Home";               // Home page
import Login from "./Components/Login";                // Login page

// Dashboard components import kar rahe hain - har role ke liye alag dashboard
import AdminDashboard from "./page/Admin/AdminDashboard";       // Admin ka dashboard
import TeacherDashboard from "./page/Teacher/TeacherDashboard"; // Teacher ka dashboard
import StudentDashboard from "./page/Student/Dashboard";        // Student ka dashboard

// 🗺️ APP ROUTES COMPONENT - Saare application routes define karta hai
const AppRoutes = () => {
  return (
    <Routes>
      {/* 🏠 PUBLIC PAGES - Ye pages koi bhi access kar sakta hai (Navbar ke saath) */}
      
      {/* Home Page Route */}
      <Route
        path="/"
        element={
          <>
            <Navbar />  {/* Navigation bar dikhayenge */}
            <Home />    {/* Home page content */}
          </>
        }
      />
      
      {/* Login Page Route */}
      <Route
        path="/login"
        element={
          <>
            <Navbar />  {/* Navigation bar dikhayenge */}
            <Login />   {/* Login form */}
          </>
        }
      />

      {/* 🔒 PROTECTED PAGES - Sirf logged in users access kar sakte hain (Navbar nahi hai) */}
      
      {/* Admin Dashboard - Sirf Admin access kar sakta hai */}
      <Route
        path="/admin-dashboard"
        element={
          <PrivateRoute roles={["admin"]}> {/* Sirf admin role wale users */}
            <AdminDashboard />
          </PrivateRoute>
        }
      />
      
      {/* Teacher Dashboard - Sirf Teacher access kar sakta hai */}
      <Route
        path="/teacher-dashboard"
        element={
          <PrivateRoute roles={["teacher"]}> {/* Sirf teacher role wale users */}
            <TeacherDashboard />
          </PrivateRoute>
        }
      />
      
      {/* Student Dashboard - Sirf Student access kar sakta hai */}
      <Route
        path="/student-dashboard"
        element={
          <PrivateRoute roles={["student"]}> {/* Sirf student role wale users */}
            <StudentDashboard />
          </PrivateRoute>
        }
      />

      {/* 🚫 FALLBACK ROUTE - Agar koi invalid URL hai to home page par redirect kar denge */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

// 🎨 MAIN APP COMPONENT - Ye main application component hai
const App = () => {
  return (
    // AuthProvider se pura app wrap kar rahe hain - authentication state manage karne ke liye
    <AuthProvider>
      {/* Router se wrap kar rahe hain - routing functionality ke liye */}
      <Router>
        <AppRoutes /> {/* Saare routes render kar rahe hain */}
      </Router>
    </AuthProvider>
  );
};

// App component ko export kar rahe hain taaki main.jsx mein use kar saken
export default App;
