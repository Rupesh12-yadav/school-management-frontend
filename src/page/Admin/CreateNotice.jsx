import React, { useState } from "react";
import { noticeAPI } from "../../services/api";
import { FaBullhorn, FaImage } from "react-icons/fa";
import { useAuth } from "../../context/AuthProvider";

const CreateNotice = () => {
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    audience: "All",
    isImportant: false,
    image: ""
  });

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', 'school_notices');

    try {
      setUploading(true);
      const response = await fetch('https://api.cloudinary.com/v1_1/YOUR_CLOUD_NAME/image/upload', {
        method: 'POST',
        body: formData
      });
      const data = await response.json();
      setFormData(prev => ({ ...prev, image: data.secure_url }));
    } catch (error) {
      alert('Failed to upload image');
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const userId = user?._id || localStorage.getItem("userId");
      await noticeAPI.createNotice({ ...formData, createdBy: userId });
      alert("Notice created successfully!");
      setFormData({ title: "", description: "", audience: "All", isImportant: false, image: "" });
    } catch (error) {
      alert("Failed to create notice");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-yellow-50 to-orange-100 p-6">
      <div className="max-w-2xl mx-auto bg-white rounded-xl shadow-lg p-8">
        <div className="flex items-center gap-3 mb-6">
          <FaBullhorn className="text-3xl text-yellow-600" />
          <h1 className="text-3xl font-bold text-gray-800">Create Notice</h1>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Title</label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({...formData, title: e.target.value})}
              className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-yellow-500"
              required
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({...formData, description: e.target.value})}
              className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-yellow-500 h-32 resize-none"
              required
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Audience</label>
            <select
              value={formData.audience}
              onChange={(e) => setFormData({...formData, audience: e.target.value})}
              className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-yellow-500"
            >
              <option value="All">All</option>
              <option value="Students">Students</option>
              <option value="Teachers">Teachers</option>
              <option value="Parents">Parents</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
              <FaImage /> Notice Image (Optional)
            </label>
            <input
              type="file"
              accept="image/*"
              onChange={handleImageUpload}
              className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-yellow-500"
            />
            {uploading && <p className="text-sm text-blue-600 mt-2">Uploading image...</p>}
            {formData.image && (
              <div className="mt-3">
                <img src={formData.image} alt="Preview" className="w-32 h-32 object-cover rounded-lg" />
              </div>
            )}
          </div>
          
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="important"
              checked={formData.isImportant}
              onChange={(e) => setFormData({...formData, isImportant: e.target.checked})}
              className="w-4 h-4 text-yellow-600 focus:ring-yellow-500"
            />
            <label htmlFor="important" className="text-sm font-medium text-gray-700">
              Mark as Important
            </label>
          </div>
          
          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-yellow-600 hover:bg-yellow-700 text-white font-semibold py-3 rounded-lg transition disabled:opacity-50"
          >
            {isLoading ? "Creating..." : "Create Notice"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default CreateNotice;