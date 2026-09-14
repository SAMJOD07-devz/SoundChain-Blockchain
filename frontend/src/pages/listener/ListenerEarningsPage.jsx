import React from "react";
import { useWallet } from "../../context/WalletContext";
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import { ArrowRight, Sparkles, TrendingUp, Award, Disc } from "lucide-react";
import { Link } from "react-router-dom";

export function ListenerEarningsPage() {
  const { lstnBalance, totalListens } = useWallet();

  // Simulated cumulative earnings curve anchored to actual totalListens
  const baseListens = Math.max(totalListens, 3);
  const chartData = [
    { day: "Mon", lstn: 10, cumulative: 10 },
    { day: "Tue", lstn: 20, cumulative: 30 },
    { day: "Wed", lstn: 10, cumulative: 40 },
    { day: "Thu", lstn: 30, cumulative: 70 },
    { day: "Fri", lstn: 20, cumulative: 90 },
    { day: "Sat", lstn: 40, cumulative: 130 },
    { day: "Today", lstn: baseListens * 10, cumulative: Math.max(parseInt(lstnBalance) || 150, 150) },
  ];

  return (
    <div className="space-y-12 py-8 pb-28 max-w-4xl mx-auto">
      
      {/* Header */}
      <div className="border-b border-hairline pb-6 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div className="space-y-1.5">
          <div className="font-mono text-xs text-brass uppercase tracking-widest">
            // REWARDS ACCRUAL ANALYTICS
          </div>
          <h1 className="font-serif text-3xl sm:text-4xl font-bold text-paper tracking-tight">
            LSTN Earnings Over Time
          </h1>
          <p className="font-mono text-xs text-ash">
            Track your stream verification activity and cumulative ERC-20 utility tokens earned.
          </p>
        </div>

        <Link
          to="/app/listen"
          className="px-4 py-2 bg-brass text-ink font-semibold text-xs rounded-sm hover:bg-brass-light transition-colors inline-flex items-center gap-2"
        >
          <span>Stream More Tracks</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 font-mono text-xs">
        <div className="p-4 bg-[#1A1814] border border-hairline rounded-sm space-y-1">
          <span className="text-ash uppercase text-[10px]">TOTAL TOKENS MINTED</span>
          <div className="font-serif text-2xl font-bold text-brass">{lstnBalance} LSTN</div>
        </div>
        <div className="p-4 bg-[#1A1814] border border-hairline rounded-sm space-y-1">
          <span className="text-ash uppercase text-[10px]">VERIFIED STREAMS</span>
          <div className="font-serif text-2xl font-bold text-paper">{totalListens} Plays</div>
        </div>
        <div className="p-4 bg-[#1A1814] border border-hairline rounded-sm space-y-1">
          <span className="text-ash uppercase text-[10px]">ACTIVE STREAK</span>
          <div className="font-serif text-2xl font-bold text-signal-light">4 Days</div>
        </div>
        <div className="p-4 bg-[#1A1814] border border-hairline rounded-sm space-y-1">
          <span className="text-ash uppercase text-[10px]">REWARD RATE</span>
          <div className="font-serif text-2xl font-bold text-paper">+10 LSTN/play</div>
        </div>
      </div>

      {/* Recharts Area Chart */}
      <div className="p-6 sm:p-8 bg-[#1A1814] border border-hairline rounded-sm space-y-6">
        <div className="flex items-center justify-between border-b border-hairline pb-4 font-mono text-xs">
          <div>
            <span className="text-brass uppercase font-bold text-[10px] tracking-wider block">
              7-DAY ACCUMULATION CURVE
            </span>
            <span className="text-ash">Tokens Minted via Listen-to-Earn Contract</span>
          </div>
          <span className="text-paper font-semibold">Scale: Cumulative LSTN</span>
        </div>

        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="brassGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#C9A24B" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="#C9A24B" stopOpacity={0.0} />
                </linearGradient>
              </defs>
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
                formatter={(val) => [`${val} LSTN`, "Accrued"]}
              />
              <Area
                type="monotone"
                dataKey="cumulative"
                stroke="#C9A24B"
                strokeWidth={2}
                fillOpacity={1}
                fill="url(#brassGradient)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        <div className="pt-4 border-t border-hairline flex items-center justify-between font-mono text-[11px] text-ash">
          <span>Smart Contract: ListenToken.sol (ERC-20)</span>
          <span>Reward minted directly to your address</span>
        </div>
      </div>

    </div>
  );
}
