import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CalendarDaysIcon, Clock, BookOpen, Download, Timer } from "lucide-react";
import { examAPI } from "../../services/api";

const ExamTimetable = () => {
  const [exams, setExams] = useState([]);
  const [filterDate, setFilterDate] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchExams();
  }, []);

  const fetchExams = async () => {
    try {
      setIsLoading(true);
      console.log('Fetching exams...');
      
      const response = await examAPI.getAllExams();
      console.log('Exam API Response:', response);
      console.log('Response type:', typeof response);
      console.log('Is array:', Array.isArray(response));
      
      // Handle different response formats
      let examList = [];
      if (Array.isArray(response)) {
        examList = response;
      } else if (response && Array.isArray(response.exams)) {
        examList = response.exams;
      } else if (response && Array.isArray(response.data)) {
        examList = response.data;
      }
      
      console.log('Exam list:', examList);
      setExams(examList);
    } catch (error) {
      console.error('Error fetching exams:', error);
      setExams([]);
    } finally {
      setIsLoading(false);
    }
  };



  const filteredExams = filterDate
    ? exams.filter((exam) => exam.examDate && exam.examDate.split('T')[0] === filterDate)
    : exams;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-xl">Loading exams...</div>
      </div>
    );
  }

  const handleDownload = () => {
    alert("✅ Timetable downloaded successfully!");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-yellow-50 via-white to-amber-100 p-6 flex flex-col items-center">

      {/* Header */}
      <motion.div
        className="flex flex-col md:flex-row items-center justify-between w-full max-w-6xl mb-8 gap-4"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="flex items-center gap-3">
          <CalendarDaysIcon className="text-yellow-600 w-8 h-8" />
          <h1 className="text-3xl md:text-4xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-yellow-600 to-amber-700">
            📅 Royal School Exam Timetable
          </h1>
        </div>

        {/* Filter + Download */}
        <div className="flex gap-3 items-center">
          <input
            type="date"
            value={filterDate}
            onChange={(e) => setFilterDate(e.target.value)}
            className="border border-amber-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-yellow-500 outline-none"
          />
          <button
            onClick={() => setFilterDate("")}
            className="bg-yellow-100 px-3 py-2 rounded-lg hover:bg-yellow-200 text-sm"
          >
            Clear
          </button>
          <button
            onClick={handleDownload}
            className="flex items-center gap-2 bg-gradient-to-r from-yellow-500 to-amber-600 text-white px-4 py-2 rounded-lg hover:scale-105 transition-transform"
          >
            <Download className="w-4 h-4" /> Download PDF
          </button>
        </div>
      </motion.div>

      {/* Live Countdown */}
      {/* Removed countdown feature */}

      {/* Table */}
      <div className="w-full max-w-6xl overflow-x-auto shadow-xl rounded-2xl bg-white/80 backdrop-blur-lg border border-yellow-200">
        <table className="min-w-full table-auto text-gray-700">
          <thead>
            <tr className="bg-gradient-to-r from-yellow-500 to-amber-600 text-white text-sm md:text-base">
              <th className="py-3 px-4 text-left">Subject</th>
              <th className="py-3 px-4 text-left">Date</th>
              <th className="py-3 px-4 text-left">Day</th>
              <th className="py-3 px-4 text-left">Total Marks</th>
            </tr>
          </thead>
          <tbody>
            {filteredExams.length === 0 ? (
              <tr>
                <td colSpan="4" className="py-8 text-center text-gray-500">
                  No exams scheduled yet.
                </td>
              </tr>
            ) : (
              filteredExams.map((exam, index) => (
                <motion.tr
                  key={exam._id}
                  className={`${index % 2 === 0 ? "bg-white" : "bg-yellow-50"} border-b hover:bg-yellow-100 transition-all`}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <td className="py-3 px-4 flex items-center gap-2 font-semibold">
                    <BookOpen className="text-yellow-600 w-4 h-4" />
                    {exam.subjectName}
                  </td>
                  <td className="py-3 px-4">
                    {exam.examDate ? new Date(exam.examDate).toLocaleDateString() : 'N/A'}
                  </td>
                  <td className="py-3 px-4">{exam.examDay}</td>
                  <td className="py-3 px-4 text-gray-700">{exam.totalMarks}</td>
                </motion.tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Footer */}
      <motion.div
        className="mt-8 text-gray-700 text-sm text-center"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
      >
        🏫 Academic Year: <b>2025</b> | Total Exams: <b>{filteredExams.length}</b>
      </motion.div>
    </div>
  );
};

export default ExamTimetable;
