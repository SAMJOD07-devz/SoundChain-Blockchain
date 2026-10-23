import React, { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { useWallet } from "../context/WalletContext";
import { formatEtherBalance } from "../utils/ethereum";
import { RoleSwitcher } from "./RoleSwitcher";
import { ChevronDown, Check, Copy, ExternalLink, ArrowRight } from "lucide-react";
import toast from "react-hot-toast";

export function Navbar() {
  const location = useLocation();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  const {
    account,
    chainId,
    ethBalance,
    usdcBalance,
    lstnBalance,
    userRole,
    status,
    connectWallet,
    disconnectWallet,
    connectTestWallet,
  } = useWallet();

  const navLinks = [
    { name: "Explore", path: "/" },
    { name: "Catalog", path: "/tracks" },
    { name: "Analytics", path: "/analytics" },
    { name: "How It Works", path: "/how-it-works" },
  ];

  const handleCopyAddress = () => {
    if (account) {
      navigator.clipboard.writeText(account);
      setCopied(true);
      toast.success("Address copied");
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const truncatedAccount = account
    ? `${account.substring(0, 6)}···${account.substring(account.length - 4)}`
    : "";

  return (
    <header className="sticky top-0 z-30 w-full bg-[#14120F]/95 backdrop-blur-md border-b border-hairline">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          
          {/* Left: Brand Wordmark */}
          <Link to="/" className="flex items-baseline gap-2.5 group">
            <span className="font-serif text-2xl font-bold tracking-tight text-paper group-hover:text-brass transition-colors">
              SOUND<span className="italic font-normal text-brass">CHAIN</span>
            </span>
            <span className="text-[10px] font-mono tracking-wider text-ash uppercase hidden sm:inline-block">
              // PUBLIC ARCHIVE
            </span>
          </Link>

          {/* Center: Public Navigation Links */}
          <nav className="hidden md:flex items-center gap-8">
            {navLinks.map((link) => {
              const isActive = location.pathname === link.path;
              return (
                <Link
                  key={link.path}
                  to={link.path}
                  className={`text-xs font-mono tracking-wider transition-colors py-1 relative ${
                    isActive
                      ? "text-paper font-bold"
                      : "text-ash hover:text-paper"
                  }`}
                >
                  {link.name}
                  {isActive && (
                    <span className="absolute bottom-0 left-0 right-0 h-[2px] bg-brass" />
                  )}
                </Link>
              );
            })}
          </nav>

          {/* Right: Role Switcher Dropdown & Account Controls */}
          <div className="flex items-center gap-3">
            
            {/* Compact Role Switcher */}
            <RoleSwitcher />

            {/* Account Status / Connect Button */}
            {status === "connected" && account ? (
              <div className="relative">
                <button
                  onClick={() => setDropdownOpen(!dropdownOpen)}
                  className="flex items-center gap-2 px-3 py-1.5 rounded-sm border border-hairline bg-[#1A1814] hover:border-brass-dim transition-all text-left text-xs font-mono"
                >
                  <span className="text-ash">
                    {truncatedAccount}
                  </span>
                  <ChevronDown className="w-3.5 h-3.5 text-ash" />
                </button>

                {/* Dropdown */}
                {dropdownOpen && (
                  <div className="absolute right-0 mt-2 w-64 bg-[#1A1814] border border-hairline shadow-2xl p-4 z-50 rounded-sm font-mono text-xs space-y-3">
                    <div className="flex items-center justify-between pb-2.5 border-b border-hairline">
                      <div className="flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-signal" />
                        <span className="text-paper">
                          {chainId === 31337 ? "Localhost 8545" : "Sepolia"}
                        </span>
                      </div>
                      <button
                        onClick={handleCopyAddress}
                        className="text-ash hover:text-paper flex items-center gap-1 text-[11px]"
                      >
                        {copied ? <Check className="w-3 h-3 text-brass" /> : <Copy className="w-3 h-3" />}
                        Copy
                      </button>
                    </div>

                    <div className="space-y-1 text-ash text-[11px]">
                      <div className="flex justify-between">
                        <span>USDC:</span>
                        <span className="text-paper font-bold">${parseFloat(usdcBalance || 0).toLocaleString("en-US", { minimumFractionDigits: 2 })}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>LSTN:</span>
                        <span className="text-brass font-bold">{lstnBalance}</span>
                      </div>
                      <div className="flex justify-between text-[10px] text-ash/60">
                        <span>Gas (ETH):</span>
                        <span>{formatEtherBalance(ethBalance, 4)}</span>
                      </div>
                    </div>

                    <div className="pt-2 border-t border-hairline flex items-center justify-between text-[11px]">
                      <Link
                        to={userRole === "creator" ? "/app/dashboard" : "/app/listen"}
                        onClick={() => setDropdownOpen(false)}
                        className="text-brass hover:underline flex items-center gap-1"
                      >
                        Launch App <ExternalLink className="w-3 h-3" />
                      </Link>
                      <button
                        onClick={() => {
                          disconnectWallet();
                          setDropdownOpen(false);
                        }}
                        className="text-ash hover:text-paper"
                      >
                        Disconnect
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <button
                  onClick={() => connectTestWallet(0)}
                  className="px-3.5 py-1.5 bg-brass text-ink font-semibold text-xs font-mono rounded-sm hover:bg-brass-light transition-colors shadow-sm"
                >
                  Connect Test Ledger
                </button>
                <button
                  onClick={connectWallet}
                  className="hidden sm:inline-block px-3 py-1.5 border border-hairline text-ash hover:text-paper text-xs font-mono rounded-sm transition-colors"
                >
                  MetaMask
                </button>
              </div>
            )}

          </div>

        </div>
      </div>
    </header>
  );
}
