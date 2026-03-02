import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { teacherAPI, attendanceAPI } from "../../../services/api";

export default function TeacherAttendance({ goBack }) {
  const [teachersData, setTeachersData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    const fetchTeachers = async () => {
      try {
        const data = await teacherAPI.getAllTeachers();
        setTeachersData(data.data || data || []);
      } catch (error) {
        console.error('Error fetching teachers:', error);
        alert('Failed to load teachers');
      } finally {
        setIsLoading(false);
      }
    };
    fetchTeachers();
  }, []);
  
  const teachers = teachersData.map(teacher => ({
    id: teacher._id,
    name: teacher.name,
    subjects: teacher.subjects?.join(", ") || "No subjects",
    experience: teacher.experience || 0
  }));

  const [attendance, setAttendance] = useState({});
  const [savedAttendance, setSavedAttendance] = useState(null);
  const [viewMode, setViewMode] = useState("mark");

  useEffect(() => {
    const stored = localStorage.getItem("teacherAttendance");
    if (stored) setSavedAttendance(JSON.parse(stored));
  }, []);

  useEffect(() => {
    if (savedAttendance)
      localStorage.setItem("teacherAttendance", JSON.stringify(savedAttendance));
  }, [savedAttendance]);

  const handleMark = (id, status) => {
    if (viewMode === "view" || viewMode === "completed") return;
    setAttendance((prev) => ({ ...prev, [id]: status }));
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const attendancePromises = Object.entries(attendance).map(([teacherId, status]) =>
        attendanceAPI.markTeacherAttendance({
          teacherId: teacherId,
          status,
          date: new Date().toISOString()
        })
      );
      
      await Promise.all(attendancePromises);
      
      const currentDate = new Date().toLocaleDateString();
      setSavedAttendance({
        data: attendance,
        date: currentDate,
      });
      
      alert('Teacher attendance saved successfully!');
      setViewMode("completed");
    } catch (error) {
      console.error('Error saving attendance:', error);
      alert(error.message || 'Failed to save attendance');
    } finally {
      setIsSaving(false);
    }
  };

  const handleView = () => {
    setAttendance(savedAttendance.data);
    setViewMode("view");
  };

  const handleEdit = () => {
    setAttendance(savedAttendance.data);
    setViewMode("mark");
  };

  const allMarked =
    teachers.length > 0 && teachers.every((t) => attendance[t.id]);
    
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-xl">Loading teachers...</div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="p-8 bg-white rounded-2xl shadow-lg max-w-4xl mx-auto w-full"
    >
      {/* 🔙 Back Button */}
      <button
        onClick={goBack}
         style={{
          backgroundColor: "var(--primary-color)",
          color: "var(--button-text)",
          boxShadow: "0 3px 6px rgba(0,0,0,0.2)",
        }}
        className="font-semibold px-4 py-2 rounded-xl transition"
      >
        ← Back
      </button>

      <h2 className="text-2xl font-semibold mb-6 text-gray-800 text-center">
        Teacher Attendance
      </h2>

      {/* 🗂️ Saved Record */}
      {savedAttendance && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex justify-between items-center bg-gray-50 border rounded-xl p-4 shadow-sm mb-8"
        >
          <div className="font-semibold text-gray-800">Previous Attendance</div>
          <div className="font-semibold text-gray-700">
            📅 {savedAttendance.date}
          </div>
          <div className="flex gap-2">
            <button
              onClick={handleView}
              className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
            >
              View
            </button>
            <button
              onClick={handleEdit}
              className="px-4 py-2 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600"
            >
              Edit
            </button>
          </div>
        </motion.div>
      )}

      {/* 🧾 Attendance Table */}
      {(viewMode === "mark" || viewMode === "view") && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.1 }}
        >
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-green-50 border-b">
                <th className="p-3 text-left text-gray-700 font-semibold">
                  Name
                </th>
                <th className="p-3 text-center text-gray-700 font-semibold">
                  Mark Attendance
                </th>
              </tr>
            </thead>
            <tbody>
              {teachers.map((teacher) => (
                <motion.tr
                  key={teacher.id}
                  whileHover={{ scale: 1.01 }}
                  className="border-b hover:bg-gray-50"
                >
                  <td className="p-3">
                    <div>
                      <div className="font-medium">{teacher.name}</div>
                      <div className="text-sm text-gray-500">{teacher.subjects}</div>
                      <div className="text-xs text-gray-400">{teacher.experience} years exp</div>
                    </div>
                  </td>
                  <td className="p-3 text-center space-x-3">
                    {["Present", "Absent", "Leave"].map((status) => {
                      const isActive = attendance[teacher.id] === status;
                      const base =
                        "px-4 py-2 rounded-full font-medium transition-all duration-200";
                      const styles = {
                        Present: isActive
                          ? "bg-green-500 text-white shadow-md scale-105"
                          : "bg-green-100 text-green-700 hover:bg-green-200",
                        Absent: isActive
                          ? "bg-red-500 text-white shadow-md scale-105"
                          : "bg-red-100 text-red-700 hover:bg-red-200",
                        Leave: isActive
                          ? "bg-yellow-500 text-white shadow-md scale-105"
                          : "bg-yellow-100 text-yellow-700 hover:bg-yellow-200",
                      };

                      return (
                        <motion.button
                          key={status}
                          whileTap={{ scale: 0.95 }}
                          disabled={viewMode === "view"}
                          onClick={() => handleMark(teacher.id, status)}
                          className={`${base} ${styles[status]} ${
                            viewMode === "view"
                              ? "opacity-60 cursor-not-allowed"
                              : ""
                          }`}
                        >
                          {status}
                        </motion.button>
                      );
                    })}
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>

          {/* 💾 Save Button */}
          {allMarked && viewMode === "mark" && (
            <motion.div
              className="flex justify-center mt-6"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              <button
                onClick={handleSave}
                disabled={isSaving}
                className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSaving ? '⏳ Saving...' : '💾 Save Attendance'}
              </button>
            </motion.div>
          )}
        </motion.div>
      )}

      {!savedAttendance && (
        <p className="text-gray-500 text-center mt-10">
          Please mark attendance for teachers.
        </p>
      )}
    </motion.div>
  );
}
