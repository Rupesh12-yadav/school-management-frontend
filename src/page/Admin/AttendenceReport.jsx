import React, { useState, useEffect } from "react";
import { AnimatePresence } from "framer-motion";
import { studentAPI, teacherAPI, attendanceAPI } from "../../services/api";
import ClassReport from "./AttendanceReport/ClassReport";
import StudentReport from "./AttendanceReport/StudentReport";
import TeacherReport from "./AttendanceReport/TeacherReport";

const AttendanceReport = () => {
  const [selectedOption, setSelectedOption] = useState("class");
  const [selectedClass, setSelectedClass] = useState("");
  const [filter, setFilter] = useState("weekly");
  const [percentage, setPercentage] = useState(null);
  const [studentName, setStudentName] = useState("");
  const [studentClass, setStudentClass] = useState("");
  const [teacherName, setTeacherName] = useState("");
  const [students, setStudents] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [teacherAttendance, setTeacherAttendance] = useState([]);
  const [studentAttendance, setStudentAttendance] = useState([]);
  const [chartData, setChartData] = useState({ weekly: [], monthly: [], yearly: [] });

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        const [studentsData, teachersData, studentAttData, teacherAttData] = await Promise.all([
          studentAPI.getAllStudents(),
          teacherAPI.getAllTeachers(),
          attendanceAPI.getAllStudentsAttendance(),
          attendanceAPI.getAllTeachersAttendance()
        ]);
        console.log('Fetched Student Attendance:', studentAttData);
        console.log('Fetched Teacher Attendance:', teacherAttData);
        setStudents(studentsData.data || studentsData || []);
        setTeachers(teachersData.data || teachersData || []);
        setStudentAttendance(studentAttData || []);
        setTeacherAttendance(teacherAttData || []);
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, []);
  
  // Get unique classes from students
  const classes = [...new Set(students.map(s => `${s.class} - ${s.section}`))];
  
  // Get student names for dropdown
  const studentOptions = students.map(s => ({
    name: `${s.name} ${s.lastname}`,
    class: `${s.class} - ${s.section}`,
    id: s._id
  }));
  
  // Get teacher names for dropdown
  const teacherOptions = teachers.map(t => ({
    name: t.name,
    subjects: t.subjects?.join(", ") || "No subjects",
    id: t._id
  }));

  // Get class attendance data
  const getClassAttendanceData = (className) => {
    if (!className) return { weekly: [], monthly: [], yearly: [] };
    
    const classStudents = students.filter(s => `${s.class} - ${s.section}` === className);
    const classStudentIds = classStudents.map(s => s._id);
    
    const classAttendance = studentAttendance.filter(att => 
      classStudentIds.includes(att.student?._id || att.studentId)
    );
    
    return {
      weekly: processAttendanceData(classAttendance, 'weekly'),
      monthly: processAttendanceData(classAttendance, 'monthly'),
      yearly: processAttendanceData(classAttendance, 'yearly')
    };
  };

  // Process attendance data for charts
  const processAttendanceData = (attendanceRecords, filter) => {
    if (!attendanceRecords || attendanceRecords.length === 0) {
      return [];
    }

    const now = new Date();
    let filteredData = [];

    if (filter === 'weekly') {
      const weekDays = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
      const last7Days = attendanceRecords.slice(-7);
      
      filteredData = weekDays.map((day, index) => {
        const record = last7Days[index];
        if (record) {
          const present = record.status === 'Present' ? 100 : 0;
          return { name: day, value: present, status: record.status };
        }
        return { name: day, value: 0, status: 'N/A' };
      });
    } else if (filter === 'monthly') {
      const weeks = ['Week 1', 'Week 2', 'Week 3', 'Week 4'];
      const last30Days = attendanceRecords.slice(-30);
      
      filteredData = weeks.map((week, index) => {
        const weekData = last30Days.slice(index * 7, (index + 1) * 7);
        const presentCount = weekData.filter(d => d.status === 'Present').length;
        const percentage = weekData.length > 0 ? Math.round((presentCount / weekData.length) * 100) : 0;
        const status = percentage > 75 ? 'Present' : percentage > 50 ? 'Leave' : 'Absent';
        return { name: week, value: percentage, status };
      });
    } else if (filter === 'yearly') {
      const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      
      filteredData = months.map((month, index) => {
        const monthData = attendanceRecords.filter(record => {
          const recordDate = new Date(record.date);
          return recordDate.getMonth() === index;
        });
        
        const presentCount = monthData.filter(d => d.status === 'Present').length;
        const percentage = monthData.length > 0 ? Math.round((presentCount / monthData.length) * 100) : 0;
        const status = percentage > 75 ? 'Present' : percentage > 50 ? 'Leave' : 'Absent';
        return { name: month, value: percentage, status };
      });
    }

    return filteredData;
  };

  const handleStudentSubmit = async () => {
    if (!studentName || !studentClass) return;
    
    try {
      const selectedStudent = studentOptions.find(s => s.name === studentName);
      if (!selectedStudent) return;
      
      console.log('Selected Student:', selectedStudent);
      console.log('All Student Attendance:', studentAttendance);
      
      // Filter attendance for selected student
      const studentAtt = studentAttendance.filter(
        att => {
          const studentId = att.student?._id || att.student;
          return studentId === selectedStudent.id || String(studentId) === String(selectedStudent.id);
        }
      );
      
      console.log('Filtered Student Attendance:', studentAtt);
      
      if (studentAtt.length > 0) {
        const totalDays = studentAtt.length;
        const presentDays = studentAtt.filter(att => att.status === "Present").length;
        const calculatedPercentage = Math.round((presentDays / totalDays) * 100);
        setPercentage(calculatedPercentage);
        
        // Process chart data
        const processedData = {
          weekly: processAttendanceData(studentAtt, 'weekly'),
          monthly: processAttendanceData(studentAtt, 'monthly'),
          yearly: processAttendanceData(studentAtt, 'yearly')
        };
        console.log('Processed Chart Data:', processedData);
        setChartData(processedData);
      } else {
        setPercentage(0);
        setChartData({ weekly: [], monthly: [], yearly: [] });
        alert('No attendance records found for this student');
      }
    } catch (error) {
      console.error('Error calculating student attendance:', error);
      setPercentage(0);
    }
  };

  const handleTeacherSubmit = async () => {
    if (!teacherName) return;
    
    try {
      const selectedTeacher = teacherOptions.find(t => t.name === teacherName);
      if (!selectedTeacher) return;
      
      console.log('Selected Teacher:', selectedTeacher);
      console.log('All Teacher Attendance:', teacherAttendance);
      
      // Filter attendance for selected teacher
      const teacherAtt = teacherAttendance.filter(
        att => {
          const teacherId = att.teacher?._id || att.teacher;
          return teacherId === selectedTeacher.id || String(teacherId) === String(selectedTeacher.id);
        }
      );
      
      console.log('Filtered Teacher Attendance:', teacherAtt);
      
      if (teacherAtt.length > 0) {
        const totalDays = teacherAtt.length;
        const presentDays = teacherAtt.filter(att => att.status === "Present").length;
        const calculatedPercentage = Math.round((presentDays / totalDays) * 100);
        setPercentage(calculatedPercentage);
        
        // Process chart data
        const processedData = {
          weekly: processAttendanceData(teacherAtt, 'weekly'),
          monthly: processAttendanceData(teacherAtt, 'monthly'),
          yearly: processAttendanceData(teacherAtt, 'yearly')
        };
        console.log('Processed Chart Data:', processedData);
        setChartData(processedData);
      } else {
        setPercentage(0);
        setChartData({ weekly: [], monthly: [], yearly: [] });
        alert('No attendance records found for this teacher');
      }
    } catch (error) {
      console.error('Error calculating teacher attendance:', error);
      setPercentage(0);
    }
  };

  return (
    <div className="min-h-screen p-4 sm:p-6 md:p-8">
      <div className="flex flex-wrap justify-center gap-4 sm:gap-6 mb-8">
        {[
          { label: "Class Report", value: "class" },
          { label: "Student Report", value: "student" },
          { label: "Teacher Report", value: "teacher" },
        ].map((btn) => (
          <button
            key={btn.value}
            onClick={() => {
              setSelectedOption(btn.value);
              setPercentage(null);
            }}
            className={`w-full sm:w-auto px-6 py-2 rounded-lg font-semibold transition ${
              selectedOption === btn.value
                ? "bg-blue-600 text-white shadow-lg"
                : "bg-gray-200 text-gray-700 hover:bg-gray-300"
            }`}
          >
            {btn.label}
          </button>
        ))}
      </div>

      <AnimatePresence mode="wait">
        {selectedOption === "class" && (
          <ClassReport
            classes={classes}
            selectedClass={selectedClass}
            setSelectedClass={setSelectedClass}
            filter={filter}
            setFilter={setFilter}
          />
        )}

        {selectedOption === "student" && (
          <StudentReport
            studentOptions={studentOptions}
            classes={classes}
            studentName={studentName}
            setStudentName={setStudentName}
            studentClass={studentClass}
            setStudentClass={setStudentClass}
            handleStudentSubmit={handleStudentSubmit}
            filter={filter}
            setFilter={setFilter}
            percentage={percentage}
            chartData={chartData}
          />
        )}

        {selectedOption === "teacher" && (
          <TeacherReport
            teacherOptions={teacherOptions}
            teacherName={teacherName}
            setTeacherName={setTeacherName}
            handleTeacherSubmit={handleTeacherSubmit}
            filter={filter}
            setFilter={setFilter}
            percentage={percentage}
            chartData={chartData}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

export default AttendanceReport;
