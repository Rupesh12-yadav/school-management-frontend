import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { studentAPI, attendanceAPI } from "../../../services/api";

const ClassReport = () => {
  const [chartData, setChartData] = useState([]);
  const [students, setStudents] = useState([]);
  const [attendance, setAttendance] = useState([]);
  const [selectedClass, setSelectedClass] = useState("");
  const [filter, setFilter] = useState("weekly");

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    if (selectedClass && students.length > 0 && attendance.length > 0) {
      processClassData();
    }
  }, [selectedClass, filter, students, attendance]);

  const fetchData = async () => {
    try {
      const [studentsData, attendanceData] = await Promise.all([
        studentAPI.getAllStudents(),
        attendanceAPI.getAllStudentsAttendance()
      ]);
      setStudents(Array.isArray(studentsData) ? studentsData : studentsData.data || []);
      setAttendance(attendanceData.data || attendanceData || []);
    } catch (error) {
      console.error('Error:', error);
      setStudents([]);
      setAttendance([]);
    }
  };

  const processClassData = () => {
    const classStudents = students.filter(s => `${s.class} - ${s.section}` === selectedClass);
    const classStudentIds = classStudents.map(s => s._id);
    const classAttendance = attendance.filter(att => {
      const sid = att.student?._id || att.student;
      return classStudentIds.includes(sid);
    });
    
    const processed = processData(classAttendance, filter);
    setChartData(processed);
  };

  const processData = (records, filterType) => {
    if (filterType === 'weekly') {
      const today = new Date();
      const last7Days = [];
      
      for (let i = 6; i >= 0; i--) {
        const date = new Date(today);
        date.setDate(today.getDate() - i);
        last7Days.push(date);
      }
      
      const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
      
      return last7Days.map(date => {
        const dayName = days[date.getDay()];
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        const dateStr = `${year}-${month}-${day}`;
        
        const dayRecords = records.filter(rec => {
          const recDate = new Date(rec.date);
          const recYear = recDate.getFullYear();
          const recMonth = String(recDate.getMonth() + 1).padStart(2, '0');
          const recDay = String(recDate.getDate()).padStart(2, '0');
          const recDateStr = `${recYear}-${recMonth}-${recDay}`;
          return recDateStr === dateStr;
        });
        
        const present = dayRecords.filter(r => r.status === 'Present').length;
        const value = dayRecords.length > 0 ? (present / dayRecords.length) : 0;
        
        return { name: dayName, value };
      });
    } else if (filterType === 'monthly') {
      const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      return months.map((month, i) => {
        const monthData = records.filter(r => new Date(r.date).getMonth() === i);
        const present = monthData.filter(d => d.status === 'Present').length;
        return { name: month, value: monthData.length ? (present / monthData.length) : 0 };
      });
    } else {
      const currentYear = new Date().getFullYear();
      const years = [currentYear - 2, currentYear - 1, currentYear, currentYear + 1, currentYear + 2];
      return years.map(year => {
        const yearData = records.filter(r => new Date(r.date).getFullYear() === year);
        const present = yearData.filter(d => d.status === 'Present').length;
        return { name: year.toString(), value: yearData.length ? (present / yearData.length) : 0 };
      });
    }
  };

  const classes = [...new Set(students.map(s => `${s.class} - ${s.section}`))];
  const classStudents = students.filter(s => `${s.class} - ${s.section}` === selectedClass);
  const fadeUp = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.4 } },
  };

  return (
    <motion.div
      key="class"
      variants={fadeUp}
      initial="hidden"
      animate="visible"
      exit="hidden"
      className="bg-white/80 backdrop-blur-md p-6 md:p-8 rounded-xl shadow-lg max-w-4xl mx-auto w-full"
    >
      <h2 className="text-2xl font-bold mb-5 text-gray-800 text-center sm:text-left">
        Class Attendance Report
      </h2>

      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <select
          value={selectedClass}
          onChange={(e) => setSelectedClass(e.target.value)}
          className="flex-1 border p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
        >
          <option value="">Select Class</option>
          {classes.map((cls, i) => (
            <option key={i} value={cls}>{cls}</option>
          ))}
        </select>
      </div>

      <div className="flex justify-center gap-3 mb-6">
        {["weekly", "monthly", "yearly"].map((type) => (
          <button
            key={type}
            onClick={() => setFilter(type)}
            className={`px-4 py-2 rounded-lg text-sm font-semibold transition ${
              filter === type ? "bg-blue-600 text-white" : "bg-gray-200 hover:bg-gray-300"
            }`}
          >
            {type.charAt(0).toUpperCase() + type.slice(1)}
          </button>
        ))}
      </div>

      {chartData.length > 0 && (
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={chartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis domain={[0, 1]} />
            <Tooltip />
            <Line type="monotone" dataKey="value" stroke="#2563EB" strokeWidth={3} dot={{ r: 4 }} activeDot={{ r: 8 }} />
          </LineChart>
        </ResponsiveContainer>
      )}
    </motion.div>
  );
};

export default ClassReport;
