import React, { useState, useEffect, useRef } from "react";
import { useParams, Link } from "react-router-dom";
import { DEMO_TRACKS } from "../data/demoTracks";
import { useWallet } from "../context/WalletContext";
import { useAudio } from "../context/AudioContext";
import { parseEtherError, formatEtherBalance } from "../utils/ethereum";
import { StackedSplitBar } from "../components/StackedSplitBar";
import { ethers } from "ethers";
import toast from "react-hot-toast";
import {
  ArrowLeft,
  Play,
  Pause,
  Headphones,
  Send,
  CheckCircle2,
  Clock,
  FileText,
  ExternalLink
} from "lucide-react";

export function TrackDetailPage() {
  const { id } = useParams();
  const track = DEMO_TRACKS.find((t) => t.id === id) || DEMO_TRACKS[0];

  const {
    account,
    getRoyaltySplitterContract,
    getListenTokenContract,
    refreshBalances,
    connectTestWallet,
    lstnBalance,
  } = useWallet();

  const { currentTrack, isPlaying, playTrack, togglePlay } = useAudio();
  const isThisTrackPlaying = currentTrack?.id === track.id && isPlaying;

  // Simulator State
  const [paymentAmount, setPaymentAmount] = useState("0.01");
  const [isSimulatingPayment, setIsSimulatingPayment] = useState(false);
  const [isBarPulsing, setIsBarPulsing] = useState(false);
  const [txReceipt, setTxReceipt] = useState(null);

  // Listen-to-Earn State
  const [listenStatus, setListenStatus] = useState("idle"); // 'idle' | 'listening' | 'claiming' | 'completed'
  const [listenProgress, setListenProgress] = useState(0);
  const [elapsedSec, setElapsedSec] = useState(0);
  const [rewardTxHash, setRewardTxHash] = useState(null);
  const timerRef = useRef(null);
  const totalListenSec = 12;

  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  // Calculate live breakdown for simulated ETH
  const parsedEthAmount = parseFloat(paymentAmount) || 0;
  const simulatedSplits = track.splits.map((s) => ({
    ...s,
    shareEth: ((parsedEthAmount * s.percent) / 100).toFixed(4),
  }));

  // Execute On-Chain Royalty Split Simulation
  const handleSimulatePayment = async () => {
    if (!account) {
      await connectTestWallet(0);
    }

    if (!paymentAmount || parseFloat(paymentAmount) <= 0) {
      toast.error("Enter a valid ETH amount to split.");
      return;
    }

    setIsSimulatingPayment(true);
    setIsBarPulsing(true);
    toast.loading(`Routing ${paymentAmount} ETH through basis-point splitter...`, { id: "split-tx" });

    try {
      const splitter = getRoyaltySplitterContract();
      if (!splitter) {
        throw new Error("RoyaltySplitter contract not found.");
      }

      const txValue = ethers.parseEther(paymentAmount.toString());
      const tx = await splitter.payRoyalty(track.bytes32Id, { value: txValue });
      const receipt = await tx.wait();

      setTxReceipt({
        hash: receipt.hash,
        blockNumber: receipt.blockNumber,
        totalEth: paymentAmount,
        timestamp: new Date().toLocaleTimeString(),
        recipients: simulatedSplits,
      });

      toast.success("Settlement Complete: ETH distributed to all payees!", { id: "split-tx" });
      await refreshBalances();
    } catch (err) {
      console.error("Split simulation error:", err);
      const parsed = parseEtherError(err);
      toast.error(`Transaction failed: ${parsed}`, { id: "split-tx" });
    } finally {
      setIsSimulatingPayment(false);
      setTimeout(() => setIsBarPulsing(false), 800);
    }
  };

  // Start Real Progress Bar Listening Session
  const handleStartListening = () => {
    if (!account) {
      connectTestWallet(0);
    }
    if (listenStatus === "claiming") return;

    playTrack(track);
    setListenStatus("listening");
    setListenProgress(0);
    setElapsedSec(0);

    let sec = 0;
    if (timerRef.current) clearInterval(timerRef.current);

    timerRef.current = setInterval(() => {
      sec += 1;
      setElapsedSec(sec);
      const prog = Math.min(Math.round((sec / totalListenSec) * 100), 100);
      setListenProgress(prog);

      if (sec >= totalListenSec) {
        clearInterval(timerRef.current);
        claimListeningReward();
      }
    }, 1000);
  };

  const handlePauseListening = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    togglePlay();
    setListenStatus("idle");
  };

  // Claim Listen-to-Earn Reward via ListenToken.rewardListener
  const claimListeningReward = async () => {
    setListenStatus("claiming");
    toast.loading("Stream verified. Minting +10 LSTN utility reward...", { id: "reward-tx" });

    try {
      const token = getListenTokenContract();
      if (!token) throw new Error("ListenToken contract not loaded.");

      const tx = await token.rewardListener(account);
      setRewardTxHash(tx.hash);
      await tx.wait();

      setListenStatus("completed");
      toast.success("+10.00 LSTN Minted Directly to Your Ledger!", { id: "reward-tx" });
      await refreshBalances();
    } catch (err) {
      console.error("Reward error:", err);
      const parsed = parseEtherError(err);
      setListenStatus("idle");
      toast.error(`Reward minting failed: ${parsed}`, { id: "reward-tx" });
    }
  };

  return (
    <div className="space-y-12 py-8 pb-28">
      
      {/* Top Back Action */}
      <div>
        <Link
          to="/tracks"
          className="inline-flex items-center gap-2 font-mono text-xs text-ash hover:text-paper transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Catalog Archive</span>
        </Link>
      </div>

      {/* 1. MASTER TRACK SPECIFICATION BANNER */}
      <section className="bg-[#1A1814] border border-hairline p-6 sm:p-10 rounded-sm space-y-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Track Header & Playback Trigger */}
          <div className="lg:col-span-8 space-y-4">
            <div className="flex flex-wrap items-center gap-3 font-mono text-xs">
              <span className="text-brass font-bold">
                MASTER // {track.catalogNo}
              </span>
              <span className="text-ash">/</span>
              <span className="text-ash">{track.genre}</span>
              <span className="text-ash">/</span>
              <span className="text-ash">{track.duration}</span>
              <span className="text-ash">/</span>
              <span className="text-ash">{track.bpm} BPM</span>
            </div>

            <h1 className="font-serif text-3xl sm:text-5xl font-bold text-paper tracking-tight">
              {track.title}
            </h1>

            <p className="font-mono text-sm text-ash">
              Recorded by <span className="text-paper font-semibold">{track.artist}</span> · Album:{" "}
              <span className="text-paper/80">{track.album}</span>
            </p>

            <p className="text-sm text-ash leading-relaxed max-w-2xl">
              {track.description}
            </p>

            <div className="pt-2 flex items-center gap-4">
              <button
                onClick={() => {
                  if (isThisTrackPlaying) {
                    togglePlay();
                  } else {
                    playTrack(track);
                  }
                }}
                className="px-5 py-2.5 bg-paper text-ink font-semibold text-xs rounded-sm hover:bg-white transition-colors inline-flex items-center gap-2"
              >
                {isThisTrackPlaying ? (
                  <>
                    <Pause className="w-3.5 h-3.5 fill-current" />
                    <span>Pause Master Audio</span>
                  </>
                ) : (
                  <>
                    <Play className="w-3.5 h-3.5 fill-current" />
                    <span>Play Master Audio</span>
                  </>
                )}
              </button>

              <span className="font-mono text-xs text-ash">
                On-Chain ID: <span className="text-paper">{track.bytes32Id.slice(0, 10)}···{track.bytes32Id.slice(-6)}</span>
              </span>
            </div>
          </div>

          {/* Quick Metric Ledger */}
          <div className="lg:col-span-4 border-t lg:border-t-0 lg:border-l border-hairline pt-6 lg:pt-0 lg:pl-8 space-y-4 font-mono text-xs">
            <div className="text-ash uppercase tracking-wider">
              PROTOCOL AUDIT SPEC
            </div>
            <div className="space-y-2">
              <div className="flex justify-between py-1 border-b border-hairline">
                <span className="text-ash">Split Logic:</span>
                <span className="text-paper">Basis Points (BPS)</span>
              </div>
              <div className="flex justify-between py-1 border-b border-hairline">
                <span className="text-ash">Holding Escrow:</span>
                <span className="text-brass font-semibold">0% (Instant)</span>
              </div>
              <div className="flex justify-between py-1 border-b border-hairline">
                <span className="text-ash">Stream Token:</span>
                <span className="text-paper">LSTN (ERC-20)</span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-ash">Listener Balance:</span>
                <span className="text-brass font-bold">{lstnBalance} LSTN</span>
              </div>
            </div>
          </div>

        </div>

        {/* Horizontal Stacked Bar (Master Cut Royalty Division) */}
        <div className="pt-6 border-t border-hairline space-y-3">
          <div className="flex items-center justify-between font-mono text-xs">
            <span className="text-ash uppercase tracking-wider">
              VERIFIED CONTRACT ROYALTY SPLIT (10,000 BPS / 100%)
            </span>
            <span className="text-paper">No Platform Intermediary Cut</span>
          </div>
          <StackedSplitBar splits={track.splits} isPulsing={isBarPulsing} />
        </div>
      </section>

      {/* 2. TWO-COLUMN WORKBENCH: PAYMENT SIMULATOR & LISTEN-TO-EARN PROGRESS */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left Column: Settlement Simulator & Financial Voucher (7 cols) */}
        <section className="lg:col-span-7 bg-[#1A1814] border border-hairline p-6 sm:p-8 rounded-sm space-y-6">
          <div className="flex items-center justify-between border-b border-hairline pb-4">
            <div>
              <span className="font-mono text-xs text-brass uppercase tracking-widest">
                // EXECUTE TRANSACTION
              </span>
              <h2 className="font-serif text-2xl font-bold text-paper">
                Simulate Direct Royalty Payout
              </h2>
            </div>
            <span className="font-mono text-xs text-ash">EVM Execution</span>
          </div>

          <p className="text-xs text-ash leading-relaxed">
            Deposit test ETH into the Solidity contract. The contract algorithmically divides the payment across payees in real-time according to their exact basis point percentages.
          </p>

          {/* Amount Presets */}
          <div className="space-y-2">
            <label className="block font-mono text-xs text-ash">
              Select or Enter Test ETH Amount:
            </label>
            <div className="flex items-center gap-2">
              {["0.005", "0.01", "0.05", "0.1"].map((val) => (
                <button
                  key={val}
                  onClick={() => setPaymentAmount(val)}
                  className={`px-3 py-1.5 font-mono text-xs border rounded-sm transition-colors ${
                    paymentAmount === val
                      ? "border-brass text-brass bg-brass/10 font-bold"
                      : "border-hairline text-ash hover:text-paper"
                  }`}
                >
                  {val} ETH
                </button>
              ))}
            </div>

            {/* Custom Input */}
            <div className="relative pt-2">
              <input
                type="number"
                step="0.001"
                min="0.0001"
                value={paymentAmount}
                onChange={(e) => setPaymentAmount(e.target.value)}
                className="w-full bg-[#100F0D] border border-hairline rounded-sm px-3.5 py-2.5 font-mono text-sm text-paper focus:outline-none focus:border-brass"
                placeholder="0.01"
              />
              <span className="absolute right-3.5 top-4 font-mono text-xs text-ash">
                ETH
              </span>
            </div>
          </div>

          {/* Real-time Payee Breakdown Preview */}
          <div className="bg-[#100F0D] border border-hairline p-4 rounded-sm space-y-2 font-mono text-xs">
            <div className="text-ash uppercase text-[10px] tracking-wider pb-1 border-b border-hairline">
              ANTICIPATED ON-CHAIN DISBURSEMENT
            </div>
            {simulatedSplits.map((split, index) => (
              <div key={index} className="flex items-center justify-between text-ash">
                <span>
                  {split.role} ({split.percent}%):
                </span>
                <span className="text-paper font-semibold">
                  +{split.shareEth} ETH
                </span>
              </div>
            ))}
          </div>

          {/* Submit Button */}
          <button
            onClick={handleSimulatePayment}
            disabled={isSimulatingPayment}
            className="w-full py-3 bg-brass text-ink font-semibold text-sm rounded-sm hover:bg-brass-light transition-colors disabled:opacity-60 flex items-center justify-center gap-2"
          >
            <Send className="w-4 h-4" />
            <span>
              {isSimulatingPayment ? "Executing Smart Contract Split..." : "Execute Settlement Simulation"}
            </span>
          </button>

          {/* Monospace Financial Settlement Receipt */}
          {txReceipt && (
            <div className="mt-6 border border-hairline bg-[#100F0D] p-5 rounded-sm space-y-3 font-mono text-xs">
              <div className="flex items-center justify-between text-signal-light pb-2 border-b border-hairline">
                <span className="flex items-center gap-1.5 font-bold uppercase tracking-wider">
                  <CheckCircle2 className="w-4 h-4" /> SETTLEMENT VOUCHER
                </span>
                <span className="text-ash">{txReceipt.timestamp}</span>
              </div>

              <div className="space-y-1.5 text-ash">
                <div className="flex justify-between">
                  <span>TX HASH:</span>
                  <span className="text-paper">{txReceipt.hash.slice(0, 18)}···</span>
                </div>
                <div className="flex justify-between">
                  <span>BLOCK NUMBER:</span>
                  <span className="text-paper">#{txReceipt.blockNumber}</span>
                </div>
                <div className="flex justify-between">
                  <span>TOTAL DISBURSED:</span>
                  <span className="text-brass font-bold">{txReceipt.totalEth} ETH</span>
                </div>
              </div>

              <div className="pt-2 border-t border-hairline space-y-1 text-ash">
                <span className="text-[10px] uppercase text-ash/60">PAYEE CREDITS:</span>
                {txReceipt.recipients.map((rec, i) => (
                  <div key={i} className="flex justify-between text-[11px]">
                    <span className="text-paper">{rec.name} ({rec.role}):</span>
                    <span className="text-brass">+{rec.shareEth} ETH</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </section>

        {/* Right Column: Listen-to-Earn Audio Progress Workbench (5 cols) */}
        <section className="lg:col-span-5 bg-[#1A1814] border border-hairline p-6 sm:p-8 rounded-sm space-y-6">
          <div className="flex items-center justify-between border-b border-hairline pb-4">
            <div>
              <span className="font-mono text-xs text-brass uppercase tracking-widest">
                // STREAM INCENTIVE
              </span>
              <h2 className="font-serif text-2xl font-bold text-paper">
                Listen-to-Earn
              </h2>
            </div>
            <span className="font-mono text-xs text-signal-light font-bold">+10 LSTN</span>
          </div>

          <p className="text-xs text-ash leading-relaxed">
            Listen to 12 seconds of this master recording. The smart contract validates completion and immediately mints 10 LSTN utility tokens to your wallet.
          </p>

          {/* Real Audio Progress Bar */}
          <div className="space-y-3 pt-2">
            <div className="flex justify-between font-mono text-xs text-ash">
              <span>Stream Duration</span>
              <span className="text-paper font-semibold">
                00:{elapsedSec < 10 ? `0${elapsedSec}` : elapsedSec} / 00:12
              </span>
            </div>

            {/* Tactile Progress Bar */}
            <div className="w-full h-3 bg-[#100F0D] border border-hairline rounded-sm overflow-hidden p-0.5">
              <div
                style={{ width: `${listenProgress}%` }}
                className="h-full bg-brass transition-all duration-300 relative"
              />
            </div>

            <div className="flex justify-between font-mono text-[11px] text-ash">
              <span>{listenProgress}% Completed</span>
              <span className={listenProgress === 100 ? "text-brass font-bold" : "text-ash"}>
                {listenProgress === 100 ? "Ready for Mint" : "12s Required"}
              </span>
            </div>
          </div>

          {/* Action Trigger */}
          <div className="pt-2">
            {listenStatus === "listening" ? (
              <button
                onClick={handlePauseListening}
                className="w-full py-3 border border-ash text-paper font-mono text-xs rounded-sm hover:border-paper transition-colors flex items-center justify-center gap-2"
              >
                <Pause className="w-3.5 h-3.5" />
                <span>Pause Verification</span>
              </button>
            ) : (
              <button
                onClick={handleStartListening}
                disabled={listenStatus === "claiming"}
                className="w-full py-3 bg-paper text-ink font-semibold text-xs rounded-sm hover:bg-white transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
              >
                <Headphones className="w-4 h-4" />
                <span>
                  {listenStatus === "claiming"
                    ? "Minting On-Chain..."
                    : listenStatus === "completed"
                    ? "Listen Again (+10 LSTN)"
                    : "Listen to Earn 10 LSTN"}
                </span>
              </button>
            )}
          </div>

          {/* Reward Status Notice */}
          {listenStatus === "completed" && (
            <div className="p-4 bg-[#100F0D] border border-signal-dim rounded-sm space-y-2 font-mono text-xs">
              <div className="flex items-center gap-2 text-signal-light font-bold">
                <CheckCircle2 className="w-4 h-4" />
                <span>+10.00 LSTN MINTED</span>
              </div>
              <p className="text-ash text-[11px]">
                Tokens credited to active ledger account. Updated wallet balance:{" "}
                <span className="text-brass font-bold">{lstnBalance} LSTN</span>.
              </p>
              {rewardTxHash && (
                <div className="text-[10px] text-ash/60 truncate">
                  TX: {rewardTxHash}
                </div>
              )}
            </div>
          )}
        </section>

      </div>

    </div>
  );
}
