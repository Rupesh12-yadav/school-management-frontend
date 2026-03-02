// src/components/ui/Button.jsx
import React from "react";

export const Button = ({ children, ...props }) => {
  return (
    <button {...props} className="bg-blue-500 text-white px-4 py-2 rounded">
      {children}
    </button>
  );
};
