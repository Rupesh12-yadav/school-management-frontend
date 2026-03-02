import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { teacherAPI, examAPI, resultAPI } from "../../services/api";
import { useAuth } from "../../context/AuthProvider";

const MarksUpload = () => {
  const totalMarks = 100;
  const [selectedClass, setSelectedClass] = useState("");
  const [selectedSection, setSelectedSection] = useState("");
  const [selectedExam, setSelectedExam] = useState("");
  const [selectedSubject, setSelectedSubject] = useState("");
  const [marks, setMarks] = useState({});
  const [students, setStudents] = useState([]);
  const [classes, setClasses] = useState([]);
  const [sections, setSections] = useState([]);
  const [studentsData, setStudentsData] = useState([]);
  const [exams, setExams] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const { user } = useAuth();

  useEffect(() => {
    fetchTeacherData();
  }, []);

  const fetchTeacherData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Fetch all data in parallel
      const [studentsRes, examsRes] = await Promise.all([
        teacherAPI.getMyStudents(),
        teacherAPI.getMyExams()
      ]);
      
      console.log('Students API Response:', studentsRes);
      console.log('Exams API Response:', examsRes);
      
      const assignedStudents = Array.isArray(studentsRes) ? studentsRes : [];
      setStudentsData(assignedStudents);
      
      // Handle exams response - could be array or object with data property
      let examsData = [];
      if (Array.isArray(examsRes)) {
        examsData = examsRes;
      } else if (examsRes && Array.isArray(examsRes.data)) {
        examsData = examsRes.data;
      } else if (examsRes && examsRes.exams) {
        examsData = examsRes.exams;
      }
      setExams(examsData);
      
      // Extract unique classes from students
      const uniqueClasses = [...new Set(assignedStudents.map(s => s.class).filter(Boolean))];
      console.log('Extracted classes:', uniqueClasses);
      setClasses(uniqueClasses.sort((a, b) => parseInt(a) - parseInt(b)));
    } catch (err) {
      console.error('Error fetching data:', err);
      setError("Failed to load data: " + (err.message || err.error || "Unknown error"));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (selectedClass) {
      const classSections = studentsData
        .filter(s => s.class === selectedClass)
        .map(s => s.section)
        .filter(Boolean);
      const uniqueSections = [...new Set(classSections)];
      setSections(uniqueSections.sort());
    } else {
      setSections([]);
      setSelectedSection("");
      setStudents([]);
    }
  }, [selectedClass, studentsData]);

  useEffect(() => {
    if (selectedClass && selectedSection) {
      const filtered = studentsData.filter(s => s.class === selectedClass && s.section === selectedSection);
      setStudents(filtered);
    } else {
      setStudents([]);
    }
  }, [selectedClass, selectedSection, studentsData]);

  // Auto-fill subject when exam is selected
  useEffect(() => {
    if (selectedExam && exams.length > 0) {
      const selectedExamData = exams.find(e => e._id === selectedExam);
      if (selectedExamData) {
        // Auto-select class and section from exam
        if (!selectedClass) {
          setSelectedClass(selectedExamData.class);
        }
        if (!selectedSection) {
          setSelectedSection(selectedExamData.section);
        }
        if (!selectedSubject) {
          setSelectedSubject(selectedExamData.subjectName);
        }
      }
    }
  }, [selectedExam, exams, selectedClass, selectedSection, selectedSubject]);

  const handleMarksChange = (id, value) => {
    if (value === "") {
      setMarks({ ...marks, [id]: "" });
      return;
    }
    const num = Number(value);
    if (num < 0 || num > totalMarks) {
      alert(`Marks must be between 0 and ${totalMarks}`);
      return;
    }
    setMarks({ ...marks, [id]: num });
  };

  const handleSaveDraft = () => {
    const draftData = {
      class: selectedClass,
      section: selectedSection,
      exam: selectedExam,
      subject: selectedSubject,
      marks
    };
    localStorage.setItem('marksDraft', JSON.stringify(draftData));
    setSuccess("Draft saved successfully!");
    setTimeout(() => setSuccess(null), 3000);
  };

  const handleSubmit = async () => {
    if (!selectedClass || !selectedSection) {
      alert("Please select class and section first!");
      return;
    }

    if (!selectedSubject) {
      alert("Please enter or select a subject!");
      return;
    }

    const marksData = Object.entries(marks)
      .filter(([_, value]) => value !== "")
      .map(([studentId, marksObtained]) => ({
        studentId,
        marksObtained: Number(marksObtained),
        totalMarks
      }));

    if (marksData.length === 0) {
      alert("Please enter marks for at least one student!");
      return;
    }

    try {
      setLoading(true);
      setError(null);
      
      // Prepare payload
      const payload = {
        class: selectedClass,
        section: selectedSection,
        subject: selectedSubject,
        totalMarks: totalMarks,
        marks: marksData
      };

      // Add exam ID and examName if selected
      if (selectedExam) {
        const selectedExamData = exams.find(e => e._id === selectedExam);
        payload.examId = selectedExam;
        payload.examName = selectedExamData?.examName || "";
      }

      await resultAPI.createResult(payload);
      
      setSuccess("Marks submitted successfully!");
      setMarks({});
      localStorage.removeItem('marksDraft');
    } catch (err) {
      console.error('Error submitting marks:', err);
      setError(err?.message || err?.error || "Failed to submit marks. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Filter exams for selected class and section
  const filteredExams = exams.filter(exam => 
    exam.class === selectedClass && 
    (!selectedSection || exam.section === selectedSection)
  );

  return (
    <div className="min-h-screen p-6" 
         style={{ background: "linear-gradient(to bottom right, #fffdf3, #fffbea, #fff6d9)" }}>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-6xl mx-auto bg-white p-6 rounded-xl shadow-lg border border-yellow-200"
      >
        <h2 className="text-2xl font-bold text-[var(--text-secondary)] mb-6">📊 Upload Marks</h2>
        
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

        {loading && (
          <div className="text-center py-4">
            <div className="text-yellow-600">Loading...</div>
          </div>
        )}

        {/* Step 1: Select Exam First */}
        <div className="mb-4">
          <label className="font-semibold mr-3">📝 Select Exam:</label>
          <select
            value={selectedExam}
            onChange={(e) => {
              setSelectedExam(e.target.value);
              if (!e.target.value) {
                // Reset class and section if no exam selected
                setSelectedClass("");
                setSelectedSection("");
              }
            }}
            className="border border-yellow-300 rounded-xl px-4 py-2 focus:ring-2 focus:ring-yellow-400 outline-none bg-yellow-50 w-full"
            disabled={loading}
          >
            <option value="">-- Select an Exam --</option>
            {exams.length > 0 ? exams.map(exam => (
              <option key={exam._id} value={exam._id}>
                {exam.examName ? `${exam.examName} (${exam.subjectName})` : exam.subjectName} - Class {exam.class}-{exam.section}
              </option>
            )) : (
              <option disabled>No exams found</option>
            )}
          </select>
          {exams.length === 0 && (
            <p className="text-sm text-gray-500 mt-1">
              💡 No exams created yet. You can upload marks without selecting an exam.
            </p>
          )}
        </div>

        {/* Step 2: Select Class and Section */}
        <div className="flex gap-4 mb-4">
          <div className="flex-1">
            <label className="font-semibold mr-3">Select Class:</label>
            <select
              value={selectedClass}
              onChange={(e) => {
                setSelectedClass(e.target.value);
                setSelectedSection("");
                setSelectedExam("");
                setMarks({});
              }}
              className="border border-yellow-300 rounded-xl px-4 py-2 focus:ring-2 focus:ring-yellow-400 outline-none bg-yellow-50 w-full"
              disabled={loading}
            >
              <option value="">-- Select Class --</option>
              {classes.map(cls => (
                <option key={cls} value={cls}>
                  Class {cls}
                </option>
              ))}
            </select>
          </div>

          {selectedClass && (
            <div className="flex-1">
              <label className="font-semibold mr-3">Select Section:</label>
              <select
                value={selectedSection}
                onChange={(e) => {
                  setSelectedSection(e.target.value);
                  setSelectedExam("");
                  setMarks({});
                }}
                className="border border-yellow-300 rounded-xl px-4 py-2 focus:ring-2 focus:ring-yellow-400 outline-none bg-yellow-50 w-full"
                disabled={loading}
              >
                <option value="">-- Select Section --</option>
                {sections.map(sec => (
                  <option key={sec} value={sec}>
                    Section {sec}
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>

        {/* Step 3: Enter Subject and Marks (shown after class/section selected) */}
        {selectedClass && selectedSection && (
          <>
            <div className="mb-4">
              <label className="font-semibold mr-3">Subject Name:</label>
              <input
                type="text"
                value={selectedSubject}
                onChange={(e) => setSelectedSubject(e.target.value)}
                placeholder="Enter subject name (e.g., Mathematics)"
                className="border border-yellow-300 rounded-xl px-4 py-2 focus:ring-2 focus:ring-yellow-400 outline-none bg-yellow-50 w-full"
                disabled={loading}
              />
            </div>

            <div className="mb-4">
              <label className="font-semibold mr-3">Total Marks:</label>
              <input
                type="number"
                value={totalMarks}
                readOnly
                className="border border-yellow-300 rounded-xl px-4 py-2 bg-gray-100 w-32"
              />
            </div>
          </>
        )}

        {loading && <p className="text-center">Loading...</p>}

        {selectedClass && selectedSection && students.length > 0 && (
          <>
            <h3 className="text-lg font-bold mb-1">Class: {selectedClass}-{selectedSection}</h3>
            <h4 className="text-md font-semibold mb-4 text-gray-600">
              Subject: {selectedSubject || "Not specified"}
            </h4>

            <div className="overflow-x-auto">
              <table className="w-full border border-gray-300 mb-6">
                <thead className="bg-yellow-50">
                  <tr>
                    <th className="border px-4 py-2 text-left">Roll No</th>
                    <th className="border px-4 py-2 text-left">Student Name</th>
                    <th className="border px-4 py-2 text-center">Marks Obtained</th>
                  </tr>
                </thead>
                <tbody>
                  {students.map((student) => (
                    <tr key={student._id} className="hover:bg-yellow-50">
                      <td className="border px-4 py-2 text-center">
                        {student.rollNumber}
                      </td>
                      <td className="border px-4 py-2">
                        {student.name} {student.lastname}
                      </td>
                      <td className="border px-4 py-2 text-center">
                        <input
                          type="number"
                          min="0"
                          max={totalMarks}
                          value={marks[student._id] ?? ""}
                          onChange={(e) =>
                            handleMarksChange(student._id, e.target.value)
                          }
                          className="w-24 border rounded-xl px-3 py-2 text-center focus:ring-2 focus:ring-yellow-400 outline-none"
                          placeholder="--"
                          disabled={loading}
                        />
                        <span className="ml-2 text-gray-500">/ {totalMarks}</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="flex justify-end gap-4">
              <button
                onClick={handleSaveDraft}
                disabled={loading || Object.keys(marks).length === 0}
                className="px-5 py-2 bg-gray-500 text-white rounded-xl hover:bg-gray-600 disabled:opacity-50"
              >
                Save Draft
              </button>

              <button
                onClick={handleSubmit}
                disabled={loading || !selectedSubject || Object.keys(marks).length === 0}
                className="px-5 py-2 bg-green-600 text-white rounded-xl hover:bg-green-700 disabled:opacity-50"
              >
                {loading ? 'Submitting...' : 'Submit Marks'}
              </button>
            </div>
          </>
        )}

        {selectedClass && selectedSection && students.length === 0 && !loading && (
          <p className="text-gray-500 text-center mt-4">No students found for this class and section.</p>
        )}

        {!selectedClass && (
          <p className="text-gray-500 text-center mt-4">
            📝 Select an exam above OR manually select a class and section to upload marks.
          </p>
        )}
      </motion.div>
    </div>
  );
};

export default MarksUpload;
