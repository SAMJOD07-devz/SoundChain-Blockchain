import React from "react";
import { getAllTracks } from "../data/demoTracks";

export function LiveLedgerStrip() {
  const allTracks = getAllTracks();
  
  const dynamicEntries = allTracks.map((t, idx) => ({
    type: idx % 2 === 0 ? "SPLIT" : "MINT",
    amount: idx % 2 === 0 ? `$${(idx + 1) * 15}.00 USDC` : "+10.00 LSTN",
    track: t.title,
    payees: `${t.splits?.length || 3} Payees (${t.splits?.map(s => `${s.percent}%`).join(' / ') || '50 / 30 / 20%'})`,
    hash: t.txHash ? `${t.txHash.slice(0, 6)}...${t.txHash.slice(-4)}` : (t.bytes32Id ? `${t.bytes32Id.slice(0, 6)}...${t.bytes32Id.slice(-4)}` : "0x8827...2cc0"),
    time: idx === 0 ? "Just now" : `${idx * 4}m ago`,
  }));

  // Duplicate list to create a seamless infinite scroll loop
  const entries = [...dynamicEntries, ...dynamicEntries];

  return (
    <div className="w-full border-y border-hairline bg-[#0E0D0B] overflow-hidden select-none py-2.5">
      <div className="flex items-center">
        {/* Static Prefix Indicator */}
        <div className="flex-shrink-0 px-4 flex items-center gap-2 border-r border-hairline z-10 bg-[#0E0D0B]">
          <span className="w-2 h-2 rounded-full bg-signal inline-block" />
          <span className="font-mono text-[11px] uppercase tracking-wider text-ash font-medium">
            ON-CHAIN LEDGER
          </span>
        </div>

        {/* Scrolling Ticker Track */}
        <div className="overflow-hidden flex-1 relative">
          <div className="ticker-track animate-ticker flex items-center gap-8 py-0.5">
            {entries.map((item, index) => (
              <div
                key={index}
                className="flex items-center gap-3 text-[12px] font-mono whitespace-nowrap text-ash"
              >
                <span className={item.type === "SPLIT" ? "text-brass font-semibold" : "text-signal-light font-semibold"}>
                  {item.amount}
                </span>
                <span className="text-paper/40">/</span>
                <span className="text-paper font-normal">{item.track}</span>
                <span className="text-paper/40">/</span>
                <span className="text-ash">{item.payees}</span>
                <span className="text-paper/40">/</span>
                <span className="text-ash/70">{item.hash}</span>
                <span className="text-[10px] text-ash/50 ml-2">{item.time}</span>
                <span className="text-brass-dim/40 ml-4">§</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
