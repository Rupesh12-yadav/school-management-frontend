import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthProvider";
import {
  FaBook,
  FaClipboardList,
  FaBullhorn,
  FaCalendarAlt,
  FaGraduationCap,
  FaRegCalendarCheck,
  FaUserCircle,
  FaBell ,
  FaTasks,
  FaCalendarCheck
} from "react-icons/fa";
import { FiLogOut, FiMenu } from "react-icons/fi";
import { MdAssessment } from "react-icons/md";
import Student_img from "../../assets/student.jpg";


import Homework from "./Homework";
import Attendance from "./Attention";
import Notice from "./Notice";
import Exam from "./Timetable";
import Result from "./Result";
import Leave from "./Leave";

// Import APIs directly
import { attendanceAPI, homeworkAPI, noticeAPI, examAPI } from "../../services/api";

export default function StudentDashboard() {
  const [active, setActive] = useState("Dashboard");
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [showProfile, setShowProfile] = useState(false);
  const [profilePic, setProfilePic] = useState(null);
  const [dashboardData, setDashboardData] = useState({
    attendance: "0%",
    pendingHomework: "0",
    notices: "0",
    upcomingExams: "0"
  });
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  // Redirect if not authenticated or not student
  useEffect(() => {
    if (!user || user.role?.toLowerCase() !== 'student') {
      navigate('/login');
    }
  }, [user, navigate]);

  // Fetch dashboard data
  useEffect(() => {
    if (user) {
      fetchDashboardData();
    }
  }, [user]);

  const fetchDashboardData = async () => {
    try {
      setIsLoading(true);
      console.log('Fetching dashboard data...');
      
      // Fetch attendance
      const attendanceRes = await attendanceAPI.getMyAttendance();
      console.log('Attendance Response:', attendanceRes);
      const attendanceData = Array.isArray(attendanceRes) ? attendanceRes : (attendanceRes?.data || []);
      const presentCount = attendanceData.filter(a => a.status === 'Present').length;
      const attendancePercent = attendanceData.length > 0 
        ? Math.round((presentCount / attendanceData.length) * 100) 
        : 0;
      console.log('Attendance percent:', attendancePercent);
      
      // Fetch homework
      const homeworkRes = await homeworkAPI.getAllHomework();
      console.log('Homework Response:', homeworkRes);
      const homeworkData = Array.isArray(homeworkRes) ? homeworkRes : (homeworkRes?.data || []);
      console.log('Homework count:', homeworkData.length);
      
      // Fetch notices
      const noticeRes = await noticeAPI.getAllNotices();
      console.log('Notice Response:', noticeRes);
      const noticeData = Array.isArray(noticeRes) ? noticeRes : (noticeRes?.notices || noticeRes?.data || []);
      console.log('Notice count:', noticeData.length);
      
      // Fetch exams
      const examRes = await examAPI.getAllExams();
      console.log('Exam Response:', examRes);
      const examData = Array.isArray(examRes) ? examRes : (examRes?.exams || examRes?.data || []);
      console.log('Exam data:', examData);
      console.log('Exam count:', examData.length);
      
      // Debug: Show each exam with date
      examData.forEach((exam, index) => {
        console.log(`Exam ${index + 1}:`, {
          subject: exam.subject,
          examDate: exam.examDate,
          className: exam.className,
          section: exam.section
        });
      });
      
      // Filter upcoming exams (examDate is in the future)
      const now = new Date();
      console.log('Current date:', now.toISOString());
      
      const upcomingExams = examData.filter(e => {
        if (!e.examDate) {
          console.log(`Exam "${e.subject}" has no date`);
          return false;
        }
        const examDate = new Date(e.examDate);
        console.log(`Exam "${e.subject}" date:`, examDate.toISOString(), '>', now.toISOString(), '=', examDate > now);
        return examDate > now;
      });
      console.log('Upcoming exams count:', upcomingExams.length);
      console.log('All exams count (for reference):', examData.length);
      
      setDashboardData({
        attendance: `${attendancePercent}%`,
        pendingHomework: homeworkData.length.toString(),
        notices: noticeData.length.toString(),
        upcomingExams: upcomingExams.length.toString()
      });
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      // Set zeros on error
      setDashboardData({
        attendance: "0%",
        pendingHomework: "0",
        notices: "0",
        upcomingExams: "0"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  const menuItems = [
    { name: "Dashboard", icon: <MdAssessment /> },
    { name: "Today's Homework", icon: <FaBook /> },
    { name: "Attendance Report", icon: <FaClipboardList /> },
    { name: "View Notice", icon: <FaBullhorn /> },
    { name: "Exam Timetable", icon: <FaCalendarAlt /> },
    { name: "View Result", icon: <FaGraduationCap /> },
    { name: "Request for Leave", icon: <FaRegCalendarCheck /> },
  ];

  // Dashboard stats with API data
  const dashboardStats = [
    { title: "Attendance", value: dashboardData.attendance, icon: <FaCalendarCheck />, color: "text-green-600" },
    { title: "Pending Homework", value: dashboardData.pendingHomework, icon: <FaTasks />, color: "text-orange-600" },
    { title: "Notices", value: dashboardData.notices, icon: <FaBell />, color: "text-blue-600" },
    { title: "Upcoming Exams", value: dashboardData.upcomingExams, icon: <FaGraduationCap />, color: "text-purple-600" },
  ];

  const renderContent = () => {
    switch (active) {
      case "Dashboard": return (
        <>
          <h2 className="text-2xl font-bold mb-6 text-[var(--text-secondary)]">
            📚 Student Dashboard
          </h2>

          {/* Dashboard Stats */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
            {dashboardStats.map((stat, i) => (
              <motion.div
                key={i}
                whileHover={{ scale: 1.05 }}
                style={{
                  backgroundColor: "var(--card-bg)",
                  boxShadow: `-6px 4px 12px rgba(0, 0, 0, 0.25)`,
                }}
                className="p-5 rounded-2xl hover:shadow-[-8px_6px_16px_rgba(0,0,0,0.35)] transition duration-300"
              >
                <div className="flex justify-between items-center">
                  <div>
                    <h3 className="text-gray-700">{stat.title}</h3>
                    <p className="text-3xl font-bold text-[var(--text-secondary)] mt-2">
                      {stat.value}
                    </p>
                  </div>
                  <div className={`text-4xl ${stat.color}`}>
                    {stat.icon}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Quick Info Cards */}
          
        </>
      );
      case "Today's Homework": return <Homework />;
      case "Attendance Report": return <Attendance />;
      case "View Notice": return <Notice />;
      case "Exam Timetable": return <Exam />;
      case "View Result": return <Result />;
      case "Request for Leave": return <Leave />;
      default: return <Dashboard />;
    }
  };

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-[#fffdf3] via-[#fffbea] to-[#fff6d9]">
      {/* ===== Sidebar ===== */}
      <motion.aside
        animate={{
          width: isSidebarOpen ? 240 : 80,
          boxShadow: "2px 0 10px rgba(0,0,0,0.1)",
        }}
        transition={{ duration: 0.4 }}
        style={{
          backgroundColor: "var(--sidebar-bg)",
          position: "fixed",
          top: 0,
          left: 0,
          bottom: 0,
          overflowY: "auto",
        }}
        className="text-gray-900 p-4 flex flex-col border-r border-yellow-200"
      >
        <div className="flex items-center justify-between mb-6">
          {isSidebarOpen && (
            <h1 className="text-xl font-bold text-gray-800 drop-shadow-sm">
              🎓 Student Panel
            </h1>
          )}
          <button
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className="text-gray-700 hover:text-gray-900 transition"
          >
            <FiMenu size={22} />
          </button>
        </div>

        {/* Student Profile Section */}
        {isSidebarOpen && (
          <div className="mb-6 p-4 bg-gradient-to-r from-yellow-50 to-yellow-100 rounded-xl">
            <div className="flex flex-col items-center">
              {profilePic ? (
                <img
                  src={profilePic}
                  alt="Profile"
                  className="w-16 h-16 rounded-full border-2 border-yellow-300 object-cover mb-2"
                />
              ) : (
                <img 
                  src={Student_img} 
                  alt="Student" 
                  className="w-16 h-16 rounded-full border-2 border-yellow-300 object-cover mb-2"
                />
              )}
              <h3 className="font-semibold text-gray-800">{user?.name || "Student"}</h3>
              <p className="text-sm text-gray-600">{user?.email}</p>
              <p className="text-xs text-gray-500 mt-1">Class 10th A</p>
            </div>
          </div>
        )}

        {/* Sidebar Menu */}
        <nav className="space-y-2">
          {menuItems.map((item, index) => (
            <motion.div
              key={index}
              whileHover={{ scale: 1.05 }}
              style={{
                backgroundColor:
                  active === item.name ? "var(--sidebar-active)" : "transparent",
              }}
              className={`flex items-center gap-3 p-3 rounded-xl cursor-pointer transition-all ${
                active === item.name
                  ? "text-gray-900 font-semibold"
                  : "hover:bg-[var(--sidebar-hover)] text-gray-800"
              }`}
              onClick={() => setActive(item.name)}
            >
              <span className="text-lg">{item.icon}</span>
              {isSidebarOpen && <span className="text-sm">{item.name}</span>}
            </motion.div>
          ))}
        </nav>
      </motion.aside>

      {/* ===== Main Content ===== */}
      <div
        className="flex-1 flex flex-col"
        style={{
          marginLeft: isSidebarOpen ? 240 : 80,
          transition: "margin-left 0.4s ease",
        }}
      >
        {/* Navbar */}
        <header
          style={{
            position: "sticky",
            top: 0,
            zIndex: 50,
            backgroundColor: "var(--background-color)",
            boxShadow: "0 4px 8px rgba(0, 0, 0, 0.15)",
            borderBottom: "1px solid rgba(0, 0, 0, 0.05)",
          }}
          className="text-gray-900 flex justify-between items-center px-6 py-4 backdrop-blur-md"
        >
          <h2 className="text-lg font-semibold tracking-wide">
            Welcome, {user?.name || "Student"} 👋
          </h2>

          {/* Profile + Logout Buttons */}
          <div className="flex items-center gap-4">
            {/* Profile Icon */}
            <div
              onClick={() => setShowProfile(true)}
              className="cursor-pointer relative group"
            >
              {profilePic ? (
                <img
                  src={profilePic}
                  alt="Profile"
                  className="w-10 h-10 rounded-full border-2 border-gray-400 object-cover"
                />
              ) : (
                <FaUserCircle
                  size={38}
                  className="text-gray-600 hover:text-gray-800 transition"
                />
              )}
            </div>

            {/* Logout */}
            <motion.button
              whileHover={{ scale: 1.05 }}
              onClick={handleLogout}
              style={{
                backgroundColor: "var(--primary-color)",
                color: "var(--button-text)",
                boxShadow: "0 3px 6px rgba(0,0,0,0.2)",
              }}
              className="font-semibold px-4 py-2 rounded-xl transition"
            >
              <FiLogOut className="inline mr-1" /> Logout
            </motion.button>
          </div>
        </header>

        {/* ===== Dashboard Body ===== */}
        <motion.main
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="p-8 flex-1 overflow-y-auto"
          style={{
            background:
              "linear-gradient(to bottom right, #fffdf3, #fffbea, #fff6d9)",
          }}
        >
          {renderContent()}
        </motion.main>
      </div>

      {/* ===== Profile Modal ===== */}
      {showProfile && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex justify-center items-center z-50">
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.3 }}
            className="bg-white p-6 rounded-2xl shadow-xl w-[400px]"
          >
            <h2 className="text-xl font-bold mb-4 text-gray-800">
              👤 Profile Details
            </h2>

            {/* Profile Picture */}
            <div className="flex flex-col items-center mb-4">
              {profilePic ? (
                <img
                  src={profilePic}
                  alt="Profile"
                  className="w-24 h-24 rounded-full border border-gray-300 object-cover mb-2"
                />
              ) : (
                <img 
                  src={Student_img} 
                  alt="Student" 
                  className="w-24 h-24 rounded-full border border-gray-300 object-cover mb-2"
                />
              )}

              <label className="cursor-pointer text-blue-500 text-sm font-medium hover:underline">
                Upload Picture
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files[0];
                    if (file) {
                      const url = URL.createObjectURL(file);
                      setProfilePic(url);
                    }
                  }}
                />
              </label>
            </div>

            {/* Details */}
            <div className="text-gray-700 space-y-2">
              <p><strong>Name:</strong> {user?.name || "Student"}</p>
              <p><strong>Email:</strong> {user?.email || "Not available"}</p>
              <p><strong>Role:</strong> {user?.role || "Student"}</p>
              <p><strong>Class:</strong> 10th A</p>
              <p><strong>Roll Number:</strong> 2024001</p>
            </div>

            {/* Buttons */}
            <div className="mt-5 flex justify-end gap-3">
              <button
                onClick={() => setShowProfile(false)}
                className="px-4 py-2 rounded-lg bg-gray-300 hover:bg-gray-400 transition"
              >
                Close
              </button>
              <button
                onClick={() => {
                  alert("Profile Updated Successfully!");
                  setShowProfile(false);
                }}
                className="px-4 py-2 rounded-lg bg-yellow-500 text-white hover:bg-yellow-600 transition"
              >
                Save
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}
