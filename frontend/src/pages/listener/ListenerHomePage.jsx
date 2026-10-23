import React, { useState, useRef, useEffect } from "react";
import { Link } from "react-router-dom";
import { useWallet } from "../../context/WalletContext";
import { useAudio } from "../../context/AudioContext";
import { getAllTracks } from "../../data/demoTracks";
import { parseEtherError } from "../../utils/ethereum";
import { resolveIPFS, formatCid } from "../../utils/ipfs";
import { generateCryptographicStreamProof } from "../../utils/streamValidator";
import {
  Play,
  Pause,
  Headphones,
  CheckCircle2,
  ArrowRight,
  Sparkles,
  Disc,
  UploadCloud,
  ShieldCheck,
  FileCheck2,
  Copy,
  ExternalLink,
} from "lucide-react";
import toast from "react-hot-toast";

export function ListenerHomePage() {
  const {
    account,
    lstnBalance,
    totalListens,
    refreshBalances,
    getListenTokenContract,
    connectTestWallet,
    testAccounts,
    chainId,
  } = useWallet();

  const { currentTrack, isPlaying, playTrack, togglePlay } = useAudio();
  const allTracks = getAllTracks();

  // Active track for continue listening
  const activeTrack = currentTrack || allTracks[0];

  // Listen-to-Earn State
  const [listenStatus, setListenStatus] = useState("idle"); // 'idle' | 'listening' | 'claiming' | 'completed'
  const [progress, setProgress] = useState(0);
  const [elapsed, setElapsed] = useState(0);
  const [justEarned, setJustEarned] = useState(false);
  const [verifiedProofReceipt, setVerifiedProofReceipt] = useState(null);
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
        triggerRewardMint(trackToPlay || activeTrack);
      }
    }, 1000);
  };

  const handlePauseSession = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    togglePlay();
    setListenStatus("idle");
  };

  const triggerRewardMint = async (targetTrack) => {
    setListenStatus("claiming");
    toast.loading("Generating cryptographic anti-bot audio proof...", { id: "mint-tx" });

    try {
      const token = getListenTokenContract(true);
      if (!token) throw new Error("Contract not ready");

      const recipient = account || testAccounts?.[0]?.address;
      if (!recipient) throw new Error("No wallet address available to receive reward.");

      const track = targetTrack || activeTrack;
      const trackBytes32 = track.bytes32Id || ethers.id(track.id);

      // Generate cryptographic ECDSA stream proof
      const proof = await generateCryptographicStreamProof({
        listenerAddress: recipient,
        bytes32TrackId: trackBytes32,
        listenSeconds: totalSec,
        chainId: chainId || 31337,
      });

      toast.loading("Verifying cryptographic proof on Ethereum ledger...", { id: "mint-tx" });

      let tx;
      if (typeof token.rewardListenerWithProof === "function") {
        tx = await token.rewardListenerWithProof(
          proof.listenerAddress,
          proof.bytes32TrackId,
          proof.listenSeconds,
          proof.nonce,
          proof.signature
        );
      } else {
        tx = await token.rewardListener(recipient);
      }

      const receipt = await tx.wait();

      setVerifiedProofReceipt({
        txHash: receipt.hash,
        blockNumber: receipt.blockNumber,
        proofHash: proof.proofHash,
        signature: proof.signature,
        nonce: proof.nonce,
        listenSeconds: proof.listenSeconds,
        validator: proof.validatorAddress,
        trackTitle: track.title,
        catalogNo: track.catalogNo,
        tokensEarned: "+10.00 LSTN",
      });

      setListenStatus("completed");
      setJustEarned(true);
      toast.success("Stream Verified: +10.00 LSTN Mint Confirmed!", { id: "mint-tx" });
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

        {/* Cryptographic Stream Proof Settlement Voucher */}
        {verifiedProofReceipt && (
          <div className="p-5 bg-[#12110E] border border-emerald-500/40 rounded-sm space-y-4 font-mono text-xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-hairline pb-3">
              <div className="flex items-center gap-2 text-emerald-400 font-bold">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <span className="uppercase text-[11px] tracking-wider">
                  CRYPTOGRAPHIC STREAM ATTESTATION VOUCHER (ANTI-BOT VERIFIED)
                </span>
              </div>
              <span className="text-[10px] text-emerald-400 bg-emerald-950/80 px-2 py-0.5 rounded border border-emerald-800">
                BLOCK #{verifiedProofReceipt.blockNumber} CONFIRMED
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-[11px]">
              <div className="space-y-1.5">
                <div className="text-ash">Session Track:</div>
                <div className="text-paper font-bold">{verifiedProofReceipt.trackTitle} ({verifiedProofReceipt.catalogNo})</div>
                <div className="text-ash pt-1">ECDSA Stream Proof Hash:</div>
                <div className="text-paper break-all text-[10px] bg-[#1A1814] p-1.5 rounded border border-hairline">
                  {verifiedProofReceipt.proofHash}
                </div>
              </div>

              <div className="space-y-1.5">
                <div className="text-ash">Minted Utility Reward:</div>
                <div className="text-brass font-bold text-sm">{verifiedProofReceipt.tokensEarned}</div>
                <div className="text-ash pt-1">Authorized Validator Node:</div>
                <div className="text-ash break-all text-[10px] bg-[#1A1814] p-1.5 rounded border border-hairline">
                  {verifiedProofReceipt.validator}
                </div>
              </div>
            </div>

            <div className="pt-2 border-t border-hairline flex flex-wrap items-center justify-between gap-2 text-[10px] text-ash">
              <span>Anti-Replay Nonce: {verifiedProofReceipt.nonce} · Verified Duration: {verifiedProofReceipt.listenSeconds}s</span>
              <span className="text-brass flex items-center gap-1">
                <span>Tx Hash: {verifiedProofReceipt.txHash.slice(0, 14)}···{verifiedProofReceipt.txHash.slice(-8)}</span>
              </span>
            </div>
          </div>
        )}
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
          {allTracks.map((track) => {
            const isThisPlaying = currentTrack?.id === track.id && isPlaying;
            return (
              <div
                key={track.id}
                className="p-6 bg-[#1A1814] border border-hairline hover:border-brass-dim rounded-sm space-y-4 transition-colors group flex flex-col justify-between"
              >
                <div className="space-y-2">
                  <div className="flex justify-between items-center font-mono text-xs text-ash">
                    <span className="flex items-center gap-1.5">
                      <span>{track.catalogNo}</span>
                      {track.ipfsCid && (
                        <span className="px-1.5 py-0.2 rounded bg-emerald-950/70 text-emerald-400 border border-emerald-800/40 text-[9px] flex items-center gap-1">
                          <span className="w-1 h-1 rounded-full bg-emerald-400"></span>
                          IPFS
                        </span>
                      )}
                    </span>
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
