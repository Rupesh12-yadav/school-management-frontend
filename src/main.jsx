// React library import kar rahe hain
import React from "react";
// ReactDOM import kar rahe hain - DOM mein render karne ke liye
import ReactDOM from "react-dom/client";
// Main App component import kar rahe hain
import App from "./App";

// React app ko DOM mein render kar rahe hain
ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
