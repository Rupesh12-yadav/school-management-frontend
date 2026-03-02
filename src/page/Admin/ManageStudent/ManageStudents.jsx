/* eslint-disable no-unused-vars */
// React aur hooks import kar rahe hain
import React, { useState, useEffect } from "react";
// Icons import kar rahe hain
import { FiEdit, FiEye, FiTrash2, FiUpload } from "react-icons/fi";
// Toast notifications ke liye
import { toast } from "react-toastify";
// Axios-based API service
import { studentAPI } from "../../../services/api";

const ManageStudents = () => {
  const [search, setSearch] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [classes, setClasses] = useState([]);
  const [sections, setSections] = useState([]);
  const [form, setForm] = useState({
    name: "",
    lastname: "",
    email: "",
    password: "",
    mobile: "",
    class: "",
    section: "",
    rollNumber: "",
  });

  // Fetch students data
  const fetchStudents = async () => {
    try {
      setLoading(true);
      const data = await studentAPI.getAllStudents();
      const studentList = data.data || data || [];
      setStudents(studentList);
      
      // Extract unique classes and sections
      const uniqueClasses = [...new Set(studentList.map(s => s.class).filter(Boolean))];
      const uniqueSections = [...new Set(studentList.map(s => s.section).filter(Boolean))];
      setClasses(uniqueClasses.sort());
      setSections(uniqueSections.sort());
    } catch (error) {
      console.error('Error fetching students:', error);
      toast.error('Failed to fetch students');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStudents();
  }, []);

  // Handle input change
  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  // Add or Update Student
  const handleAddStudent = async (e) => {
    e.preventDefault();
    try {
      if (editingId) {
        // Update Mode
        await studentAPI.updateStudent(editingId, form);
        toast.success("Student updated successfully!");
        setEditingId(null);
      } else {
        // Add Mode
        await studentAPI.createStudent(form);
        toast.success("Student added successfully!");
      }

      // Reset form
      setForm({
        name: "",
        lastname: "",
        email: "",
        password: "",
        mobile: "",
        class: "",
        section: "",
        rollNumber: "",
      });
      fetchStudents(); // Refresh data
    } catch (err) {
      console.error("Operation failed:", err);
      toast.error(err.message || "Something went wrong");
    }
  };

  // Delete Student
  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this student?")) return;
    try {
      await studentAPI.deleteStudent(id);
      toast.success("Student deleted successfully!");
      fetchStudents(); // Refresh data
    } catch (err) {
      console.error("Delete Error:", err);
      toast.error("Error deleting student");
    }
  };

  // Edit Student (fill data in form)
  const handleEditClick = (student) => {
    setForm(student);
    setEditingId(student._id);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // Filter for search
  const filtered = students.filter(
    (s) =>
      s.name?.toLowerCase().includes(search.toLowerCase()) ||
      s.lastname?.toLowerCase().includes(search.toLowerCase()) ||
      s.rollNumber?.toLowerCase().includes(search.toLowerCase()) ||
      s.class?.toLowerCase().includes(search.toLowerCase())
  );

  if (loading) return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-xl text-gray-600">⏳ Loading students...</div>
    </div>
  );

  return (
    <div className="p-8 bg-gradient-to-br from-blue-50 to-indigo-100 min-h-screen">
      <div className="flex justify-between items-center mb-8">
        <h2 className="text-3xl font-bold text-gray-800">
          🎓 Manage Students
        </h2>
        <div className="text-sm text-gray-600">
          Total Students: <span className="font-bold text-blue-600">{students.length}</span>
        </div>
      </div>

      {/* Add / Update Student Form */}
      <div className="bg-white rounded-2xl shadow-lg p-6 mb-8 border border-gray-200">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">
          {editingId ? "✏️ Edit Student" : "➕ Add New Student"}
        </h3>
        <form onSubmit={handleAddStudent} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <input
            type="text"
            name="name"
            placeholder="First Name"
            value={form.name || ""}
            onChange={handleChange}
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
            required
          />
          <input
            type="text"
            name="lastname"
            placeholder="Last Name"
            value={form.lastname || ""}
            onChange={handleChange}
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
            required
          />
          <input
            type="email"
            name="email"
            placeholder="Email (optional)"
            value={form.email || ""}
            onChange={handleChange}
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
          />
          <input
            type="password"
            name="password"
            placeholder="Password"
            value={form.password || ""}
            onChange={handleChange}
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
            required
          />
          <input
            type="text"
            name="mobile"
            placeholder="Mobile"
            value={form.mobile || ""}
            onChange={handleChange}
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
          />
          <select
            name="class"
            value={form.class || ""}
            onChange={handleChange}
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
            required
          >
            <option value="">Select Class</option>
            {classes.map((cls) => (
              <option key={cls} value={cls}>{cls}</option>
            ))}
            <option value="new">+ Add New Class</option>
          </select>
          <select
            name="section"
            value={form.section || ""}
            onChange={handleChange}
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
            required
          >
            <option value="">Select Section</option>
            {sections.map((sec) => (
              <option key={sec} value={sec}>{sec}</option>
            ))}
            <option value="new">+ Add New Section</option>
          </select>
          <input
            type="text"
            name="rollNumber"
            placeholder="Roll No"
            value={form.rollNumber || ""}
            onChange={handleChange}
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
            required
          />

          <div className="md:col-span-2 lg:col-span-4 flex gap-3 mt-4">
            <button
              type="submit"
              className={`${
                editingId
                  ? "bg-yellow-500 hover:bg-yellow-600"
                  : "bg-blue-600 hover:bg-blue-700"
              } text-white font-semibold px-6 py-3 rounded-lg shadow-md transition-all duration-200 flex items-center gap-2`}
            >
              {editingId ? "✏️ Update Student" : "➕ Add Student"}
            </button>

            {editingId && (
              <button
                type="button"
                onClick={() => {
                  setEditingId(null);
                  setForm({
                    name: "",
                    lastname: "",
                    email: "",
                    password: "",
                    mobile: "",
                    class: "",
                    section: "",
                    rollNumber: "",
                  });
                }}
                className="bg-gray-500 hover:bg-gray-600 text-white font-semibold px-6 py-3 rounded-lg shadow-md transition-all duration-200"
              >
                Cancel
              </button>
            )}

            {!editingId && (
              <button
                type="button"
                className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg shadow-md transition-all duration-200"
              >
                <FiUpload /> Upload Excel
              </button>
            )}
          </div>
        </form>
      </div>

      {/* Search Bar */}
      <div className="bg-white rounded-xl shadow-lg p-4 mb-6">
        <div className="flex flex-col md:flex-row gap-4 items-center">
          <div className="flex-1">
            <input
              type="text"
              placeholder="🔍 Search by name, class, or roll number..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
            />
          </div>
          <div className="text-sm text-gray-600">
            Showing {filtered.length} of {students.length} students
          </div>
        </div>
      </div>

      {/* Students Table */}
      <div className="bg-white shadow-md rounded-2xl overflow-y-auto max-h-[60vh]">
        {filtered.length > 0 ? (
          <table className="w-full border-collapse text-gray-800">
            <thead
              className="sticky top-0 bg-gradient-to-r"
              style={{ background: "var(--gradient-yellow)" }}
            >
              <tr>
                <th className="p-3 text-left">Name</th>
                <th className="p-3 text-left">Class</th>
                <th className="p-3 text-left">Section</th>
                <th className="p-3 text-left">Roll No</th>
                <th className="p-3 text-left">Mobile</th>
                <th className="p-3 text-left">Email</th>
                <th className="p-3 text-left">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((s) => (
                <tr key={s._id} className="border-b hover:bg-yellow-50 transition-all">
                  <td className="p-3">{s.name} {s.lastname}</td>
                  <td className="p-3">{s.class}</td>
                  <td className="p-3">{s.section}</td>
                  <td className="p-3">{s.rollNumber}</td>
                  <td className="p-3">{s.mobile}</td>
                  <td className="p-3">{s.email}</td>
                  <td className="p-3 flex gap-3">
                    <button className="text-blue-600 hover:text-blue-800"><FiEye /></button>
                    <button
                      onClick={() => handleEditClick(s)}
                      className="text-amber-500 hover:text-amber-700"
                    >
                      <FiEdit />
                    </button>
                    <button
                      onClick={() => handleDelete(s._id)}
                      className="text-red-600 hover:text-red-800"
                    >
                      <FiTrash2 />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <p className="text-gray-500 text-center p-4">No students found</p>
        )}
      </div>
    </div>
  );
};

export default ManageStudents;
