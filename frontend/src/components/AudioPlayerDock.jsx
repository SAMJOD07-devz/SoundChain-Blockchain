import React, { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import {
  Play,
  Pause,
  SkipBack,
  SkipForward,
  Volume2,
  VolumeX,
  Disc,
  X,
  ExternalLink,
} from "lucide-react";
import { useAudio } from "../context/AudioContext";
import { resolveIPFS, formatCid } from "../utils/ipfs";

export function AudioPlayerDock() {
  const {
    currentTrack,
    isPlaying,
    togglePlay,
    nextTrack,
    prevTrack,
    volume,
    changeVolume,
    currentTime,
    duration,
    audioSynth,
    closePlayer,
  } = useAudio();

  const [isMuted, setIsMuted] = useState(false);
  const canvasRef = useRef(null);
  const animationFrameRef = useRef(null);

  const formatTime = (sec) => {
    const m = Math.floor(sec / 60);
    const s = Math.floor(sec % 60);
    return `${m}:${s < 10 ? "0" : ""}${s}`;
  };

  // Real-time Canvas Waveform Visualizer loop (Brushed Brass to Dim Brass)
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    const analyser = audioSynth.getAnalyser();

    const bufferLength = analyser.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);

    const draw = () => {
      animationFrameRef.current = requestAnimationFrame(draw);

      if (isPlaying) {
        analyser.getByteFrequencyData(dataArray);
      } else {
        for (let i = 0; i < bufferLength; i++) {
          dataArray[i] = Math.max(0, dataArray[i] - 2);
        }
      }

      ctx.clearRect(0, 0, canvas.width, canvas.height);

      const barWidth = (canvas.width / (bufferLength / 2)) * 1.5;
      let x = 0;

      for (let i = 0; i < bufferLength / 2; i++) {
        const barHeight = (dataArray[i] / 255) * canvas.height * 0.9;

        const grad = ctx.createLinearGradient(0, canvas.height, 0, 0);
        grad.addColorStop(0, "#C9A24B");
        grad.addColorStop(0.7, "#8A7238");
        grad.addColorStop(1, "#F6F1E7");

        ctx.fillStyle = isPlaying ? grad : "rgba(140, 133, 120, 0.2)";
        ctx.beginPath();
        ctx.roundRect(x, canvas.height - Math.max(barHeight, 2), barWidth - 1.5, Math.max(barHeight, 2), [1, 1, 0, 0]);
        ctx.fill();

        x += barWidth;
      }
    };

    draw();

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [isPlaying, audioSynth]);

  const handleToggleMute = () => {
    if (isMuted) {
      changeVolume(volume || 0.8);
      setIsMuted(false);
    } else {
      changeVolume(0);
      setIsMuted(true);
    }
  };

  if (!currentTrack) return null;

  return (
    <div className="fixed bottom-4 left-4 right-4 max-w-5xl mx-auto z-40">
      <div className="rounded-sm p-3 sm:px-5 sm:py-3 border border-hairline shadow-2xl backdrop-blur-md bg-[#14120F]/95 flex flex-col sm:flex-row items-center justify-between gap-3 relative overflow-hidden">
        
        {/* Left: Track Info & Vinyl Icon */}
        <div className="flex items-center gap-3.5 w-full sm:w-auto justify-between sm:justify-start">
          <Link to={`/track/${currentTrack.id}`} className="flex items-center gap-3 group">
            <div className="w-10 h-10 rounded-sm bg-[#1A1814] border border-hairline flex items-center justify-center">
              <Disc className={`w-5 h-5 text-brass ${isPlaying ? "animate-subtle-spin" : ""}`} />
            </div>

            <div className="flex flex-col text-left">
              <div className="flex items-center gap-1.5">
                <span className="text-xs font-bold font-serif text-paper group-hover:text-brass transition-colors truncate max-w-[140px] sm:max-w-[180px]">
                  {currentTrack.title}
                </span>
                {currentTrack.ipfsCid && (
                  <span className="hidden md:inline-flex items-center gap-1 text-[9px] font-mono px-1.5 py-0.5 bg-emerald-950/60 text-emerald-400 border border-emerald-800/40 rounded">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                    IPFS
                  </span>
                )}
              </div>
              <span className="text-[11px] font-mono text-ash truncate max-w-[140px] sm:max-w-[180px]">
                {currentTrack.artist} · <span className="text-brass-dim">{currentTrack.catalogNo}</span>
              </span>
            </div>
          </Link>
        </div>

        {/* Center: Playback Controls & Waveform */}
        <div className="flex flex-col items-center gap-1.5 w-full sm:w-80">
          <div className="flex items-center gap-4">
            <button
              onClick={prevTrack}
              className="text-ash hover:text-paper transition-colors p-1"
              title="Previous Master"
            >
              <SkipBack className="w-4 h-4" />
            </button>

            <button
              onClick={togglePlay}
              className="p-2 rounded-sm bg-brass text-ink hover:bg-brass-light transition-colors"
              title={isPlaying ? "Pause" : "Play"}
            >
              {isPlaying ? (
                <Pause className="w-4 h-4 fill-current" />
              ) : (
                <Play className="w-4 h-4 fill-current translate-x-0.5" />
              )}
            </button>

            <button
              onClick={nextTrack}
              className="text-ash hover:text-paper transition-colors p-1"
              title="Next Master"
            >
              <SkipForward className="w-4 h-4" />
            </button>
          </div>

          {/* Time and Audio Canvas */}
          <div className="flex items-center gap-2 w-full text-[10px] font-mono text-ash">
            <span>{formatTime(currentTime)}</span>
            
            <div className="relative flex-1 flex items-center">
              <canvas
                ref={canvasRef}
                width={180}
                height={14}
                className="w-full h-3 opacity-90"
              />
            </div>

            <span>{formatTime(duration)}</span>
          </div>
        </div>

        {/* Right: Volume & Link to Details */}
        <div className="hidden sm:flex items-center gap-4">
          <div className="flex items-center gap-2 text-ash">
            <button onClick={handleToggleMute} className="hover:text-paper transition-colors">
              {isMuted || volume === 0 ? (
                <VolumeX className="w-4 h-4 text-ash/60" />
              ) : (
                <Volume2 className="w-4 h-4" />
              )}
            </button>
            <input
              type="range"
              min="0"
              max="1"
              step="0.05"
              value={isMuted ? 0 : volume}
              onChange={(e) => {
                changeVolume(parseFloat(e.target.value));
                setIsMuted(false);
              }}
              className="w-16 h-1 bg-ink-subtle rounded appearance-none cursor-pointer accent-[#C9A24B]"
            />
          </div>

          {currentTrack.ipfsCid && (
            <a
              href={resolveIPFS(currentTrack.ipfsCid)}
              target="_blank"
              rel="noopener noreferrer"
              className="hidden lg:flex items-center gap-1.5 px-2.5 py-1 text-[11px] font-mono text-emerald-400 hover:text-emerald-300 border border-emerald-900/50 hover:border-emerald-700/70 bg-emerald-950/30 rounded-sm transition-colors"
              title={`View decentralized master on IPFS (${currentTrack.ipfsCid})`}
            >
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
              <span>{formatCid(currentTrack.ipfsCid, 7, 5)}</span>
              <ExternalLink className="w-3 h-3 opacity-70" />
            </a>
          )}

          <Link
            to={`/track/${currentTrack.id}`}
            className="px-3 py-1 border border-hairline hover:border-brass text-brass font-mono text-xs rounded-sm transition-colors"
          >
            Splitter Ledger
          </Link>

          <button
            onClick={closePlayer}
            className="p-1.5 text-ash hover:text-paper hover:bg-ink-subtle rounded-sm transition-colors"
            title="Dismiss player dock"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>

      </div>
    </div>
  );
}
