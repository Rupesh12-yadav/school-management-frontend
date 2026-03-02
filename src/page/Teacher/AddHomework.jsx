import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { FileText, Image as ImageIcon } from "lucide-react";
import { homeworkAPI } from "../../services/api";
import { useAuth } from "../../context/AuthProvider";

const AddHomework = () => {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [subject, setSubject] = useState("");
  const [selectedClass, setSelectedClass] = useState("");
  const [selectedSection, setSelectedSection] = useState("");
  const [subjects, setSubjects] = useState([]);
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    fetchDropdownData();
  }, []);

  const fetchDropdownData = async () => {
    try {
      const [subjectsRes, classesRes] = await Promise.all([
        homeworkAPI.getTeacherSubjects(),
        homeworkAPI.getAvailableClasses()
      ]);
      console.log('Subjects API Response:', subjectsRes);
      console.log('Classes API Response:', classesRes);
      
      // Handle subjects - could be array directly or object with subjects property
      const subjectsData = Array.isArray(subjectsRes) ? subjectsRes : subjectsRes?.subjects || [];
      setSubjects(subjectsData);
      
      // Handle classes - the API returns array of class objects with name, section, grade, label
      const classesData = Array.isArray(classesRes) ? classesRes : classesRes?.data || classesRes?.classes || [];
      setClasses(classesData);
    } catch (err) {
      console.error('Error fetching dropdown data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!title || !dueDate || !subject || !selectedClass || !selectedSection) {
      alert("Please fill all required fields: Title, Due Date, Subject, Class, and Section!");
      return;
    }

    try {
      console.log('Current user:', user);
      const userId = user?._id || user?.id;
      console.log('User ID:', userId);
      
      if (!userId) {
        alert('User not logged in properly. Please login again.');
        return;
      }

      const homeworkData = {
        title,
        description,
        assignedBy: userId,
        dueDate,
        subject,
        class: selectedClass,
        section: selectedSection
      };

      console.log('Sending homework data:', homeworkData);
      const response = await homeworkAPI.createHomework(homeworkData);
      console.log('Homework created response:', response);
      alert("Homework posted successfully!");

      // Reset form
      setTitle("");
      setDescription("");
      setDueDate("");
      setSubject("");
      setSelectedClass("");
      setSelectedSection("");
    } catch (err) {
      console.error('Full error:', err);
      alert("Error while posting homework: " + (err.message || err.error || "Unknown error"));
    }
  };

  // Extract unique classes and sections from the classes array
  const uniqueClasses = [...new Set(classes.map(c => c.name || c.grade))].filter(Boolean).sort();
  
  const getSectionsForClass = (className) => {
    return classes
      .filter(c => (c.name || c.grade) === className)
      .map(c => c.section)
      .filter(Boolean);
  };

  return (
    <div className="min-h-screen flex items-center justify-center py-10 px-4" 
         style={{ background: "linear-gradient(to bottom right, #fffdf3, #fffbea, #fff6d9)" }}>
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        style={{
          backgroundColor: "var(--card-bg)",
          boxShadow: "-6px 4px 12px rgba(0, 0, 0, 0.25)",
        }}
        className="rounded-2xl p-8 w-full max-w-lg border border-yellow-200"
      >
        <div className="flex items-center justify-center gap-2 mb-6">
          <FileText className="text-yellow-600 w-7 h-7" />
          <h1 className="text-2xl font-bold text-[var(--text-secondary)]">📚 Add Homework</h1>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Homework Title *
            </label>
            <input
              type="text"
              placeholder="e.g. Science - Chapter 6: Motion"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full border border-yellow-300 rounded-xl px-3 py-2 focus:ring-2 focus:ring-yellow-400 outline-none transition bg-yellow-50"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Description
            </label>
            <textarea
              placeholder="Write homework details here..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full border border-yellow-300 rounded-xl px-3 py-2 h-28 resize-none focus:ring-2 focus:ring-yellow-400 outline-none transition bg-yellow-50"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Subject *
            </label>
            <select
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              className="w-full border border-yellow-300 rounded-xl px-3 py-2 focus:ring-2 focus:ring-yellow-400 outline-none transition bg-yellow-50"
              disabled={loading}
            >
              <option value="">Select Subject</option>
              {subjects.map((sub, idx) => (
                <option key={idx} value={sub}>{sub}</option>
              ))}
            </select>
          </div>

          <div className="flex gap-4">
            <div className="flex-1">
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Class *
              </label>
              <select
                value={selectedClass}
                onChange={(e) => {
                  setSelectedClass(e.target.value);
                  setSelectedSection("");
                }}
                className="w-full border border-yellow-300 rounded-xl px-3 py-2 focus:ring-2 focus:ring-yellow-400 outline-none transition bg-yellow-50"
                disabled={loading}
              >
                <option value="">Select Class</option>
                {uniqueClasses.map((cls, idx) => (
                  <option key={idx} value={cls}>{cls}</option>
                ))}
              </select>
            </div>

            {selectedClass && (
              <div className="flex-1">
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Section *
                </label>
                <select
                  value={selectedSection}
                  onChange={(e) => setSelectedSection(e.target.value)}
                  className="w-full border border-yellow-300 rounded-xl px-3 py-2 focus:ring-2 focus:ring-yellow-400 outline-none transition bg-yellow-50"
                  disabled={loading}
                >
                  <option value="">Section</option>
                  {getSectionsForClass(selectedClass).map((sec, idx) => (
                    <option key={idx} value={sec}>{sec}</option>
                  ))}
                </select>
              </div>
            )}
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Due Date *
            </label>
            <input
              type="date"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
              className="w-full border border-yellow-300 rounded-xl px-3 py-2 focus:ring-2 focus:ring-yellow-400 outline-none transition bg-yellow-50"
            />
          </div>

          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            type="submit"
            style={{
              backgroundColor: "var(--primary-color)",
              color: "var(--text-primary)",
            }}
            className="w-full hover:bg-yellow-500 font-semibold py-3 rounded-xl shadow-md transition"
          >
            <div className="flex items-center justify-center gap-2">
              <ImageIcon className="w-5 h-5" />
              Post Homework
            </div>
          </motion.button>
        </form>
      </motion.div>
    </div>
  );
};

export default AddHomework;
