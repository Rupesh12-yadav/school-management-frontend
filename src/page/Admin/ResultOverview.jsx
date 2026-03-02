/* eslint-disable no-unused-vars */
import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import jsPDF from "jspdf";
import { resultAPI } from "../../services/api";

const ResultOverview = () => {
  const [resultData, setResultData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // ✅ Filters
  const [selectedDate, setSelectedDate] = useState("");
  const [selectedClass, setSelectedClass] = useState("");
  const [selectedSubject, setSelectedSubject] = useState("");
  const [selectedStudent, setSelectedStudent] = useState("");
  const [selectedResult, setSelectedResult] = useState(null);

  // ✅ Fetch data from API
  useEffect(() => {
    fetchResults();
  }, []);

  const fetchResults = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await resultAPI.getAllResults();
      console.log('Results API Response:', response);
      
      // Handle response - could be array directly or object with results property
      let resultsArray = [];
      if (Array.isArray(response)) {
        resultsArray = response;
      } else if (response && Array.isArray(response.results)) {
        resultsArray = response.results;
      } else if (response && Array.isArray(response.data)) {
        resultsArray = response.data;
      }
      
      // Format the data for the frontend
      const formattedData = resultsArray.map(result => ({
        _id: result._id,
        studentName: result.student?.name ? `${result.student.name} ${result.student.lastname || ""}` : "Unknown",
        rollNo: result.student?.rollNumber || "N/A",
        className: result.class ? `${result.class}${result.section ? '-' + result.section : ''}` : "Not specified",
        subject: result.subject || "Not specified",
        date: result.createdAt ? new Date(result.createdAt).toLocaleDateString() : "N/A",
        marks: result.marksObtained || 0,
        total: result.totalMarks || 100,
        grade: result.grade || "N/A",
        remarks: result.remarks || ""
      }));
      
      setResultData(formattedData);
    } catch (err) {
      console.error('Error fetching results:', err);
      setError("Failed to load results: " + (err.message || err.error || "Unknown error"));
    } finally {
      setLoading(false);
    }
  };

  // ✅ Filter logic
  const filteredResults = resultData.filter((item) => {
    return (
      (selectedDate ? item.date === selectedDate : true) &&
      (selectedClass ? item.className === selectedClass : true) &&
      (selectedSubject ? item.subject === selectedSubject : true) &&
      (selectedStudent ? item.studentName === selectedStudent : true)
    );
  });

  // ✅ Unique filter options
  const classOptions = [...new Set(resultData.map((item) => item.className))];
  const subjectOptions = [...new Set(resultData.map((item) => item.subject))];
  const studentOptions = [...new Set(resultData.map((item) => item.studentName))];

  // ✅ View handler
  const handleView = (result) => {
    setSelectedResult(result);
  };

  // ✅ PDF Download
  const handleDownload = (result) => {
    const doc = new jsPDF();
    doc.setFontSize(16);
    doc.text("Student Result Report", 70, 20);
    doc.setFontSize(12);
    doc.text(`Name: ${result.studentName}`, 20, 40);
    doc.text(`Class: ${result.className}`, 20, 50);
    doc.text(`Subject: ${result.subject}`, 20, 60);
    doc.text(`Date: ${result.date}`, 20, 70);
    doc.text(`Marks: ${result.marks}/${result.total}`, 20, 80);
    doc.text(`Grade: ${result.grade}`, 20, 90);
    doc.text(`Remarks: ${result.remarks}`, 20, 100);
    doc.save(`${result.studentName}_Result.pdf`);
  };

  // ✅ Delete handler
  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this result?")) {
      try {
        await resultAPI.deleteResult(id);
        setResultData((prev) => prev.filter((item) => item._id !== id));
        alert("Result deleted successfully!");
      } catch (err) {
        console.error('Error deleting result:', err);
        alert("Failed to delete result!");
      }
    }
  };

  // ✅ Close Modal
  const handleCloseModal = () => setSelectedResult(null);

  return (
    <div className="bg-gradient-to-br min-h-screen p-6 overflow-hidden relative">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-slate-800">🎓 Result Overview</h2>

        {/* Loading/Error State */}
        {loading && <span className="text-purple-600">Loading...</span>}
        {error && <span className="text-red-600">{error}</span>}

        {/* Filter Section */}
        <div className="flex flex-wrap items-center gap-3 mt-4 sm:mt-0">
          {/* Date */}
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="border border-gray-300 rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-purple-400"
          />

          {/* Class */}
          <select
            value={selectedClass}
            onChange={(e) => setSelectedClass(e.target.value)}
            className="border border-gray-300 rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-purple-400"
          >
            <option value="">All Classes</option>
            {classOptions.map((cls) => (
              <option key={cls} value={cls}>
                {cls}
              </option>
            ))}
          </select>

          {/* Subject */}
          <select
            value={selectedSubject}
            onChange={(e) => setSelectedSubject(e.target.value)}
            className="border border-gray-300 rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-purple-400"
          >
            <option value="">All Subjects</option>
            {subjectOptions.map((sub) => (
              <option key={sub} value={sub}>
                {sub}
              </option>
            ))}
          </select>

          {/* Student */}
          <select
            value={selectedStudent}
            onChange={(e) => setSelectedStudent(e.target.value)}
            className="border border-gray-300 rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-purple-400"
          >
            <option value="">All Students</option>
            {studentOptions.map((stu) => (
              <option key={stu} value={stu}>
                {stu}
              </option>
            ))}
          </select>

          {/* Clear */}
          {(selectedDate ||
            selectedClass ||
            selectedSubject ||
            selectedStudent) && (
            <button
              onClick={() => {
                setSelectedDate("");
                setSelectedClass("");
                setSelectedSubject("");
                setSelectedStudent("");
              }}
              className="text-sm text-purple-600 hover:underline"
            >
              Clear All
            </button>
          )}
        </div>
      </div>

      {/* Cards Section */}
      <div className="rounded-xl overflow-y-auto max-h-[70vh] p-5">
        {loading ? (
          <p className="text-gray-500 text-center p-4">Loading results...</p>
        ) : error ? (
          <p className="text-red-500 text-center p-4">{error}</p>
        ) : filteredResults.length > 0 ? (
          <div className="flex flex-col gap-5">
            {filteredResults.map((item, index) => (
              <motion.div
                key={item._id || index}
                whileHover={{ scale: 1.02, y: -3 }}
                transition={{ type: "spring", stiffness: 200, damping: 15 }}
                style={{ background: "var(--card-bg)" }}
                className="border border-gray-100 rounded-xl shadow-2xl hover:border-transparent  p-5"
              >
                {/* Card Info */}
                <div className="flex flex-wrap justify-between items-center text-gray-700 gap-3 sm:gap-4">
                  <p className="font-semibold text-purple-700 text-lg">
                    🧑‍🎓 {item.studentName}
                  </p>
                  <p>📘 {item.subject}</p>
                  <p>🏫 {item.className}</p>
                  <p>📅 {item.date}</p>
                </div>

                <p className="mt-2 text-gray-700 text-sm leading-relaxed">
                  Marks: <b>{item.marks}</b> / {item.total} | Grade:{" "}
                  <b>{item.grade}</b>
                </p>

                {/* Buttons */}
                <div className="mt-4 flex gap-3 justify-end">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    onClick={() => handleView(item)}
                    className="px-3 py-1.5 rounded-md bg-blue-600 text-white text-sm font-medium hover:bg-blue-700 transition"
                  >
                    👁 View
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    onClick={() => handleDownload(item)}
                    className="px-3 py-1.5 rounded-md bg-green-600 text-white text-sm font-medium hover:bg-green-700 transition"
                  >
                    ⬇ Download
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    onClick={() => handleDelete(item._id)}
                    className="px-3 py-1.5 rounded-md bg-red-600 text-white text-sm font-medium hover:bg-red-700 transition"
                  >
                    🗑 Delete
                  </motion.button>
                </div>
              </motion.div>
            ))}
          </div>
        ) : (
          <p className="text-gray-500 text-center p-4">
            No results found. Upload marks first using the "Upload Marks" page.
          </p>
        )}
      </div>

      {/* ✅ Modal for Result Details */}
      <AnimatePresence>
        {selectedResult && (
          <motion.div
            className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              className="relative bg-white rounded-lg shadow-2xl p-6 max-w-lg w-[90%]"
            >
              <h3 className="text-xl font-bold mb-3 text-purple-700">
                🧾 Result Details
              </h3>
              <p>
                <b>Name:</b> {selectedResult.studentName}
              </p>
              <p>
                <b>Class:</b> {selectedResult.className}
              </p>
              <p>
                <b>Roll No:</b> {selectedResult.rollNo}
              </p>
              <p>
                <b>Subject:</b> {selectedResult.subject}
              </p>
              <p>
                <b>Date:</b> {selectedResult.date}
              </p>
              <p>
                <b>Marks:</b> {selectedResult.marks}/{selectedResult.total}
              </p>
              <p>
                <b>Grade:</b> {selectedResult.grade}
              </p>
              <p>
                <b>Remarks:</b> {selectedResult.remarks}
              </p>

              <div className="mt-5 text-right">
                <button
                  onClick={handleCloseModal}
                  className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 transition"
                >
                  Close
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ResultOverview;
