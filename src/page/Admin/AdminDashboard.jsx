// React aur hooks import kar rahe hain
import React, { useState, useEffect } from "react";
// Animation library import kar rahe hain
import { motion } from "framer-motion"; // eslint-disable-line
// Authentication context import kar rahe hain
import { useAuth } from "../../context/AuthProvider";
// Axios-based API services import kar rahe hain
import { 
  studentAPI, 
  teacherAPI,
  eventAPI,
  homeworkAPI,
  noticeAPI,
  adminAPI
} from "../../services/api";
// Icons import kar rahe hain
import {
  FaUserPlus,
  FaSchool,
  FaChalkboardTeacher,
  FaBookOpen,
  FaRegCalendarCheck,
  FaUserCircle,
} from "react-icons/fa";
import {
  MdAssessment,
  MdLeaderboard,
  MdCampaign,
  MdOutlineAssignmentTurnedIn,
} from "react-icons/md";
import { FiLogOut, FiMenu } from "react-icons/fi";
import { useNavigate } from "react-router-dom";
// Component imports
import ManageStudents from "./ManageStudent/ManageStudents";
import ManageTeachers from "./ManageTeacher/Manageteacher";
import AttendanceReport from "./AttendenceReport";
import ManageClasses from "./Manageclass/ViewClassDetail";
import MarkAttendance from "./MarkAttendence/MarkAttendence";
import HomeworkOverview from "./HomeworkOverview";
import ResultOverview from "./ResultOverview";
import LeaveManagement from "./LeaveManagement";
import Announcements from "./Announcements";

