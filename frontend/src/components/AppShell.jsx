import React, { useState } from "react";
import { Link, useLocation, useNavigate, Outlet } from "react-router-dom";
import { useWallet } from "../context/WalletContext";
import { formatEtherBalance } from "../utils/ethereum";
import { RoleSwitcher } from "./RoleSwitcher";
import { DevAccountsDrawer } from "./DevAccountsDrawer";
import { AudioPlayerDock } from "./AudioPlayerDock";
import { Footer } from "./Footer";
import {
  ChevronDown,
  Check,
  Copy,
  Settings,
  Headphones,
  FileSpreadsheet,
  Coins,
  TrendingUp,
  Power,
} from "lucide-react";
import toast from "react-hot-toast";

export function AppShell() {
  const location = useLocation();
  const navigate = useNavigate();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  const {
    account,
    chainId,
    ethBalance,
    lstnBalance,
    creatorLifetimeEth,
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
      
      {/* TOP UPPER NAVBAR (Role-Aware & Full-Width) */}
      <header className="sticky top-0 z-30 w-full bg-[#14120F]/95 backdrop-blur-md border-b border-hairline">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            
            {/* Left: Brand Wordmark & Active Persona Label */}
            <div className="flex items-center gap-3">
              <Link to="/" className="flex items-baseline gap-2 group">
                <span className="font-serif text-2xl font-bold tracking-tight text-paper group-hover:text-brass transition-colors">
                  SOUND<span className="italic font-normal text-brass">CHAIN</span>
                </span>
              </Link>

              <span className="h-4 w-[1px] bg-hairline hidden sm:inline-block" />

              {/* Persona Breadcrumb Tag */}
              <div className="hidden sm:flex items-center gap-1.5 font-mono text-[11px] text-ash">
                {userRole === "creator" ? (
                  <span className="text-paper flex items-center gap-1">
                    <FileSpreadsheet className="w-3.5 h-3.5 text-brass" />
                    <span>Studio Workstation</span>
                  </span>
                ) : (
                  <span className="text-paper flex items-center gap-1">
                    <Headphones className="w-3.5 h-3.5 text-brass" />
                    <span>Listener Portal</span>
                  </span>
                )}
              </div>
            </div>

            {/* Center: Role-Specific Sub-Navigation Links */}
            <nav className="hidden md:flex items-center gap-7">
              {currentNav.map((link) => {
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

            {/* Right: Role Switcher Dropdown, Financial Emphasis Pill, & Wallet Pill */}
            <div className="flex items-center gap-3">
              
              {/* 1. COMPACT ROLE SWITCHER DROPDOWN */}
              <RoleSwitcher />

              {/* 2. ROLE-SPECIFIC EMPHASIS PILL */}
              {userRole === "creator" ? (
                // Creator Emphasis: Lifetime Royalties in ETH
                <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 border border-hairline bg-[#1A1814] rounded-sm">
                  <TrendingUp className="w-3.5 h-3.5 text-brass" />
                  <div className="flex flex-col text-right">
                    <span className="font-mono text-[9px] text-ash uppercase leading-none">
                      EARNED
                    </span>
                    <span className="font-mono text-xs font-bold text-brass leading-tight">
                      {creatorLifetimeEth} ETH
                    </span>
                  </div>
                </div>
              ) : (
                // Listener Emphasis: LSTN Token Rewards
                <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 border border-hairline bg-[#1A1814] rounded-sm">
                  <Coins className="w-3.5 h-3.5 text-brass" />
                  <div className="flex flex-col text-right">
                    <span className="font-mono text-[9px] text-ash uppercase leading-none">
                      LSTN
                    </span>
                    <span className="font-mono text-xs font-bold text-brass leading-tight">
                      {lstnBalance} LSTN
                    </span>
                  </div>
                </div>
              )}

              {/* 3. ACCOUNT DROPDOWN */}
              <div className="relative">
                <button
                  onClick={() => setDropdownOpen(!dropdownOpen)}
                  className="flex items-center gap-2 px-3 py-2 rounded-sm border border-hairline bg-[#1A1814] hover:border-brass-dim transition-all text-left"
                >
                  <span className="font-mono text-xs text-ash">
                    {truncatedAccount}
                  </span>
                  <ChevronDown className="w-3.5 h-3.5 text-ash" />
                </button>

                {/* Dropdown Menu */}
                {dropdownOpen && (
                  <div className="absolute right-0 mt-2 w-72 bg-[#1A1814] border border-hairline shadow-2xl p-4 z-50 rounded-sm font-mono text-xs space-y-3">
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
                        <span>ETH Balance:</span>
                        <span className="text-paper font-semibold">{formatEtherBalance(ethBalance, 4)} ETH</span>
                      </div>
                      <div className="flex justify-between">
                        <span>LSTN Tokens:</span>
                        <span className="text-brass font-bold">{lstnBalance} LSTN</span>
                      </div>
                    </div>

                    <div className="pt-2 border-t border-hairline flex items-center justify-between text-[11px]">
                      <Link
                        to="/app/settings"
                        onClick={() => setDropdownOpen(false)}
                        className="text-ash hover:text-paper flex items-center gap-1"
                      >
                        <Settings className="w-3 h-3" />
                        Settings
                      </Link>
                      <button
                        onClick={() => {
                          disconnectWallet();
                          setDropdownOpen(false);
                          navigate("/");
                        }}
                        className="text-rose-400 hover:text-rose-300"
                      >
                        Disconnect
                      </button>
                    </div>
                  </div>
                )}
              </div>

            </div>

          </div>
        </div>
      </header>

      {/* Main Viewport Content (Full-Width, Unshifted) */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 pb-20 pt-6">
        <Outlet />
      </main>

      {/* Discreet Corner Developer Accounts Drawer */}
      <DevAccountsDrawer />

      {/* Floating Audio Dock */}
      <AudioPlayerDock />

      {/* Colophon Footer */}
      <Footer />

    </div>
  );
}
