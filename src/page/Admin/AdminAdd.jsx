import React, { useState } from "react";
import { useAddAdminMutation } from "../../../Api/SchoolApi";
import { FaUserPlus } from "react-icons/fa";

const AdminAdd = () => {
  const [addAdmin, { isLoading }] = useAddAdminMutation();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    domain: ""
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await addAdmin(formData);
      alert("Admin added successfully!");
      setFormData({ name: "", email: "", password: "", domain: "" });
    } catch (error) {
      alert("Failed to add admin");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-6">
      <div className="max-w-2xl mx-auto bg-white rounded-xl shadow-lg p-8">
        <div className="flex items-center gap-3 mb-6">
          <FaUserPlus className="text-3xl text-blue-600" />
          <h1 className="text-3xl font-bold text-gray-800">Add New Admin</h1>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Name</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({...formData, name: e.target.value})}
              className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({...formData, email: e.target.value})}
              className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Password</label>
            <input
              type="password"
              value={formData.password}
              onChange={(e) => setFormData({...formData, password: e.target.value})}
              className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Domain</label>
            <select
              value={formData.domain}
              onChange={(e) => setFormData({...formData, domain: e.target.value})}
              className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500"
              required
            >
              <option value="">Select Domain</option>
              <option value="Management">Management</option>
              <option value="Academics">Academics</option>
              <option value="Finance">Finance</option>
              <option value="HR">HR</option>
              <option value="IT">IT</option>
            </select>
          </div>
          
          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-lg transition disabled:opacity-50"
          >
            {isLoading ? "Adding..." : "Add Admin"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default AdminAdd;