export default function AdminDashboard() {
  const [active, setActive] = useState("Dashboard");
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [showProfile, setShowProfile] = useState(false);
  const [profilePic, setProfilePic] = useState(null);
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  
  // State for dashboard data
  const [dashboardData, setDashboardData] = useState({
    students: [],
    teachers: [],
    events: [],
    notices: [],
    homework: [],
    loading: true,
    error: null
  });
  
  // Redirect if not authenticated or not admin
  useEffect(() => {
    if (!user || user.role?.toLowerCase() !== 'admin') {
      navigate('/login');
    }
  }, [user, navigate]);

  // Fetch dashboard data
  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setDashboardData(prev => ({ ...prev, loading: true, error: null }));
        
        console.log('Fetching dashboard data...');
        
        // Parallel API calls
        const [studentsRes, teachersRes, eventsRes, noticesRes, homeworkRes] = await Promise.all([
          studentAPI.getAllStudents().catch(err => { console.error('Students API error:', err); return []; }),
          teacherAPI.getAllTeachers().catch(err => { console.error('Teachers API error:', err); return []; }),
          eventAPI.getAllEvents().catch(err => { console.error('Events API error:', err); return []; }),
          noticeAPI.getAllNotices().catch(err => { console.error('Notices API error:', err); return []; }),
          homeworkAPI.getAllHomework().catch(err => { console.error('Homework API error:', err); return []; })
        ]);
        
        console.log('API Responses:', { studentsRes, teachersRes, eventsRes, noticesRes, homeworkRes });
        
        setDashboardData({
          students: Array.isArray(studentsRes) ? studentsRes : [],
          teachers: Array.isArray(teachersRes) ? teachersRes : [],
          events: Array.isArray(eventsRes) ? eventsRes : [],
          notices: noticesRes?.notices || (Array.isArray(noticesRes) ? noticesRes : []),
          homework: Array.isArray(homeworkRes) ? homeworkRes : [],
          loading: false,
          error: null
        });
      } catch (error) {
        console.error('Dashboard data fetch error:', error);
        setDashboardData(prev => ({
          ...prev,
          loading: false,
          error: error.message || 'Failed to fetch dashboard data'
        }));
      }
    };

    if (user?.role?.toLowerCase() === 'admin') {
      fetchDashboardData();
    }
  }, [user]);

  const menuItems = [
    { name: "Dashboard", icon: <MdAssessment /> },
    { name: "Manage Student", icon: <FaUserPlus /> },
    { name: "Manage Teacher", icon: <FaChalkboardTeacher /> },
    { name: "Manage Classes", icon: <FaSchool /> },
    { name: "Mark Attendance", icon: <MdOutlineAssignmentTurnedIn /> },
    { name: "Attendance Report", icon: <MdOutlineAssignmentTurnedIn /> },
    { name: "Homework Overview", icon: <FaBookOpen /> },
    { name: "Result Overview", icon: <MdLeaderboard /> },
    { name: "Leave Management", icon: <FaRegCalendarCheck /> },
    { name: "Announcements", icon: <MdCampaign /> },
  ];

  const handleLogout = () => {
    logout();
    navigate("/");
  };
  
  // Show loading if data is being fetched
  if (dashboardData.loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
        <div className="text-xl text-gray-600">Loading dashboard...</div>
      </div>
    );
  }
  
  // Show error if data fetch failed
  if (dashboardData.error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-xl text-red-600">Error: {dashboardData.error}</div>
      </div>
    );
  }
  
  // Calculate dashboard stats with safe defaults
  const totalStudents = Array.isArray(dashboardData.students) ? dashboardData.students.length : 0;
  const totalTeachers = Array.isArray(dashboardData.teachers) ? dashboardData.teachers.length : 0;
  const totalEvents = Array.isArray(dashboardData.events) ? dashboardData.events.length : 0;
  const totalNotices = Array.isArray(dashboardData.notices) ? dashboardData.notices.length : 0;
  const totalHomework = Array.isArray(dashboardData.homework) ? dashboardData.homework.length : 0;
  const totalClasses = 12; // Static for now

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
              🏫 Admin Panel
            </h1>
          )}
          <button
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className="text-gray-700 hover:text-gray-900 transition"
          >
            <FiMenu size={22} />
          </button>
        </div>

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
            Welcome, {user?.email?.split('@')[0] || "Admin"} 👋
          </h2>

          {/* 👤 Profile + Logout Buttons */}
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
          {active === "Dashboard" ? (
            <>
              <h2 className="text-2xl font-bold mb-6 text-[var(--text-secondary)]">
                📊 Dashboard Overview
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
                {[
                  {
                    title: "Total Students",
                    value: totalStudents.toString(),
                    icon: <FaUserPlus />,
                    color: "text-blue-600"
                  },
                  {
                    title: "Total Teachers",
                    value: totalTeachers.toString(),
                    icon: <FaChalkboardTeacher />,
                    color: "text-green-600"
                  },
                  { 
                    title: "Total Events", 
                    value: totalEvents.toString(), 
                    icon: <MdCampaign />,
                    color: "text-purple-600"
                  },
                  { 
                    title: "Total Notices", 
                    value: totalNotices.toString(), 
                    icon: <MdAssessment />,
                    color: "text-orange-600"
                  },
                  { 
                    title: "Total Homework", 
                    value: totalHomework.toString(), 
                    icon: <FaBookOpen />,
                    color: "text-red-600"
                  },
                  { 
                    title: "Total Classes", 
                    value: totalClasses.toString(), 
                    icon: <FaSchool />,
                    color: "text-indigo-600"
                  },
                ].map((stat, i) => (
                  <motion.div
                    key={i}
                    whileHover={{ scale: 1.05 }}
                    style={{
                      backgroundColor: "var(--card-bg)",
                      boxShadow: `-6px 4px 12px rgba(0, 0, 0, 0.25)`,
                    }}
                    className="p-5 rounded-2xl hover:shadow-[ -8px_6px_16px_rgba(0,0,0,0.35) ] transition duration-300"
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

              {/* Recent Activities Section */}
             
              {/* Recent Homework & Events */}
             
            </>
          ) : active === "Manage Student" ? (
            <ManageStudents />
          ) : active === "Manage Teacher" ? (
            <ManageTeachers />
          ) : active === "Manage Classes" ? (
            <ManageClasses />
          ) : active === "Mark Attendance" ? (
            <MarkAttendance />
          ) : active === "Attendance Report" ? (
            <AttendanceReport />
          ) : active === "Homework Overview" ? (
            <HomeworkOverview />
          ) : active === "Result Overview" ? (
            <ResultOverview />
          ) : active === "Leave Management" ? (
            <LeaveManagement />
          ) : active === "Announcements" ? (
            <Announcements />
          ) : (
            <p className="text-gray-700">
              You selected <strong>{active}</strong>. Content for this section
              will appear here.
            </p>
          )}
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
                <FaUserCircle size={80} className="text-gray-400 mb-2" />
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

            {/* Name & Email */}
            <div className="text-gray-700 space-y-2">
              <p>
                <strong>Name:</strong> {user?.email?.split('@')[0] || "Admin"}
              </p>
              <p>
                <strong>Email:</strong> {user?.email || "Not available"}
              </p>
              <p>
                <strong>Role:</strong> {user?.role || "Admin"}
              </p>
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
