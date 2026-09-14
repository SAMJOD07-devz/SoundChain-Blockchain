import React from "react";

export function Badge({ children, variant = "emerald", className = "" }) {
  const variantClasses = {
    emerald: "bg-emerald-500/10 text-emerald-300 border-emerald-500/30",
    mint: "bg-emerald-500/10 text-emerald-300 border-emerald-500/30",
    gold: "bg-amber-500/10 text-amber-300 border-amber-500/30",
    amber: "bg-amber-500/10 text-amber-300 border-amber-500/30",
    lime: "bg-lime-500/10 text-lime-300 border-lime-500/30",
    titanium: "bg-white/[0.05] text-slate-200 border-white/10",
    rose: "bg-rose-500/10 text-rose-300 border-rose-500/30",
    neutral: "bg-slate-900/80 text-slate-300 border-white/10",
    purple: "bg-emerald-500/10 text-emerald-300 border-emerald-500/30", // graceful fallback
    teal: "bg-amber-500/10 text-amber-300 border-amber-500/30", // graceful fallback
  };

  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-mono font-semibold border ${variantClasses[variant] || variantClasses.emerald} ${className}`}
    >
      {children}
    </span>
  );
}
