import React from "react";

export function StackedSplitBar({ splits = [], isPulsing = false, showLabels = true, className = "" }) {
  if (!splits || splits.length === 0) return null;

  return (
    <div className={`w-full ${className}`}>
      {/* Horizontal Stacked Bar Container */}
      <div
        className={`w-full h-8 rounded-sm flex overflow-hidden border border-hairline bg-[#100F0D] relative transition-all ${
          isPulsing ? "ring-2 ring-brass shadow-brass-glow scale-[1.01]" : ""
        }`}
      >
        {splits.map((split, index) => {
          const isPrimary = index === 0;
          const bg = isPrimary
            ? "bg-[#C9A24B]"
            : index === 1
            ? "bg-[#8A7238]"
            : "bg-[#B2ABA0]";
          const textColor = isPrimary
            ? "text-[#14120F]"
            : index === 1
            ? "text-[#F6F1E7]"
            : "text-[#14120F]";

          return (
            <div
              key={index}
              style={{ width: `${split.percent}%` }}
              className={`h-full ${bg} flex items-center justify-between px-2.5 relative border-r border-ink/40 last:border-r-0 transition-all duration-500 select-none group/seg overflow-hidden`}
              title={`${split.role} (${split.name}): ${split.percent}% (${split.bps} BPS)`}
            >
              {/* Internal Label */}
              <span className={`font-mono text-[11px] font-bold ${textColor} truncate`}>
                {split.role}
              </span>
              <span className={`font-mono text-[11px] font-medium ${textColor} opacity-90 ml-1`}>
                {split.percent}%
              </span>

              {/* Shimmer on pulse */}
              {isPulsing && (
                <div className="absolute inset-0 bg-white/20 animate-pulse" />
              )}
            </div>
          );
        })}
      </div>

      {/* Sub-label Details (Under the bar) */}
      {showLabels && (
        <div className="flex items-center justify-between mt-2 font-mono text-[11px] text-ash">
          {splits.map((split, index) => (
            <div key={index} className="flex items-center gap-1.5">
              <span
                className="w-2 h-2 rounded-none inline-block"
                style={{ backgroundColor: index === 0 ? "#C9A24B" : index === 1 ? "#8A7238" : "#B2ABA0" }}
              />
              <span className="text-paper">{split.name}</span>
              <span className="text-ash/60">({split.bps} BPS)</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
