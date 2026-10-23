import React from "react";

/**
 * Deterministic Generative Master Cover Art Component
 * Produces a warm analog vinyl lacquer / tape master aesthetic based on the track's properties.
 */
export function TrackCoverArt({ track, size = "md", className = "" }) {
  const seedStr = (track?.id || track?.title || "soundchain") + (track?.catalogNo || "SL-001");
  
  // Deterministic numeric hash from string
  let hash = 0;
  for (let i = 0; i < seedStr.length; i++) {
    hash = (hash << 5) - hash + seedStr.charCodeAt(i);
    hash |= 0;
  }
  const absHash = Math.abs(hash);
  const variant = absHash % 4; // 4 graphic variations

  // Dimensions
  const sizeMap = {
    sm: "w-12 h-12",
    md: "w-24 h-24",
    lg: "w-36 h-36 sm:w-44 sm:h-44",
    xl: "w-48 h-48 sm:w-56 sm:h-56",
  };

  const dimClass = sizeMap[size] || sizeMap.md;

  return (
    <div
      className={`relative rounded overflow-hidden flex-shrink-0 bg-[#0E0D0B] border border-hairline shadow-md group ${dimClass} ${className}`}
    >
      <svg
        viewBox="0 0 200 200"
        className="w-full h-full"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <radialGradient id={`discGrad-${absHash}`} cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#25211B" />
            <stop offset="40%" stopColor="#14120F" />
            <stop offset="85%" stopColor="#1A1814" />
            <stop offset="100%" stopColor="#0B0A08" />
          </radialGradient>

          <linearGradient id={`brassSheen-${absHash}`} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#C9A24B" stopOpacity="0.8" />
            <stop offset="50%" stopColor="#8A7238" stopOpacity="0.2" />
            <stop offset="100%" stopColor="#C9A24B" stopOpacity="0.6" />
          </linearGradient>

          <linearGradient id={`goldShine-${absHash}`} x1="20%" y1="0%" x2="80%" y2="100%">
            <stop offset="0%" stopColor="#FFE29A" stopOpacity="0.4" />
            <stop offset="50%" stopColor="#C9A24B" stopOpacity="0.0" />
            <stop offset="100%" stopColor="#8A7238" stopOpacity="0.3" />
          </linearGradient>
        </defs>

        {/* Outer Master Sleeve Background */}
        <rect width="200" height="200" fill={`url(#discGrad-${absHash})`} />

        {/* Concentric Mastering Grooves */}
        <circle cx="100" cy="100" r="90" stroke="#8A7238" strokeWidth="0.75" strokeOpacity="0.25" fill="none" />
        <circle cx="100" cy="100" r="80" stroke="#8A7238" strokeWidth="0.5" strokeOpacity="0.2" fill="none" />
        <circle cx="100" cy="100" r="70" stroke="#8A7238" strokeWidth="0.6" strokeOpacity="0.3" fill="none" />
        <circle cx="100" cy="100" r="60" stroke="#C9A24B" strokeWidth="0.75" strokeOpacity="0.35" fill="none" />
        <circle cx="100" cy="100" r="50" stroke="#8A7238" strokeWidth="0.5" strokeOpacity="0.2" fill="none" />

        {/* Light Beam Reflections */}
        <polygon
          points="100,100 0,30 20,0"
          fill={`url(#goldShine-${absHash})`}
        />
        <polygon
          points="100,100 200,170 180,200"
          fill={`url(#goldShine-${absHash})`}
        />

        {/* Center Label Variant */}
        {variant === 0 && (
          // Concentric Wave Bands
          <g transform="translate(100, 100)">
            {[-35, -20, -5, 10, 25].map((y, idx) => (
              <path
                key={idx}
                d={`M -40,${y} Q -10,${y - 8} 15,${y + 6} T 40,${y}`}
                stroke="#C9A24B"
                strokeWidth="1.2"
                strokeOpacity={0.4 + idx * 0.1}
                fill="none"
              />
            ))}
          </g>
        )}

        {variant === 1 && (
          // Cross-Hatch Sound Frequency Ring
          <g>
            <circle cx="100" cy="100" r="38" stroke="#C9A24B" strokeWidth="1" strokeDasharray="3 3" fill="none" strokeOpacity="0.6" />
            <circle cx="100" cy="100" r="30" stroke="#8A7238" strokeWidth="0.75" fill="none" strokeOpacity="0.4" />
          </g>
        )}

        {variant === 2 && (
          // Analog Harmonic Radar Lines
          <g stroke="#C9A24B" strokeOpacity="0.35" strokeWidth="0.75">
            <line x1="100" y1="20" x2="100" y2="180" />
            <line x1="20" y1="100" x2="180" y2="100" />
            <circle cx="100" cy="100" r="32" stroke="#FFE29A" strokeOpacity="0.5" strokeWidth="1" fill="none" />
          </g>
        )}

        {variant === 3 && (
          // Studio Spindle Brass Medallion
          <circle cx="100" cy="100" r="36" fill={`url(#brassSheen-${absHash})`} fillOpacity="0.25" stroke="#C9A24B" strokeWidth="1" />
        )}

        {/* Center Spindle Hole */}
        <circle cx="100" cy="100" r="14" fill="#0D0C0A" stroke="#C9A24B" strokeWidth="1.5" />
        <circle cx="100" cy="100" r="5" fill="#14120F" />

        {/* Micro Typography on Master Jacket */}
        <text
          x="14"
          y="24"
          fill="#8C8578"
          fontSize="9"
          fontFamily="IBM Plex Mono"
          letterSpacing="0.05em"
        >
          {track?.catalogNo || "SL-001"}
        </text>

        <text
          x="14"
          y="188"
          fill="#C9A24B"
          fontSize="7.5"
          fontFamily="Inter, sans-serif"
          fontWeight="600"
          opacity="0.85"
        >
          DIRECT LACQUER CUT
        </text>

        <text
          x="186"
          y="188"
          fill="#8C8578"
          fontSize="7"
          fontFamily="IBM Plex Mono"
          textAnchor="end"
          opacity="0.7"
        >
          24b/96k
        </text>
      </svg>
    </div>
  );
}
