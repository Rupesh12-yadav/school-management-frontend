import React, { useState } from "react";
import { useGetStudentsQuery, useGetTeachersQuery, useGetAdminsQuery, useDeleteUserMutation } from "../../../Api/SchoolApi";
import { FaTrash, FaUser } from "react-icons/fa";

const DeleteUser = () => {
  const { data: students = [] } = useGetStudentsQuery();
  const { data: teachers = [] } = useGetTeachersQuery();
  const { data: admins = [] } = useGetAdminsQuery();
  const [deleteUser] = useDeleteUserMutation();
  
  const [selectedType, setSelectedType] = useState("student");
  
  const handleDelete = async (type, id, name) => {
    if (window.confirm(`Are you sure you want to delete ${name}?`)) {
      try {
        await deleteUser({ type, id });
        alert("User deleted successfully!");
      } catch (error) {
        alert("Failed to delete user");
      }
    }
  };

  const renderUsers = () => {
    let users = [];
    switch(selectedType) {
      case "student":
        users = students.map(s => ({ ...s, type: "student" }));
        break;
      case "teacher":
        users = teachers.map(t => ({ ...t, type: "teacher" }));
        break;
      case "admin":
        users = admins.map(a => ({ ...a, type: "admin" }));
        break;
    }

    return users.map((user) => (
      <div key={user._id} className="flex items-center justify-between p-4 bg-white rounded-lg shadow">
        <div className="flex items-center gap-3">
          <FaUser className="text-gray-500" />
          <div>
            <p className="font-medium">{user.name} {user.lastname || ""}</p>
            <p className="text-sm text-gray-600">{user.email}</p>
          </div>
        </div>
        <button
          onClick={() => handleDelete(selectedType, user._id, user.name)}
          className="flex items-center gap-2 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition"
        >
          <FaTrash /> Delete
        </button>
      </div>
    ));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 to-pink-100 p-6">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center gap-3 mb-6">
          <FaTrash className="text-3xl text-red-600" />
          <h1 className="text-3xl font-bold text-gray-800">Delete Users</h1>
        </div>
        
        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">Select User Type</label>
            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              className="border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-red-500"
            >
              <option value="student">Students</option>
              <option value="teacher">Teachers</option>
              <option value="admin">Admins</option>
            </select>
          </div>
          
          <div className="space-y-4">
            {renderUsers()}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DeleteUser;