// Axios library import kar rahe hain - HTTP requests ke liye
import axios from 'axios';

// Base API URL - Backend server ka address
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

// Axios instance create kar rahe hain with default configuration
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor - Har request se pehle token add karta hai
api.interceptors.request.use(
  (config) => {
    // localStorage se token get kar rahe hain
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor - Response handle karta hai
api.interceptors.response.use(
  (response) => {
    return response.data; // Sirf data return karte hain
  },
  (error) => {
    // Error handling
    if (error.response?.status === 401) {
      // Unauthorized - token invalid hai
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error.response?.data || error.message);
  }
);

// ========== AUTHENTICATION APIs ==========
export const authAPI = {
  login: (credentials) => api.post('/auth/login', credentials),
  register: (userData) => api.post('/auth/register', userData),
};

// ========== ADMIN APIs ==========
export const adminAPI = {
  getAllAdmins: () => api.get('/admin/admins'),
  getAdminById: (id) => api.get(`/admin/admins/${id}`),
  createAdmin: (adminData) => api.post('/admin/admins', adminData),
  updateAdmin: (id, adminData) => api.put(`/admin/admins/${id}`, adminData),
  deleteAdmin: (id) => api.delete(`/admin/admins/${id}`),
  getDashboardData: () => api.get('/admin/dashboard'),
  getAdminClasses: () => api.get('/admin/classes'),
};

// ========== STUDENT APIs ==========
export const studentAPI = {
  getAllStudents: () => api.get('/admin/students/all'),
  getStudentById: (id) => api.get(`/admin/students/${id}`),
  createStudent: (studentData) => api.post('/admin/students/add', studentData),
  updateStudent: (id, studentData) => api.put(`/admin/students/update/${id}`, studentData),
  deleteStudent: (id) => api.delete(`/admin/students/delete/${id}`),
  getUniqueSections: () => api.get('/admin/students/sections'),
};

// ========== TEACHER APIs ==========
export const teacherAPI = {
  getAllTeachers: () => api.get('/admin/teachers/all'),
  getTeacherById: (id) => api.get(`/admin/teachers/${id}`),
  createTeacher: (teacherData) => api.post('/admin/teachers/add', teacherData),
  updateTeacher: (id, teacherData) => api.put(`/admin/teachers/update/${id}`, teacherData),
  deleteTeacher: (id) => api.delete(`/admin/teachers/delete/${id}`),
  getMyStudents: () => api.get('/teacher/my-students'),
  getMySubjects: () => api.get('/teacher/my-subjects'),
  getMyClasses: () => api.get('/teacher/my-classes'),
  getMySections: () => api.get('/teacher/my-sections'),
  getMyExams: () => api.get('/teacher/my-exams'),
  getStudentsByClass: (className, section) => {
    const params = new URLSearchParams({ class: className });
    if (section) params.append('section', section);
    return api.get(`/teacher/students-by-class?${params}`);
  },
};

// ========== CLASS APIs ==========
export const classAPI = {
  getAllClasses: () => api.get('/admin/classes'),
  getClassById: (id) => api.get(`/admin/classes/${id}`),
  createClass: (classData) => api.post('/admin/classes', classData),
  updateClass: (id, classData) => api.put(`/admin/classes/${id}`, classData),
  deleteClass: (id) => api.delete(`/admin/classes/${id}`),
  createPredefinedClasses: () => api.post('/admin/classes/predefined'),
  deleteAllClasses: () => api.delete('/admin/classes/all'),
};

// ========== EVENT APIs ==========
export const eventAPI = {
  getAllEvents: () => api.get('/admin/events'),
  getEventById: (id) => api.get(`/admin/events/${id}`),
  createEvent: (eventData) => api.post('/admin/events', eventData),
  updateEvent: (id, eventData) => api.put(`/admin/events/${id}`, eventData),
  deleteEvent: (id) => api.delete(`/admin/events/${id}`),
};

// ========== NOTICE APIs ==========
export const noticeAPI = {
  getAllNotices: () => {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    const role = user.role?.toLowerCase() || 'student';
    const basePath = role === 'admin' ? '/admin' : role === 'teacher' ? '/teacher' : '/student';
    return api.get(`${basePath}/notices/all`);
  },
  getNoticeById: (id) => api.get(`/admin/notices/${id}`),
  createNotice: (noticeData) => api.post('/admin/notices/add', noticeData),
  updateNotice: (id, noticeData) => api.put(`/admin/notices/${id}`, noticeData),
  deleteNotice: (id) => api.delete(`/admin/notices/${id}`),
};

// ========== HOMEWORK APIs ==========
export const homeworkAPI = {
  getAllHomework: () => {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    const role = user.role?.toLowerCase() || 'student';
    let basePath = '/student';
    if (role === 'teacher') basePath = '/teacher';
    else if (role === 'admin') basePath = '/admin';
    return api.get(`${basePath}/homework/all`);
  },
  getHomeworkById: (id) => api.get(`/teacher/homework/${id}`),
  createHomework: (homeworkData) => api.post('/teacher/homework/add', homeworkData),
  updateHomework: (id, homeworkData) => api.put(`/teacher/homework/${id}`, homeworkData),
  deleteHomework: (id) => api.delete(`/teacher/homework/${id}`),
  getTeacherSubjects: () => api.get('/teacher/homework/teacher-subjects'),
  getAvailableClasses: () => api.get('/teacher/homework/available-classes'),
};

// ========== LEAVE APIs ==========
export const leaveAPI = {
  applyLeave: (leaveData) => api.post('/student/leave/apply', leaveData),
  getMyLeaves: () => api.get('/student/leave/my-leaves'),
  getAllLeaves: () => api.get('/admin/leaves/all'),
  getTeacherLeaves: () => api.get('/teacher/leaves/teacher-leaves'),
  getLeaveById: (id) => api.get(`/admin/leaves/${id}`),
  updateLeaveStatus: (id, status) => api.put(`/teacher/leaves/${id}`, { status }),
  deleteLeave: (id) => api.delete(`/admin/leaves/${id}`),
};

// ========== RESULT APIs ==========
export const resultAPI = {
  // Get all results (auto-filters by student role)
  getAllResults: () => {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    const role = user.role?.toLowerCase() || 'student';
    let basePath = '/student';
    if (role === 'teacher') basePath = '/teacher';
    else if (role === 'admin') basePath = '/admin';
    return api.get(`${basePath}/results/all`);
  },
  // Get result by ID
  getResultById: (id) => api.get(`/student/results/${id}`),
  // Create result (Teacher only)
  createResult: (resultData) => api.post('/teacher/results/add', resultData),
  // Update result (Teacher only)
  updateResult: (id, resultData) => api.put(`/teacher/results/${id}`, resultData),
  // Delete result (Teacher only)
  deleteResult: (id) => api.delete(`/teacher/results/${id}`),
};

// ========== EXAM APIs ==========
export const examAPI = {
  getAllExams: () => {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    const role = user.role?.toLowerCase() || 'student';
    const basePath = role === 'teacher' ? '/teacher' : '/student';
    return api.get(`${basePath}/exam/all`);
  },
  getExamById: (id) => api.get(`/teacher/exam/${id}`),
  createExam: (examData) => api.post('/teacher/exam/add', examData),
  updateExam: (id, examData) => api.put(`/teacher/exam/${id}`, examData),
  deleteExam: (id) => api.delete(`/teacher/exam/${id}`),
};

// ========== ATTENDANCE APIs ==========
export const attendanceAPI = {
  // Student Attendance
  markStudentAttendance: (attendanceData) => api.post('/attendance/student', attendanceData),
  
  // Get student attendance by student ID (for logged-in student)
  getStudentAttendance: (studentId) => api.get(`/attendance/student/${studentId}`),
  
  // Get all students attendance (Admin/Teacher only)
  getAllStudentsAttendance: () => api.get('/attendance/student'),
  
  // Update student attendance
  updateStudentAttendance: (id, attendanceData) => api.put(`/attendance/student/${id}`, attendanceData),
  
  // Delete student attendance (Admin only)
  deleteStudentAttendance: (id) => api.delete(`/attendance/student/${id}`),
  
  // Get my attendance (for currently logged-in student)
  getMyAttendance: () => {
    // Check for user object in localStorage
    let userId = null;
    
    // First try to get from 'user' JSON object
    const userJson = localStorage.getItem('user');
    if (userJson) {
      try {
        const user = JSON.parse(userJson);
        userId = user._id || user.userId;
      } catch (e) {
        console.error('Error parsing user from localStorage:', e);
      }
    }
    
    // If not found, try individual keys
    if (!userId) {
      userId = localStorage.getItem('userId');
    }
    
    if (userId) {
      return api.get(`/attendance/student/${userId}`);
    }
    return Promise.reject(new Error('User ID not found'));
  },
  
  // Teacher Attendance
  markTeacherAttendance: (attendanceData) => api.post('/attendance/teacher', attendanceData),
  getTeacherAttendance: (teacherId) => api.get(`/attendance/teacher/${teacherId}`),
  getAllTeachersAttendance: () => api.get('/attendance/teacher'),
  updateTeacherAttendance: (id, attendanceData) => api.put(`/attendance/teacher/${id}`, attendanceData),
  deleteTeacherAttendance: (id) => api.delete(`/attendance/teacher/${id}`),
};

// ========== HOLIDAY APIs ==========
export const holidayAPI = {
  getAllHolidays: () => api.get('/admin/holidays'),
  getHolidayById: (id) => api.get(`/admin/holidays/${id}`),
  createHoliday: (holidayData) => api.post('/admin/holidays', holidayData),
  updateHoliday: (id, holidayData) => api.put(`/admin/holidays/${id}`, holidayData),
  deleteHoliday: (id) => api.delete(`/admin/holidays/${id}`),
};

// ========== ANNOUNCEMENT APIs ==========
export const announcementAPI = {
  getAllAnnouncements: () => api.get('/admin/announcements'),
  getAnnouncementById: (id) => api.get(`/admin/announcements/${id}`),
  createAnnouncement: (announcementData) => api.post('/admin/announcements', announcementData),
  updateAnnouncement: (id, announcementData) => api.put(`/admin/announcements/${id}`, announcementData),
  deleteAnnouncement: (id) => api.delete(`/admin/announcements/${id}`),
};

// ========== FEE APIs ==========
export const feeAPI = {
  createFeeStructure: (feeData) => api.post('/admin/fees/structure', feeData),
  getAllFeeStructures: () => api.get('/admin/fees/structure'),
  getFeeByClassSection: (className, section) => api.get(`/admin/fees/structure/${className}/${section}`),
  updateFeeStructure: (id, feeData) => api.put(`/admin/fees/structure/${id}`, feeData),
  deleteFeeStructure: (id) => api.delete(`/admin/fees/structure/${id}`),
  recordPayment: (paymentData) => api.post('/admin/fees/payment', paymentData),
  getAllPayments: () => api.get('/admin/fees/payments'),
  getStudentPayments: (studentId) => api.get(`/student/fees/payments/student/${studentId}`),
  getPendingFees: () => api.get('/admin/fees/pending'),
  getReceipt: (id) => api.get(`/admin/fees/receipt/${id}`),
};

// Default export - main api instance
export default api;
