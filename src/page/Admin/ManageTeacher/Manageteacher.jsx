/* eslint-disable no-unused-vars */
import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { teacherAPI, studentAPI } from "../../../services/api";
import { toast } from "react-toastify";

const ManageTeachers = () => {
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState("");
  const [selectedTeacher, setSelectedTeacher] = useState(null);
  const [teachers, setTeachers] = useState([]);
  const [allStudents, setAllStudents] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "teacher123",
    mobile: "",
    location: "",
    experience: 0,
    subjects: [],
    students: [],
  });

  const fetchTeachers = async () => {
    try {
      setIsLoading(true);
      const [teachersData, studentsData] = await Promise.all([
        teacherAPI.getAllTeachers(),
        studentAPI.getAllStudents()
      ]);
      setTeachers(teachersData.data || teachersData || []);
      setAllStudents(Array.isArray(studentsData) ? studentsData : []);
    } catch (error) {
      console.error('Error fetching data:', error);
      toast.error('Failed to fetch data');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchTeachers();
  }, []);

  // Open / Close Modal
  const openModal = (type, teacher = null) => {
    setModalType(type);
    setSelectedTeacher(teacher);
    if (teacher) {
      setFormData({
        name: teacher.name || "",
        email: teacher.email || "",
        password: "teacher123",
        mobile: teacher.mobile || "",
        location: teacher.location || "",
        experience: teacher.experience || 0,
        subjects: teacher.subjects || [],
        students: teacher.students?.map(s => s._id || s) || [],
      });
    } else {
      setFormData({
        name: "",
        email: "",
        password: "teacher123",
        mobile: "",
        location: "",
        experience: 0,
        subjects: [],
        students: [],
      });
    }
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setSelectedTeacher(null);
    setModalType("");
  };

  // Add / Edit / Delete APIs using axios
  const handleSave = async () => {
    try {
      if (modalType === "add") {
        await teacherAPI.createTeacher(formData);
        toast.success("Teacher added successfully!");
      } else if (modalType === "edit" && selectedTeacher) {
        await teacherAPI.updateTeacher(selectedTeacher._id, formData);
        toast.success("Teacher updated successfully!");
      }
      fetchTeachers();
      closeModal();
    } catch (err) {
      console.error("Error saving teacher:", err);
      toast.error("Error saving teacher");
    }
  };

  const handleDelete = async () => {
    if (!window.confirm("Are you sure you want to delete this teacher?")) return;
    try {
      await teacherAPI.deleteTeacher(selectedTeacher._id);
      toast.success("Teacher deleted successfully!");
      fetchTeachers();
      closeModal();
    } catch (err) {
      console.error("Error deleting teacher:", err);
      toast.error("Error deleting teacher");
    }
  };

  // UI Part
  return (
    <div className="p-8  min-h-screen">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <h2 className="text-3xl font-bold text-gray-800 tracking-tight">
          👨‍🏫 Manage Teachers
        </h2>
        <button
          onClick={() => openModal("add")}
          className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-5 py-2 rounded-lg shadow-md transition-all duration-200"
        >
          ➕ Add Teacher
        </button>
      </div>

      {/* Table */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-200"
      >
        {isLoading ? (
          <p className="text-center text-gray-500 p-6">⏳ Loading teachers...</p>
        ) : teachers.length > 0 ? (
          <table className="min-w-full border-collapse">
            <thead style={{background:"var(--gradient-yellow)"}}>
              <tr>
                <th className="p-4 text-left font-medium">Name</th>
                <th className="p-4 text-left font-medium">Subjects</th>
                <th className="p-4 text-left font-medium">Email</th>
                <th className="p-4 text-left font-medium">Mobile</th>
                <th className="p-4 text-left font-medium">Location</th>
                <th className="p-4 text-left font-medium">Experience</th>
                <th className="p-4 text-center font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {teachers.map((t, index) => (
                <tr
                  key={t._id}
                  className={`${
                    index % 2 === 0 ? "bg-gray-50" : "bg-white"
                  } hover:bg-blue-50 transition-all duration-200`}
                >
                  <td className="p-4 text-gray-700 font-medium">{t.name}</td>
                  <td className="p-4 text-gray-600">{t.subjects?.join(", ") || "—"}</td>
                  <td className="p-4 text-gray-600">{t.email}</td>
                  <td className="p-4 text-gray-600">{t.mobile || "—"}</td>
                  <td className="p-4 text-gray-600">{t.location || "—"}</td>
                  <td className="p-4 text-gray-700 font-semibold">
                    {t.experience || 0} years
                  </td>
                  <td className="p-4 text-center space-x-2">
                    <button
                      className="bg-blue-500 hover:bg-blue-600 text-white text-sm px-3 py-1 rounded shadow"
                      onClick={() => openModal("view", t)}
                    >
                      👁️
                    </button>
                    <button
                      className="bg-yellow-500 hover:bg-yellow-600 text-white text-sm px-3 py-1 rounded shadow"
                      onClick={() => openModal("edit", t)}
                    >
                      ✏️
                    </button>

                    <button
                      className="bg-red-600 hover:bg-red-700 text-white text-sm px-3 py-1 rounded shadow"
                      onClick={() => openModal("delete", t)}
                    >
                      ❌
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <p className="text-center text-gray-500 p-6">
            No teachers found. Add new teachers to get started.
          </p>
        )}
      </motion.div>

      {/* Modal section - unchanged */}
      <AnimatePresence>
        {showModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 flex justify-center items-center bg-black bg-opacity-50 z-50 backdrop-blur-sm"
          >
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              className="bg-white rounded-2xl shadow-2xl p-8 w-[420px]"
            >
              <h3 className="text-xl font-bold mb-4 text-gray-800">
                {modalType === "add" && "➕ Add New Teacher"}
                {modalType === "edit" && "✏️ Edit Teacher"}
                {modalType === "view" && "👁️ View Teacher Details"}
                {modalType === "delete" && "❌ Delete Teacher"}
              </h3>

              {(modalType === "add" || modalType === "edit") && (
                <div className="space-y-4">
                  <input
                    type="text"
                    placeholder="Teacher Name"
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                  <input
                    type="email"
                    placeholder="Email"
                    value={formData.email}
                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                    className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                  <input
                    type="text"
                    placeholder="Mobile Number"
                    value={formData.mobile}
                    onChange={(e) => setFormData({...formData, mobile: e.target.value})}
                    className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                  <input
                    type="text"
                    placeholder="Location"
                    value={formData.location}
                    onChange={(e) => setFormData({...formData, location: e.target.value})}
                    className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                  <input
                    type="number"
                    placeholder="Experience (years)"
                    value={formData.experience}
                    onChange={(e) => setFormData({...formData, experience: parseInt(e.target.value) || 0})}
                    className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                  <input
                    type="text"
                    placeholder="Subjects (comma separated)"
                    value={formData.subjects.join(", ")}
                    onChange={(e) => setFormData({...formData, subjects: e.target.value.split(", ").filter(s => s.trim())})}
                    className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                  <div>
                    <label className="block text-sm font-semibold mb-2">Assign Students:</label>
                    <select
                      multiple
                      value={formData.students}
                      onChange={(e) => setFormData({...formData, students: Array.from(e.target.selectedOptions, option => option.value)})}
                      className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none h-32"
                    >
                      {allStudents.map(student => (
                        <option key={student._id} value={student._id}>
                          {student.name} {student.lastname} - Class {student.class}-{student.section}
                        </option>
                      ))}
                    </select>
                    <p className="text-xs text-gray-500 mt-1">Hold Ctrl/Cmd to select multiple students</p>
                  </div>
                  <div className="flex gap-3 mt-6">
                    <button
                      onClick={handleSave}
                      className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-semibold"
                    >
                      {modalType === "add" ? "Add Teacher" : "Update Teacher"}
                    </button>
                    <button
                      onClick={closeModal}
                      className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-lg font-semibold"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}

              {modalType === "view" && selectedTeacher && (
                <div className="space-y-3">
                  <p><strong>Name:</strong> {selectedTeacher.name}</p>
                  <p><strong>Email:</strong> {selectedTeacher.email}</p>
                  <p><strong>Mobile:</strong> {selectedTeacher.mobile || "Not provided"}</p>
                  <p><strong>Location:</strong> {selectedTeacher.location || "Not provided"}</p>
                  <p><strong>Experience:</strong> {selectedTeacher.experience || 0} years</p>
                  <p><strong>Subjects:</strong> {selectedTeacher.subjects?.join(", ") || "None"}</p>
                  <button
                    onClick={closeModal}
                    className="mt-4 bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-lg font-semibold"
                  >
                    Close
                  </button>
                </div>
              )}

              {modalType === "delete" && selectedTeacher && (
                <div>
                  <p className="text-gray-700 mb-4">
                    Are you sure you want to delete <strong>{selectedTeacher.name}</strong>?
                  </p>
                  <div className="flex gap-3">
                    <button
                      onClick={handleDelete}
                      className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg font-semibold"
                    >
                      Yes, Delete
                    </button>
                    <button
                      onClick={closeModal}
                      className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-lg font-semibold"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ManageTeachers;
