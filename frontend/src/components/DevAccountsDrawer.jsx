import React, { useState, useRef, useEffect } from "react";
import { useWallet } from "../context/WalletContext";
import { Terminal, X, Check, ArrowRight } from "lucide-react";
import toast from "react-hot-toast";

export function DevAccountsDrawer() {
  const [isOpen, setIsOpen] = useState(false);
  const panelRef = useRef(null);

  const {
    account,
    testAccounts,
    connectTestWallet,
    isTestWalletMode,
    currentTestAccountIndex,
  } = useWallet();

  // Close on outside click
  useEffect(() => {
    function handleClickOutside(event) {
      if (panelRef.current && !panelRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }
    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen]);

  const handleSelectAccount = async (id, name) => {
    await connectTestWallet(id);
    toast.success(`Active Dev Account: ${name}`);
    setIsOpen(false);
  };

  return (
    <div className="fixed bottom-20 right-4 z-40" ref={panelRef}>
      {/* Floating Corner Trigger Button */}
      {!isOpen ? (
        <button
          onClick={() => setIsOpen(true)}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-sm bg-[#1A1814] border border-hairline hover:border-brass text-ash hover:text-paper shadow-xl text-xs font-mono transition-all opacity-85 hover:opacity-100"
          title="Open Hardhat Dev Accounts Drawer"
        >
          <Terminal className="w-3.5 h-3.5 text-brass" />
          <span>Dev Accounts</span>
        </button>
      ) : (
        /* Compact Floating Drawer Panel (~340px) */
        <div className="w-80 sm:w-96 bg-[#1A1814] border border-hairline shadow-2xl rounded-sm p-4 font-mono text-xs space-y-3 animate-in fade-in slide-in-from-bottom-2 duration-200">
          
          {/* Header */}
          <div className="flex items-center justify-between pb-2 border-b border-hairline">
            <div className="flex items-center gap-2">
              <Terminal className="w-3.5 h-3.5 text-brass" />
              <span className="font-bold text-paper text-[11px] uppercase tracking-wider">
                Local Hardhat Accounts — Dev Only
              </span>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="text-ash hover:text-paper p-0.5"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <p className="text-[10px] text-ash leading-relaxed">
            One-click test wallet impersonation for assignment evaluation on <code className="text-paper">http://127.0.0.1:8545</code>.
          </p>

          {/* Compact Account Rows */}
          <div className="space-y-1.5">
            {testAccounts.map((item) => {
              const isActive = isTestWalletMode && currentTestAccountIndex === item.id;
              return (
                <div
                  key={item.id}
                  className={`p-2 rounded-sm border flex items-center justify-between transition-colors ${
                    isActive
                      ? "bg-[#100F0D] border-brass text-paper"
                      : "bg-[#100F0D] border-hairline text-ash hover:border-brass-dim"
                  }`}
                >
                  <div className="space-y-0.5 truncate max-w-[200px]">
                    <div className="text-[11px] font-medium text-paper truncate">
                      {item.name}
                    </div>
                    <div className="text-[10px] text-ash/80 truncate">
                      {item.address.slice(0, 8)}···{item.address.slice(-6)} · <span className="text-brass">{item.role}</span>
                    </div>
                  </div>

                  {isActive ? (
                    <span className="px-2 py-0.5 bg-brass/20 text-brass text-[10px] font-bold rounded-sm inline-flex items-center gap-1">
                      <Check className="w-3 h-3" /> Active
                    </span>
                  ) : (
                    <button
                      onClick={() => handleSelectAccount(item.id, item.name)}
                      className="px-2.5 py-1 bg-paper text-ink hover:bg-white text-[10px] font-semibold rounded-sm transition-colors"
                    >
                      Use
                    </button>
                  )}
                </div>
              );
            })}
          </div>

          <div className="pt-2 border-t border-hairline flex items-center justify-between text-[10px] text-ash/60">
            <span>Pre-funded with $10,000 USDC</span>
            <span>Chain ID: 31337</span>
          </div>

        </div>
      )}
    </div>
  );
}
