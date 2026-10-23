import React, { useState } from "react";
import { useWallet } from "../../context/WalletContext";
import { formatEtherBalance, parseEtherError } from "../../utils/ethereum";
import { ethers } from "ethers";
import toast from "react-hot-toast";
import { Send, Copy, Check, RefreshCw, Coins, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";

export function ListenerWalletPage() {
  const {
    account,
    ethBalance,
    usdcBalance,
    lstnBalance,
    totalListens,
    refreshBalances,
    getListenTokenContract,
  } = useWallet();

  const [recipient, setRecipient] = useState("");
  const [amount, setAmount] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [copied, setCopied] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleCopy = () => {
    if (account) {
      navigator.clipboard.writeText(account);
      setCopied(true);
      toast.success("Address copied");
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await refreshBalances();
    setTimeout(() => setIsRefreshing(false), 500);
    toast.success("Wallet balance refreshed");
  };

  const handleTransfer = async (e) => {
    e.preventDefault();
    if (!account) return toast.error("Connect your wallet first.");
    if (!recipient || !ethers.isAddress(recipient)) return toast.error("Invalid recipient Ethereum address.");
    const num = parseFloat(amount);
    if (!num || num <= 0) return toast.error("Enter a valid LSTN token amount.");
    if (num > parseFloat(lstnBalance)) return toast.error("Amount exceeds your available LSTN balance.");

    setIsSending(true);
    toast.loading("Transferring tokens...", { id: "tx-send" });

    try {
      const contract = getListenTokenContract();
      if (!contract) throw new Error("Contract not ready");

      const tx = await contract.transfer(recipient, ethers.parseUnits(amount, 18));
      await tx.wait();

      toast.success(`Successfully transferred ${amount} LSTN!`, { id: "tx-send" });
      setRecipient("");
      setAmount("");
      await refreshBalances();
    } catch (err) {
      console.error(err);
      toast.error(`Transfer failed: ${parseEtherError(err)}`, { id: "tx-send" });
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="space-y-10 py-8 pb-28 max-w-3xl mx-auto">
      
      {/* Header */}
      <div className="border-b border-hairline pb-6 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div className="space-y-1.5">
          <div className="font-mono text-xs text-brass uppercase tracking-widest">
            // LISTENER REWARDS WALLET
          </div>
          <h1 className="font-serif text-3xl sm:text-4xl font-bold text-paper tracking-tight">
            Your Tokens & Rewards
          </h1>
          <p className="font-mono text-xs text-ash">
            Account: <span className="text-paper">{account || "Disconnected"}</span>
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleCopy}
            className="px-3 py-1.5 border border-hairline hover:border-paper font-mono text-xs text-ash hover:text-paper rounded-sm inline-flex items-center gap-1.5"
          >
            {copied ? <Check className="w-3 h-3 text-brass" /> : <Copy className="w-3 h-3" />}
            <span>Copy Address</span>
          </button>
          <button
            onClick={handleRefresh}
            disabled={isRefreshing}
            className="px-3 py-1.5 border border-hairline hover:border-paper font-mono text-xs text-ash hover:text-paper rounded-sm inline-flex items-center gap-1.5"
          >
            <RefreshCw className={`w-3 h-3 ${isRefreshing ? "animate-spin" : ""}`} />
            <span>Refresh</span>
          </button>
        </div>
      </div>

      {/* 1. TOKEN-FIRST BALANCE CARD */}
      <div className="p-8 bg-[#1A1814] border border-hairline rounded-sm space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-hairline pb-6">
          <div>
            <span className="font-mono text-xs text-ash uppercase tracking-wider block">
              AVAILABLE STREAM REWARD TOKENS
            </span>
            <div className="font-serif text-4xl sm:text-5xl font-bold text-brass mt-1">
              {lstnBalance} <span className="text-xl font-normal text-paper font-mono">LSTN</span>
            </div>
            <span className="font-mono text-xs text-ash mt-1 block">
              SoundChain Utility ERC-20 Token
            </span>
          </div>

          <div className="sm:border-l sm:border-hairline sm:pl-8 space-y-2 font-mono text-xs">
            <div className="flex justify-between gap-6">
              <span className="text-ash">Completed Streams:</span>
              <span className="text-paper font-bold">{totalListens} Plays</span>
            </div>
            <div className="flex justify-between gap-6">
              <span className="text-ash">Stable USDC:</span>
              <span className="text-brass font-bold">${parseFloat(usdcBalance || 0).toLocaleString("en-US", { minimumFractionDigits: 2 })} USDC</span>
            </div>
            <div className="flex justify-between gap-6">
              <span className="text-ash">Gas / Network ETH:</span>
              <span className="text-ash">{formatEtherBalance(ethBalance, 4)} ETH</span>
            </div>
            <div className="flex justify-between gap-6">
              <span className="text-ash">Stream Incentive:</span>
              <span className="text-signal-light font-semibold">+10 LSTN / Stream</span>
            </div>
          </div>
        </div>

        {/* Quick Earn More CTA */}
        <div className="flex items-center justify-between font-mono text-xs text-ash">
          <span>Want to accumulate more rewards?</span>
          <Link to="/app/listen" className="text-brass hover:underline flex items-center gap-1">
            <span>Stream Next Master</span>
            <ArrowRight className="w-3 h-3" />
          </Link>
        </div>
      </div>

      {/* 2. SIMPLE SEND / TRANSFER FORM */}
      <div className="p-6 sm:p-8 bg-[#1A1814] border border-hairline rounded-sm space-y-6">
        <div className="border-b border-hairline pb-3 flex items-center justify-between">
          <div>
            <span className="font-mono text-xs text-brass uppercase tracking-widest">
              // TRANSFER TOKENS
            </span>
            <h2 className="font-serif text-2xl font-bold text-paper mt-0.5">
              Send LSTN to a Friend
            </h2>
          </div>
          <span className="font-mono text-xs text-ash">ERC-20 Transfer</span>
        </div>

        <form onSubmit={handleTransfer} className="space-y-4 font-mono text-xs">
          <div className="space-y-1.5">
            <label className="text-ash block">Recipient Ethereum Address (0x...):</label>
            <input
              type="text"
              value={recipient}
              onChange={(e) => setRecipient(e.target.value)}
              placeholder="0x70997970C51812dc3A010C7d01b50e0d17dc79C8"
              className="w-full bg-[#100F0D] border border-hairline rounded-sm px-3.5 py-2.5 text-paper placeholder-ash/40 focus:outline-none focus:border-brass"
            />
          </div>

          <div className="space-y-1.5">
            <div className="flex justify-between text-ash">
              <span>Amount (LSTN):</span>
              <span>Available: {lstnBalance} LSTN</span>
            </div>
            <div className="relative">
              <input
                type="number"
                step="1"
                min="1"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="10"
                className="w-full bg-[#100F0D] border border-hairline rounded-sm px-3.5 py-2.5 text-paper placeholder-ash/40 focus:outline-none focus:border-brass"
              />
              <button
                type="button"
                onClick={() => setAmount(lstnBalance)}
                className="absolute right-3 top-2.5 text-[11px] text-brass hover:underline"
              >
                Max
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={isSending}
            className="w-full py-3 bg-brass text-ink font-semibold text-xs rounded-sm hover:bg-brass-light transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
          >
            <Send className="w-3.5 h-3.5" />
            <span>{isSending ? "Executing On-Chain Transfer..." : "Send LSTN Tokens"}</span>
          </button>
        </form>
      </div>

    </div>
  );
}
