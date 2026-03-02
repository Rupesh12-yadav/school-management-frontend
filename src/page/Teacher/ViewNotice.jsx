import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Megaphone, CalendarDays, X } from "lucide-react";
import { noticeAPI } from "../../services/api";

const ViewNotice = () => {
  const [announcements, setAnnouncements] = useState([]);
  const [selected, setSelected] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchNotices();
  }, []);

  const fetchNotices = async () => {
    try {
      setIsLoading(true);
      const response = await noticeAPI.getAllNotices();
      console.log('Notice API Response:', response);
      const noticesData = response.notices || response.data || response || [];
      console.log('Notices with images:', noticesData.map(n => ({ title: n.title, image: n.image })));
      setAnnouncements(Array.isArray(noticesData) ? noticesData : []);
    } catch (error) {
      console.error('Error fetching notices:', error);
      setAnnouncements([]);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-xl">Loading notices...</div>
      </div>
    );
  }

  return (
    <div 
      className="min-h-screen p-6"
      style={{ background: "linear-gradient(to bottom right, #fffdf3, #fffbea, #fff6d9)" }}
    >
      {/* Header */}
      <motion.div
        className="flex items-center justify-center gap-3 mb-8"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <Megaphone className="text-yellow-600 w-9 h-9" />
        <h1 className="text-3xl md:text-4xl font-extrabold text-[var(--text-secondary)] drop-shadow-md">
          📢 Announcements
        </h1>
      </motion.div>

      {/* Cards */}
      <div className="max-w-6xl mx-auto grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {announcements.length > 0 ? announcements.map((notice, i) => (
          <motion.div
            key={notice._id || notice.id}
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            whileHover={{ scale: 1.03 }}
            style={{
              backgroundColor: "var(--card-bg)",
              boxShadow: "-6px 4px 12px rgba(0, 0, 0, 0.25)",
            }}
            className="rounded-2xl border border-yellow-200 overflow-hidden cursor-pointer hover:shadow-[-8px_6px_16px_rgba(0,0,0,0.35)] transition-all"
            onClick={() => setSelected(notice)}
          >
            <div className="relative">
              <img
                src={notice.image || "https://images.unsplash.com/photo-1559027615-5bdf7f3e3c55?auto=format&fit=crop&w=900&q=80"}
                alt={notice.title}
                className="w-full h-48 object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
              <div className="absolute bottom-3 left-3 text-white text-sm flex items-center gap-2 font-medium">
                <CalendarDays size={14} />
                {new Date(notice.createdAt || notice.date).toLocaleDateString()}
              </div>
            </div>

            <div className="p-5">
              <h2 className="text-lg font-bold text-gray-900">
                {notice.title}
              </h2>
              <p className="text-gray-500 text-sm mt-1 font-medium">By {notice.author || notice.createdBy?.name || "Admin"}</p>
              <p className="text-gray-700 mt-3 line-clamp-3">
                {notice.description}
              </p>
              {notice.isImportant && (
                <span className="inline-block mt-2 bg-red-100 text-red-800 text-xs px-2 py-1 rounded-full">
                  Important
                </span>
              )}
            </div>
          </motion.div>
        )) : (
          <div className="col-span-full text-center py-10">
            <p className="text-gray-500 text-lg">No notices available</p>
          </div>
        )}
      </div>

      {/* Modal */}
      <AnimatePresence>
        {selected && (
          <motion.div
            className="fixed inset-0 bg-black/40 flex items-center justify-center p-4 z-50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              style={{
                backgroundColor: "var(--card-bg)",
                boxShadow: "-6px 4px 12px rgba(0, 0, 0, 0.25)",
              }}
              className="rounded-2xl max-w-2xl w-full overflow-hidden border border-yellow-200"
              initial={{ scale: 0.95, y: 30 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 30 }}
            >
              <div className="relative">
                <img
                  src={selected.image || "https://images.unsplash.com/photo-1559027615-5bdf7f3e3c55?auto=format&fit=crop&w=900&q=80"}
                  alt={selected.title}
                  className="w-full h-56 object-cover"
                />
                <button
                  onClick={() => setSelected(null)}
                  style={{ backgroundColor: "var(--primary-color)" }}
                  className="absolute top-3 right-3 hover:bg-yellow-500 text-gray-800 p-2 rounded-full shadow"
                >
                  <X size={18} />
                </button>
              </div>

              <div className="p-6">
                <h2 className="text-2xl font-bold text-gray-900">
                  {selected.title}
                </h2>
                <p className="text-sm text-gray-500 mb-3 font-medium">
                  {selected.author || selected.createdBy?.name || "Admin"} • {new Date(selected.createdAt || selected.date).toLocaleDateString()}
                </p>
                <p className="text-gray-700 leading-relaxed">{selected.description}</p>
                {selected.isImportant && (
                  <div className="mt-4">
                    <span className="bg-red-100 text-red-800 text-sm px-3 py-1 rounded-full">
                      ⚠️ Important Notice
                    </span>
                  </div>
                )}
                <div className="mt-4 text-sm text-gray-600">
                  <p><strong>Audience:</strong> {selected.audience || "All"}</p>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ViewNotice;
