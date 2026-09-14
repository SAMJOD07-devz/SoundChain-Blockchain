import React from "react";

export function Skeleton({ className = "" }) {
  return (
    <div
      className={`bg-slate-800/60 animate-pulse rounded-xl ${className}`}
    />
  );
}
