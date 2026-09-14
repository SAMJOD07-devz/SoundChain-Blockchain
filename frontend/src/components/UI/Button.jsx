import React from "react";
import { Spinner } from "./Spinner";

export function Button({
  children,
  variant = "primary", // primary | secondary | outline | ghost | mint | gold
  size = "md", // sm | md | lg
  isLoading = false,
  isDisabled = false,
  onClick,
  className = "",
  type = "button",
  ...props
}) {
  const baseClasses =
    "inline-flex items-center justify-center font-bold rounded-xl transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-[#050608] disabled:opacity-50 disabled:cursor-not-allowed disabled:pointer-events-none active:scale-[0.98]";

  const variantClasses = {
    primary:
      "bg-gradient-to-r from-emerald-500 via-teal-500 to-emerald-600 hover:from-emerald-400 hover:to-teal-400 text-black shadow-glow-emerald focus:ring-emerald-400 border border-emerald-300/30",
    secondary:
      "bg-gradient-to-r from-amber-500 via-yellow-500 to-amber-600 hover:from-amber-400 hover:to-yellow-400 text-black shadow-glow-gold focus:ring-amber-400 border border-amber-300/30",
    mint:
      "bg-gradient-to-r from-emerald-500 to-lime-500 hover:from-emerald-400 hover:to-lime-400 text-black shadow-glow-emerald focus:ring-emerald-400 border border-emerald-300/30",
    gold:
      "bg-gradient-to-r from-amber-400 to-yellow-500 hover:from-amber-300 hover:to-yellow-400 text-black shadow-glow-gold focus:ring-amber-400",
    outline:
      "border border-white/10 hover:border-emerald-500/40 bg-white/[0.03] hover:bg-white/[0.08] text-slate-200 focus:ring-emerald-400",
    ghost:
      "bg-transparent hover:bg-white/[0.06] text-slate-300 hover:text-white focus:ring-emerald-400",
    danger:
      "bg-rose-600 hover:bg-rose-500 text-white focus:ring-rose-500 border border-rose-400/20",
  };

  const sizeClasses = {
    sm: "px-3 py-1.5 text-xs gap-1.5",
    md: "px-4 py-2 text-xs gap-2",
    lg: "px-6 py-3 text-sm gap-2.5",
  };

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={isDisabled || isLoading}
      className={`${baseClasses} ${variantClasses[variant] || variantClasses.primary} ${sizeClasses[size] || sizeClasses.md} ${className}`}
      {...props}
    >
      {isLoading ? (
        <>
          <Spinner size={size === "lg" ? "md" : "sm"} />
          <span>Processing...</span>
        </>
      ) : (
        children
      )}
    </button>
  );
}
