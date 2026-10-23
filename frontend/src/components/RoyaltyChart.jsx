import React from "react";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";
import { formatEth, truncateAddress } from "../utils/ethereum";

export function RoyaltyChart({ splits, totalReceivedEth = "0" }) {
  if (!splits || splits.length === 0) return null;

  const data = splits.map((item) => ({
    name: `${item.role} (${item.name || "Payee"})`,
    role: item.role,
    payeeName: item.name,
    address: item.address,
    value: item.percent,
    bps: item.bps,
    color: item.color || "#00f59b",
  }));

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const dataItem = payload[0].payload;
      return (
        <div className="glass-panel p-3 border border-white/15 rounded-2xl shadow-2xl text-xs space-y-1 bg-[#050608]/95 backdrop-blur-xl">
          <div className="font-bold text-white flex items-center gap-2">
            <span
              className="w-2.5 h-2.5 rounded-full"
              style={{ backgroundColor: dataItem.color }}
            />
            {dataItem.role}: {dataItem.payeeName}
          </div>
          <div className="text-amber-300 font-mono font-semibold">
            Share: {dataItem.value}% ({dataItem.bps} BPS)
          </div>
          {dataItem.address && (
            <div className="text-slate-400 font-mono text-[10px]">
              {truncateAddress(dataItem.address)}
            </div>
          )}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="space-y-6">
      {/* Recharts Pie Container */}
      <div className="relative h-64 w-full flex items-center justify-center">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={70}
              outerRadius={100}
              paddingAngle={5}
              dataKey="value"
              stroke="#050608"
              strokeWidth={3}
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip content={<CustomTooltip />} />
          </PieChart>
        </ResponsiveContainer>

        {/* Center Metric Label */}
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none text-center">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider font-mono">
            Total Distributed
          </span>
          <span className="text-xl font-black text-amber-400 font-mono">
            {totalReceivedUsdc ? `$${parseFloat(totalReceivedUsdc).toFixed(2)} USDC` : "$10,000.00 USDC"}
          </span>
        </div>
      </div>

      {/* Payee Breakdown List */}
      <div className="space-y-2 pt-2 border-t border-white/10">
        <div className="text-xs font-bold text-slate-300 uppercase tracking-wider font-mono mb-3">
          Stakeholder Allocation ({splits.length} Payees)
        </div>

        {splits.map((split, idx) => (
          <div
            key={idx}
            className="flex items-center justify-between p-3 rounded-2xl bg-[#050608] border border-white/5 hover:border-white/15 transition-colors"
          >
            <div className="flex items-center gap-3">
              <span
                className="w-3.5 h-3.5 rounded-full flex-shrink-0 border border-white/20"
                style={{ backgroundColor: split.color || "#00f59b" }}
              />
              <div className="flex flex-col">
                <div className="text-xs font-bold text-slate-100 flex items-center gap-2">
                  <span>{split.role}</span>
                  <span className="text-slate-400 font-normal">({split.name})</span>
                </div>
                {split.address && (
                  <span className="text-[10px] font-mono text-slate-400">
                    {truncateAddress(split.address)}
                  </span>
                )}
              </div>
            </div>

            <div className="text-right">
              <div className="text-sm font-black text-amber-300 font-mono">
                {split.percent}%
              </div>
              <div className="text-[10px] text-slate-400 font-mono">
                {split.bps} BPS
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
