import React from "react";
import { Link } from "react-router-dom";
import { useWallet } from "../../context/WalletContext";
import { formatEtherBalance } from "../../utils/ethereum";
import { DEMO_TRACKS } from "../../data/demoTracks";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import { ArrowUpRight, TrendingUp, Clock, FileSpreadsheet, ArrowRight, CheckCircle2 } from "lucide-react";

export function CreatorDashboardPage() {
  const { account, creatorLifetimeEth, ethBalance, currentTestAccountIndex, testAccounts } = useWallet();

  const currentAccount = testAccounts[currentTestAccountIndex] || {
    role: "Artist (Payee)",
    name: "Master Contributor",
  };

  // Recent incoming payment feed
  const incomingPayments = [
    { track: "Midnight Signals", grossEth: "0.010 ETH", netEth: "+0.0050 ETH", role: "Artist (50%)", time: "2 min ago", hash: "0x8827...2cc0" },
    { track: "Glass Horizon", grossEth: "0.025 ETH", netEth: "+0.0150 ETH", role: "Artist (60%)", time: "18 min ago", hash: "0x4a78...14c3" },
    { track: "Afterglow Circuit", grossEth: "0.015 ETH", netEth: "+0.0082 ETH", role: "Artist (55%)", time: "1 hr ago", hash: "0xfeeb...7e1c" },
    { track: "Midnight Signals", grossEth: "0.020 ETH", netEth: "+0.0100 ETH", role: "Artist (50%)", time: "3 hrs ago", hash: "0x91d4...33a1" },
    { track: "Glass Horizon", grossEth: "0.008 ETH", netEth: "+0.0048 ETH", role: "Artist (60%)", time: "6 hrs ago", hash: "0x33b1...88c2" },
  ];

  // Financial Earnings curve over 30 days
  const earningsData = [
    { day: "Day 1", eth: 0.005 },
    { day: "Day 5", eth: 0.012 },
    { day: "Day 10", eth: 0.018 },
    { day: "Day 15", eth: 0.024 },
    { day: "Day 20", eth: 0.031 },
    { day: "Day 25", eth: 0.038 },
    { day: "Today", eth: parseFloat(creatorLifetimeEth) || 0.0425 },
  ];

  return (
    <div className="space-y-12 py-8 pb-28 max-w-6xl mx-auto">
      
      {/* Finance Portal Header */}
      <div className="border-b border-hairline pb-6 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div className="space-y-1.5">
          <div className="font-mono text-xs text-brass uppercase tracking-widest">
            // CREATOR STUDIO LEDGER & WORKSTATION
          </div>
          <h1 className="font-serif text-3xl sm:text-4xl font-bold text-paper tracking-tight">
            Royalty Treasury & Performance
          </h1>
          <p className="font-mono text-xs text-ash">
            Stakeholder Role: <span className="text-paper">{currentAccount.role}</span> · Account:{" "}
            <span className="text-ash/80">{account || "Disconnected"}</span>
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            to="/app/payouts"
            className="px-3.5 py-2 border border-hairline hover:border-paper font-mono text-xs text-ash hover:text-paper rounded-sm inline-flex items-center gap-1.5 transition-colors"
          >
            <FileSpreadsheet className="w-3.5 h-3.5 text-brass" />
            <span>Audit Payout Ledger</span>
          </Link>
          <Link
            to="/app/register-track"
            className="px-4 py-2 bg-brass text-ink font-semibold text-xs rounded-sm hover:bg-brass-light transition-colors"
          >
            + Register Master
          </Link>
        </div>
      </div>

      {/* 1. KEY FINANCIAL KPI STRIP (No Play Buttons, Money & Performance First) */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 font-mono text-xs">
        <div className="p-5 bg-[#1A1814] border border-hairline rounded-sm space-y-1">
          <span className="text-ash uppercase text-[10px]">LIFETIME ROYALTIES EARNED</span>
          <div className="font-serif text-3xl font-bold text-brass">
            {creatorLifetimeEth} <span className="text-sm font-normal text-paper font-mono">ETH</span>
          </div>
          <span className="text-[10px] text-signal-light">100% Direct Payouts</span>
        </div>

        <div className="p-5 bg-[#1A1814] border border-hairline rounded-sm space-y-1">
          <span className="text-ash uppercase text-[10px]">ACTIVE CATALOG SHARES</span>
          <div className="font-serif text-3xl font-bold text-paper">
            3 <span className="text-sm font-normal text-ash font-mono">Masters</span>
          </div>
          <span className="text-[10px] text-ash">Avg. Share: 55.0% BPS</span>
        </div>

        <div className="p-5 bg-[#1A1814] border border-hairline rounded-sm space-y-1">
          <span className="text-ash uppercase text-[10px]">SETTLEMENT SPEED</span>
          <div className="font-serif text-3xl font-bold text-signal-light">
            0 sec
          </div>
          <span className="text-[10px] text-ash">Same-Block Disbursement</span>
        </div>

        <div className="p-5 bg-[#1A1814] border border-hairline rounded-sm space-y-1">
          <span className="text-ash uppercase text-[10px]">LIQUID ETH IN VAULT</span>
          <div className="font-serif text-3xl font-bold text-paper">
            {formatEtherBalance(ethBalance, 2)} <span className="text-sm font-normal text-ash font-mono">ETH</span>
          </div>
          <span className="text-[10px] text-ash">Wallet Balance</span>
        </div>
      </div>

      {/* 2. FINANCIAL EARNINGS OVER TIME CHART */}
      <div className="p-6 sm:p-8 bg-[#1A1814] border border-hairline rounded-sm space-y-6">
        <div className="flex items-center justify-between border-b border-hairline pb-4 font-mono text-xs">
          <div>
            <span className="text-brass uppercase font-bold text-[10px] tracking-wider block">
              30-DAY CUMULATIVE ROYALTY SETTLEMENTS
            </span>
            <span className="text-ash">Aggregated on-chain payouts credited across all tracks</span>
          </div>
          <span className="text-paper font-semibold">Values in ETH</span>
        </div>

        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={earningsData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
              <XAxis
                dataKey="day"
                stroke="#8C8578"
                fontSize={11}
                fontFamily="IBM Plex Mono"
                tickLine={false}
              />
              <YAxis
                stroke="#8C8578"
                fontSize={11}
                fontFamily="IBM Plex Mono"
                tickLine={false}
                tickFormatter={(v) => `${v} Ξ`}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: "#100F0D",
                  borderColor: "#8A7238",
                  borderRadius: "2px",
                  fontSize: "12px",
                  fontFamily: "IBM Plex Mono",
                  color: "#F6F1E7",
                }}
                formatter={(val) => [`${val} ETH`, "Credited"]}
              />
              <Line
                type="monotone"
                dataKey="eth"
                stroke="#C9A24B"
                strokeWidth={2.5}
                dot={{ fill: "#C9A24B", stroke: "#14120F", strokeWidth: 2, r: 4 }}
                activeDot={{ r: 6, fill: "#F6F1E7" }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* 3. TWO-COLUMN WORKBENCH: LIVE PAYMENT FEED & MY PARTICIPATING TRACKS */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Live Incoming Payment Feed (7 cols) */}
        <div className="lg:col-span-7 bg-[#1A1814] border border-hairline p-6 rounded-sm space-y-5">
          <div className="flex items-center justify-between border-b border-hairline pb-3">
            <span className="font-mono text-xs text-brass uppercase tracking-wider font-bold">
              LIVE INCOMING SETTLEMENTS FEED
            </span>
            <span className="font-mono text-[10px] text-signal-light flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-signal inline-block" />
              Live On-Chain Events
            </span>
          </div>

          <div className="divide-y divide-hairline font-mono text-xs">
            {incomingPayments.map((item, idx) => (
              <div key={idx} className="py-3 flex items-center justify-between hover:bg-[#100F0D] px-2 -mx-2 transition-colors">
                <div className="space-y-0.5">
                  <div className="text-paper font-semibold">{item.track}</div>
                  <div className="text-[11px] text-ash">
                    Gross: {item.grossEth} · {item.role}
                  </div>
                  <div className="text-[10px] text-ash/60">TX: {item.hash}</div>
                </div>

                <div className="text-right space-y-0.5">
                  <div className="text-brass font-bold text-sm">{item.netEth}</div>
                  <div className="text-[10px] text-ash">{item.time}</div>
                </div>
              </div>
            ))}
          </div>

          <div className="pt-2 text-right">
            <Link to="/app/payouts" className="font-mono text-xs text-brass hover:underline inline-flex items-center gap-1">
              <span>View complete audit history</span>
              <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
        </div>

        {/* Participating Tracks Summary (5 cols) */}
        <div className="lg:col-span-5 bg-[#1A1814] border border-hairline p-6 rounded-sm space-y-5">
          <div className="flex items-center justify-between border-b border-hairline pb-3">
            <span className="font-mono text-xs text-paper uppercase tracking-wider font-bold">
              YOUR REGISTERED MASTERS
            </span>
            <Link to="/app/my-tracks" className="font-mono text-xs text-brass hover:underline">
              Manage All →
            </Link>
          </div>

          <div className="space-y-3 font-mono text-xs">
            {DEMO_TRACKS.map((track, idx) => (
              <div key={idx} className="p-3.5 bg-[#100F0D] border border-hairline rounded-sm space-y-2">
                <div className="flex justify-between items-start">
                  <div>
                    <div className="font-serif text-sm font-bold text-paper">{track.title}</div>
                    <div className="text-[11px] text-ash">{track.catalogNo} · {track.genre}</div>
                  </div>
                  <span className="text-brass font-bold">{track.splits[0].percent}% Share</span>
                </div>

                <div className="pt-1.5 border-t border-hairline flex justify-between text-[11px] text-ash">
                  <span>{track.splits[0].bps} Basis Points</span>
                  <Link to={`/app/my-tracks/${track.id}/manage`} className="text-paper hover:text-brass">
                    Inspect Split →
                  </Link>
                </div>
              </div>
            ))}
          </div>

          <div className="pt-1">
            <Link
              to="/app/register-track"
              className="w-full py-2.5 border border-hairline hover:border-brass text-brass font-mono text-xs rounded-sm inline-flex items-center justify-center gap-1.5 transition-colors"
            >
              <span>+ Register New Master Cut</span>
            </Link>
          </div>
        </div>

      </div>

    </div>
  );
}
