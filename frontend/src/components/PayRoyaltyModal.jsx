import React, { useState } from "react";
import { ethers } from "ethers";
import toast from "react-hot-toast";
import { Send, Wallet, CheckCircle2, AlertCircle, RefreshCw, Sparkles, Disc, Coins } from "lucide-react";
import { useWallet } from "../context/WalletContext";
import { Modal } from "./UI/Modal";
import { Button } from "./UI/Button";
import { formatEth, parseEtherError, truncateAddress } from "../utils/ethereum";

export function PayRoyaltyModal({ isOpen, onClose, track, onPaymentSuccess }) {
  const [amountEth, setAmountEth] = useState("0.01");
  const [txState, setTxState] = useState("idle"); // 'idle' | 'confirming' | 'mining' | 'success' | 'error'
  const [txHash, setTxHash] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [summaryData, setSummaryData] = useState(null);

  const { account, connectTestWallet, getRoyaltySplitterContract, refreshBalances } = useWallet();

  const handlePreset = (val) => {
    setAmountEth(val);
    setErrorMessage("");
  };

  const handleSendPayment = async () => {
    setErrorMessage("");
    if (!account) {
      await connectTestWallet(0);
    }

    const numAmount = parseFloat(amountEth);
    if (isNaN(numAmount) || numAmount <= 0) {
      setErrorMessage("Please enter a valid ETH payment amount greater than 0.");
      return;
    }

    try {
      const contract = getRoyaltySplitterContract();
      if (!contract) {
        throw new Error("RoyaltySplitter contract address not configured. Please ensure local node is running.");
      }

      setTxState("confirming");
      const weiAmount = ethers.parseEther(amountEth);

      const tx = await contract.payRoyalty(track.bytes32Id, {
        value: weiAmount,
      });

      setTxState("mining");
      setTxHash(tx.hash);
      toast.loading("Transaction submitted to Ethereum...", { id: "pay-tx" });

      await tx.wait();
      setTxState("success");
      toast.success("ETH Royalty payment successfully distributed!", { id: "pay-tx" });

      const summary = track.splits.map((s) => ({
        role: s.role,
        name: s.name,
        percent: s.percent,
        ethReceived: (numAmount * (s.percent / 100)).toFixed(4),
      }));
      setSummaryData(summary);

      await refreshBalances();
      if (onPaymentSuccess) onPaymentSuccess(weiAmount.toString());
    } catch (err) {
      console.error("Payment error:", err);
      const parsedErr = parseEtherError(err);
      setErrorMessage(parsedErr);
      setTxState("error");
      toast.error(parsedErr, { id: "pay-tx" });
    }
  };

  const handleResetModal = () => {
    setTxState("idle");
    setTxHash("");
    setErrorMessage("");
    setSummaryData(null);
    onClose();
  };

  const presets = ["0.005", "0.01", "0.05", "0.1"];

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleResetModal}
      title={`Simulate Royalty Payment — ${track?.title}`}
      maxWidth="max-w-lg"
    >
      {txState === "idle" || txState === "error" ? (
        <div className="space-y-6">
          {/* Top Note */}
          <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center gap-3">
            <div className="p-2 rounded-xl bg-amber-500 text-black font-black text-xs font-mono">
              ETH
            </div>
            <div className="text-xs text-amber-200/90">
              <span className="font-bold text-white">Smart Contract Splitting: </span>
              Your test ETH will be automatically split on-chain to registered stakeholders in basis points.
            </div>
          </div>

          {/* Amount Input */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-300 uppercase tracking-wider font-mono">
              Payment Amount (Test ETH)
            </label>
            <div className="relative">
              <input
                type="number"
                step="0.001"
                min="0.0001"
                value={amountEth}
                onChange={(e) => {
                  setAmountEth(e.target.value);
                  setErrorMessage("");
                }}
                className="w-full bg-[#050608] border border-white/10 rounded-2xl px-4 py-3.5 text-xl font-black text-white focus:outline-none focus:border-emerald-500 font-mono shadow-inner"
                placeholder="0.01"
              />
              <span className="absolute right-4 top-4 text-xs font-bold text-amber-400 font-mono">
                ETH
              </span>
            </div>

            {/* Presets */}
            <div className="flex gap-2 pt-1">
              {presets.map((val) => (
                <button
                  key={val}
                  type="button"
                  onClick={() => handlePreset(val)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold font-mono border transition-all ${
                    amountEth === val
                      ? "bg-amber-400 text-black border-amber-300 shadow-glow-gold font-extrabold"
                      : "bg-[#0d1017] text-slate-400 border-white/10 hover:border-slate-500"
                  }`}
                >
                  {val} ETH
                </button>
              ))}
            </div>
          </div>

          {/* Realtime Payee Payout Preview Cards */}
          <div className="space-y-2.5 p-4 rounded-2xl bg-[#050608] border border-white/5">
            <div className="text-xs font-bold text-slate-300 flex items-center justify-between font-mono">
              <span>On-Chain Payee Distribution:</span>
              <span className="text-[10px] text-emerald-400 font-bold">10,000 BPS Total</span>
            </div>
            
            <div className="space-y-2 text-xs">
              {track?.splits.map((s, idx) => {
                const total = parseFloat(amountEth) || 0;
                const shareEth = (total * (s.percent / 100)).toFixed(4);
                return (
                  <div key={idx} className="flex justify-between items-center p-2.5 rounded-xl bg-white/[0.02] border border-white/5">
                    <span className="text-slate-300 font-medium">
                      {s.role} ({s.name}) — <strong className="text-amber-300">{s.percent}%</strong>
                    </span>
                    <span className="font-mono font-bold text-emerald-400">
                      +{shareEth} ETH
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Error display */}
          {errorMessage && (
            <div className="p-3 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-rose-400 flex-shrink-0 mt-0.5" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Action button */}
          <button
            onClick={handleSendPayment}
            className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-emerald-500 via-teal-500 to-emerald-600 hover:from-emerald-400 hover:to-teal-400 text-black font-black text-xs shadow-glow-emerald flex items-center justify-center gap-2 font-mono"
          >
            <Send className="w-4 h-4" />
            Execute Test Payment ({amountEth} ETH)
          </button>
        </div>
      ) : null}

      {/* Confirming State */}
      {txState === "confirming" && (
        <div className="py-12 text-center space-y-4">
          <div className="p-4 rounded-full bg-amber-500/20 text-amber-400 border border-amber-500/30 inline-block animate-bounce">
            <Coins className="w-10 h-10" />
          </div>
          <h4 className="text-lg font-black text-white font-heading">Signing Transaction</h4>
          <p className="text-xs text-slate-400 max-w-xs mx-auto font-mono">
            Sending transaction to Ethereum node...
          </p>
        </div>
      )}

      {/* Mining State */}
      {txState === "mining" && (
        <div className="py-12 text-center space-y-4">
          <div className="p-4 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 inline-block animate-spin">
            <RefreshCw className="w-10 h-10" />
          </div>
          <h4 className="text-lg font-black text-white font-heading">Transaction Mining On-Chain</h4>
          <p className="text-xs text-slate-400 max-w-xs mx-auto font-mono">
            Waiting for block inclusion...
          </p>
          {txHash && (
            <div className="text-[11px] font-mono text-emerald-400 break-all bg-black/60 p-2 rounded-xl">
              Tx: {txHash}
            </div>
          )}
        </div>
      )}

      {/* Success View */}
      {txState === "success" && (
        <div className="space-y-6 py-2">
          <div className="p-5 rounded-3xl bg-emerald-500/10 border border-emerald-500/30 text-center space-y-2">
            <CheckCircle2 className="w-12 h-12 text-emerald-400 mx-auto" />
            <h4 className="text-xl font-black text-white font-heading">Royalty Payout Complete!</h4>
            <p className="text-xs text-emerald-300 font-mono">
              {amountEth} ETH was split & distributed automatically by RoyaltySplitter.sol
            </p>
          </div>

          <div className="space-y-2">
            <div className="text-xs font-bold text-slate-300 uppercase font-mono">Distribution Summary</div>
            <div className="space-y-2">
              {summaryData?.map((item, i) => (
                <div key={i} className="flex justify-between items-center p-3 rounded-2xl bg-[#050608] border border-white/5 text-xs">
                  <div>
                    <div className="font-bold text-white">{item.role} ({item.name})</div>
                    <div className="text-[10px] text-slate-400 font-mono">Share: {item.percent}%</div>
                  </div>
                  <div className="font-mono font-bold text-emerald-400 text-sm">
                    +{item.ethReceived} ETH
                  </div>
                </div>
              ))}
            </div>
          </div>

          <button
            onClick={handleResetModal}
            className="w-full py-3.5 rounded-2xl bg-emerald-500 hover:bg-emerald-400 text-black font-extrabold text-xs shadow-glow-emerald font-mono"
          >
            Done
          </button>
        </div>
      )}
    </Modal>
  );
}
