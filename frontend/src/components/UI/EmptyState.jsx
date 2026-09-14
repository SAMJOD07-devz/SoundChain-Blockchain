import React from "react";
import { Disc3 } from "lucide-react";
import { Button } from "./Button";

export function EmptyState({
  title = "No Tracks Found",
  description = "Try adjusting your search criteria or clear your search input to see available music tracks.",
  actionText,
  onAction,
  icon: Icon = Disc3,
}) {
  return (
    <div className="flex flex-col items-center justify-center text-center p-12 glass-panel rounded-2xl border border-white/5 my-8">
      <div className="p-4 rounded-2xl bg-purple-500/10 border border-purple-500/20 text-purple-400 mb-4">
        <Icon className="w-10 h-10 animate-spin-slow" />
      </div>
      <h3 className="text-xl font-bold text-slate-100 mb-2">{title}</h3>
      <p className="text-slate-400 text-sm max-w-md mb-6">{description}</p>
      {actionText && onAction && (
        <Button variant="primary" onClick={onAction}>
          {actionText}
        </Button>
      )}
    </div>
  );
}
