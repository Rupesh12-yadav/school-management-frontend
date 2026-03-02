// Home.jsx
import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";// eslint-disable-line
import Navbar from "../../Components/Navbar";
import heroImg from "../../assets/download (3).jpg";
import Login from "../../Components/Login";

const Home = ({ openLoginExternally }) => {
  const [showLogin, setShowLogin] = useState(false);

  // Navbar se login open kare
  useEffect(() => {
    if (openLoginExternally) setShowLogin(true);
  }, [openLoginExternally]);

  // Courses Data
  const courses = [
    { id: 1, name: "Basic Computer", description: "Learn computer basics and MS Office.", classLevel: "10", duration: "30 hours", teacher: "Mr. Aman Verma" },
    { id: 2, name: "Arts", description: "Creative arts classes for imagination and skills.", classLevel: "9-12", duration: "40 hours", teacher: "Ms. Neha Sharma" },
    { id: 3, name: "Maths-Science", description: "Learn problem solving and scientific concepts together.", classLevel: "11", duration: "50 hours", teacher: "Mr. Ravi Kumar" },
    { id: 4, name: "Biology-Science", description: "Learn human body, plants, and environment.", classLevel: "12", duration: "45 hours", teacher: "Ms. Sneha Gupta" },
  ];

  return (
    <div className="min-h-screen bg-white text-gray-900 overflow-hidden relative">
      {/* Navbar */}
      <Navbar onLoginClick={() => setShowLogin(true)} />

      {/* Hero Section */}
      <main className="pl-[70px] pt-32 pb-24 px-6 bg-gradient-to-b from-yellow-50 to-white relative">
        <div className="max-w-7xl mx-auto flex flex-col lg:flex-row items-center gap-12 relative">
          <AnimatePresence>
            {!showLogin && (
              <>
                {/* Left Text */}
                <motion.div
                  key="left"
                  initial={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -300 }}
                  transition={{ duration: 0.8, ease: "easeInOut" }}
                  className="w-full lg:w-6/12"
                >
                  <h1 className="text-5xl font-extrabold text-gray-900 leading-tight">
                    We are the top <br />
                    <span className="text-yellow-500">Learning Platform</span>
                  </h1>
                  <p className="mt-4 text-gray-600 text-lg leading-relaxed">
                    Simplify Learning, Attendance, and Results — manage everything easily
                    through one modern and secure portal.
                  </p>

                  <div className="mt-8 flex gap-4">
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      onClick={() => setShowLogin(true)}
                      className="bg-yellow-400 text-white px-8 py-3 rounded-full font-semibold shadow hover:bg-yellow-500 transition"
                    >
                      Get Started
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      className="border border-yellow-400 text-yellow-500 px-8 py-3 rounded-full font-semibold hover:bg-yellow-50 transition"
                    >
                      Learn More
                    </motion.button>
                  </div>
                </motion.div>

                {/* Right Image */}
                <motion.div
                  key="right"
                  initial={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 300 }}
                  transition={{ duration: 0.8, ease: "easeInOut" }}
                  className="w-full lg:w-6/12 flex justify-center"
                >
                  <img
                    src={heroImg}
                    alt="Classroom"
                    className="rounded-2xl shadow-2xl max-w-md lg:max-w-lg"
                  />
                </motion.div>
              </>
            )}
          </AnimatePresence>

          {/* Login Form */}
          <AnimatePresence>
            {showLogin && (
              <motion.div
                key="login"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.7 }}
                transition={{ duration: 0.6, ease: "easeInOut" }}
                className="fixed inset-0 flex items-center justify-center bg-white/80 backdrop-blur-sm z-[999]"
              >
                <Login closeLogin={() => setShowLogin(false)} />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </main>

      {/* About Section */}
      <section className="py-20 px-6 bg-yellow-50">
        <div className="max-w-4xl mx-auto bg-yellow-100 rounded-2xl shadow-2xl p-8 text-center">
          <h2 className="text-3xl font-bold text-yellow-600 mb-6">About Our School</h2>
          <p className="text-gray-700 text-lg leading-relaxed">
            The School Management System is a digital platform that helps manage all school
            activities in one place. It connects teachers, students, and administrators to make
            work faster and easier. Teachers can upload marks and attendance, while students can
            view their progress and school updates. This system makes school management smart,
            simple, and efficient.
          </p>
        </div>
      </section>

      {/* Courses Section */}
      <section className="py-16 px-6 bg-yellow-50">
        <div className="max-w-6xl mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-8">
          {courses.map((course) => (
            <div
              key={course.id}
              className="bg-white rounded-2xl shadow-md p-6 hover:shadow-xl transition flex flex-col justify-start"
            >
              <h3 className="text-xl font-bold text-yellow-500 mb-2">{course.name}</h3>
              <p className="text-gray-600 text-sm mb-2">{course.description}</p>
              <p className="text-gray-500 text-xs mb-1">Class: {course.classLevel}</p>
              <p className="text-gray-500 text-xs mb-1">Duration: {course.duration}</p>
              <p className="text-gray-500 text-xs">Teacher: {course.teacher}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};

export default Home;
