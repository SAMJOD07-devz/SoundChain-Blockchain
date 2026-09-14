import React from "react";

export function Card({ children, className = "", hover = false, ...props }) {
  return (
    <div
      className={`glass-panel rounded-2xl p-6 transition-all duration-300 ${
        hover ? "hover:-translate-y-1 hover:border-purple-500/30 hover:shadow-glow-purple" : ""
      } ${className}`}
      {...props}
    >
      {children}
    </div>
  );
}
