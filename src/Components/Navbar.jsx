import React, { useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";// eslint-disable-line

const Navbar = ({ onLoginClick }) => {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <header className="fixed top-0 left-0 w-full bg-white shadow-md z-[1000]">
      <nav className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
        <div className="flex items-center gap-2 cursor-pointer">
          <div className="w-10 h-10 bg-yellow-400 text-white flex items-center justify-center rounded-full font-bold text-lg shadow">
            S
          </div>
          <h1 className="font-extrabold text-gray-800 text-xl">MySchool</h1>
        </div>

        <ul className="hidden md:flex items-center space-x-8 font-semibold text-gray-700">
          <li><Link to="/" className="hover:text-yellow-500 transition">Home</Link></li>
          <li><Link to="/about" className="hover:text-yellow-500 transition">About</Link></li>
          <li><Link to="/courses" className="hover:text-yellow-500 transition">Courses</Link></li>
          <li><Link to="/contact" className="hover:text-yellow-500 transition">Contact</Link></li>
        </ul>

        {/* <div className="hidden md:block">
          <button
            onClick={onLoginClick}
            className="bg-yellow-400 text-white px-6 py-2 rounded-full font-semibold hover:bg-yellow-500 transition shadow"
          >
            Log In
          </button>
        </div> */}

        {/* Mobile menu toggle */}
        <button
          onClick={() => setMenuOpen(!menuOpen)}
          className="md:hidden text-gray-700 text-3xl"
        >
          {menuOpen ? "✖" : "☰"}
        </button>
      </nav>

      {/* Mobile Menu */}
      {menuOpen && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="bg-white shadow-md md:hidden flex flex-col items-center py-4 space-y-4 font-semibold text-gray-700"
        >
          <Link onClick={() => setMenuOpen(false)} to="/">Home</Link>
          <Link onClick={() => setMenuOpen(false)} to="/about">About</Link>
          <Link onClick={() => setMenuOpen(false)} to="/courses">Courses</Link>
          <Link onClick={() => setMenuOpen(false)} to="/contact">Contact</Link>
          <button
            onClick={() => {
              setMenuOpen(false);
              onLoginClick();
            }}
            className="bg-yellow-400 text-white px-6 py-2 rounded-full font-semibold hover:bg-yellow-500 transition"
          >
            Log In
          </button>
        </motion.div>
      )}
    </header>
  );
};

export default Navbar;
