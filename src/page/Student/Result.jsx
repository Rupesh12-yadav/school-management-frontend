import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FiDownload, FiEye, FiX } from "react-icons/fi";
import confetti from "canvas-confetti";
import { Crown } from "lucide-react";
import { resultAPI } from "../../services/api";
import { useAuth } from "../../context/AuthProvider";

export default function Results() {
  const [showPreview, setShowPreview] = useState(false);
  const [results, setResults] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const { user } = useAuth();

  useEffect(() => {
    fetchResults();
  }, [user?._id]);

  const fetchResults = async () => {
    try {
      setIsLoading(true);
      setError(null);
      console.log('Fetching results for student...');
      
      const response = await resultAPI.getAllResults();
      console.log('Results API Response:', response);
      
      // Handle different response formats
      const resultData = response?.results || response?.data || response || [];
      console.log('Results data:', resultData);
      console.log('Results count:', resultData.length);
      
      // Transform API data to match component format
      const transformedResults = resultData.map(r => ({
        _id: r._id,
        examName: r.examName || r.exam?.examName || 'N/A',
        subject: r.exam?.subjectName || r.subject || 'N/A',
        marks: r.marksObtained ?? r.marks ?? 0,
        total: r.exam?.totalMarks ?? r.totalMarks ?? 100,
        grade: r.grade || 'N/A',
        studentClass: r.class || r.student?.class || user?.class || 'N/A',
        section: r.section || r.student?.section || user?.section || 'N/A',
        date: r.createdAt || r.exam?.examDate || 'N/A'
      }));
      
      console.log('Transformed Results:', transformedResults);
      setResults(transformedResults);
      
    } catch (error) {
      console.error('Error fetching results:', error);
      setError(error.message || 'Failed to fetch results');
      setResults([]);
    } finally {
      setIsLoading(false);
    }
  };

  const totalMarks = results.reduce((sum, r) => sum + (r.marks || 0), 0);
  const totalPossible = results.reduce((sum, r) => sum + (r.total || 0), 0);
  const overallPercentage = totalPossible > 0 ? ((totalMarks / totalPossible) * 100).toFixed(2) : 0;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-xl">Loading results...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-xl text-red-600">Error: {error}</div>
      </div>
    );
  }

  if (results.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-xl">No results found.</div>
      </div>
    );
  }

  const handleViewResult = () => {
    setShowPreview(true);
    setTimeout(() => {
      confetti({
        particleCount: 600,
        spread: 80,
        origin: { y: 0.9 },
        colors: ["#facc15", "#f59e0b", "#eab308", "#fbbf24", "#fcd34d"],
      });
    }, 300);
  };

  return (
    <div 
      className="min-h-screen p-6"
      style={{ background: "linear-gradient(to bottom right, #fffdf3, #fffbea, #fff6d9)" }}
    >
      <div className="max-w-5xl mx-auto">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6">
          <div>
            <h1 className="text-3xl font-extrabold text-[var(--text-secondary)] flex items-center gap-2">
              🎓 School Result Dashboard
              {overallPercentage > 90 && <Crown className="text-yellow-500 animate-bounce" />}
            </h1>
            <p className="text-yellow-600 mt-1 text-sm">
              Welcome to the Royal Academic Portal 🌟
            </p>
          </div>

          <div className="flex gap-3 mt-4 sm:mt-0">
            <motion.button
              whileHover={{ scale: 1.05 }}
              onClick={handleViewResult}
              style={{ backgroundColor: "var(--primary-color)" }}
              className="flex items-center gap-2 text-gray-800 px-4 py-2 rounded-xl shadow-lg"
            >
              <FiEye /> View Result
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.05 }}
              onClick={() => alert("PDF Download Coming Soon 🚀")}
              className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-xl shadow-lg"
            >
              <FiDownload /> Download PDF
            </motion.button>
          </div>
        </div>

        <div 
          style={{
            backgroundColor: "var(--card-bg)",
            boxShadow: "-6px 4px 12px rgba(0, 0, 0, 0.25)",
          }}
          className="backdrop-blur-lg rounded-2xl overflow-hidden border border-yellow-300"
        >
          <div className="grid grid-cols-4 gap-4 p-4 bg-yellow-50 border-b border-yellow-200">
            <div className="text-sm font-bold text-[var(--text-secondary)]">Exam</div>
            <div className="text-sm font-bold text-[var(--text-secondary)]">Subject</div>
            <div className="text-sm font-bold text-[var(--text-secondary)]">Marks</div>
            <div className="text-sm font-bold text-[var(--text-secondary)]">Total</div>
          </div>

          {results.map((r, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className="grid grid-cols-4 gap-4 p-4 border-b border-yellow-200"
            >
              <div className="font-semibold text-gray-600 text-sm">{r.examName || 'N/A'}</div>
              <div className="font-semibold text-gray-800">{r.subject}</div>
              <div
                className={`font-bold ${
                  r.marks >= 90
                    ? "text-yellow-600"
                    : r.marks >= 80
                    ? "text-green-600"
                    : "text-blue-600"
                }`}
              >
                {r.marks}
              </div>
              <div className="text-gray-600">{r.total}</div>
            </motion.div>
          ))}

          <div className="p-4 bg-yellow-50 flex justify-between items-center">
            <p className="font-semibold text-[var(--text-secondary)]">Overall Percentage:</p>
            <p className="text-2xl font-bold text-yellow-600">
              {overallPercentage.toFixed(2)}%
            </p>
          </div>
        </div>
      </div>

      {/* Modal */}
      <AnimatePresence>
        {showPreview && (
          <motion.div 
            className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50"
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            exit={{ opacity: 0 }}
          >
            <motion.div
              initial={{ scale: 0.8 }} 
              animate={{ scale: 1 }} 
              exit={{ scale: 0.8 }}
              style={{
                backgroundColor: "var(--card-bg)",
                boxShadow: "-6px 4px 12px rgba(0, 0, 0, 0.25)",
              }}
              className="rounded-2xl max-w-xl w-full overflow-hidden border-2 border-yellow-400"
            >
              <div className="flex justify-between items-center p-5 border-b bg-yellow-50">
                <h2 className="text-xl font-bold text-[var(--text-secondary)]">🏅 Royal Report Card</h2>
                <button onClick={() => setShowPreview(false)} className="text-yellow-600 hover:text-black">
                  <FiX size={22} />
                </button>
              </div>

              <div className="p-6">
                <p className="font-semibold text-center text-[var(--text-secondary)]">{user?.name || 'Student'}</p>
                <p className="text-center text-sm text-gray-600 mb-4">
                  Class: {user?.class || results[0]?.studentClass || 'N/A'} 
                  {results[0]?.section ? `- ${results[0].section}` : ''} | Session: 2025
                </p>

                <table className="w-full border border-yellow-200">
                  <thead className="bg-yellow-50 text-[var(--text-secondary)]">
                    <tr>
                      <th className="p-2 text-left border border-yellow-200">Exam</th>
                      <th className="p-2 text-left border border-yellow-200">Subject</th>
                      <th className="p-2 text-center border border-yellow-200">Marks</th>
                      <th className="p-2 text-center border border-yellow-200">Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {results.map((r, i) => (
                      <tr key={i} className="border border-yellow-200">
                        <td className="p-2 border border-yellow-200 text-sm text-gray-600">{r.examName || 'N/A'}</td>
                        <td className="p-2 border border-yellow-200">{r.subject}</td>
                        <td className="p-2 text-center font-bold text-yellow-600 border border-yellow-200">{r.marks}</td>
                        <td className="p-2 text-center border border-yellow-200">{r.total}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>

                <div className="mt-4 text-center font-bold text-[var(--text-secondary)]">
                  Percentage: {overallPercentage.toFixed(2)}%
                </div>

                <div className="mt-6 flex justify-between items-center">
                  <p>Signature: ____________</p>
                  <button className="bg-green-600 text-white px-4 py-2 rounded-lg">
                    <FiDownload className="inline" /> Download
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}