import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useAuth } from "../../context/AuthProvider";
import { 
  FaBookOpen, 
  FaClipboardList, 
  FaUpload, 
  FaUserCircle,
  FaChalkboardTeacher,
  FaUsers,
  FaCalendarCheck,
  FaExclamationCircle
} from "react-icons/fa";
import { MdCampaign, MdEventNote, MdAssessment } from "react-icons/md";
import { IoIosPaper } from "react-icons/io";
import { FiLogOut, FiMenu } from "react-icons/fi";
import { useNavigate } from "react-router-dom";
import AddHomework from "./AddHomework";
import ViewNotice from "./ViewNotice";
import MarkAttendance from "./MarkAttendence";
import PostExam from "./PostExam";
import LeaveRequests from "./LeaveRequest";
import MarksUpload from "./UplodeMarks";
import { teacherAPI, homeworkAPI, attendanceAPI, leaveAPI } from "../../services/api";

export default function TeacherDashboard() {
  const [active, setActive] = useState("Dashboard");
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [showProfile, setShowProfile] = useState(false);
  const [profilePic, setProfilePic] = useState(null);
  const [dashboardData, setDashboardData] = useState({
    myClasses: "0",
    totalStudents: "0",
    pendingHomework: "0",
    todayAttendance: "0",
    pendingLeaves: "0"
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  // Redirect if not authenticated or not teacher
  useEffect(() => {
    if (!user || user.role?.toLowerCase() !== 'teacher') {
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
      setError(null);
      
      const today = new Date().toISOString().split('T')[0];
      console.log('Today date:', today);
      
      // Initialize data with defaults
      let classes = [];
      let students = [];
      let homework = [];
      let attendance = [];
      let leaves = [];
      
      // Fetch data individually with error handling
      try {
        const classesRes = await teacherAPI.getMyClasses();
        classes = Array.isArray(classesRes) ? classesRes : [];
        console.log('Classes:', classes);
      } catch (e) {
        console.error('Error fetching classes:', e);
      }
      
      try {
        const studentsRes = await teacherAPI.getMyStudents();
        students = Array.isArray(studentsRes) ? studentsRes : [];
        console.log('Students:', students);
      } catch (e) {
        console.error('Error fetching students:', e);
      }
      
      try {
        const homeworkRes = await homeworkAPI.getAllHomework();
        homework = Array.isArray(homeworkRes) ? homeworkRes : homeworkRes?.data || [];
        console.log('Homework:', homework);
      } catch (e) {
        console.error('Error fetching homework:', e);
      }
      
      try {
        const attendanceRes = await attendanceAPI.getAllStudentsAttendance();
        attendance = Array.isArray(attendanceRes) ? attendanceRes : attendanceRes?.data || attendanceRes?.attendance || [];
        console.log('Attendance:', attendance);
      } catch (e) {
        console.error('Error fetching attendance:', e);
      }
      
      try {
        const leavesRes = await leaveAPI.getTeacherLeaves();
        leaves = Array.isArray(leavesRes) ? leavesRes : leavesRes?.data || [];
        console.log('Leaves:', leaves);
      } catch (e) {
        console.error('Error fetching leaves:', e);
      }
      
      // Filter pending leaves
      const pendingLeaves = leaves.filter(l => l.status === 'Pending').length;
      
      // Count today's attendance (Present only)
      const todayAttendance = attendance.filter(a => {
        if (!a.date) return false;
        try {
          const attDate = new Date(a.date).toISOString().split('T')[0];
          return attDate === today && a.status === 'Present';
        } catch (e) {
          return false;
        }
      });
      
      console.log('Today attendance count:', todayAttendance.length);
      
      setDashboardData({
        myClasses: classes.length.toString(),
        totalStudents: students.length.toString(),
        pendingHomework: homework.length.toString(),
        todayAttendance: todayAttendance.length.toString(),
        pendingLeaves: pendingLeaves.toString()
      });
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      setError("Failed to load dashboard data: " + error.message);
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
    { name: "Add Homework", icon: <FaBookOpen /> },
    { name: "View Notice", icon: <MdCampaign /> },
    { name: "Mark Attendance", icon: <MdEventNote /> },
    { name: "Post Exam", icon: <IoIosPaper /> },
    { name: "Leave Request", icon: <FaClipboardList /> },
    { name: "Upload Marks", icon: <FaUpload /> },
  ];

  // Dashboard stats with API data
  const dashboardStats = [
    { title: "My Classes", value: dashboardData.myClasses, icon: <FaChalkboardTeacher />, color: "text-blue-600" },
    { title: "Total Students", value: dashboardData.totalStudents, icon: <FaUsers />, color: "text-green-600" },
    { title: "Pending Homework", value: dashboardData.pendingHomework, icon: <FaBookOpen />, color: "text-orange-600" },
    { title: "Today's Attendance", value: dashboardData.todayAttendance, icon: <FaCalendarCheck />, color: "text-purple-600" },
    { title: "Pending Leaves", value: dashboardData.pendingLeaves, icon: <FaClipboardList />, color: "text-red-600" },
  ];

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
        className="text-gray-900 p-4 flex flex-col border-r border-yellow-200 z-20"
      >
        <div className="flex items-center justify-between mb-6">
          {isSidebarOpen && (
            <h1 className="text-xl font-bold text-gray-800 drop-shadow-sm">
              👨🏫 Teacher Panel
            </h1>
          )}
          <button
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className="text-gray-700 hover:text-gray-900 transition"
          >
            <FiMenu size={22} />
          </button>
        </div>

        {/* Teacher Profile Section */}
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
                <FaUserCircle size={64} className="text-gray-400 mb-2" />
              )}
              <h3 className="font-semibold text-gray-800">{user?.name || "Teacher"}</h3>
              <p className="text-sm text-gray-600">{user?.email}</p>
              <p className="text-xs text-gray-500 mt-1">{user?.subjects?.join(", ") || "Teacher"}</p>
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
            Welcome, {user?.name || "Teacher"} 👋
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
          {isLoading ? (
            <div className="flex items-center justify-center h-64">
              <div className="text-xl text-yellow-600">Loading dashboard...</div>
            </div>
          ) : error ? (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded flex items-center gap-2">
              <FaExclamationCircle />
              {error}
            </div>
          ) : active === "Dashboard" ? (
            <>
              <h2 className="text-2xl font-bold mb-6 text-[var(--text-secondary)]">
                📊 Teacher Dashboard
              </h2>

              {/* Dashboard Stats */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6 mb-10">
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

              {/* Quick Actions */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-8">
                <motion.div
                  className="p-6 rounded-2xl shadow-sm"
                  style={{
                    backgroundColor: "var(--background-color)",
                    boxShadow: `-6px 4px 12px rgba(0, 0, 0, 0.25)`,
                  }}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.3 }}
                >
                  <h3 className="text-lg font-semibold text-[var(--text-secondary)] mb-4">
                    📚 Quick Actions
                  </h3>
                  <div className="space-y-3">
                    <button 
                      onClick={() => setActive("Add Homework")}
                      className="w-full flex items-center justify-between p-3 bg-blue-50 rounded-lg hover:bg-blue-100 transition"
                    >
                      <span className="font-medium text-gray-800">Add New Homework</span>
                      <span className="text-blue-600">→</span>
                    </button>
                    <button 
                      onClick={() => setActive("Mark Attendance")}
                      className="w-full flex items-center justify-between p-3 bg-green-50 rounded-lg hover:bg-green-100 transition"
                    >
                      <span className="font-medium text-gray-800">Mark Today's Attendance</span>
                      <span className="text-green-600">→</span>
                    </button>
                    <button 
                      onClick={() => setActive("Post Exam")}
                      className="w-full flex items-center justify-between p-3 bg-purple-50 rounded-lg hover:bg-purple-100 transition"
                    >
                      <span className="font-medium text-gray-800">Create New Exam</span>
                      <span className="text-purple-600">→</span>
                    </button>
                    <button 
                      onClick={() => setActive("Upload Marks")}
                      className="w-full flex items-center justify-between p-3 bg-orange-50 rounded-lg hover:bg-orange-100 transition"
                    >
                      <span className="font-medium text-gray-800">Upload Student Marks</span>
                      <span className="text-orange-600">→</span>
                    </button>
                  </div>
                </motion.div>

                <motion.div
                  className="p-6 rounded-2xl shadow-sm"
                  style={{
                    backgroundColor: "var(--background-color)",
                    boxShadow: `-6px 4px 12px rgba(0, 0, 0, 0.25)`,
                  }}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.4 }}
                >
                  <h3 className="text-lg font-semibold text-[var(--text-secondary)] mb-4">
                    📋 Pending Tasks
                  </h3>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between p-3 bg-yellow-50 rounded-lg">
                      <div>
                        <p className="font-medium text-gray-800">Review Leave Requests</p>
                        <p className="text-sm text-gray-600">Check pending applications</p>
                      </div>
                      <button 
                        onClick={() => setActive("Leave Request")}
                        className="px-3 py-1 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 text-sm"
                      >
                        Review
                      </button>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-red-50 rounded-lg">
                      <div>
                        <p className="font-medium text-gray-800">Upcoming Exams</p>
                        <p className="text-sm text-gray-600">No exams scheduled</p>
                      </div>
                      <button 
                        onClick={() => setActive("Post Exam")}
                        className="px-3 py-1 bg-red-500 text-white rounded-lg hover:bg-red-600 text-sm"
                      >
                        Schedule
                      </button>
                    </div>
                  </div>
                </motion.div>
              </div>
            </>
          ) : active === "Add Homework" ? (
            <AddHomework />
          ) : active === "View Notice" ? (
            <ViewNotice />
          ) : active === "Mark Attendance" ? (
            <MarkAttendance />
          ) : active === "Post Exam" ? (
            <PostExam />
          ) : active === "Leave Request" ? (
            <LeaveRequests />
          ) : active === "Upload Marks" ? (
            <MarksUpload />
          ) : (
            <p className="text-gray-600">
              You have selected "{active}". Content for this section will be displayed here.
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

            {/* Details */}
            <div className="text-gray-700 space-y-2">
              <p><strong>Name:</strong> {user?.name || "Teacher"}</p>
              <p><strong>Email:</strong> {user?.email || "Not available"}</p>
              <p><strong>Role:</strong> {user?.role || "Teacher"}</p>
              <p><strong>Subjects:</strong> {user?.subjects?.join(", ") || "Not assigned"}</p>
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
