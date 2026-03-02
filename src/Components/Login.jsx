// React aur hooks import kar rahe hain
import React, { useState } from "react";
// Animation library import kar rahe hain - smooth transitions ke liye
import { motion } from "framer-motion"; // eslint-disable-line
// Toast notifications ke liye - success/error messages dikhane ke liye
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
// Navigation ke liye - page redirect karne ke liye
import { useNavigate } from "react-router-dom";
// Authentication context hook
import { useAuth } from "../context/AuthProvider"; // Local storage management ke liye
// Axios-based API service
import { authAPI } from "../services/api";

// 🔑 LOGIN COMPONENT - User authentication handle karta hai
const Login = ({ closeLogin }) => {
  // 📝 STATE VARIABLES - Form data store karne ke liye
  const [email, setEmail] = useState("");         // User ka email
  const [password, setPassword] = useState("");   // User ka password
  const [isLoading, setIsLoading] = useState(false); // Loading state
  
  // 🔧 HOOKS SETUP
  const navigate = useNavigate();                  // Page navigation ke liye
  const { login: contextLogin } = useAuth();       // Context se login function

  // 🚀 FORM SUBMIT HANDLER - Jab user login button dabaye
  const handleSubmit = async (e) => {
    e.preventDefault(); // Page reload prevent karne ke liye
    setIsLoading(true);
    
    try {
      // 🌐 API CALL - Backend se login request bhej rahe hain
      const data = await authAPI.login({ email, password });

      // ✅ LOGIN SUCCESS - Agar token mil gaya
      if (data?.token) {
        console.log('Login response data:', data);
        // Context mein save kar rahe hain (localStorage ke liye)
        contextLogin({
          token: data.token,
          role: data.role,
          email: data.email,
          name: data.name,
          _id: data._id || data.id || data.userId
        });
        
        // Success message dikhayenge
        toast.success("Login successful!", { autoClose: 1500 });

        // 🗺️ ROLE-BASED REDIRECT - User ke role ke basis par dashboard par bhejenge
        setTimeout(() => {
          switch (data.role?.toLowerCase()) {
            case "admin":
              navigate("/admin-dashboard");    // Admin dashboard
              break;
            case "teacher":
              navigate("/teacher-dashboard");  // Teacher dashboard
              break;
            case "student":
              navigate("/student-dashboard");  // Student dashboard
              break;
            default:
              navigate("/");                   // Home page (fallback)
          }
        }, 1500);
      } else {
        // ❌ LOGIN FAILED - Token nahi mila
        toast.error(data?.message || "Login failed", { autoClose: 3000 });
      }
    } catch (error) {
      // 🚫 ERROR HANDLING - Koi technical error aayi
      console.log(error);
      toast.error(error?.message || "Something went wrong", {
        autoClose: 3000,
      });
    } finally {
      setIsLoading(false);
    }
  };

  // 🎨 UI RENDER - Login form ka design
  return (
    // Motion div - Animation effects ke liye
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}    // Starting state
      animate={{ opacity: 1, scale: 1 }}      // Final state
      exit={{ opacity: 0, scale: 0.7 }}       // Exit state
      transition={{ duration: 0.6, ease: "easeInOut" }}
      className="relative w-full max-w-md bg-white/90 backdrop-blur-sm border border-yellow-300 rounded-2xl shadow-2xl p-8"
    >
      {/* 📝 HEADER SECTION */}
      <h2 className="text-3xl font-bold text-center text-gray-800 mb-2">
        Welcome Back 👋
      </h2>
      <p className="text-center text-gray-600 mb-6 text-sm">
        Please log in to continue to your dashboard
      </p>

      {/* 📝 LOGIN FORM */}
      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Email Input Field */}
        <div>
          <label className="block text-gray-700 mb-1 text-sm font-medium">
            Email
          </label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)} // Email state update
            placeholder="Enter your email"
            required
            className="w-full px-4 py-2 rounded-lg bg-white border border-gray-300 text-gray-800 focus:outline-none focus:ring-2 focus:ring-yellow-400"
          />
        </div>

        {/* Password Input Field */}
        <div>
          <label className="block text-gray-700 mb-1 text-sm font-medium">
            Password
          </label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)} // Password state update
            placeholder="Enter your password"
            required
            className="w-full px-4 py-2 rounded-lg bg-white border border-gray-300 text-gray-800 focus:outline-none focus:ring-2 focus:ring-yellow-400"
          />
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={isLoading} // Loading state mein button disable
          className={`w-full py-3 font-semibold rounded-lg transition-all ${
            isLoading
              ? "bg-gray-400 cursor-not-allowed"           // Loading state styling
              : "bg-yellow-400 hover:bg-yellow-500 text-white" // Normal state styling
          }`}
        >
          {isLoading ? "Logging in..." : "Login"} {/* Dynamic button text */}
        </button>
      </form>

      {/* Back Button */}
      <button
        onClick={closeLogin} // Login modal close karne ke liye
        className="w-full py-2 mt-4 bg-gray-200 text-gray-800 font-medium rounded-lg hover:bg-gray-300 transition"
      >
        ← Back
      </button>

      {/* Toast Container - Notifications dikhane ke liye */}
      <ToastContainer position="top-right" newestOnTop />
    </motion.div>
  );
};

// Component export kar rahe hain
export default Login;
