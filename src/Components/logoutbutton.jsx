import React from "react";
import { motion } from "framer-motion"; // eslint-disable-line
import { FiLogOut } from "react-icons/fi";
import { useNavigate } from "react-router-dom";

const LogoutButton = ({ setUser }) => {
  const navigate = useNavigate();

  const handleLogout = () => {
    setUser(null); // user ko null karke logout kar do
    navigate("/"); // homepage pe bhej do
  };

  return (
    <motion.button
      onClick={handleLogout}
      className="flex items-center gap-2 px-4 py-2 bg-white border rounded-lg shadow-sm hover:bg-gray-100"
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
    >
      <FiLogOut /> Logout
    </motion.button>
  );
};

export default LogoutButton;
