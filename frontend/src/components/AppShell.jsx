import React, { useState } from "react";
import { Link, useLocation, Outlet } from "react-router-dom";
import { useWallet } from "../context/WalletContext";
import { formatEtherBalance } from "../utils/ethereum";
import { RoleSwitcher } from "./RoleSwitcher";
import { DevAccountsDrawer } from "./DevAccountsDrawer";
import { AudioPlayerDock } from "./AudioPlayerDock";
import { Footer } from "./Footer";
import { ChevronDown, Check, Copy, ExternalLink, Menu, X } from "lucide-react";
import toast from "react-hot-toast";

export function AppShell() {
  const location = useLocation();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const {
    account,
    chainId,
    ethBalance,
    usdcBalance,
    lstnBalance,
    creatorLifetimeUsdc,
    userRole,
    disconnectWallet,
  } = useWallet();

  // Role-specific Navigation Links
  const listenerNav = [
    { name: "Listen", path: "/app/listen" },
    { name: "Wallet", path: "/app/wallet" },
    { name: "Earnings", path: "/app/earnings" },
  ];

  const creatorNav = [
    { name: "Dashboard", path: "/app/dashboard" },
    { name: "My Tracks", path: "/app/my-tracks" },
    { name: "Payouts", path: "/app/payouts" },
    { name: "Register Track", path: "/app/register-track" },
  ];

  const currentNav = userRole === "creator" ? creatorNav : listenerNav;

  const handleCopyAddress = () => {
    if (account) {
      navigator.clipboard.writeText(account);
      setCopied(true);
      toast.success("Wallet address copied");
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const truncatedAccount = account
    ? `${account.substring(0, 6)}···${account.substring(account.length - 4)}`
    : "Not Connected";

  return (
    <div className="flex flex-col min-h-screen bg-[#14120F] text-[#F6F1E7] selection:bg-[#C9A24B] selection:text-[#14120F]">
      
      {/* TOP UPPER NAVBAR (Clean, de-duplicated, role-aware) */}
      <header className="sticky top-0 z-30 w-full bg-[#14120F]/95 backdrop-blur-md border-b border-hairline">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            
            {/* Left: Brand Wordmark (Clean serif, no extra text badges) */}
            <Link to="/" className="flex items-baseline gap-2 group">
              <span className="font-serif text-2xl font-bold tracking-tight text-paper group-hover:text-brass transition-colors">
                Sound<span className="italic font-normal text-brass">Chain</span>
              </span>
            </Link>

            {/* Center: Role-Specific Navigation Links (Sans font, regular weight, brass underline) */}
            <nav className="hidden lg:flex items-center gap-7 font-sans">
              {currentNav.map((link) => {
                const isActive = location.pathname === link.path;
                return (
                  <Link
                    key={link.path}
                    to={link.path}
                    className={`text-sm tracking-normal transition-colors py-1 relative ${
                      isActive
                        ? "text-paper font-medium"
                        : "text-ash hover:text-paper"
                    }`}
                  >
                    {link.name}
                    {isActive && (
                      <span className="absolute -bottom-1 left-0 right-0 h-[2px] bg-brass rounded-full" />
                    )}
                  </Link>
                );
              })}
            </nav>

            {/* Right: Role Switcher & Merged Metric/Wallet Grouped Control */}
            <div className="flex items-center gap-3">
              
              {/* 1. Compact Role Switcher */}
              <RoleSwitcher />

              {/* 2. Grouped Metric & Wallet Control (One clean border, metric on top, address below) */}
              <div className="relative">
                <button
                  onClick={() => setDropdownOpen(!dropdownOpen)}
                  className="flex items-center gap-2.5 px-3 py-1.5 rounded border border-hairline bg-[#1A1814] hover:border-brass/50 transition-colors text-left"
                >
                  <div className="flex flex-col text-right">
                    <span className="font-sans text-[11px] text-paper font-semibold leading-tight">
                      {userRole === "creator"
                        ? `$${creatorLifetimeUsdc || "425.00"} USDC`
                        : `${lstnBalance} LSTN`}
                    </span>
                    <span className="font-mono text-[10px] text-ash leading-none mt-0.5">
                      {truncatedAccount}
                    </span>
                  </div>
                  <ChevronDown className="w-3.5 h-3.5 text-ash" />
                </button>

                {/* Dropdown Menu */}
                {dropdownOpen && (
                  <div className="absolute right-0 mt-2 w-72 bg-[#1A1814] border border-hairline shadow-2xl p-4 z-50 rounded font-sans text-xs space-y-3">
                    <div className="flex items-center justify-between pb-2.5 border-b border-hairline">
                      <div className="flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-signal" />
                        <span className="text-paper text-xs font-medium">
                          {chainId === 31337 ? "Localhost Node" : "Sepolia Testnet"}
                        </span>
                      </div>
                      <button
                        onClick={handleCopyAddress}
                        className="text-ash hover:text-paper flex items-center gap-1 text-[11px] transition-colors"
                      >
                        {copied ? <Check className="w-3 h-3 text-brass" /> : <Copy className="w-3 h-3" />}
                        Copy
                      </button>
                    </div>

                    <div className="space-y-1.5 text-ash text-xs">
                      <div className="flex justify-between">
                        <span>Royalty Balance:</span>
                        <span className="font-mono font-semibold text-paper">
                          ${parseFloat(usdcBalance || 0).toLocaleString("en-US", { minimumFractionDigits: 2 })} USDC
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span>LSTN Tokens:</span>
                        <span className="font-mono font-semibold text-brass">{lstnBalance} LSTN</span>
                      </div>
                      <div className="flex justify-between text-[11px] text-ash/80">
                        <span>Gas Balance:</span>
                        <span className="font-mono">{formatEtherBalance(ethBalance, 4)} ETH</span>
                      </div>
                    </div>

                    <div className="pt-2 border-t border-hairline flex items-center justify-between text-xs">
                      <Link
                        to="/app/settings"
                        onClick={() => setDropdownOpen(false)}
                        className="text-brass hover:underline"
                      >
                        Settings
                      </Link>
                      <button
                        onClick={() => {
                          disconnectWallet();
                          setDropdownOpen(false);
                        }}
                        className="text-ash hover:text-paper transition-colors"
                      >
                        Disconnect
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Mobile Hamburger Button */}
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="lg:hidden p-1.5 text-ash hover:text-paper transition-colors"
                aria-label="Toggle navigation menu"
              >
                {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5 text-paper" />}
              </button>

            </div>

          </div>

          {/* Mobile Navigation Drawer */}
          {mobileMenuOpen && (
            <nav className="lg:hidden py-4 border-t border-hairline space-y-2 font-sans">
              {currentNav.map((link) => {
                const isActive = location.pathname === link.path;
                return (
                  <Link
                    key={link.path}
                    to={link.path}
                    onClick={() => setMobileMenuOpen(false)}
                    className={`block px-3 py-2 rounded text-sm transition-colors ${
                      isActive
                        ? "text-brass bg-brass/10 font-medium"
                        : "text-ash hover:text-paper"
                    }`}
                  >
                    {link.name}
                  </Link>
                );
              })}
            </nav>
          )}
        </div>
      </header>

      {/* Main Role Portal Body */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 pb-16">
        <Outlet />
      </main>

      {/* Floating Developer Accounts Drawer */}
      <DevAccountsDrawer />

      {/* Persistent Audio Player Dock */}
      <AudioPlayerDock />

      {/* Footer */}
      <Footer />
    </div>
  );
}
