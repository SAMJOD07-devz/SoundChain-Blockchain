import React, { useState, useRef, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useWallet } from "../context/WalletContext";
import { Headphones, FileSpreadsheet, ShieldCheck, ChevronDown, Check } from "lucide-react";
import toast from "react-hot-toast";

export function RoleSwitcher() {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);
  const location = useLocation();
  const navigate = useNavigate();

  const { userRole, setUserRole } = useWallet();

  // Determine which role matches the current view
  let activeKey = userRole;
  if (location.pathname === "/app/register-track") {
    activeKey = "admin";
  }

  const roleOptions = [
    {
      id: "fan",
      name: "Listener Portal",
      desc: "Stream, earn & wallet",
      path: "/app/listen",
      icon: Headphones,
    },
    {
      id: "creator",
      name: "Creator Studio",
      desc: "Royalty ledger & math",
      path: "/app/dashboard",
      icon: FileSpreadsheet,
    },
    {
      id: "admin",
      name: "Platform Admin",
      desc: "Register tracks (deployer)",
      path: "/app/register-track",
      icon: ShieldCheck,
    },
  ];

  const currentRoleObj = roleOptions.find((r) => r.id === activeKey) || roleOptions[0];

  // Close on outside click
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSelect = (option) => {
    if (option.id === "admin") {
      setUserRole("creator");
    } else {
      setUserRole(option.id);
    }
    navigate(option.path);
    setIsOpen(false);
    toast.success(`Active Persona: ${option.name}`);
  };

  return (
    <div className="relative inline-block text-left" ref={dropdownRef}>
      {/* Navbar Trigger Pill */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-1.5 rounded-sm border border-hairline hover:border-brass-dim bg-[#1A1814] transition-all text-xs font-mono select-none"
        title="Switch product interface role"
      >
        <span className="w-1.5 h-1.5 rounded-full bg-brass animate-pulse" />
        <span className="font-semibold text-paper">
          {currentRoleObj.name}
        </span>
        <ChevronDown className={`w-3 h-3 text-ash transition-transform duration-200 ${isOpen ? "rotate-180 text-paper" : ""}`} />
      </button>

      {/* Compact Floating Dropdown Panel (~280px) */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-[280px] bg-[#1A1814] border border-hairline shadow-2xl rounded-sm py-1.5 z-50 divide-y divide-hairline/60">
          <div className="px-3 py-1.5">
            <span className="font-mono text-[9px] uppercase tracking-widest text-ash">
              SELECT ACTIVE INTERFACE
            </span>
          </div>

          <div className="py-1">
            {roleOptions.map((opt) => {
              const Icon = opt.icon;
              const isSelected = activeKey === opt.id;
              return (
                <button
                  key={opt.id}
                  onClick={() => handleSelect(opt)}
                  className={`w-full text-left px-3 py-2 flex items-center justify-between transition-colors ${
                    isSelected
                      ? "bg-brass/10 text-paper"
                      : "text-ash hover:bg-ink hover:text-paper"
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <Icon className={`w-4 h-4 ${isSelected ? "text-brass" : "text-ash"}`} />
                    <div>
                      <div className={`font-serif text-xs font-semibold leading-tight ${isSelected ? "text-paper" : "text-ash"}`}>
                        {opt.name}
                      </div>
                      <div className="font-mono text-[10px] text-ash/80 leading-tight">
                        {opt.desc}
                      </div>
                    </div>
                  </div>

                  {isSelected && (
                    <Check className="w-3.5 h-3.5 text-brass ml-2 flex-shrink-0" />
                  )}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
