import React, { useState } from "react";
import { useWallet, HARDHAT_TEST_ACCOUNTS } from "../context/WalletContext";
import { formatEtherBalance } from "../utils/ethereum";
import {
  X,
  Plus,
  Coins,
  DollarSign,
  Fuel,
  Sparkles,
  Zap,
  CheckCircle2,
  RefreshCw,
  RotateCcw,
  ShieldAlert,
  AlertTriangle,
} from "lucide-react";
import toast from "react-hot-toast";

export function AddFundsModal({ isOpen, onClose }) {
  const {
    account,
    chainId,
    status,
    ethBalance,
    usdcBalance,
    lstnBalance,
    currentTestAccountIndex,
    isTestWalletMode,
    addFunds,
    resetBalances,
    refreshBalances,
    isNodeOnline,
    switchToLocalhost,
    importTokenToMetaMask,
  } = useWallet();

  const [activeTab, setActiveTab] = useState("presets"); // 'presets' | 'custom'
  const [customAsset, setCustomAsset] = useState("USDC"); // 'USDC' | 'ETH' | 'LSTN'
  const [customAmount, setCustomAmount] = useState("250");
  const [isProcessing, setIsProcessing] = useState(false);

  if (!isOpen) return null;

  const currentAccountInfo = !isTestWalletMode && account ? {
    name: "MetaMask (Connected)",
    role: "Active Web3 Wallet",
    address: account,
  } : HARDHAT_TEST_ACCOUNTS[currentTestAccountIndex] || {
    name: "Connected Account",
    role: "User",
    address: account || "0x...",
  };

  const handleQuickAdd = async (asset, amount, label) => {
    setIsProcessing(true);
    const toastId = toast.loading(`Adding ${label || `${amount} ${asset}`} to wallet...`);

    try {
      await addFunds({ asset, amount, targetAddress: account });
      toast.success(
        `Added +${amount} ${asset} to ${currentAccountInfo.name}!`,
        { id: toastId }
      );
      await refreshBalances();
    } catch (err) {
      console.error("Quick add error:", err);
      toast.error("Failed to add funds", { id: toastId });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleRefillAll = async () => {
    setIsProcessing(true);
    const toastId = toast.loading("Refilling all test assets (1,000 USDC, 2 ETH, 100 LSTN)...");

    try {
      await addFunds({ asset: "ALL", amount: 0, targetAddress: account });
      toast.success("Wallet successfully topped up with full test suite!", { id: toastId });
      await refreshBalances();
    } catch (err) {
      console.error("Refill error:", err);
      toast.error("Failed to refill", { id: toastId });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleCustomSubmit = async (e) => {
    if (e && e.preventDefault) e.preventDefault();
    const num = parseFloat(customAmount);
    if (isNaN(num) || num <= 0) {
      toast.error("Please enter a valid amount greater than 0");
      return;
    }

    setIsProcessing(true);
    const toastId = toast.loading(`Minting +${customAmount} ${customAsset}...`);

    try {
      await addFunds({ asset: customAsset, amount: num, targetAddress: account });
      toast.success(`Successfully deposited +${customAmount} ${customAsset}!`, { id: toastId });
      await refreshBalances();
      setCustomAmount("");
    } catch (err) {
      console.error("Custom submit error:", err);
      toast.error("Custom funding failed", { id: toastId });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleResetDefaults = async () => {
    setIsProcessing(true);
    const toastId = toast.loading("Restoring test balances to default...");

    try {
      await resetBalances();
      toast.success("Test balances reset to default state", { id: toastId });
      await refreshBalances();
    } catch (err) {
      console.error("Reset error:", err);
      toast.error("Failed to reset balances", { id: toastId });
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-[#0E0D0B]/85 backdrop-blur-md transition-opacity"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Modal Dialog */}
      <div className="relative w-full max-w-lg bg-[#181613] border border-hairline rounded-sm shadow-2xl p-6 sm:p-8 z-20 space-y-6 font-sans text-paper">
        
        {/* Header */}
        <div className="flex items-start justify-between border-b border-hairline pb-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <Coins className="w-4 h-4 text-brass" />
              <p className="text-brass text-xs font-semibold uppercase tracking-wider font-mono">
                Test Faucet & Treasury Top-Up
              </p>
            </div>
            <h2 className="font-serif text-2xl sm:text-3xl font-bold text-paper">
              Add Test Funds
            </h2>
            <p className="text-xs text-ash">
              Credit test USDC stablecoins, ETH gas, or LSTN utility tokens to evaluate royalties and streaming payouts.
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="text-ash hover:text-paper p-1 rounded transition-colors"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Network Mismatch Notice for MetaMask Users */}
        {!isTestWalletMode && account && chainId !== 31337 && (
          <div className="p-3.5 bg-amber-950/40 border border-amber-500/60 rounded-sm space-y-2.5">
            <div className="flex items-start gap-2.5">
              <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
              <div className="space-y-1 text-xs">
                <p className="font-semibold text-amber-300">
                  MetaMask is on {chainId === 1 ? "Ethereum Mainnet" : `Network #${chainId || "Unknown"}`}
                </p>
                <p className="text-amber-200/80 leading-relaxed text-[11px]">
                  SoundChain's smart contracts and test balances exist on <strong>Localhost 8545 (Chain ID 31337)</strong>. Funds will show as $0.00 until you switch MetaMask to Localhost.
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={async () => {
                try {
                  await switchToLocalhost();
                  toast.success("Switched MetaMask to Localhost 8545!");
                  await refreshBalances();
                } catch (e) {
                  toast.error("Could not switch network: " + (e.message || "Failed"));
                }
              }}
              className="w-full flex items-center justify-center gap-2 py-2 px-3 bg-amber-500 hover:bg-amber-400 text-black font-semibold text-xs rounded transition-colors shadow-sm"
            >
              <span>🦊</span> Switch MetaMask to Localhost 8545 (Chain 31337)
            </button>
          </div>
        )}

        {/* Current Account Card */}
        <div className="p-3.5 bg-[#12110E] border border-hairline rounded-sm space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="text-ash font-medium">Target Account:</span>
            <span className="text-brass font-mono font-semibold">
              {currentAccountInfo.role}
            </span>
          </div>
          <div className="flex items-center justify-between text-[11px] font-mono">
            <span className="text-paper font-semibold">{currentAccountInfo.name}</span>
            <span className="text-ash">{account ? `${account.slice(0, 8)}···${account.slice(-6)}` : "Not connected"}</span>
          </div>

          {/* Current Balance Pills */}
          <div className="grid grid-cols-3 gap-2 pt-2 border-t border-hairline/60 text-center font-mono">
            <div className="p-2 bg-[#0D0C0A] rounded border border-hairline/40">
              <div className="text-[10px] text-ash uppercase">USDC Balance</div>
              <div className="text-xs font-bold text-paper mt-0.5">
                ${parseFloat(usdcBalance || 0).toLocaleString("en-US", { minimumFractionDigits: 2 })}
              </div>
            </div>
            <div className="p-2 bg-[#0D0C0A] rounded border border-hairline/40">
              <div className="text-[10px] text-ash uppercase">Gas (ETH)</div>
              <div className="text-xs font-bold text-brass mt-0.5">
                {formatEtherBalance(ethBalance, 2)} ETH
              </div>
            </div>
            <div className="p-2 bg-[#0D0C0A] rounded border border-hairline/40">
              <div className="text-[10px] text-ash uppercase">LSTN Tokens</div>
              <div className="text-xs font-bold text-signal-light mt-0.5">
                {lstnBalance || "0"} LSTN
              </div>
            </div>
          </div>
        </div>

        {/* 1-Click Import Tokens to MetaMask */}
        {!isTestWalletMode && account && (
          <div className="p-3 bg-[#12110E] border border-hairline rounded-sm space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="text-ash font-medium flex items-center gap-1.5">
                <span>🦊</span> Display Tokens in MetaMask:
              </span>
              <span className="text-[10px] text-ash/80 font-mono">1-click register</span>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={async () => {
                  try {
                    await importTokenToMetaMask("USDC");
                    toast.success("Added MockUSDC token to MetaMask!");
                  } catch (e) {
                    toast.error(e.message || "Could not add token");
                  }
                }}
                className="py-1.5 px-2.5 bg-[#1B1915] hover:bg-[#25221C] border border-hairline hover:border-brass text-paper text-xs font-mono rounded transition-colors flex items-center justify-center gap-1.5"
                title="Register custom USDC token contract in MetaMask"
              >
                <span>🪙</span> Import USDC to MetaMask
              </button>
              <button
                type="button"
                onClick={async () => {
                  try {
                    await importTokenToMetaMask("LSTN");
                    toast.success("Added LSTN token to MetaMask!");
                  } catch (e) {
                    toast.error(e.message || "Could not add token");
                  }
                }}
                className="py-1.5 px-2.5 bg-[#1B1915] hover:bg-[#25221C] border border-hairline hover:border-brass text-paper text-xs font-mono rounded transition-colors flex items-center justify-center gap-1.5"
                title="Register custom LSTN reward token in MetaMask"
              >
                <span>🎵</span> Import LSTN to MetaMask
              </button>
            </div>
          </div>
        )}

        {/* Tab Controls */}
        <div className="flex border-b border-hairline text-xs font-mono">
          <button
            type="button"
            onClick={() => setActiveTab("presets")}
            className={`pb-2.5 px-4 font-semibold transition-colors border-b-2 ${
              activeTab === "presets"
                ? "border-brass text-brass"
                : "border-transparent text-ash hover:text-paper"
            }`}
          >
            Quick 1-Click Packs
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("custom")}
            className={`pb-2.5 px-4 font-semibold transition-colors border-b-2 ${
              activeTab === "custom"
                ? "border-brass text-brass"
                : "border-transparent text-ash hover:text-paper"
            }`}
          >
            Custom Amount
          </button>
        </div>

        {/* Tab 1: Presets */}
        {activeTab === "presets" && (
          <div className="space-y-4">
            
            {/* Super Refill Hero Button */}
            <button
              type="button"
              onClick={handleRefillAll}
              disabled={isProcessing}
              className="w-full p-3.5 bg-gradient-to-r from-brass/20 via-brass/10 to-transparent border border-brass/50 hover:border-brass rounded-sm flex items-center justify-between text-left transition-all group"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-sm bg-brass text-ink font-bold flex items-center justify-center">
                  <Zap className="w-4 h-4 fill-current" />
                </div>
                <div>
                  <div className="text-xs font-bold text-paper group-hover:text-brass transition-colors">
                    ⚡ Quick Refill All (+1,000 USDC + 2.0 ETH + 100 LSTN)
                  </div>
                  <div className="text-[11px] text-ash">
                    Instant full treasury top-up for end-to-end evaluation
                  </div>
                </div>
              </div>
              <span className="text-xs font-mono font-semibold text-brass px-2.5 py-1 bg-brass/15 rounded-sm">
                1-Click
              </span>
            </button>

            {/* Individual Pack Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => handleQuickAdd("USDC", 100, "+$100 USDC")}
                disabled={isProcessing}
                className="p-3 bg-[#12110E] hover:bg-[#1C1A16] border border-hairline hover:border-brass rounded-sm text-left transition-colors font-mono"
              >
                <div className="text-brass font-bold text-sm">+$100 USDC</div>
                <div className="text-[10px] text-ash mt-0.5">Stream Royalty</div>
              </button>

              <button
                type="button"
                onClick={() => handleQuickAdd("USDC", 500, "+$500 USDC")}
                disabled={isProcessing}
                className="p-3 bg-[#12110E] hover:bg-[#1C1A16] border border-hairline hover:border-brass rounded-sm text-left transition-colors font-mono"
              >
                <div className="text-paper font-bold text-sm">+$500 USDC</div>
                <div className="text-[10px] text-ash mt-0.5">Popular Test Pack</div>
              </button>

              <button
                type="button"
                onClick={() => handleQuickAdd("USDC", 2500, "+$2,500 USDC")}
                disabled={isProcessing}
                className="p-3 bg-[#12110E] hover:bg-[#1C1A16] border border-hairline hover:border-brass rounded-sm text-left transition-colors font-mono"
              >
                <div className="text-signal-light font-bold text-sm">+$2,500 USDC</div>
                <div className="text-[10px] text-ash mt-0.5">Label Treasury</div>
              </button>

              <button
                type="button"
                onClick={() => handleQuickAdd("ETH", 1.0, "+1.0 ETH")}
                disabled={isProcessing}
                className="p-3 bg-[#12110E] hover:bg-[#1C1A16] border border-hairline hover:border-brass rounded-sm text-left transition-colors font-mono"
              >
                <div className="text-brass font-bold text-sm">+1.0 ETH</div>
                <div className="text-[10px] text-ash mt-0.5">Gas Liquidity</div>
              </button>

              <button
                type="button"
                onClick={() => handleQuickAdd("ETH", 5.0, "+5.0 ETH")}
                disabled={isProcessing}
                className="p-3 bg-[#12110E] hover:bg-[#1C1A16] border border-hairline hover:border-brass rounded-sm text-left transition-colors font-mono"
              >
                <div className="text-paper font-bold text-sm">+5.0 ETH</div>
                <div className="text-[10px] text-ash mt-0.5">Heavy Contract Gas</div>
              </button>

              <button
                type="button"
                onClick={() => handleQuickAdd("LSTN", 50, "+50 LSTN")}
                disabled={isProcessing}
                className="p-3 bg-[#12110E] hover:bg-[#1C1A16] border border-hairline hover:border-brass rounded-sm text-left transition-colors font-mono"
              >
                <div className="text-signal-light font-bold text-sm">+50 LSTN</div>
                <div className="text-[10px] text-ash mt-0.5">Fan Rewards</div>
              </button>
            </div>

          </div>
        )}

        {/* Tab 2: Custom Amount */}
        {activeTab === "custom" && (
          <form onSubmit={handleCustomSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs text-ash font-medium block">Choose Asset to Fund:</label>
              <div className="grid grid-cols-3 gap-2 font-mono text-xs">
                {["USDC", "ETH", "LSTN"].map((asset) => (
                  <button
                    key={asset}
                    type="button"
                    onClick={() => setCustomAsset(asset)}
                    className={`py-2 px-3 rounded-sm border font-semibold transition-colors ${
                      customAsset === asset
                        ? "bg-brass text-ink border-brass"
                        : "bg-[#12110E] text-ash border-hairline hover:border-brass/60"
                    }`}
                  >
                    {asset}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-1.5 font-mono">
              <div className="flex justify-between text-xs text-ash">
                <span>Amount:</span>
                <span>Asset: {customAsset}</span>
              </div>
              <input
                type="number"
                step="any"
                min="0.1"
                value={customAmount}
                onChange={(e) => setCustomAmount(e.target.value)}
                placeholder="Enter deposit amount"
                className="w-full bg-[#12110E] border border-hairline rounded-sm px-3.5 py-2.5 text-paper placeholder-ash/40 focus:outline-none focus:border-brass text-sm"
              />
            </div>

            {/* Quick Increment Steppers */}
            <div className="flex items-center gap-2 font-mono text-xs">
              <span className="text-ash text-[11px]">Quick add:</span>
              {[50, 250, 1000].map((inc) => (
                <button
                  key={inc}
                  type="button"
                  onClick={() => setCustomAmount(String((parseFloat(customAmount) || 0) + inc))}
                  className="px-2 py-0.5 rounded border border-hairline hover:border-brass text-ash hover:text-paper"
                >
                  +{inc}
                </button>
              ))}
            </div>

            <button
              type="submit"
              disabled={isProcessing}
              className="w-full py-3 bg-brass text-ink font-semibold text-xs rounded-sm hover:bg-brass-light transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
            >
              <Plus className="w-4 h-4" />
              <span>Deposit {customAmount || "0"} {customAsset} to Test Wallet</span>
            </button>
          </form>
        )}

        {/* Footer with Reset Defaults */}
        <div className="pt-3 border-t border-hairline flex items-center justify-between text-[11px] text-ash font-sans">
          <span>
            Environment: <strong className="text-paper">{isNodeOnline ? "Hardhat Node (Live)" : "Local Persistent Store"}</strong>
          </span>

          <button
            type="button"
            onClick={handleResetDefaults}
            disabled={isProcessing}
            className="text-ash hover:text-paper hover:underline flex items-center gap-1 font-mono transition-colors"
            title="Reset balances back to clean demo state"
          >
            <RotateCcw className="w-3 h-3" />
            <span>Reset Defaults</span>
          </button>
        </div>

      </div>
    </div>
  );
}
