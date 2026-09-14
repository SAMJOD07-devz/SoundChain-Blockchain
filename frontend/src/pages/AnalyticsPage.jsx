import React, { useState } from "react";
import {
  TrendingUp,
  DollarSign,
  Activity,
  Layers,
  ArrowUpRight,
  ShieldCheck,
  Zap,
  BarChart3,
  PieChart as PieIcon,
  Clock,
  ExternalLink,
  Coins,
} from "lucide-react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  Cell,
} from "recharts";
import { Badge } from "../components/UI/Badge";
import { DEMO_TRACKS } from "../data/demoTracks";
import { useWallet } from "../context/WalletContext";
import { formatEth } from "../utils/ethereum";

export function AnalyticsPage() {
  const { isLocalhost, isSepolia } = useWallet();
  const [timeRange, setTimeRange] = useState("30D");

  // Protocol Macro Financial Metrics
  const macroStats = [
    {
      label: "Total Royalty Volume Settled",
      value: "148.85 ETH",
      subValue: "~$512,420 USD",
      change: "+18.4%",
      isPositive: true,
      color: "text-emerald-400",
    },
    {
      label: "Active Asset Portfolio",
      value: "3 IP Assets",
      subValue: "100% On-Chain Cap Tables",
      change: "Seeded",
      isPositive: true,
      color: "text-amber-400",
    },
    {
      label: "Average Settlement Latency",
      value: "1 Block (~12s)",
      subValue: "vs 90 Days Traditional Net-Pay",
      change: "-99.9%",
      isPositive: true,
      color: "text-emerald-400",
    },
    {
      label: "Listen-to-Earn Rewards Distributed",
      value: "24,850 LSTN",
      subValue: "Cap: 1,000,000 LSTN",
      change: "+12.2%",
      isPositive: true,
      color: "text-amber-400",
    },
  ];

  // Historical Settlement Volume Data (Recharts)
  const volumeData = [
    { date: "Day 1", volume: 4.2, lstn: 420 },
    { date: "Day 5", volume: 8.6, lstn: 860 },
    { date: "Day 10", volume: 15.3, lstn: 1530 },
    { date: "Day 15", volume: 22.8, lstn: 2280 },
    { date: "Day 20", volume: 38.4, lstn: 3840 },
    { date: "Day 25", volume: 74.2, lstn: 7420 },
    { date: "Day 30", volume: 148.85, lstn: 14880 },
  ];

  // Distribution by Stakeholder Role
  const roleDistribution = [
    { role: "Artists (Primary Creators)", share: 55, volume: "81.86 ETH", color: "#00f59b" },
    { role: "Producers (Sound Engineering)", share: 27, volume: "40.18 ETH", color: "#fbbf24" },
    { role: "Songwriters (Publishing)", share: 18, volume: "26.81 ETH", color: "#e2e8f0" },
  ];

  // Recent On-Chain Settlement Ledger
  const recentSettlements = [
    {
      txHash: "0x8f2a...4b19",
      asset: "Midnight Signals",
      amount: "0.1000 ETH",
      payees: "3 Stakeholders",
      time: "2 mins ago",
      status: "Settled (Block 19284)",
    },
    {
      txHash: "0x3c9e...7a22",
      asset: "Glass Horizon",
      amount: "0.0500 ETH",
      payees: "3 Stakeholders",
      time: "8 mins ago",
      status: "Settled (Block 19281)",
    },
    {
      txHash: "0x1d4f...9c83",
      asset: "Afterglow Circuit",
      amount: "0.2500 ETH",
      payees: "3 Stakeholders",
      time: "14 mins ago",
      status: "Settled (Block 19276)",
    },
    {
      txHash: "0x6a1b...2e44",
      asset: "Midnight Signals",
      amount: "0.0100 ETH",
      payees: "3 Stakeholders",
      time: "26 mins ago",
      status: "Settled (Block 19270)",
    },
  ];

  return (
    <div className="space-y-12 py-8">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 border-b border-white/10 pb-8">
        <div className="space-y-2">
          <Badge variant="emerald" className="gap-1.5 py-1 px-3">
            <Activity className="w-3.5 h-3.5 text-emerald-400" />
            <span>Protocol Financial Intelligence</span>
          </Badge>
          <h1 className="text-3xl sm:text-5xl font-black text-white font-heading">
            Settlement Analytics
          </h1>
          <p className="text-sm text-slate-400 max-w-2xl font-normal">
            Real-time on-chain financial metrics, cumulative ETH royalty liquidity distributions, and stakeholder cap table accounting.
          </p>
        </div>

        {/* Time Range Selector */}
        <div className="flex items-center gap-1 p-1 rounded-xl bg-black/60 border border-white/10 font-mono text-xs">
          {["24H", "7D", "30D", "ALL"].map((range) => (
            <button
              key={range}
              onClick={() => setTimeRange(range)}
              className={`px-3 py-1.5 rounded-lg font-bold transition-all ${
                timeRange === range
                  ? "bg-emerald-500 text-black font-extrabold shadow-glow-emerald"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              {range}
            </button>
          ))}
        </div>
      </div>

      {/* Macro Metrics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {macroStats.map((stat, idx) => (
          <div key={idx} className="glass-panel p-6 rounded-2xl border border-white/10 space-y-3 bg-[#080a0f]">
            <div className="flex items-center justify-between text-xs font-mono text-slate-400">
              <span>{stat.label}</span>
              <span className="text-emerald-400 font-bold">{stat.change}</span>
            </div>
            <div className={`text-2xl sm:text-3xl font-black font-heading ${stat.color}`}>
              {stat.value}
            </div>
            <div className="text-xs font-mono text-slate-400 pt-1 border-t border-white/5">
              {stat.subValue}
            </div>
          </div>
        ))}
      </div>

      {/* Primary Chart: Cumulative Volume Settlement (Area Chart) */}
      <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-white/10 space-y-6 bg-[#080a0f]">
        <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
          <div>
            <div className="text-xs font-mono font-bold text-slate-400 uppercase tracking-wider">
              Settlement Inflow Curve
            </div>
            <h3 className="text-xl font-bold text-white font-heading mt-0.5">
              Cumulative ETH Royalty Payouts
            </h3>
          </div>

          <div className="flex items-center gap-4 text-xs font-mono">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
              <span className="text-slate-300">ETH Volume</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-400" />
              <span className="text-slate-300">LSTN Tokens Minted</span>
            </div>
          </div>
        </div>

        {/* Recharts Area Chart Container */}
        <div className="h-72 w-full pt-4">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={volumeData}>
              <defs>
                <linearGradient id="ethGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#00f59b" stopOpacity={0.35} />
                  <stop offset="95%" stopColor="#00f59b" stopOpacity={0.0} />
                </linearGradient>
              </defs>
              <XAxis dataKey="date" stroke="#475569" fontSize={11} fontFamily="JetBrains Mono" />
              <YAxis stroke="#475569" fontSize={11} fontFamily="JetBrains Mono" />
              <Tooltip
                contentStyle={{
                  backgroundColor: "#050608",
                  borderColor: "rgba(255,255,255,0.15)",
                  borderRadius: "1rem",
                  fontSize: "12px",
                  fontFamily: "JetBrains Mono",
                }}
              />
              <Area
                type="monotone"
                dataKey="volume"
                stroke="#00f59b"
                strokeWidth={2.5}
                fillOpacity={1}
                fill="url(#ethGrad)"
                name="ETH Settled"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Grid: Stakeholder Role Allocations & Recent Ledger */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left: Role Distribution Matrix */}
        <div className="lg:col-span-5 glass-panel p-6 sm:p-8 rounded-3xl border border-white/10 space-y-6 bg-[#080a0f]">
          <div>
            <div className="text-xs font-mono font-bold text-slate-400 uppercase tracking-wider">
              Cap Table Aggregates
            </div>
            <h3 className="text-lg font-bold text-white font-heading mt-0.5">
              Royalty Distribution by Stakeholder Class
            </h3>
          </div>

          <div className="space-y-4">
            {roleDistribution.map((item, i) => (
              <div key={i} className="p-4 rounded-2xl bg-black/40 border border-white/5 space-y-2">
                <div className="flex justify-between items-center text-xs">
                  <span className="font-bold text-white">{item.role}</span>
                  <span className="font-mono text-emerald-400 font-bold">{item.share}%</span>
                </div>
                <div className="w-full bg-slate-900 rounded-full h-2 overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-500"
                    style={{ width: `${item.share}%`, backgroundColor: item.color }}
                  />
                </div>
                <div className="flex justify-between text-[11px] font-mono text-slate-400 pt-1">
                  <span>Gross Settled:</span>
                  <span className="text-amber-300 font-bold">{item.volume}</span>
                </div>
              </div>
            ))}
          </div>

          <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-xs font-mono text-slate-300 space-y-1">
            <div className="font-bold text-emerald-300">Atomic Clearing Guarantee</div>
            <p className="text-[11px] text-slate-400">
              Smart contracts disburse 10,000 basis points atomically in the execution block. No escrow lockups.
            </p>
          </div>
        </div>

        {/* Right: Live On-Chain Settlement Ledger */}
        <div className="lg:col-span-7 glass-panel p-6 sm:p-8 rounded-3xl border border-white/10 space-y-6 bg-[#080a0f]">
          <div className="flex justify-between items-center">
            <div>
              <div className="text-xs font-mono font-bold text-slate-400 uppercase tracking-wider">
                Blockchain Activity Feed
              </div>
              <h3 className="text-lg font-bold text-white font-heading mt-0.5">
                Recent On-Chain Settlements
              </h3>
            </div>
            <span className="flex items-center gap-1.5 text-xs font-mono text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-full border border-emerald-500/30">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              Live Ledger
            </span>
          </div>

          <div className="space-y-3">
            {recentSettlements.map((tx, idx) => (
              <div
                key={idx}
                className="p-4 rounded-2xl bg-black/40 border border-white/5 flex flex-col sm:flex-row justify-between sm:items-center gap-3 hover:border-emerald-500/30 transition-all font-mono"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-white font-heading">{tx.asset}</span>
                    <span className="text-[10px] text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                      {tx.payees}
                    </span>
                  </div>
                  <div className="text-[11px] text-slate-400 flex items-center gap-2">
                    <span>Tx: {tx.txHash}</span>
                    <span>•</span>
                    <span className="text-slate-500">{tx.time}</span>
                  </div>
                </div>

                <div className="text-left sm:text-right">
                  <div className="text-sm font-black text-amber-300">+{tx.amount}</div>
                  <div className="text-[10px] text-slate-400">{tx.status}</div>
                </div>
              </div>
            ))}
          </div>

          <div className="pt-2 text-center text-xs font-mono text-slate-500">
            Operating on local Hardhat node (Chain ID: 31337) and Ethereum Sepolia Testnet.
          </div>
        </div>

      </div>
    </div>
  );
}
