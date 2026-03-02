import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { examAPI, teacherAPI } from "../../services/api";
import { useAuth } from "../../context/AuthProvider";
import { Calendar, BookOpen, Clock, AlertCircle } from "lucide-react";

function PostExam() {
  const [examName, setExamName] = useState("");
  const [subjectName, setSubjectName] = useState("");
  const [examDate, setExamDate] = useState("");
  const [examDay, setExamDay] = useState("");
  const [totalMarks, setTotalMarks] = useState("");
  const [selectedClass, setSelectedClass] = useState("");
  const [selectedSection, setSelectedSection] = useState("");
  const [classes, setClasses] = useState([]);
  const [sections, setSections] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [studentsData, setStudentsData] = useState([]);
  const [sectionsMapState, setSectionsMapState] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const { user } = useAuth();

  useEffect(() => {
    fetchAssignedData();
  }, []);

  const fetchAssignedData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Fetch classes and subjects in parallel
      const [classesRes, subjectsRes, teacherRes] = await Promise.all([
        teacherAPI.getMyClasses(),
        teacherAPI.getMySubjects(),
        teacherAPI.getMyStudents()
      ]);
      
      setClasses(Array.isArray(classesRes) ? classesRes : []);
      setSubjects(Array.isArray(subjectsRes) ? subjectsRes : []);
      
      console.log('API Response - Classes:', classesRes);
      console.log('API Response - Subjects:', subjectsRes);
      console.log('API Response - Students:', teacherRes);
      
      // Extract sections from students
      const studentsData = Array.isArray(teacherRes) ? teacherRes : [];
      setStudentsData(studentsData);
      
      const classSectionsMap = {};
      studentsData.forEach(student => {
        if (student.class && student.section) {
          if (!classSectionsMap[student.class]) {
            classSectionsMap[student.class] = new Set();
          }
          classSectionsMap[student.class].add(student.section);
        }
      });
      
      // Store sections map for later use
      setSectionsMapState(classSectionsMap);
    } catch (error) {
      console.error('Error fetching data:', error);
      setError('Error loading data: ' + (error.message || 'Unknown error'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (selectedClass) {
      // Get sections for the selected class
      const classSections = sectionsMapState[selectedClass];
      console.log('Selected class:', selectedClass, 'Sections found:', classSections);
      if (classSections && classSections.size > 0) {
        setSections(Array.from(classSections).sort());
      } else {
        // Fallback: check if sections exist in studentsData directly
        const directSections = studentsData
          .filter(s => s.class === selectedClass)
          .map(s => s.section)
          .filter(Boolean);
        if (directSections.length > 0) {
          setSections([...new Set(directSections)].sort());
        } else {
          // Default sections if none found
          setSections(['A', 'B', 'C'].filter(() => true));
        }
      }
    } else {
      setSections([]);
      setSelectedSection("");
    }
  }, [selectedClass, sectionsMapState, studentsData]);

  const handleDateChange = (e) => {
    const selectedDate = e.target.value;
    setExamDate(selectedDate);
    
    if (selectedDate) {
      const date = new Date(selectedDate);
      const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
      setExamDay(days[date.getDay()]);
    } else {
      setExamDay("");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!examName || !subjectName || !examDate || !examDay || !totalMarks || !selectedClass || !selectedSection) {
      alert("Please fill all fields!");
      return;
    }

    setLoading(true);
    try {
      await examAPI.createExam({
        examName,
        subjectName,
        examDate,
        examDay,
        totalMarks: Number(totalMarks),
        class: selectedClass,
        section: selectedSection,
        createdBy: user?._id || user?.id
      });
      
      setSuccess("Exam created successfully!");
      setExamName("");
      setSubjectName("");
      setExamDate("");
      setExamDay("");
      setTotalMarks("");
      setSelectedClass("");
      setSelectedSection("");
      
      setTimeout(() => setSuccess(null), 3000);
    } catch (error) {
      console.error('Error creating exam:', error);
      setError("Error creating exam: " + (error.message || "Unknown error"));
    } finally {
      setLoading(false);
    }
  };

  if (loading && classes.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-xl text-yellow-600">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-6" style={{ background: "linear-gradient(to bottom right, #fffdf3, #fffbea, #fff6d9)" }}>
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        style={{
          backgroundColor: "var(--card-bg)",
          boxShadow: "-6px 4px 12px rgba(0, 0, 0, 0.25)",
        }}
        className="max-w-lg mx-auto rounded-2xl p-8 border border-yellow-200"
      >
        <div className="flex items-center justify-center gap-2 mb-6">
          <BookOpen className="text-yellow-600 w-7 h-7" />
          <h2 className="text-2xl font-bold text-[var(--text-secondary)]">📝 Create Exam</h2>
        </div>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4 flex items-center gap-2">
            <AlertCircle size={18} />
            {error}
          </div>
        )}
        
        {success && (
          <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
            {success}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Exam Name *
            </label>
            <input
              type="text"
              placeholder="e.g., Mid Term Exam, Unit Test 1"
              value={examName}
              onChange={(e) => setExamName(e.target.value)}
              className="w-full border border-yellow-300 rounded-xl px-3 py-2 focus:ring-2 focus:ring-yellow-400 outline-none transition bg-yellow-50"
            />
          </div>

          <div>
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
            >
              <option value="">Select Class</option>
              {classes.map((cls) => (
                <option key={cls} value={cls}>
                  Class {cls}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Section *
            </label>
            <select
              value={selectedSection}
              onChange={(e) => setSelectedSection(e.target.value)}
              disabled={!selectedClass}
              className="w-full border border-yellow-300 rounded-xl px-3 py-2 focus:ring-2 focus:ring-yellow-400 outline-none transition bg-yellow-50 disabled:bg-gray-100 disabled:cursor-not-allowed"
            >
              <option value="">Select Section</option>
              {sections.map((sec) => (
                <option key={sec} value={sec}>
                  Section {sec}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Subject Name *
            </label>
            <select
              value={subjectName}
              onChange={(e) => setSubjectName(e.target.value)}
              className="w-full border border-yellow-300 rounded-xl px-3 py-2 focus:ring-2 focus:ring-yellow-400 outline-none transition bg-yellow-50"
            >
              <option value="">Select Subject</option>
              {subjects.map((subject, index) => (
                <option key={index} value={subject}>
                  {subject}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Exam Date *
            </label>
            <input
              type="date"
              value={examDate}
              onChange={handleDateChange}
              className="w-full border border-yellow-300 rounded-xl px-3 py-2 focus:ring-2 focus:ring-yellow-400 outline-none transition bg-yellow-50"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Exam Day *
            </label>
            <input
              type="text"
              value={examDay}
              readOnly
              placeholder="Auto-filled from date"
              className="w-full border border-yellow-300 rounded-xl px-3 py-2 bg-gray-100 cursor-not-allowed"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Total Marks *
            </label>
            <input
              type="number"
              placeholder="e.g. 100"
              value={totalMarks}
              onChange={(e) => setTotalMarks(e.target.value)}
              className="w-full border border-yellow-300 rounded-xl px-3 py-2 focus:ring-2 focus:ring-yellow-400 outline-none transition bg-yellow-50"
            />
          </div>

          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            type="submit"
            disabled={loading}
            style={{
              backgroundColor: "var(--primary-color)",
              color: "var(--text-primary)",
            }}
            className="w-full hover:bg-yellow-500 font-semibold py-3 rounded-xl shadow-md transition disabled:opacity-50"
          >
            {loading ? 'Creating...' : 'Create Exam'}
          </motion.button>
        </form>
      </motion.div>
    </div>
  );
}

export default PostExam;
