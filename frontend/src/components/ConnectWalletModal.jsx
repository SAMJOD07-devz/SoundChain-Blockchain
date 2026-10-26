import React, { useState } from "react";
import { useWallet, HARDHAT_TEST_ACCOUNTS } from "../context/WalletContext";
import { truncateAddress } from "../utils/ethereum";
import {
  X,
  Wallet,
  Check,
  ArrowRight,
  ExternalLink,
  ShieldCheck,
  Sparkles,
  Zap,
  Copy,
  Info,
  Layers,
  Coins,
  CheckCircle2,
  AlertTriangle,
  RotateCw,
} from "lucide-react";
import toast from "react-hot-toast";

export function ConnectWalletModal({ isOpen, onClose }) {
  const {
    account,
    chainId,
    status,
    isTestWalletMode,
    isMetaMaskConnected,
    hasMetaMask,
    currentTestAccountIndex,
    connectTestWallet,
    connectWallet,
    disconnectWallet,
    switchToLocalhost,
    switchToSepolia,
    isNodeOnline,
    openAddFundsModal,
  } = useWallet();

  const [isConnectingMetaMask, setIsConnectingMetaMask] = useState(false);
  const [copiedKey, setCopiedKey] = useState(false);
  const [showMetaMaskGuide, setShowMetaMaskGuide] = useState(false);

  if (!isOpen) return null;

  const handleSelectTestAccount = async (id, name) => {
    try {
      await connectTestWallet(id);
      toast.success(`Connected: ${name}`);
      onClose();
    } catch (err) {
      console.error(err);
      toast.error("Failed to connect test account");
    }
  };

  const handleConnectMetaMask = async () => {
    if (!hasMetaMask) {
      window.open("https://metamask.io/download/", "_blank");
      toast("Opening MetaMask download page...", { icon: "🦊" });
      return;
    }

    setIsConnectingMetaMask(true);
    const toastId = toast.loading("Connecting to MetaMask...");
    try {
      const connectedAcc = await connectWallet();
      if (connectedAcc) {
        toast.success(`MetaMask Connected: ${truncateAddress(connectedAcc)}`, { id: toastId });
        onClose();
      } else {
        toast.dismiss(toastId);
      }
    } catch (err) {
      console.error("MetaMask error:", err);
      toast.error(err.message || "MetaMask connection was rejected", { id: toastId });
    } finally {
      setIsConnectingMetaMask(false);
    }
  };

  const handleCopyPrivateKey = (key) => {
    navigator.clipboard.writeText(key);
    setCopiedKey(true);
    toast.success("Private key copied! Import it into MetaMask: Account > Import Account");
    setTimeout(() => setCopiedKey(false), 2500);
  };

  const handleSwitchNetwork = async () => {
    try {
      await switchToLocalhost();
      toast.success("Switched network to Localhost (31337)");
    } catch (err) {
      toast.error(err.message || "Failed to switch network");
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Dark backdrop */}
      <div
        className="fixed inset-0 bg-[#0E0D0B]/85 backdrop-blur-md transition-opacity animate-in fade-in duration-200"
        onClick={onClose}
      />

      {/* Modal Dialog */}
      <div className="relative w-full max-w-xl bg-[#14120F] border border-hairline rounded-sm shadow-2xl p-6 sm:p-7 z-10 space-y-5 font-sans text-paper animate-in zoom-in-95 duration-200 max-h-[92vh] overflow-y-auto">
        
        {/* Header */}
        <div className="flex items-start justify-between border-b border-hairline pb-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-brass animate-pulse" />
              <p className="text-brass text-xs font-semibold uppercase tracking-wider font-mono">
                Web3 Connect Gateway
              </p>
            </div>
            <h2 className="font-serif text-2xl font-bold text-paper">
              Connect Your Wallet
            </h2>
            <p className="text-xs text-ash leading-relaxed">
              Connect your MetaMask browser extension for live on-chain transactions, or use an instant test persona.
            </p>
          </div>

          <button
            onClick={onClose}
            className="text-ash hover:text-paper p-1.5 rounded transition-colors"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Node Status Banner */}
        <div className="flex items-center justify-between px-3.5 py-2 bg-[#1A1814] border border-hairline rounded-sm text-xs font-mono">
          <div className="flex items-center gap-2">
            <span
              className={`w-2 h-2 rounded-full ${
                isNodeOnline ? "bg-signal animate-pulse" : "bg-brass"
              }`}
            />
            <span className="text-ash">
              EVM Node:{" "}
              <strong className="text-paper">
                {isNodeOnline ? "Hardhat RPC Online (127.0.0.1:8545)" : "Simulated Local Node (Active)"}
              </strong>
            </span>
          </div>
          <span className="text-brass text-[11px]">Chain ID 31337</span>
        </div>

        {/* ============================================================== */}
        {/* SPOTLIGHT OPTION 1: METAMASK (PRIMARY FEATURED BROWSER WALLET) */}
        {/* ============================================================== */}
        <div className="p-4 rounded-sm border-2 border-brass/50 bg-[#1A1814] space-y-3.5 relative overflow-hidden shadow-lg">
          <div className="absolute top-0 right-0 px-2.5 py-0.5 bg-brass text-ink font-mono font-bold text-[10px] uppercase tracking-wider">
            Primary · Real Web3
          </div>

          <div className="flex items-start gap-3.5">
            {/* MetaMask Fox Emblem */}
            <div className="w-12 h-12 rounded-sm bg-gradient-to-br from-[#E2761B] to-[#CD6116] flex items-center justify-center text-paper font-black text-xl shadow-md flex-shrink-0">
              🦊
            </div>

            <div className="space-y-1 flex-1">
              <div className="flex items-center gap-2">
                <h3 className="font-serif text-base font-bold text-paper">
                  MetaMask Browser Wallet
                </h3>
                {hasMetaMask ? (
                  <span className="px-1.5 py-0.5 bg-signal/20 text-signal-light text-[10px] font-mono font-bold rounded">
                    Detected
                  </span>
                ) : (
                  <span className="px-1.5 py-0.5 bg-amber-500/20 text-amber-400 text-[10px] font-mono font-bold rounded">
                    Not Installed
                  </span>
                )}
              </div>
              <p className="text-xs text-ash leading-relaxed">
                Interact live on-chain with SoundChain smart contracts. Sign royalty distributions, earn LSTN rewards, and manage creator splits.
              </p>
            </div>
          </div>

          {/* Connected state vs Disconnected state */}
          {isMetaMaskConnected ? (
            <div className="p-3 bg-[#100F0D] border border-hairline rounded space-y-2.5">
              <div className="flex items-center justify-between text-xs font-mono">
                <span className="text-ash">Connected MetaMask Address:</span>
                <span className="text-brass font-bold">{truncateAddress(account)}</span>
              </div>
              <div className="flex items-center justify-between text-xs font-mono">
                <span className="text-ash">Network:</span>
                <span className={`font-semibold ${status === "wrong_network" ? "text-amber-400" : "text-signal-light"}`}>
                  {status === "wrong_network" ? "⚠️ Unsupported Network" : `Chain ID: ${chainId} (Supported)`}
                </span>
              </div>

              <div className="flex items-center gap-2 pt-1">
                {status === "wrong_network" && (
                  <button
                    onClick={handleSwitchNetwork}
                    className="flex-1 py-1.5 px-3 bg-amber-500 text-ink font-semibold text-xs rounded hover:bg-amber-400 transition-colors flex items-center justify-center gap-1.5"
                  >
                    <RotateCw className="w-3.5 h-3.5" />
                    <span>Switch to Hardhat (31337)</span>
                  </button>
                )}
                <button
                  onClick={() => {
                    onClose();
                    openAddFundsModal();
                  }}
                  className="flex-1 py-1.5 px-3 bg-brass text-ink font-semibold text-xs rounded hover:bg-brass-light transition-colors flex items-center justify-center gap-1.5"
                >
                  <Coins className="w-3.5 h-3.5" />
                  <span>+ Fund MetaMask</span>
                </button>
                <button
                  onClick={() => {
                    disconnectWallet();
                    toast("MetaMask disconnected");
                  }}
                  className="py-1.5 px-3 border border-hairline hover:border-brass/40 text-ash hover:text-paper font-semibold text-xs rounded transition-colors"
                >
                  Disconnect
                </button>
              </div>
            </div>
          ) : (
            <div className="flex flex-col sm:flex-row items-center gap-2 pt-1">
              <button
                onClick={handleConnectMetaMask}
                disabled={isConnectingMetaMask}
                className="w-full sm:flex-1 py-2.5 px-4 bg-brass hover:bg-brass-light text-ink font-sans font-bold text-xs uppercase tracking-wider rounded transition-all active:scale-[0.99] flex items-center justify-center gap-2 shadow-md disabled:opacity-50"
              >
                {isConnectingMetaMask ? (
                  <>
                    <RotateCw className="w-4 h-4 animate-spin" />
                    <span>Connecting...</span>
                  </>
                ) : hasMetaMask ? (
                  <>
                    <Wallet className="w-4 h-4" />
                    <span>Connect with MetaMask</span>
                  </>
                ) : (
                  <>
                    <ExternalLink className="w-4 h-4" />
                    <span>Install MetaMask Extension</span>
                  </>
                )}
              </button>

              <button
                onClick={() => setShowMetaMaskGuide(!showMetaMaskGuide)}
                className="w-full sm:w-auto py-2.5 px-3 border border-hairline hover:border-brass/40 bg-[#100F0D] text-ash hover:text-paper text-xs font-mono rounded flex items-center justify-center gap-1.5 transition-colors"
              >
                <Info className="w-3.5 h-3.5 text-brass" />
                <span>{showMetaMaskGuide ? "Hide Setup Guide" : "MetaMask Guide"}</span>
              </button>
            </div>
          )}

          {/* Collapsible MetaMask Setup Guide */}
          {showMetaMaskGuide && (
            <div className="p-3.5 bg-[#100F0D] border border-hairline rounded space-y-2.5 text-xs font-sans animate-in fade-in duration-150">
              <div className="font-semibold text-brass font-mono flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Quick MetaMask Setup for SoundChain:</span>
              </div>
              <p className="text-ash text-[11px] leading-relaxed">
                SoundChain contracts run on your local Hardhat node. You can connect your existing MetaMask account, or import a pre-funded test account:
              </p>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px] font-mono">
                <div className="p-2 bg-[#1A1814] border border-hairline rounded">
                  <span className="text-ash block">Network RPC:</span>
                  <strong className="text-paper">http://127.0.0.1:8545</strong>
                </div>
                <div className="p-2 bg-[#1A1814] border border-hairline rounded">
                  <span className="text-ash block">Chain ID:</span>
                  <strong className="text-paper">31337 (Localhost)</strong>
                </div>
              </div>

              <div className="pt-1 flex flex-wrap gap-2">
                <button
                  onClick={handleSwitchNetwork}
                  className="px-2.5 py-1.5 bg-brass/10 hover:bg-brass/20 border border-brass/40 text-brass text-[11px] font-mono font-semibold rounded flex items-center gap-1 transition-colors"
                >
                  <RotateCw className="w-3 h-3" />
                  <span>1-Click Add Localhost to MetaMask</span>
                </button>
                <button
                  onClick={() => handleCopyPrivateKey(HARDHAT_TEST_ACCOUNTS[0].privateKey)}
                  className="px-2.5 py-1.5 bg-[#1A1814] hover:bg-[#221F1A] border border-hairline text-ash hover:text-paper text-[11px] font-mono rounded flex items-center gap-1 transition-colors"
                >
                  {copiedKey ? <Check className="w-3 h-3 text-signal-light" /> : <Copy className="w-3 h-3" />}
                  <span>{copiedKey ? "Copied Account #0 Key!" : "Copy 10,000 ETH Key"}</span>
                </button>
              </div>
            </div>
          )}
        </div>

        {/* ============================================================== */}
        {/* OPTION 2: INSTANT TEST PERSONAS (NO EXTENSION REQUIRED)        */}
        {/* ============================================================== */}
        <div className="space-y-3 pt-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-ash font-mono flex items-center gap-1.5">
              <Zap className="w-3.5 h-3.5 text-brass" />
              Or Evaluate with Instant Test Personas
            </span>
            <span className="text-[11px] text-brass bg-brass/10 px-2 py-0.5 rounded-sm font-mono">
              Zero Extension Needed
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {HARDHAT_TEST_ACCOUNTS.map((item) => {
              const isActive =
                isTestWalletMode &&
                account &&
                account.toLowerCase() === item.address.toLowerCase();

              return (
                <div
                  key={item.id}
                  onClick={() => handleSelectTestAccount(item.id, item.name)}
                  className={`p-3 rounded-sm border cursor-pointer transition-all text-left group relative ${
                    isActive
                      ? "bg-[#1A1814] border-brass shadow-md ring-1 ring-brass/30"
                      : "bg-[#100F0D] border-hairline hover:border-brass/60 hover:bg-[#1A1814]"
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="space-y-0.5 truncate">
                      <div className="text-xs font-semibold text-paper group-hover:text-brass transition-colors truncate">
                        {item.name}
                      </div>
                      <div className="text-[11px] text-brass font-medium font-mono">
                        {item.role}
                      </div>
                    </div>

                    {isActive ? (
                      <span className="flex-shrink-0 px-2 py-0.5 bg-signal/20 text-signal-light text-[10px] font-bold rounded-sm flex items-center gap-1">
                        <Check className="w-3 h-3" /> Active
                      </span>
                    ) : (
                      <ArrowRight className="w-3.5 h-3.5 text-ash group-hover:text-brass group-hover:translate-x-0.5 transition-all flex-shrink-0 mt-0.5" />
                    )}
                  </div>

                  <div className="mt-2 pt-1.5 border-t border-hairline/60 flex items-center justify-between text-[10px] font-mono text-ash">
                    <span>{truncateAddress(item.address)}</span>
                    <span className="text-paper/80 font-medium">{item.description}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Footer Info */}
        <div className="pt-3 border-t border-hairline flex flex-col sm:flex-row items-center justify-between gap-3 text-[11px] text-ash font-sans">
          <div className="flex items-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-signal-light" />
            <span>Zero real funds required · Local sandbox environment</span>
          </div>

          {account && (
            <button
              onClick={() => {
                onClose();
                openAddFundsModal();
              }}
              className="text-brass hover:underline flex items-center gap-1 font-mono font-medium"
            >
              <Coins className="w-3.5 h-3.5" />
              <span>Need more funds? Open Faucet</span>
            </button>
          )}
        </div>

      </div>
    </div>
  );
}
