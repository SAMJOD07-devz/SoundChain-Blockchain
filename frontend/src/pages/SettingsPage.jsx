import React from "react";
import { useWallet } from "../context/WalletContext";
import { formatEtherBalance } from "../utils/ethereum";
import { Settings, Shield, ArrowRightLeft, Check, Copy, Power, ExternalLink } from "lucide-react";
import toast from "react-hot-toast";

export function SettingsPage() {
  const {
    account,
    chainId,
    ethBalance,
    usdcBalance,
    lstnBalance,
    userRole,
    setUserRole,
    toggleUserRole,
    disconnectWallet,
    connectTestWallet,
    isTestWalletMode,
    currentTestAccountIndex,
    testAccounts,
    isAdmin,
    isCreatorPayee,
  } = useWallet();

  const handleCopy = () => {
    if (account) {
      navigator.clipboard.writeText(account);
      toast.success("Wallet address copied");
    }
  };

  return (
    <div className="space-y-10 py-8 pb-28 max-w-3xl mx-auto font-mono text-xs">
      
      {/* Header */}
      <div className="border-b border-hairline pb-6 space-y-2">
        <div className="text-brass uppercase tracking-widest text-[11px]">
          // SYSTEM CONFIGURATION
        </div>
        <h1 className="font-serif text-3xl sm:text-4xl font-bold text-paper tracking-tight">
          Wallet & Node Environment
        </h1>
        <p className="text-ash text-xs">
          Active blockchain connection, persona preferences, and demonstration account credentials.
        </p>
      </div>

      {/* 1. ACTIVE CONNECTION DETAILS */}
      <div className="p-6 bg-[#1A1814] border border-hairline rounded-sm space-y-4">
        <div className="flex items-center justify-between border-b border-hairline pb-3">
          <span className="text-ash uppercase text-[10px]">EVM ACCOUNT DETAILS</span>
          <span className="text-signal-light flex items-center gap-1.5 font-bold">
            <span className="w-1.5 h-1.5 rounded-full bg-signal" />
            Connected (Chain ID: {chainId || 31337})
          </span>
        </div>

        <div className="space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
            <span className="text-ash">Address:</span>
            <div className="flex items-center gap-2">
              <span className="text-paper break-all">{account || "None"}</span>
              <button onClick={handleCopy} className="text-brass hover:underline">
                Copy
              </button>
            </div>
          </div>

          <div className="flex justify-between py-1 border-t border-hairline">
            <span className="text-ash">USDC Royalty Balance:</span>
            <span className="text-paper font-bold">${parseFloat(usdcBalance || 0).toLocaleString("en-US", { minimumFractionDigits: 2 })} USDC</span>
          </div>

          <div className="flex justify-between py-1 border-t border-hairline">
            <span className="text-ash">LSTN Tokens:</span>
            <span className="text-brass font-bold">{lstnBalance} LSTN</span>
          </div>

          <div className="flex justify-between py-1 border-t border-hairline">
            <span className="text-ash">Gas Liquidity (ETH):</span>
            <span className="text-ash">{formatEtherBalance(ethBalance, 4)} ETH</span>
          </div>

          <div className="flex justify-between py-1 border-t border-hairline">
            <span className="text-ash">RPC Endpoint:</span>
            <span className="text-ash">http://127.0.0.1:8545</span>
          </div>
        </div>
      </div>

      {/* 2. DEMO PERSONA SWITCHER */}
      <div className="p-6 bg-[#1A1814] border border-hairline rounded-sm space-y-4">
        <div className="flex items-center justify-between border-b border-hairline pb-3">
          <span className="text-ash uppercase text-[10px]">PRESENTATION PERSONA PREFERENCE</span>
          <span className="text-brass font-bold uppercase">{userRole === "creator" ? "Creator Studio" : "Fan Portal"}</span>
        </div>

        <p className="text-ash text-xs leading-relaxed">
          Toggle between the Listener discovery interface and the Creator financial studio. This setting persists across browser sessions.
        </p>

        <div className="flex items-center gap-3 pt-1">
          <button
            onClick={() => {
              setUserRole("fan");
              toast.success("Switched to Fan / Listener Portal");
            }}
            className={`px-4 py-2 rounded-sm border transition-colors ${
              userRole === "fan"
                ? "bg-brass text-ink font-bold border-brass"
                : "border-hairline text-ash hover:text-paper"
            }`}
          >
            Fan / Listener Mode
          </button>
          <button
            onClick={() => {
              setUserRole("creator");
              toast.success("Switched to Creator Studio");
            }}
            className={`px-4 py-2 rounded-sm border transition-colors ${
              userRole === "creator"
                ? "bg-brass text-ink font-bold border-brass"
                : "border-hairline text-ash hover:text-paper"
            }`}
          >
            Creator / Studio Mode
          </button>
        </div>
      </div>

      {/* 3. DEMO ACCOUNTS ROLE SELECTOR */}
      <div className="p-6 bg-[#1A1814] border border-hairline rounded-sm space-y-4">
        <div className="border-b border-hairline pb-3">
          <span className="text-ash uppercase text-[10px] block">HARDHAT PRE-FUNDED ROLES</span>
          <span className="text-paper font-bold">Select Demo Stakeholder Account</span>
        </div>

        <div className="space-y-2">
          {testAccounts.map((accItem) => (
            <button
              key={accItem.id}
              onClick={() => {
                connectTestWallet(accItem.id);
                toast.success(`Connected as ${accItem.name}`);
              }}
              className={`w-full text-left p-3 rounded-sm border flex items-center justify-between transition-colors ${
                isTestWalletMode && currentTestAccountIndex === accItem.id
                  ? "bg-brass/10 border-brass text-paper"
                  : "bg-[#100F0D] border-hairline text-ash hover:text-paper"
              }`}
            >
              <div>
                <div className="font-bold text-paper">{accItem.name}</div>
                <div className="text-[11px] text-ash">{accItem.role} · {accItem.address.slice(0, 10)}···{accItem.address.slice(-6)}</div>
              </div>
              {isTestWalletMode && currentTestAccountIndex === accItem.id && (
                <Check className="w-4 h-4 text-brass" />
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Disconnect Action */}
      <div className="pt-2 text-right">
        <button
          onClick={disconnectWallet}
          className="px-4 py-2 border border-rose-500/40 text-rose-300 hover:bg-rose-500/10 rounded-sm inline-flex items-center gap-1.5 transition-colors"
        >
          <Power className="w-3.5 h-3.5" />
          <span>Disconnect Wallet Session</span>
        </button>
      </div>

    </div>
  );
}
