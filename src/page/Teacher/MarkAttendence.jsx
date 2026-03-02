import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { teacherAPI, attendanceAPI } from "../../services/api";
import { useAuth } from "../../context/AuthProvider";

const MarkAttendance = () => {
  const [allStudents, setAllStudents] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const { user } = useAuth();

  useEffect(() => {
    fetchStudents();
  }, []);

  const fetchStudents = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await teacherAPI.getMyStudents();
      setAllStudents(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Error fetching students:', error);
      setError("Failed to load students. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };
  
  const studentsData = allStudents.reduce((acc, student) => {
    const classKey = `${student.class} - ${student.section}`;
    if (!acc[classKey]) acc[classKey] = [];
    acc[classKey].push({
      id: student._id,
      name: `${student.name} ${student.lastname}`,
      rollNumber: student.rollNumber
    });
    return acc;
  }, {});

  const [selectedClass, setSelectedClass] = useState("");
  const [attendance, setAttendance] = useState({});
  const [savedAttendance, setSavedAttendance] = useState({});
  const [viewMode, setViewMode] = useState("mark");

  useEffect(() => {
    const stored = localStorage.getItem("teacherAttendanceData");
    if (stored) setSavedAttendance(JSON.parse(stored));
  }, []);

  useEffect(() => {
    localStorage.setItem("teacherAttendanceData", JSON.stringify(savedAttendance));
  }, [savedAttendance]);

  const handleMark = (id, status) => {
    if (viewMode === "view" || viewMode === "completed") return;
    setAttendance((prev) => ({ ...prev, [id]: status }));
  };

  const handleSave = async () => {
    if (Object.keys(attendance).length === 0) {
      alert("Please mark attendance for at least one student!");
      return;
    }

    setIsSaving(true);
    try {
      const attendancePromises = Object.entries(attendance).map(([studentId, status]) =>
        attendanceAPI.markStudentAttendance({
          studentId,
          status,
          date: new Date().toISOString(),
          markedBy: user?._id || user?.id
        })
      );
      
      await Promise.all(attendancePromises);
      
      const currentDate = new Date().toLocaleDateString();
      setSavedAttendance((prev) => ({
        ...prev,
        [selectedClass]: {
          data: attendance,
          date: currentDate,
        },
      }));
      
      setSuccess('Attendance saved successfully!');
      setSelectedClass("");
      setAttendance({});
      setViewMode("mark");
      setTimeout(() => setSuccess(null), 3000);
    } catch (error) {
      console.error('Error saving attendance:', error);
      setError(error.message || 'Failed to save attendance');
    } finally {
      setIsSaving(false);
    }
  };

  const handleClassChange = (cls) => {
    setSelectedClass(cls);
    if (savedAttendance[cls]) {
      setAttendance(savedAttendance[cls].data);
      setViewMode("completed");
    } else {
      setAttendance({});
      setViewMode("mark");
    }
  };

  const handleView = (cls) => {
    setSelectedClass(cls);
    setAttendance(savedAttendance[cls].data);
    setViewMode("view");
  };

  const handleEdit = (cls) => {
    setSelectedClass(cls);
    setAttendance(savedAttendance[cls].data);
    setViewMode("mark");
  };

  const selectedStudents = studentsData[selectedClass] || [];
  const allMarked = selectedStudents.length > 0 && selectedStudents.every((s) => attendance[s.id]);
    
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-xl text-yellow-600">Loading students...</div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="min-h-screen p-6"
      style={{ background: "linear-gradient(to bottom right, #fffdf3, #fffbea, #fff6d9)" }}
    >
      <div 
        style={{
          backgroundColor: "var(--card-bg)",
          boxShadow: "-6px 4px 12px rgba(0, 0, 0, 0.25)",
        }}
        className="max-w-6xl mx-auto rounded-3xl border border-yellow-200 p-8"
      >
        <h1 className="text-3xl font-bold text-[var(--text-secondary)] mb-6 text-center">
          📋 Mark Attendance
        </h1>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}
        
        {success && (
          <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
            {success}
          </div>
        )}

        {/* Class Dropdown */}
        <div className="flex justify-center mb-6">
          <select
            value={selectedClass}
            onChange={(e) => handleClassChange(e.target.value)}
            className="border border-yellow-300 rounded-lg px-4 py-2 w-60 focus:outline-none focus:ring-2 focus:ring-yellow-400 bg-yellow-50"
          >
            <option value="">Select Class</option>
            {Object.keys(studentsData).map((cls) => (
              <option key={cls} value={cls}>
                {cls}
              </option>
            ))}
          </select>
        </div>

        {/* Saved Attendance Cards */}
        {Object.keys(savedAttendance).length > 0 && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4 mb-10">
            {Object.entries(savedAttendance).map(([cls, info]) => (
              <motion.div
                key={cls}
                whileHover={{ scale: 1.01 }}
                className="flex justify-between items-center bg-yellow-50 border rounded-xl p-4 shadow-sm w-full"
              >
                <div className="text-left font-semibold text-gray-800">{cls}</div>
                <div className="text-center font-semibold text-gray-700">📅 {info.date || "Not Saved"}</div>
                <div className="flex gap-2">
                  <button onClick={() => handleView(cls)} className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600">View</button>
                  <button onClick={() => handleEdit(cls)} className="px-4 py-2 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600">Edit</button>
                </div>
              </motion.div>
            ))}
          </motion.div>
        )}

        {/* Attendance Table */}
        {selectedClass && viewMode !== "completed" && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.1 }}>
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="bg-yellow-50 border-b">
                    <th className="p-3 text-left text-gray-700 font-semibold">Name</th>
                    <th className="p-3 text-center text-gray-700 font-semibold">Roll No</th>
                    <th className="p-3 text-center text-gray-700 font-semibold">Mark Attendance</th>
                  </tr>
                </thead>
                <tbody>
                  {selectedStudents.map((student) => (
                    <motion.tr key={student.id} whileHover={{ scale: 1.01 }} className="border-b hover:bg-yellow-50">
                      <td className="p-3">
                        <div>
                          <div className="font-medium">{student.name}</div>
                        </div>
                      </td>
                      <td className="p-3 text-center text-gray-600">
                        {student.rollNumber}
                      </td>
                      <td className="p-3 text-center space-x-3">
                        {["Present", "Absent", "Leave"].map((status) => {
                          const isActive = attendance[student.id] === status;
                          const base = "px-4 py-2 rounded-full font-medium transition-all duration-200";
                          const styles = {
                            Present: isActive ? "bg-green-500 text-white shadow-md scale-105" : "bg-green-100 text-green-700 hover:bg-green-200",
                            Absent: isActive ? "bg-red-500 text-white shadow-md scale-105" : "bg-red-100 text-red-700 hover:bg-red-200",
                            Leave: isActive ? "bg-yellow-500 text-white shadow-md scale-105" : "bg-yellow-100 text-yellow-700 hover:bg-yellow-200",
                          };
                          return (
                            <motion.button
                              key={status}
                              whileTap={{ scale: 0.95 }}
                              disabled={viewMode === "view"}
                              onClick={() => handleMark(student.id, status)}
                              className={`${base} ${styles[status]} ${viewMode === "view" ? "opacity-60 cursor-not-allowed" : ""}`}
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
            </div>

            {/* Save Button */}
            {allMarked && viewMode === "mark" && (
              <motion.div className="flex justify-center mt-6" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
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

        {!selectedClass && Object.keys(savedAttendance).length === 0 && (
          <p className="text-gray-500 text-center mt-10">Please select a class to mark attendance.</p>
        )}
      </div>
    </motion.div>
  );
};

export default MarkAttendance;
