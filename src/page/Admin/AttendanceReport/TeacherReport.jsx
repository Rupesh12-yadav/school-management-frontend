import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { teacherAPI, attendanceAPI } from "../../../services/api";

const TeacherReport = () => {
  const [teachers, setTeachers] = useState([]);
  const [teacherName, setTeacherName] = useState("");
  const [filter, setFilter] = useState("weekly");
  const [chartData, setChartData] = useState([]);
  const [attendance, setAttendance] = useState([]);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [teachersData, attendanceData] = await Promise.all([
        teacherAPI.getAllTeachers(),
        attendanceAPI.getAllTeachersAttendance()
      ]);
      console.log('Teachers:', teachersData);
      console.log('Attendance:', attendanceData);
      setTeachers(Array.isArray(teachersData) ? teachersData : teachersData.data || []);
      setAttendance(attendanceData.data || attendanceData || []);
    } catch (error) {
      console.error('Error:', error);
      setTeachers([]);
      setAttendance([]);
    }
  };

  const handleSubmit = () => {
    if (!teacherName || !Array.isArray(attendance)) return;
    const teacher = teachers.find(t => t.name === teacherName);
    if (!teacher) return;

    const teacherAtt = attendance.filter(att => {
      const tid = att.teacher?._id || att.teacher;
      return String(tid) === String(teacher._id);
    });

    console.log('Filtered Attendance:', teacherAtt);

    if (teacherAtt.length === 0) {
      alert('No attendance found');
      return;
    }

    const processed = processData(teacherAtt, filter);
    console.log('Processed Data:', processed);
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
        
        console.log('Checking date:', dateStr);
        
        const dayRecords = records.filter(rec => {
          const recDate = new Date(rec.date);
          const recYear = recDate.getFullYear();
          const recMonth = String(recDate.getMonth() + 1).padStart(2, '0');
          const recDay = String(recDate.getDate()).padStart(2, '0');
          const recDateStr = `${recYear}-${recMonth}-${recDay}`;
          console.log('Record date:', recDateStr, 'Status:', rec.status);
          return recDateStr === dateStr;
        });
        
        const present = dayRecords.filter(r => r.status === 'Present').length;
        const value = dayRecords.length > 0 ? (present / dayRecords.length) : 0;
        
        console.log(`${dayName} (${dateStr}): ${dayRecords.length} records, ${present} present, value: ${value}`);
        
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

  useEffect(() => {
    if (teacherName && attendance.length > 0) {
      handleSubmit();
    }
  }, [filter]);

  const fadeUp = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.4 } },
  };

  return (
    <motion.div
      key="teacher"
      variants={fadeUp}
      initial="hidden"
      animate="visible"
      exit="hidden"
      className="bg-white/80 backdrop-blur-md p-6 md:p-8 rounded-xl shadow-lg max-w-4xl mx-auto w-full"
    >
      <h2 className="text-2xl font-bold mb-5 text-gray-800 text-center sm:text-left">
        Teacher Attendance Report
      </h2>

      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <select
          value={teacherName}
          onChange={(e) => setTeacherName(e.target.value)}
          className="flex-1 border p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-400"
        >
          <option value="">Select Teacher</option>
          {teachers.map((teacher, i) => (
            <option key={i} value={teacher.name}>
              {teacher.name}
            </option>
          ))}
        </select>
        <button
          onClick={handleSubmit}
          className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:scale-105 transition"
        >
          View Report
        </button>
      </div>

      <div className="flex justify-center gap-3 mb-6">
        {["weekly", "monthly", "yearly"].map((type) => (
          <button
            key={type}
            onClick={() => setFilter(type)}
            className={`px-4 py-2 rounded-lg text-sm font-semibold transition ${
              filter === type ? "bg-indigo-600 text-white" : "bg-gray-200 hover:bg-gray-300"
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
            <Line type="monotone" dataKey="value" stroke="#6366f1" strokeWidth={3} dot={{ r: 4 }} activeDot={{ r: 8 }} />
          </LineChart>
        </ResponsiveContainer>
      )}
    </motion.div>
  );
};

export default TeacherReport;
