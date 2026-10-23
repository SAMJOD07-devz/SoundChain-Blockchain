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
} from "recharts";
import { getAllTracks } from "../data/demoTracks";
import { useWallet } from "../context/WalletContext";

export function AnalyticsPage() {
  const { isLocalhost, isSepolia } = useWallet();
  const [timeRange, setTimeRange] = useState("30D");
  const allTracks = getAllTracks();

  // Protocol Macro Financial Metrics
  const macroStats = [
    {
      label: "Total Royalty Volume Settled",
      value: "$148,850.00 USDC",
      subValue: "100% Fiat-Backed Real USD",
      change: "+18.4%",
      isPositive: true,
      color: "text-brass",
    },
    {
      label: "Active Asset Portfolio",
      value: `${allTracks.length} IP Masters`,
      subValue: "100% On-Chain Cap Tables",
      change: "Active",
      isPositive: true,
      color: "text-paper",
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
      subValue: "Stream Incentive Utility",
      change: "+12.2%",
      isPositive: true,
      color: "text-brass",
    },
  ];

  // Historical Settlement Volume Data (Recharts in $1,000s)
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
    { role: "Artists (Primary Creators)", share: 55, volume: "$81,860 USDC", color: "#C9A24B" },
    { role: "Producers (Sound Engineering)", share: 27, volume: "$40,180 USDC", color: "#E6CA85" },
    { role: "Songwriters (Publishing)", share: 18, volume: "$26,810 USDC", color: "#8A8275" },
  ];

  // Recent On-Chain Settlement Ledger
  const recentSettlements = [
    {
      txHash: "0x8f2a...4b19",
      asset: allTracks[0]?.title || "Saumya - French Intro",
      amount: "$100.00 USDC",
      payees: `${allTracks[0]?.splits?.length || 2} Stakeholders`,
      time: "2 mins ago",
      status: "Settled (Block 19284)",
    },
    {
      txHash: "0x4b7c...9e32",
      asset: allTracks[1]?.title || "Midnight Signals",
      amount: "$25.00 USDC",
      payees: "2 Stakeholders",
      time: "14 mins ago",
      status: "Settled (Block 19278)",
    },
    {
      txHash: "0x1d9e...7a55",
      asset: allTracks[2]?.title || "Glass Horizon",
      amount: "$15.00 USDC",
      payees: "2 Stakeholders",
      time: "22 mins ago",
      status: "Settled (Block 19273)",
    },
    {
      txHash: "0x6f3b...2c81",
      asset: allTracks[0]?.title || "Saumya - French Intro",
      amount: "$10.00 USDC",
      payees: `${allTracks[0]?.splits?.length || 2} Stakeholders`,
      time: "26 mins ago",
      status: "Settled (Block 19270)",
    },
  ];

  return (
    <div className="space-y-10 py-8 pb-28 text-ash">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 border-b border-hairline pb-8">
        <div className="space-y-2">
          <p className="text-brass text-xs font-semibold uppercase tracking-wider font-sans">
            Protocol Intelligence & Macro Metrics
          </p>
          <h1 className="text-3xl sm:text-5xl font-bold text-paper font-serif tracking-tight">
            Settlement Analytics
          </h1>
          <p className="text-sm text-ash max-w-2xl font-sans">
            Real-time on-chain financial metrics, cumulative USDC royalty liquidity distributions, and stakeholder cap table accounting.
          </p>
        </div>

        {/* Time Range Selector */}
        <div className="flex items-center gap-1 p-1 rounded-sm bg-[#1A1814] border border-hairline font-sans text-xs">
          {["24H", "7D", "30D", "ALL"].map((range) => (
            <button
              key={range}
              onClick={() => setTimeRange(range)}
              className={`px-3 py-1.5 rounded-sm font-semibold transition-all ${
                timeRange === range
                  ? "bg-brass text-ink font-bold shadow-sm"
                  : "text-ash hover:text-paper"
              }`}
            >
              {range}
            </button>
          ))}
        </div>
      </div>

      {/* Macro Metrics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {macroStats.map((stat, idx) => (
          <div key={idx} className="p-6 rounded-sm border border-hairline space-y-2 bg-[#1A1814] shadow-sm">
            <div className="flex items-center justify-between text-xs font-sans text-ash">
              <span>{stat.label}</span>
              <span className="text-emerald-400 font-mono font-bold text-[11px]">{stat.change}</span>
            </div>
            <div className={`text-2xl sm:text-3xl font-bold font-serif ${stat.color}`}>
              {stat.value}
            </div>
            <div className="text-[11px] font-sans text-ash/80 pt-2 border-t border-hairline">
              {stat.subValue}
            </div>
          </div>
        ))}
      </div>

      {/* Primary Chart: Cumulative Volume Settlement (Area Chart) */}
      <div className="p-6 sm:p-8 rounded-sm border border-hairline space-y-6 bg-[#1A1814] shadow-sm">
        <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
          <div>
            <div className="text-xs font-semibold text-brass uppercase tracking-wider font-sans">
              Settlement Inflow Curve
            </div>
            <h3 className="text-2xl font-bold text-paper font-serif mt-0.5">
              Cumulative USDC Royalty Settlements
            </h3>
          </div>

          <div className="flex items-center gap-5 text-xs font-sans">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-brass" />
              <span className="text-paper">USDC Volume ($)</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-paper" />
              <span className="text-ash">LSTN Tokens Minted</span>
            </div>
          </div>
        </div>

        {/* Recharts Area Chart Container */}
        <div className="h-72 w-full pt-4">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={volumeData}>
              <defs>
                <linearGradient id="brassGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#C9A24B" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="#C9A24B" stopOpacity={0.0} />
                </linearGradient>
              </defs>
              <XAxis dataKey="date" stroke="#8A8275" fontSize={11} fontFamily="IBM Plex Mono" tickLine={false} />
              <YAxis stroke="#8A8275" fontSize={11} fontFamily="IBM Plex Mono" tickLine={false} />
              <Tooltip
                contentStyle={{
                  backgroundColor: "#100F0D",
                  borderColor: "#8A7238",
                  borderRadius: "2px",
                  fontSize: "12px",
                  fontFamily: "IBM Plex Mono",
                  color: "#F6F1E7",
                }}
              />
              <Area
                type="monotone"
                dataKey="volume"
                stroke="#C9A24B"
                strokeWidth={2}
                fillOpacity={1}
                fill="url(#brassGrad)"
                name="USDC Settled ($k)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Grid: Stakeholder Role Allocations & Recent Ledger */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left: Role Distribution Matrix */}
        <div className="lg:col-span-5 p-6 sm:p-8 rounded-sm border border-hairline space-y-6 bg-[#1A1814] shadow-sm">
          <div>
            <div className="text-xs font-semibold text-brass uppercase tracking-wider font-sans">
              Cap Table Aggregates
            </div>
            <h3 className="text-xl font-bold text-paper font-serif mt-0.5">
              Royalty Distribution by Role Class
            </h3>
          </div>

          <div className="space-y-4 font-sans">
            {roleDistribution.map((item, i) => (
              <div key={i} className="p-4 rounded-sm bg-[#100F0D] border border-hairline space-y-2">
                <div className="flex justify-between items-center text-xs">
                  <span className="font-semibold text-paper">{item.role}</span>
                  <span className="font-mono text-brass font-bold">{item.share}%</span>
                </div>
                <div className="w-full bg-[#1A1814] rounded-none h-1.5 overflow-hidden">
                  <div
                    className="h-full transition-all duration-500"
                    style={{ width: `${item.share}%`, backgroundColor: item.color }}
                  />
                </div>
                <div className="flex justify-between text-[11px] font-mono text-ash pt-1">
                  <span>Gross Settled:</span>
                  <span className="text-paper font-semibold">{item.volume}</span>
                </div>
              </div>
            ))}
          </div>

          <div className="p-4 rounded-sm bg-brass/10 border border-brass/25 text-xs text-paper space-y-1 font-sans">
            <div className="font-bold text-brass">Atomic Clearing Guarantee</div>
            <p className="text-[11px] text-ash leading-relaxed">
              Smart contracts disburse 10,000 basis points atomically in the execution block. No escrow lockups.
            </p>
          </div>
        </div>

        {/* Right: Live On-Chain Settlement Ledger */}
        <div className="lg:col-span-7 p-6 sm:p-8 rounded-sm border border-hairline space-y-6 bg-[#1A1814] shadow-sm">
          <div className="flex justify-between items-center">
            <div>
              <div className="text-xs font-semibold text-brass uppercase tracking-wider font-sans">
                Blockchain Activity Feed
              </div>
              <h3 className="text-xl font-bold text-paper font-serif mt-0.5">
                Recent On-Chain Settlements
              </h3>
            </div>
            <span className="flex items-center gap-1.5 text-xs font-mono text-emerald-400 bg-emerald-950/60 px-2.5 py-1 rounded-sm border border-emerald-800/40">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              Live Ledger
            </span>
          </div>

          <div className="space-y-3">
            {recentSettlements.map((tx, idx) => (
              <div
                key={idx}
                className="p-4 rounded-sm bg-[#100F0D] border border-hairline flex flex-col sm:flex-row justify-between sm:items-center gap-3 hover:border-brass/40 transition-colors"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-bold text-paper font-serif">{tx.asset}</span>
                    <span className="text-[10px] text-brass bg-brass/10 px-1.5 py-0.5 rounded-sm border border-brass/20 font-mono">
                      {tx.payees}
                    </span>
                  </div>
                  <div className="text-[11px] text-ash font-mono flex items-center gap-2">
                    <span>Tx: {tx.txHash}</span>
                    <span>•</span>
                    <span className="text-ash/70">{tx.time}</span>
                  </div>
                </div>

                <div className="text-left sm:text-right font-mono">
                  <div className="text-sm font-bold text-brass">+{tx.amount}</div>
                  <div className="text-[10px] text-ash">{tx.status}</div>
                </div>
              </div>
            ))}
          </div>

          <div className="pt-2 text-center text-xs font-mono text-ash/70">
            Operating on local Hardhat node (Chain ID: 31337).
          </div>
        </div>

      </div>
    </div>
  );
}
