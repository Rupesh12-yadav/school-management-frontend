import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { classAPI, teacherAPI } from "../../../services/api";
import { toast } from "react-toastify";
import {
  FaSchool,
  FaPlus,
  FaTrash,
  FaEdit,
  FaTimes,
  FaUser,
  FaBook
} from "react-icons/fa";

const ManageClasses = () => {
  const [teachers, setTeachers] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [classes, setClasses] = useState([]);
  const [isEditMode, setIsEditMode] = useState(false);
  const [editingClassId, setEditingClassId] = useState(null);
  const [formData, setFormData] = useState({
    className: "",
    section: "",
    classTeacher: "",
    subjects: ""
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const teachersRes = await teacherAPI.getAllTeachers();
      setTeachers(teachersRes.data || teachersRes);
      
      const classesRes = await classAPI.getAllClasses();
      console.log("Classes:", classesRes);
      setClasses(classesRes.data || classesRes);
    } catch (error) {
      console.error("Error:", error);
      toast.error("Failed to load data");
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    
    if (name === "classTeacher" && value) {
      const selectedTeacher = teachers.find(t => t._id === value);
      setSubjects(selectedTeacher?.subjects || []);
      setFormData(prev => ({ ...prev, subjects: "" }));
    }
  };

  const handleSubjectChange = (subject) => {
    setFormData(prev => ({ ...prev, subjects: subject }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const classData = {
        name: formData.className,
        section: formData.section,
        grade: formData.className,
        classTeacher: formData.classTeacher,
        subjects: [formData.subjects]
      };
      
      if (isEditMode) {
        await classAPI.updateClass(editingClassId, classData);
        toast.success("Class updated successfully");
      } else {
        await classAPI.createClass(classData);
        toast.success("Class created successfully");
      }
      
      await fetchData();
      
      setFormData({
        className: "",
        section: "",
        classTeacher: "",
        subjects: ""
      });
      setSubjects([]);
      setIsEditMode(false);
      setEditingClassId(null);
    } catch (error) {
      toast.error(error.message || "Failed to save class");
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure?")) return;
    
    try {
      await classAPI.deleteClass(id);
      toast.success("Class deleted");
      setClasses(classes.filter(c => c._id !== id));
    } catch (error) {
      toast.error("Failed to delete");
    }
  };

  const handleEdit = (cls) => {
    setIsEditMode(true);
    setEditingClassId(cls._id);
    setFormData({
      className: cls.name,
      section: cls.section,
      classTeacher: cls.classTeacher?._id || "",
      subjects: cls.subjects?.[0] || ""
    });
    
    if (cls.classTeacher?._id) {
      const teacher = teachers.find(t => t._id === cls.classTeacher._id);
      setSubjects(teacher?.subjects || []);
    }
    
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleCancelEdit = () => {
    setIsEditMode(false);
    setEditingClassId(null);
    setFormData({
      className: "",
      section: "",
      classTeacher: "",
      subjects: ""
    });
    setSubjects([]);
  };

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-lg mx-auto bg-white rounded-xl shadow-lg p-6"
        >
          <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2 mb-6">
            <FaSchool className="text-blue-600" />
            {isEditMode ? "Edit Class" : "Manage Classes"}
          </h2>

          {isEditMode && (
            <div className="mb-4 p-3 bg-blue-50 rounded-lg flex justify-between items-center">
              <p className="text-sm text-blue-700">Editing class</p>
              <button
                onClick={handleCancelEdit}
                className="text-blue-600 hover:text-blue-800 flex items-center gap-1"
              >
                <FaTimes /> Cancel
              </button>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                <FaSchool /> Class Name
              </label>
              <input
                type="text"
                name="className"
                value={formData.className}
                onChange={handleChange}
                placeholder="Enter class name"
                className="w-full mt-1 px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700">Section</label>
              <select
                name="section"
                value={formData.section}
                onChange={handleChange}
                className="w-full mt-1 px-3 py-2 border rounded-lg bg-white focus:ring-2 focus:ring-blue-500"
                required
              >
                <option value="">Select Section</option>
                <option value="A">A</option>
                <option value="B">B</option>
                <option value="C">C</option>
              </select>
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                <FaUser /> Class Teacher
              </label>
              <select
                name="classTeacher"
                value={formData.classTeacher}
                onChange={handleChange}
                className="w-full mt-1 px-3 py-2 border rounded-lg bg-white focus:ring-2 focus:ring-blue-500"
                required
              >
                <option value="">Select Teacher</option>
                {teachers.map((t) => (
                  <option key={t._id} value={t._id}>
                    {t.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700 flex items-center gap-2 mb-2">
                <FaBook /> Subject (Select one)
              </label>
              <div className="grid grid-cols-2 gap-2 p-3 border rounded-lg bg-gray-50 max-h-60 overflow-y-auto">
                {subjects.length === 0 && (
                  <p className="col-span-2 text-sm text-gray-500 text-center py-4">
                    {formData.classTeacher ? "No subjects available" : "Please select a teacher first"}
                  </p>
                )}
                {subjects.map((subject) => (
                  <label
                    key={subject}
                    className="flex items-center gap-2 cursor-pointer hover:bg-white p-2 rounded transition"
                  >
                    <input
                      type="radio"
                      name="subject"
                      checked={formData.subjects === subject}
                      onChange={() => handleSubjectChange(subject)}
                      className="w-4 h-4 text-blue-600 focus:ring-2 focus:ring-blue-500 cursor-pointer"
                    />
                    <span className="text-sm text-gray-700">{subject}</span>
                  </label>
                ))}
              </div>
              {formData.subjects && (
                <div className="mt-2 p-2 bg-blue-50 rounded">
                  <p className="text-xs text-blue-700 font-medium">
                    Selected: {formData.subjects}
                  </p>
                </div>
              )}
            </div>

            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              type="submit"
              className="w-full bg-blue-600 text-white py-2 rounded-lg font-semibold flex items-center justify-center gap-2"
            >
              {isEditMode ? (
                <><FaEdit /> Update Class</>
              ) : (
                <><FaPlus /> Save Class</>
              )}
            </motion.button>
          </form>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white rounded-xl shadow-lg p-6"
        >
          <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2 mb-6">
            <FaSchool className="text-blue-600" />
            All Classes ({classes.length})
          </h2>

          {classes.length === 0 ? (
            <p className="text-center text-gray-500 py-8">No classes found</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {classes.map((cls) => (
                <motion.div
                  key={cls._id}
                  whileHover={{ scale: 1.02 }}
                  className="border rounded-lg p-4 hover:shadow-md transition"
                >
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <h3 className="font-bold text-lg text-gray-800">{cls.name}</h3>
                      <p className="text-sm text-gray-600">Section: {cls.section}</p>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleEdit(cls)}
                        className="text-blue-500 hover:text-blue-700"
                      >
                        <FaEdit />
                      </button>
                      <button
                        onClick={() => handleDelete(cls._id)}
                        className="text-red-500 hover:text-red-700"
                      >
                        <FaTrash />
                      </button>
                    </div>
                  </div>
                  
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center gap-2 text-gray-700">
                      <FaUser className="text-blue-500" />
                      <span>{cls.classTeacher?.name || "No teacher"}</span>
                    </div>
                    
                    <div className="flex items-start gap-2 text-gray-700">
                      <FaBook className="text-green-500 mt-1" />
                      <div className="flex flex-wrap gap-1">
                        {cls.subjects?.map((sub, idx) => (
                          <span key={idx} className="bg-blue-100 text-blue-700 px-2 py-1 rounded text-xs">
                            {sub}
                          </span>
                        ))}
                      </div>
                    </div>
                    
                    <p className="text-gray-600 pt-2 border-t">Capacity: {cls.capacity || 40}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
};

export default ManageClasses;
