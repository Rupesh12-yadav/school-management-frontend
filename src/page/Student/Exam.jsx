import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Calendar, BookOpen, Clock } from "lucide-react";
import { examAPI } from "../../services/api";

const Exam = () => {
  const [exams, setExams] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchExams();
  }, []);

  const fetchExams = async () => {
    try {
      setIsLoading(true);
      const response = await examAPI.getAllExams();
      setExams(Array.isArray(response) ? response : []);
    } catch (error) {
      console.error('Error fetching exams:', error);
      setExams([]);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-xl">Loading exam timetable...</div>
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
        className="max-w-6xl mx-auto rounded-2xl p-8 border border-yellow-200"
      >
        <div className="flex items-center justify-center gap-2 mb-6">
          <Calendar className="text-yellow-600 w-7 h-7" />
          <h2 className="text-2xl font-bold text-[var(--text-secondary)]">📅 Royal School Exam Timetable</h2>
        </div>

        {exams.length === 0 ? (
          <div className="text-center py-10 text-gray-500">
            No exams scheduled yet.
          </div>
        ) : (
          <>
            {/* Desktop/Tablet Table */}
            <div className="hidden sm:block overflow-x-auto">
              <table className="w-full text-sm text-gray-700 border-collapse">
                <thead className="bg-yellow-50 text-gray-800 uppercase text-xs">
                  <tr>
                    <th className="px-4 py-3 border border-yellow-200">Subject</th>
                    <th className="px-4 py-3 border border-yellow-200">Class</th>
                    <th className="px-4 py-3 border border-yellow-200">Section</th>
                    <th className="px-4 py-3 border border-yellow-200">Exam Date</th>
                    <th className="px-4 py-3 border border-yellow-200">Exam Day</th>
                    <th className="px-4 py-3 border border-yellow-200">Total Marks</th>
                  </tr>
                </thead>
                <tbody>
                  {exams.map((exam) => (
                    <motion.tr
                      key={exam._id}
                      whileHover={{ scale: 1.01, backgroundColor: "#FFF7CC" }}
                      transition={{ duration: 0.2 }}
                      className="border-b border-yellow-200"
                    >
                      <td className="px-4 py-3 font-medium border border-yellow-200">{exam.subjectName}</td>
                      <td className="px-4 py-3 text-center border border-yellow-200">{exam.class}</td>
                      <td className="px-4 py-3 text-center border border-yellow-200">{exam.section}</td>
                      <td className="px-4 py-3 text-center border border-yellow-200">
                        {exam.examDate ? new Date(exam.examDate).toLocaleDateString() : 'N/A'}
                      </td>
                      <td className="px-4 py-3 text-center border border-yellow-200">{exam.examDay}</td>
                      <td className="px-4 py-3 text-center border border-yellow-200">{exam.totalMarks}</td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile Card Layout */}
            <div className="sm:hidden flex flex-col gap-4">
              {exams.map((exam) => (
                <motion.div
                  key={exam._id}
                  style={{
                    backgroundColor: "var(--card-bg)",
                    boxShadow: "-4px 2px 8px rgba(0, 0, 0, 0.15)",
                  }}
                  className="border border-yellow-200 rounded-xl p-4"
                  whileTap={{ scale: 0.97 }}
                >
                  <div className="font-bold text-lg text-yellow-700 flex items-center gap-2 mb-2">
                    <BookOpen size={20} /> {exam.subjectName}
                  </div>
                  <p className="text-sm text-gray-600">
                    🎓 <b>Class:</b> {exam.class} - {exam.section}
                  </p>
                  <p className="text-sm text-gray-600">
                    📅 <b>Date:</b> {exam.examDate ? new Date(exam.examDate).toLocaleDateString() : 'N/A'}
                  </p>
                  <p className="text-sm text-gray-600">
                    📆 <b>Day:</b> {exam.examDay}
                  </p>
                  <p className="text-sm text-gray-600">
                    📝 <b>Total Marks:</b> {exam.totalMarks}
                  </p>
                </motion.div>
              ))}
            </div>
          </>
        )}
      </motion.div>
    </div>
  );
};

export default Exam;