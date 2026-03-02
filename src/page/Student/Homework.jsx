import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FileDown, BookOpen, XCircle } from "lucide-react";
import { homeworkAPI } from "../../services/api";

const Homework = () => {
  const [selectedHomework, setSelectedHomework] = useState(null);
  const [homeworkData, setHomeworkData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchHomework();
  }, []);

  const fetchHomework = async () => {
    try {
      setIsLoading(true);
      const response = await homeworkAPI.getAllHomework();
      console.log('Homework API Response:', response);
      const homeworkList = Array.isArray(response) ? response : [];
      console.log('Homework list:', homeworkList);
      setHomeworkData(homeworkList);
    } catch (error) {
      console.error('Error fetching homework:', error);
      setHomeworkData([]);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-xl">Loading homework...</div>
      </div>
    );
  }

  return (
    <div className="relative p-4 font-sans">
      <h2 className="text-xl sm:text-2xl font-extrabold mb-6 text-[var(--text-secondary)]">
        📚 Homework Assignments
      </h2>

      {homeworkData.length === 0 ? (
        <div className="text-center py-10 text-gray-500">
          No homework assigned yet.
        </div>
      ) : (
        <>

      {/* PC / Tablet Table */}
      <div 
        style={{
          backgroundColor: "var(--card-bg)",
          boxShadow: "-6px 4px 12px rgba(0, 0, 0, 0.25)",
        }}
        className="hidden sm:block rounded-xl border border-yellow-200 overflow-hidden"
      >
        <table className="w-full text-sm text-gray-700">
          <thead className="bg-yellow-50 text-gray-800 uppercase text-xs">
            <tr>
              <th className="px-4 py-3 border border-yellow-200">Title</th>
              <th className="px-4 py-3 border border-yellow-200">Subject</th>
              <th className="px-4 py-3 border border-yellow-200">Class</th>
              <th className="px-4 py-3 border border-yellow-200">Teacher</th>
              <th className="px-4 py-3 border border-yellow-200">Date</th>
              <th className="px-4 py-3 text-center border border-yellow-200">File</th>
              <th className="px-4 py-3 text-center border border-yellow-200">Action</th>
            </tr>
          </thead>
          <tbody>
            {homeworkData.map((hw) => (
              <motion.tr
                key={hw._id}
                whileHover={{ scale: 1.02, backgroundColor: "#FFF7CC" }}
                transition={{ duration: 0.2 }}
                className="border-b border-yellow-200"
              >
                <td className="px-4 py-3 font-medium border border-yellow-200">{hw.title}</td>
                <td className="px-4 py-3 border border-yellow-200">{hw.subject || 'N/A'}</td>
                <td className="px-4 py-3 border border-yellow-200">{hw.classSection || 'N/A'}</td>
                <td className="px-4 py-3 border border-yellow-200">{hw.assignedBy?.name || 'Teacher'}</td>
                <td className="px-4 py-3 border border-yellow-200">{hw.dueDate ? new Date(hw.dueDate).toLocaleDateString() : 'N/A'}</td>
                <td className="px-4 py-3 text-center border border-yellow-200">
                  {hw.file ? (
                    <a
                      href={hw.file}
                      download
                      className="text-yellow-700 hover:underline flex items-center gap-1 justify-center"
                    >
                      <FileDown size={18} /> Download
                    </a>
                  ) : (
                    <span className="text-gray-400">No file</span>
                  )}
                </td>
                <td className="px-4 py-3 text-center border border-yellow-200">
                  <button
                    onClick={() => setSelectedHomework(hw)}
                    style={{ backgroundColor: "var(--primary-color)" }}
                    className="text-gray-800 px-4 py-1.5 rounded-md hover:bg-yellow-500"
                  >
                    View
                  </button>
                </td>
              </motion.tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile Card Layout */}
      <div className="sm:hidden flex flex-col gap-4">
        {homeworkData.map((hw) => (
          <motion.div
            key={hw._id}
            style={{
              backgroundColor: "var(--card-bg)",
              boxShadow: "-6px 4px 12px rgba(0, 0, 0, 0.25)",
            }}
            className="border border-yellow-200 rounded-xl p-4"
            whileTap={{ scale: 0.97 }}
          >
            <div className="font-bold text-lg text-yellow-700 flex items-center gap-2">
              <BookOpen size={20} /> {hw.title}
            </div>
            <p className="text-sm text-gray-600 mt-1">
              📚 {hw.subject || 'N/A'}
            </p>
            <p className="text-sm text-gray-600">
              🎓 {hw.classSection || 'N/A'}
            </p>
            <p className="text-sm text-gray-600">
              👨🏫 {hw.assignedBy?.name || 'Teacher'}
            </p>
            <p className="text-sm text-gray-600">
              📅 {hw.dueDate ? new Date(hw.dueDate).toLocaleDateString() : 'N/A'}
            </p>

            <div className="mt-3 flex gap-3">
              {hw.file && (
                <a
                  href={hw.file}
                  download
                  className="flex-1 text-center bg-yellow-500 text-white py-2 rounded-lg text-sm"
                >
                  Download
                </a>
              )}
              <button
                onClick={() => setSelectedHomework(hw)}
                className="flex-1 text-center bg-yellow-700 text-white py-2 rounded-lg text-sm"
              >
                View
              </button>
            </div>
          </motion.div>
        ))}
      </div>
      </>
      )}

      {/* Modal */}
      <AnimatePresence>
        {selectedHomework && (
          <motion.div
            className="fixed inset-0 bg-black/50 flex justify-center items-center z-50 px-3"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSelectedHomework(null)}
          >
            <motion.div
              style={{
                backgroundColor: "var(--card-bg)",
                boxShadow: "-6px 4px 12px rgba(0, 0, 0, 0.25)",
              }}
              className="w-full max-w-sm sm:max-w-md rounded-2xl p-6 border border-yellow-400 relative"
              onClick={(e) => e.stopPropagation()}
              initial={{ scale: 0.7, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.7, opacity: 0 }}
            >
              <div className="flex items-center gap-2 mb-3 text-yellow-700 font-bold text-lg">
                <BookOpen size={22} /> {selectedHomework.title}
              </div>
              <p><b>Subject:</b> {selectedHomework.subject || 'N/A'}</p>
              <p><b>Class:</b> {selectedHomework.classSection || 'N/A'}</p>
              <p><b>Teacher:</b> {selectedHomework.assignedBy?.name || 'Teacher'}</p>
              <p><b>Due Date:</b> {selectedHomework.dueDate ? new Date(selectedHomework.dueDate).toLocaleDateString() : 'N/A'}</p>
              <p className="mt-3 text-gray-700"><b>Description:</b> {selectedHomework.description}</p>

              {selectedHomework.file && (
                <a
                  href={selectedHomework.file}
                  download
                  style={{ backgroundColor: "var(--primary-color)" }}
                  className="block mt-4 w-full text-center text-gray-800 py-2 rounded-lg"
                >
                  📎 Download File
                </a>
              )}

              <button
                onClick={() => setSelectedHomework(null)}
                className="absolute top-2 right-2 text-red-600"
              >
                <XCircle size={26} />
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Homework;