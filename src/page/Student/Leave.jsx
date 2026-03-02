import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Upload, Send, Eye, X } from "lucide-react";
import { leaveAPI } from "../../services/api";

const LeaveApply = () => {
  const [formData, setFormData] = useState({
    fromDate: "",
    toDate: "",
    reason: "",
    file: null,
  });

  const [status, setStatus] = useState("");
  const [showPreview, setShowPreview] = useState(false);
  const [leaveHistory, setLeaveHistory] = useState([]);

  useEffect(() => {
    fetchLeaveHistory();
  }, []);

  const fetchLeaveHistory = async () => {
    try {
      const response = await leaveAPI.getMyLeaves();
      setLeaveHistory(response);
    } catch (error) {
      console.error("Error fetching leave history:", error);
    }
  };

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    setFormData({
      ...formData,
      [name]: files ? files[0] : value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await leaveAPI.applyLeave({
        fromDate: formData.fromDate,
        toDate: formData.toDate,
        reason: formData.reason,
        attachment: formData.file?.name || ""
      });
      setStatus("Pending");
      alert("✅ Leave Request Submitted Successfully!");
      setFormData({ fromDate: "", toDate: "", reason: "", file: null });
      fetchLeaveHistory();
    } catch (error) {
      alert("❌ Error: " + (error.message || "Failed to submit leave request"));
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case "Approved":
        return "bg-green-100 text-green-700";
      case "Rejected":
        return "bg-red-100 text-red-700";
      case "Pending":
        return "bg-yellow-100 text-yellow-700";
      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  return (
    <div 
      className="min-h-screen flex flex-col justify-center items-center p-6 overflow-hidden relative gap-6"
      style={{ background: "linear-gradient(to bottom right, #fffdf3, #fffbea, #fff6d9)" }}
    >
      {/* Floating Papers */}
      <AnimatePresence>
        {[...Array(8)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-6 h-8 rounded shadow-md border border-yellow-300"
            style={{
              backgroundColor: "var(--card-bg)",
              opacity: 0.8,
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
            }}
            initial={{ opacity: 0, y: 0 }}
            animate={{ opacity: [0, 1, 0], y: ["0%", "110%"] }}
            transition={{ duration: 8 + i * 2, repeat: Infinity }}
          />
        ))}
      </AnimatePresence>

      {/* Notebook Card */}
      <motion.div
        style={{
          backgroundColor: "var(--card-bg)",
          boxShadow: "-6px 4px 12px rgba(0, 0, 0, 0.25)",
        }}
        className="border-4 border-yellow-400 rounded-[2rem] p-8 w-full max-w-xl relative"
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
      >
        {/* Stickers */}
        <span className="absolute -top-6 left-6 text-4xl">📒</span>
        <span className="absolute -top-6 right-6 text-4xl">✏️</span>

        <h1 className="text-3xl font-extrabold text-[var(--text-secondary)] text-center mb-6">
          🏫 School Leave Form
        </h1>

        {/* Dotted Paper Form */}
        <div className="border border-yellow-300 bg-yellow-50 p-5 rounded-xl shadow-inner">
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* From Date */}
            <div>
              <label className="font-semibold text-gray-700">From Date</label>
              <input
                type="date"
                name="fromDate"
                value={formData.fromDate}
                onChange={handleChange}
                className="w-full border border-yellow-400 p-2 rounded-lg focus:ring-2 focus:ring-yellow-400 outline-none bg-yellow-50"
                required
              />
            </div>

            {/* To Date */}
            <div>
              <label className="font-semibold text-gray-700">To Date</label>
              <input
                type="date"
                name="toDate"
                value={formData.toDate}
                onChange={handleChange}
                className="w-full border border-yellow-400 p-2 rounded-lg focus:ring-2 focus:ring-yellow-400 outline-none bg-yellow-50"
                required
              />
            </div>

            {/* Reason */}
            <div>
              <label className="font-semibold text-gray-700">Reason</label>
              <textarea
                name="reason"
                value={formData.reason}
                onChange={handleChange}
                placeholder="Example: Fever / Family Function / Travel"
                rows="3"
                className="w-full border border-yellow-400 p-2 rounded-lg focus:ring-2 focus:ring-yellow-400 outline-none bg-yellow-50"
                required
              ></textarea>
            </div>

            {/* File */}
            <div>
              <label className="font-semibold text-gray-700 flex gap-2 items-center">
                Upload Attachment <Upload className="w-5 h-5 text-yellow-600" />
              </label>
              <input
                type="file"
                name="file"
                onChange={handleChange}
                className="w-full border border-yellow-300 p-2 rounded-lg bg-yellow-50"
              />
            </div>

            {/* Buttons */}
            <div className="flex justify-between items-center gap-4">
              <button
                type="submit"
                style={{ backgroundColor: "var(--primary-color)" }}
                className="hover:bg-yellow-500 text-gray-800 px-5 py-2 rounded-xl flex gap-2 items-center font-semibold"
              >
                <Send className="w-5 h-5" /> Submit
              </button>

              <button
                type="button"
                onClick={() => setShowPreview(true)}
                className="bg-gray-800 text-white px-5 py-2 rounded-xl flex gap-2 items-center font-semibold"
              >
                <Eye className="w-5 h-5" /> Preview
              </button>
            </div>

            {status && <p className="text-yellow-700 font-bold text-center mt-4">Status: {status}</p>}
          </form>
        </div>
      </motion.div>

      {/* Preview Modal */}
      <AnimatePresence>
        {showPreview && (
          <motion.div
            className="fixed inset-0 bg-black/40 flex justify-center items-center z-50 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <motion.div
              style={{
                backgroundColor: "var(--card-bg)",
                boxShadow: "-6px 4px 12px rgba(0, 0, 0, 0.25)",
              }}
              className="p-8 rounded-3xl border-4 border-yellow-400 w-11/12 max-w-md relative"
              initial={{ scale: 0.8 }}
              animate={{ scale: 1 }}
            >
              <button
                className="absolute right-4 top-4 text-red-500"
                onClick={() => setShowPreview(false)}
              >
                <X className="w-7 h-7" />
              </button>

              <h2 className="text-2xl font-bold text-[var(--text-secondary)] text-center mb-4">📘 Preview</h2>

              <p><b>From:</b> {formData.fromDate}</p>
              <p><b>To:</b> {formData.toDate}</p>
              <p><b>Reason:</b> {formData.reason}</p>
              {formData.file && <p><b>File:</b> {formData.file.name}</p>}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Leave History Section */}
      <motion.div
        style={{ backgroundColor: "var(--card-bg)" }}
        className="border-4 border-yellow-400 rounded-[2rem] p-6 w-full max-w-4xl"
        initial={{ y: 50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.2 }}
      >
        <h2 className="text-2xl font-bold text-[var(--text-secondary)] mb-4 flex items-center gap-2">
          📋 My Leave History
        </h2>
        
        {leaveHistory.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-yellow-100 border-b-2 border-yellow-400">
                <tr>
                  <th className="p-3">From</th>
                  <th className="p-3">To</th>
                  <th className="p-3">Reason</th>
                  <th className="p-3">Status</th>
                  <th className="p-3">Teacher</th>
                </tr>
              </thead>
              <tbody>
                {leaveHistory.map((leave) => (
                  <tr key={leave._id} className="border-b hover:bg-yellow-50">
                    <td className="p-3">{new Date(leave.fromDate).toLocaleDateString()}</td>
                    <td className="p-3">{new Date(leave.toDate).toLocaleDateString()}</td>
                    <td className="p-3">{leave.reason}</td>
                    <td className="p-3">
                      <span className={`px-3 py-1 rounded-full text-sm font-semibold ${getStatusBadge(leave.status)}`}>
                        {leave.status}
                      </span>
                    </td>
                    <td className="p-3">{leave.teacher?.name || "N/A"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-gray-500 text-center py-4">No leave requests yet.</p>
        )}
      </motion.div>
    </div>
  );
};

export default LeaveApply;