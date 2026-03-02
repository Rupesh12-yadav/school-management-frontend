import React, { createContext, useState, useEffect, useContext } from "react";

// Context
const AuthContext = createContext();

// Custom hook
// eslint-disable-next-line react-refresh/only-export-components
export const useAuth = () => useContext(AuthContext);

// Provider
const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(undefined); // undefined = loading, null = not logged in
  const [loading, setLoading] = useState(true);

  // On page load, get user from localStorage
  useEffect(() => {
    const token = localStorage.getItem("token");
    const role = localStorage.getItem("role");
    const email = localStorage.getItem("email");
    const userId = localStorage.getItem("userId");
    const name = localStorage.getItem("name");
    
    if (token && role && email) {
      setUser({ token, role, email, _id: userId, name });
    } else {
      setUser(null);
    }
    setLoading(false);
  }, []);

  const login = (data) => {
    localStorage.setItem("token", data.token);
    localStorage.setItem("role", data.role);
    localStorage.setItem("email", data.email);
    localStorage.setItem("userId", data._id);
    localStorage.setItem("name", data.name);
    setUser({ 
      token: data.token, 
      role: data.role, 
      email: data.email, 
      _id: data._id,
      name: data.name 
    });
  };

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    localStorage.removeItem("email");
    localStorage.removeItem("userId");
    localStorage.removeItem("name");
    setUser(null);
    window.location.href = "/";
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-xl">Loading...</div>
      </div>
    );
  }

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthProvider; // ✅ default export
