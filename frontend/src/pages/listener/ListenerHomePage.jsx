import React, { useState, useRef, useEffect } from "react";
import { Link } from "react-router-dom";
import { useWallet } from "../../context/WalletContext";
import { useAudio } from "../../context/AudioContext";
import { DEMO_TRACKS } from "../../data/demoTracks";
import { parseEtherError } from "../../utils/ethereum";
import { Play, Pause, Headphones, CheckCircle2, ArrowRight, Sparkles, Disc } from "lucide-react";
import toast from "react-hot-toast";

export function ListenerHomePage() {
  const {
    account,
    lstnBalance,
    totalListens,
    refreshBalances,
    getListenTokenContract,
    connectTestWallet,
  } = useWallet();

  const { currentTrack, isPlaying, playTrack, togglePlay } = useAudio();

  // Active track for continue listening
  const activeTrack = currentTrack || DEMO_TRACKS[0];

  // Listen-to-Earn State
  const [listenStatus, setListenStatus] = useState("idle"); // 'idle' | 'listening' | 'claiming' | 'completed'
  const [progress, setProgress] = useState(0);
  const [elapsed, setElapsed] = useState(0);
  const [justEarned, setJustEarned] = useState(false);
  const timerRef = useRef(null);
  const totalSec = 12;

  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  const handleStartSession = (trackToPlay) => {
    if (!account) connectTestWallet(0);
    if (listenStatus === "claiming") return;

    playTrack(trackToPlay || activeTrack);
    setListenStatus("listening");
    setProgress(0);
    setElapsed(0);
    setJustEarned(false);

    let sec = 0;
    if (timerRef.current) clearInterval(timerRef.current);

    timerRef.current = setInterval(() => {
      sec += 1;
      setElapsed(sec);
      const pct = Math.min(Math.round((sec / totalSec) * 100), 100);
      setProgress(pct);

      if (sec >= totalSec) {
        clearInterval(timerRef.current);
        triggerRewardMint();
      }
    }, 1000);
  };

  const handlePauseSession = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    togglePlay();
    setListenStatus("idle");
  };

  const triggerRewardMint = async () => {
    setListenStatus("claiming");
    toast.loading("Stream verified! Minting +10 LSTN...", { id: "mint-tx" });

    try {
      const token = getListenTokenContract();
      if (!token) throw new Error("Contract not ready");

      const tx = await token.rewardListener(account);
      await tx.wait();

      setListenStatus("completed");
      setJustEarned(true);
      toast.success("+10.00 LSTN Mint Confirmed!", { id: "mint-tx" });
      await refreshBalances();
      setTimeout(() => setJustEarned(false), 3000);
    } catch (err) {
      console.error(err);
      const parsed = parseEtherError(err);
      setListenStatus("idle");
      toast.error(`Reward minting failed: ${parsed}`, { id: "mint-tx" });
    }
  };

  return (
    <div className="space-y-12 py-8 pb-28">
      
      {/* Header & Token Summary Strip */}
      <div className="border-b border-hairline pb-6 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div className="space-y-1.5">
          <div className="font-mono text-xs text-brass uppercase tracking-widest">
            // LISTENER DASHBOARD
          </div>
          <h1 className="font-serif text-3xl sm:text-4xl font-bold text-paper tracking-tight">
            Stream Master Audio & Earn
          </h1>
          <p className="font-mono text-xs text-ash">
            Stream studio recordings to earn on-chain ERC-20 utility tokens (`LSTN`).
          </p>
        </div>

        {/* LSTN Balance Pill with Tick-Up Animation */}
        <div
          className={`flex items-center gap-3 px-4 py-2 border border-hairline bg-[#1A1814] rounded-sm transition-transform duration-300 ${
            justEarned ? "scale-105 border-brass ring-1 ring-brass" : ""
          }`}
        >
          <div className="flex flex-col text-right">
            <span className="font-mono text-[10px] text-ash uppercase">Current Balance</span>
            <span className="font-mono text-sm font-bold text-brass">
              {lstnBalance} LSTN
            </span>
          </div>
          <div className="h-6 w-[1px] bg-hairline" />
          <div className="flex flex-col text-left font-mono text-[10px] text-ash">
            <span>{totalListens} Completed</span>
            <span className="text-signal-light font-semibold">+10/stream</span>
          </div>
        </div>
      </div>

      {/* 1. CONTINUE LISTENING HERO MODULE */}
      <section className="bg-[#1A1814] border border-hairline p-6 sm:p-8 rounded-sm space-y-6">
        <div className="flex items-center justify-between border-b border-hairline pb-3">
          <span className="font-mono text-xs text-brass uppercase tracking-wider">
            CONTINUE WHERE YOU LEFT OFF
          </span>
          <span className="font-mono text-xs text-ash">
            {activeTrack.duration} · {activeTrack.bpm} BPM
          </span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
          
          <div className="lg:col-span-8 space-y-2">
            <h2 className="font-serif text-2xl sm:text-3xl font-bold text-paper">
              {activeTrack.title}
            </h2>
            <p className="font-mono text-xs text-ash">
              By <span className="text-paper">{activeTrack.artist}</span> · Catalog:{" "}
              <span className="text-brass">{activeTrack.catalogNo}</span>
            </p>
            <p className="text-xs text-ash leading-relaxed max-w-xl pt-1">
              {activeTrack.description}
            </p>
          </div>

          <div className="lg:col-span-4 flex flex-col items-start lg:items-end gap-3">
            {listenStatus === "listening" ? (
              <button
                onClick={handlePauseSession}
                className="px-6 py-3 bg-paper text-ink font-semibold text-xs rounded-sm hover:bg-white transition-colors inline-flex items-center gap-2"
              >
                <Pause className="w-4 h-4 fill-current" />
                <span>Pause Verification (00:{elapsed < 10 ? `0${elapsed}` : elapsed})</span>
              </button>
            ) : (
              <button
                onClick={() => handleStartSession(activeTrack)}
                disabled={listenStatus === "claiming"}
                className="px-6 py-3 bg-brass text-ink font-semibold text-xs rounded-sm hover:bg-brass-light transition-colors inline-flex items-center gap-2"
              >
                <Play className="w-4 h-4 fill-current" />
                <span>
                  {listenStatus === "claiming" ? "Minting LSTN..." : "Stream & Earn (+10 LSTN)"}
                </span>
              </button>
            )}
            <Link
              to={`/track/${activeTrack.id}`}
              className="font-mono text-xs text-ash hover:text-paper inline-flex items-center gap-1"
            >
              <span>View Split Details</span>
              <ArrowRight className="w-3 h-3" />
            </Link>
          </div>

        </div>

        {/* Real Progress Bar */}
        <div className="space-y-2 pt-2 border-t border-hairline">
          <div className="flex justify-between font-mono text-[11px] text-ash">
            <span>Stream Progress: {progress}%</span>
            <span>00:{elapsed < 10 ? `0${elapsed}` : elapsed} / 00:12</span>
          </div>
          <div className="w-full h-2 bg-[#100F0D] border border-hairline rounded-sm overflow-hidden">
            <div
              style={{ width: `${progress}%` }}
              className="h-full bg-brass transition-all duration-300"
            />
          </div>
        </div>
      </section>

      {/* 2. RECOMMENDED TRACKS CATALOG WITH DIRECT PLAY CONTROLS */}
      <section className="space-y-4">
        <div className="flex items-center justify-between border-b border-hairline pb-3">
          <div>
            <span className="font-mono text-xs text-brass uppercase tracking-widest">
              RECOMMENDED MASTERS
            </span>
            <h3 className="font-serif text-2xl font-bold text-paper mt-0.5">
              Available for Streaming
            </h3>
          </div>
          <Link
            to="/tracks"
            className="font-mono text-xs text-ash hover:text-paper flex items-center gap-1"
          >
            <span>Browse Full Library</span>
            <ArrowRight className="w-3 h-3" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {DEMO_TRACKS.map((track) => {
            const isThisPlaying = currentTrack?.id === track.id && isPlaying;
            return (
              <div
                key={track.id}
                className="p-6 bg-[#1A1814] border border-hairline hover:border-brass-dim rounded-sm space-y-4 transition-colors group flex flex-col justify-between"
              >
                <div className="space-y-2">
                  <div className="flex justify-between font-mono text-xs text-ash">
                    <span>{track.catalogNo}</span>
                    <span>{track.duration}</span>
                  </div>

                  <h4 className="font-serif text-xl font-bold text-paper group-hover:text-brass transition-colors">
                    {track.title}
                  </h4>

                  <p className="font-mono text-xs text-ash">
                    {track.artist} · <span className="text-paper/80">{track.genre}</span>
                  </p>

                  <p className="text-xs text-ash line-clamp-2 leading-relaxed pt-1">
                    {track.description}
                  </p>
                </div>

                <div className="pt-3 border-t border-hairline flex items-center justify-between">
                  <button
                    onClick={() => handleStartSession(track)}
                    className="px-3.5 py-2 bg-paper text-ink font-semibold text-xs rounded-sm hover:bg-white transition-colors inline-flex items-center gap-1.5"
                  >
                    {isThisPlaying ? (
                      <>
                        <Pause className="w-3.5 h-3.5 fill-current" />
                        <span>Playing</span>
                      </>
                    ) : (
                      <>
                        <Play className="w-3.5 h-3.5 fill-current" />
                        <span>Stream (Earn)</span>
                      </>
                    )}
                  </button>

                  <Link
                    to={`/track/${track.id}`}
                    className="font-mono text-xs text-brass hover:underline"
                  >
                    Inspect Split →
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      </section>

    </div>
  );
}
