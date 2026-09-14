import React from "react";

const INITIAL_LEDGER_ENTRIES = [
  { type: "SPLIT", amount: "0.010 ETH", track: "Midnight Signals", payees: "3 Payees (50 / 30 / 20%)", hash: "0x8827...2cc0", time: "2m ago" },
  { type: "MINT", amount: "+10.00 LSTN", track: "Reward Payout", payees: "Listener 0xf39F...2266", hash: "0x1b4a...9f12", time: "5m ago" },
  { type: "SPLIT", amount: "0.025 ETH", track: "Glass Horizon", payees: "3 Payees (60 / 25 / 15%)", hash: "0x4a78...14c3", time: "11m ago" },
  { type: "MINT", amount: "+10.00 LSTN", track: "Reward Payout", payees: "Listener 0x7099...79C8", hash: "0x9c32...e704", time: "18m ago" },
  { type: "SPLIT", amount: "0.015 ETH", track: "Afterglow Circuit", payees: "3 Payees (50 / 30 / 20%)", hash: "0xfeeb...7e1c", time: "24m ago" },
];

export function LiveLedgerStrip() {
  // Duplicate list to create a seamless infinite scroll loop
  const entries = [...INITIAL_LEDGER_ENTRIES, ...INITIAL_LEDGER_ENTRIES];

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
