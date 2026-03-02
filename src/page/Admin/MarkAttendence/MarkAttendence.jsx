// 📁 src/components/Attendence/MarkAttendance.jsx
import React, { useState } from "react";
import { motion } from "framer-motion";// eslint-disable-line
import { FaUserGraduate, FaChalkboardTeacher } from "react-icons/fa";
import StudentAttendance from "./StudentAttendence";
import TeacherAttendance from "./TeacherAttendence";

export default function MarkAttendance() {
  const [selectedType, setSelectedType] = useState(null);

  if (selectedType === "student") return <StudentAttendance goBack={()=>setSelectedType(null)}/> ;
  if (selectedType === "teacher") return  <TeacherAttendance goBack={()=>setSelectedType(null)}/>;

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="flex flex-col items-center justify-center min-h-[70vh] space-y-8"
    >
      <h2 className="text-2xl font-bold text-gray-800">Mark Attendance</h2>
      <div className="flex gap-8">
        <motion.div
          whileHover={{ scale: 1.05 }}
          onClick={() => setSelectedType("student")}
          className="cursor-pointer bg-[var(--card-bg)] hover:bg-[var(--button-secondary-hover)] text-white px-10 py-6 rounded-2xl shadow-2xl flex flex-col items-center"
        >
          <FaUserGraduate size={40} className="mb-3 text-[var(--text-primary)]" />
          <h3 className="text-lg text-[var(--text-primary)] font-semibold">Student Attendance</h3>
        </motion.div>

        <motion.div
          whileHover={{ scale: 1.05 }}
          onClick={() => setSelectedType("teacher")}
          className="cursor-pointer bg-[var(--card-bg)] hover:bg-[var(--button-secondary-hover)] text-white px-10 py-6 rounded-2xl shadow-2xl flex flex-col items-center"
        >
          <FaChalkboardTeacher size={40} className="mb-3 text-[var(--text-primary)]" />
          <h3 className="text-lg text-[var(--text-primary)] font-semibold">Teacher Attendance</h3>
        </motion.div>
      </div>
    </motion.div>
  );
}
