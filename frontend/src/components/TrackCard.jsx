import React from "react";
import { Link } from "react-router-dom";
import { Play, Pause, Clock, PieChart, Disc, ChevronRight, Zap, Send } from "lucide-react";
import { useAudio } from "../context/AudioContext";
import { Badge } from "./UI/Badge";

export function TrackCard({ track, onQuickTip }) {
  const { currentTrack, isPlaying, playTrack } = useAudio();
  const isCurrentPlaying = currentTrack?.id === track.id && isPlaying;

  const handlePlayClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    playTrack(track);
  };

  return (
    <div className="group relative glass-card rounded-3xl p-5 flex flex-col justify-between transition-all duration-300 hover:border-emerald-500/40 holo-sheen bg-[#090b11]">
      
      {/* Top Section */}
      <div className="space-y-4">
        {/* Cover Art Box with Vinyl Peek */}
        <div className="relative aspect-square w-full rounded-2xl overflow-hidden shadow-2xl flex items-center justify-center">
          
          {/* Vinyl Disc that slides out on hover with luxury gold center */}
          <div
            className={`absolute right-2 w-4/5 h-4/5 rounded-full vinyl-grooves border-2 border-stone-700/60 shadow-2xl flex items-center justify-center transition-all duration-500 group-hover:translate-x-6 group-hover:rotate-45 ${
              isCurrentPlaying ? "animate-spin-record translate-x-6" : ""
            }`}
          >
            <div className="w-1/3 h-1/3 rounded-full bg-gradient-to-tr from-amber-600 via-yellow-500 to-amber-700 border border-amber-300 flex items-center justify-center shadow-inner">
              <div className="w-2.5 h-2.5 rounded-full bg-[#050608]" />
            </div>
          </div>

          {/* Main Album Artwork Sleeve */}
          <div
            className={`relative z-10 w-full h-full rounded-2xl bg-gradient-to-br ${track.coverGradient} p-4 flex flex-col justify-between shadow-xl transition-transform duration-300 group-hover:scale-[0.98] border border-white/10`}
          >
            {/* Top Bar on Artwork */}
            <div className="flex justify-between items-start">
              <div className="flex items-center gap-1.5">
                <span className="px-3 py-1 rounded-full bg-black/75 backdrop-blur-md text-[11px] font-bold text-white border border-emerald-500/30 shadow-sm font-mono">
                  {track.genre}
                </span>
                {track.ipfsCid && (
                  <span className="px-2 py-0.5 rounded-full bg-emerald-950/90 text-emerald-300 border border-emerald-500/40 text-[9px] font-mono flex items-center gap-1">
                    <span className="w-1 h-1 rounded-full bg-emerald-400"></span>
                    IPFS
                  </span>
                )}
              </div>

              <span className="px-2 py-1 rounded-full bg-black/60 backdrop-blur-md text-[10px] font-mono text-emerald-300 border border-emerald-500/20">
                {track.bpm} BPM
              </span>
            </div>

            {/* Center Play/Pause Floating Action Button */}
            <div className="flex items-center justify-center">
              <button
                onClick={handlePlayClick}
                className={`p-4 rounded-full backdrop-blur-md transition-all duration-300 shadow-2xl ${
                  isCurrentPlaying
                    ? "bg-gradient-to-r from-emerald-400 to-lime-400 text-black scale-105 shadow-glow-emerald"
                    : "bg-black/60 text-white hover:bg-emerald-400 hover:text-black hover:scale-110 opacity-90 group-hover:opacity-100"
                }`}
                title={isCurrentPlaying ? "Pause preview" : "Play synth preview"}
              >
                {isCurrentPlaying ? (
                  <Pause className="w-6 h-6 fill-current" />
                ) : (
                  <Play className="w-6 h-6 fill-current translate-x-0.5" />
                )}
              </button>
            </div>

            {/* Bottom Bar on Artwork */}
            <div className="flex justify-between items-center text-[11px] font-semibold text-white/90">
              <span className="flex items-center gap-1 bg-black/60 backdrop-blur-md px-2 py-0.5 rounded-md font-mono">
                <Clock className="w-3 h-3" /> {track.duration}
              </span>

              {isCurrentPlaying && (
                <span className="flex items-center gap-1 text-emerald-300 font-mono text-[10px] bg-emerald-950/80 backdrop-blur-md px-2 py-0.5 rounded-md border border-emerald-500/30 animate-pulse">
                  <Zap className="w-3 h-3" /> Playing
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Track Title, Artist, Album */}
        <div className="space-y-1 pt-1">
          <Link to={`/track/${track.id}`}>
            <h3 className="text-lg font-black text-white group-hover:text-emerald-400 transition-colors font-heading truncate">
              {track.title}
            </h3>
          </Link>
          <p className="text-xs text-slate-400 font-medium truncate">
            by <span className="text-slate-200 font-semibold">{track.artist}</span> • <span className="text-slate-500">{track.album}</span>
          </p>
        </div>

        {/* Royalty Split Mini-Pills */}
        <div className="flex flex-wrap gap-1.5 pt-1">
          {track.splits.map((s, idx) => (
            <span
              key={idx}
              className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-white/[0.04] border border-white/5 text-slate-300"
            >
              {s.role}: <strong className="text-amber-300">{s.percent}%</strong>
            </span>
          ))}
        </div>
      </div>

      {/* Card Actions Footer */}
      <div className="pt-4 mt-4 border-t border-white/[0.06] flex items-center justify-between">
        <Link
          to={`/track/${track.id}`}
          className="text-xs font-bold font-mono text-slate-400 hover:text-emerald-300 flex items-center gap-1 transition-colors"
        >
          <span>Inspect Splits</span>
          <ChevronRight className="w-3.5 h-3.5" />
        </Link>

        <Link
          to={`/track/${track.id}`}
          className="px-3 py-1.5 rounded-xl bg-emerald-500/10 hover:bg-emerald-500 text-emerald-300 hover:text-black border border-emerald-500/30 text-xs font-bold font-mono transition-all shadow-sm flex items-center gap-1.5"
        >
          <Send className="w-3 h-3" />
          <span>Split $ USDC</span>
        </Link>
      </div>

    </div>
  );
}
