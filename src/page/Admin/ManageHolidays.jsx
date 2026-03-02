import React, { useState, useEffect } from "react";
import { holidayAPI } from "../../../services/api";
import { toast } from "react-toastify";
import { FaCalendarAlt, FaPlus, FaTrash } from "react-icons/fa";

const ManageHolidays = () => {
  const [holidays, setHolidays] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    date: "",
    description: "",
    type: "School"
  });

  const fetchHolidays = async () => {
    try {
      setIsLoading(true);
      const data = await holidayAPI.getAllHolidays();
      setHolidays(data.data || data || []);
    } catch (error) {
      console.error('Error fetching holidays:', error);
      toast.error('Failed to fetch holidays');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchHolidays();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await holidayAPI.createHoliday(formData);
      setFormData({ name: "", date: "", description: "", type: "School" });
      setShowForm(false);
      fetchHolidays();
      toast.success('Holiday added successfully');
    } catch (error) {
      toast.error("Failed to add holiday");
    }
  };

  const handleDelete = async (id, name) => {
    if (window.confirm(`Delete ${name}?`)) {
      try {
        await holidayAPI.deleteHoliday(id);
        fetchHolidays();
        toast.success('Holiday deleted successfully');
      } catch (error) {
        toast.error("Failed to delete holiday");
      }
    }
  };

  if (isLoading) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-100 p-6">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <FaCalendarAlt className="text-3xl text-green-600" />
            <h1 className="text-3xl font-bold text-gray-800">Manage Holidays</h1>
          </div>
          <button
            onClick={() => setShowForm(!showForm)}
            className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition"
          >
            <FaPlus /> Add Holiday
          </button>
        </div>

        {showForm && (
          <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
            <h2 className="text-xl font-semibold mb-4">Add New Holiday</h2>
            <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Holiday Name</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-green-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Date</label>
                <input
                  type="date"
                  value={formData.date}
                  onChange={(e) => setFormData({...formData, date: e.target.value})}
                  className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-green-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Type</label>
                <select
                  value={formData.type}
                  onChange={(e) => setFormData({...formData, type: e.target.value})}
                  className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-green-500"
                >
                  <option value="School">School</option>
                  <option value="National">National</option>
                  <option value="Religious">Religious</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                <input
                  type="text"
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-green-500"
                />
              </div>
              <div className="md:col-span-2 flex gap-4">
                <button type="submit" className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-lg transition">
                  Add Holiday
                </button>
                <button type="button" onClick={() => setShowForm(false)} className="bg-gray-500 hover:bg-gray-600 text-white px-6 py-2 rounded-lg transition">
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        <div className="bg-white rounded-xl shadow-lg p-6">
          <h2 className="text-xl font-semibold mb-4">All Holidays</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {holidays.map((holiday) => (
              <div key={holiday._id} className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-start justify-between mb-2">
                  <h3 className="font-semibold text-gray-800">{holiday.name}</h3>
                  <button
                    onClick={() => handleDelete(holiday._id, holiday.name)}
                    className="text-red-500 hover:text-red-700"
                  >
                    <FaTrash />
                  </button>
                </div>
                <p className="text-sm text-gray-600 mb-1">
                  {new Date(holiday.date).toLocaleDateString()}
                </p>
                <p className="text-xs text-gray-500 mb-2">{holiday.description}</p>
                <span className={`inline-block px-2 py-1 rounded text-xs ${
                  holiday.type === "National" ? "bg-blue-100 text-blue-800" :
                  holiday.type === "Religious" ? "bg-purple-100 text-purple-800" :
                  "bg-green-100 text-green-800"
                }`}>
                  {holiday.type}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ManageHolidays;