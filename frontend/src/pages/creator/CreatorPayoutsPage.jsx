import React, { useState } from "react";
import { useWallet } from "../../context/WalletContext";
import { getAllTracks } from "../../data/demoTracks";
import { Download, ExternalLink, Filter, Search, ArrowUpDown } from "lucide-react";
import toast from "react-hot-toast";

export function CreatorPayoutsPage() {
  const { account, creatorLifetimeUsdc } = useWallet();
  const [filterTrack, setFilterTrack] = useState("All");
  const allTracks = getAllTracks();

  const payoutEvents = [
    { id: 1, date: "2026-09-14 15:32:02", track: allTracks[0]?.title || "Saumya - French Intro", catalog: allTracks[0]?.catalogNo || "SL-004", grossUsdc: "$10.00 USDC", role: "Artist", percent: "50%", bps: "5,000", netUsdc: "+$5.00 USDC", block: "21849201", txHash: "0x8827a3ed6bfcd7052650855c0a4a2f44b8a8a7b585ec32026997ba6b4d7e2cc0" },
    { id: 2, date: "2026-09-14 15:18:44", track: allTracks[1]?.title || "Midnight Signals", catalog: allTracks[1]?.catalogNo || "SL-001", grossUsdc: "$25.00 USDC", role: "Artist", percent: "50%", bps: "5,000", netUsdc: "+$12.50 USDC", block: "21849182", txHash: "0x4a785a19c209f4d006cc934b2f946473c94d06f7b050e5189a5aff04d32814c3" },
    { id: 3, date: "2026-09-14 14:45:10", track: allTracks[2]?.title || "Glass Horizon", catalog: allTracks[2]?.catalogNo || "SL-002", grossUsdc: "$15.00 USDC", role: "Artist", percent: "60%", bps: "6,000", netUsdc: "+$9.00 USDC", block: "21849140", txHash: "0xfeebb70b16ef229c833420bc87779d2e0451215eac8f847a68e2e669c68c7e1c" },
    { id: 4, date: "2026-09-14 12:11:32", track: allTracks[0]?.title || "Saumya - French Intro", catalog: allTracks[0]?.catalogNo || "SL-004", grossUsdc: "$20.00 USDC", role: "Artist", percent: "50%", bps: "5,000", netUsdc: "+$10.00 USDC", block: "21849015", txHash: "0x19a4f21b7c093a81de6105c93847291a82bc3819e91827461938562919a00f12" },
    { id: 5, date: "2026-09-14 09:22:15", track: allTracks[1]?.title || "Midnight Signals", catalog: allTracks[1]?.catalogNo || "SL-001", grossUsdc: "$8.00 USDC", role: "Artist", percent: "50%", bps: "5,000", netUsdc: "+$4.00 USDC", block: "21848834", txHash: "0x67c29a8f01b384759281a7b038c918204918572b901847192837461029485711" },
  ];

  const filtered = filterTrack === "All"
    ? payoutEvents
    : payoutEvents.filter((p) => p.track === filterTrack);

  const handleExportCSV = () => {
    const headers = ["Date,Track,Catalog,GrossUSDC,Role,Percent,BPS,NetCreditedUSDC,Block,TxHash"];
    const rows = filtered.map((r) =>
      `"${r.date}","${r.track}","${r.catalog}","${r.grossUsdc}","${r.role}","${r.percent}","${r.bps}","${r.netUsdc}","${r.block}","${r.txHash}"`
    );
    const csvContent = "data:text/csv;charset=utf-8," + [headers, ...rows].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `soundchain_payouts_ledger_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success("Ledger CSV Export downloaded");
  };

  const trackFilterOptions = ["All", ...Array.from(new Set(allTracks.map((t) => t.title)))];

  return (
    <div className="space-y-8 py-8 pb-28 max-w-6xl mx-auto text-ash">
      
      {/* Header */}
      <div className="border-b border-hairline pb-6 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div className="space-y-1.5">
          <p className="text-brass text-xs font-semibold uppercase tracking-wider font-sans">
            Audit-Ready Financial Record
          </p>
          <h1 className="font-serif text-3xl sm:text-4xl font-bold text-paper tracking-tight">
            Royalty Payouts Ledger
          </h1>
          <p className="text-ash text-sm">
            Complete transaction history of all <code className="text-paper font-mono text-xs">RoyaltyDistributed</code> and <code className="text-paper font-mono text-xs">PayeePaid</code> events credited to this address.
          </p>
        </div>

        <button
          onClick={handleExportCSV}
          className="px-4 py-2 bg-paper text-ink font-semibold text-xs rounded-sm hover:bg-white transition-colors inline-flex items-center gap-1.5 self-start sm:self-auto font-sans"
        >
          <Download className="w-3.5 h-3.5" />
          <span>Export CSV Ledger</span>
        </button>
      </div>

      {/* Filter Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 p-3 bg-[#1A1814] border border-hairline rounded-sm">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-ash uppercase text-[11px] font-sans font-medium mr-1">Filter Track:</span>
          {trackFilterOptions.map((t) => (
            <button
              key={t}
              onClick={() => setFilterTrack(t)}
              className={`px-2.5 py-1 rounded-sm text-xs transition-colors font-sans ${
                filterTrack === t
                  ? "bg-brass text-ink font-semibold"
                  : "text-ash hover:text-paper"
              }`}
            >
              {t}
            </button>
          ))}
        </div>

        <div className="text-ash text-xs font-sans">
          Showing <span className="font-mono text-paper font-semibold">{filtered.length}</span> of <span className="font-mono text-paper font-semibold">{payoutEvents.length}</span> transactions
        </div>
      </div>

      {/* Dense Financial Table */}
      <div className="border border-hairline bg-[#1A1814] rounded-sm overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-hairline bg-[#100F0D] text-[11px] font-medium uppercase text-ash tracking-wider font-sans">
                <th className="py-3 px-4">Date / Time (UTC)</th>
                <th className="py-3 px-4">Master Title</th>
                <th className="py-3 px-4">Gross Inflow</th>
                <th className="py-3 px-4">Share % (BPS)</th>
                <th className="py-3 px-4 text-right">Net Credited ($ USDC)</th>
                <th className="py-3 px-4">Block</th>
                <th className="py-3 px-4 text-right">Tx Hash</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-hairline">
              {filtered.map((item) => (
                <tr key={item.id} className="hover:bg-[#100F0D]/60 transition-colors">
                  <td className="py-3.5 px-4 font-mono text-ash whitespace-nowrap">{item.date}</td>
                  <td className="py-3.5 px-4">
                    <span className="text-paper font-serif font-bold text-sm block">{item.track}</span>
                    <span className="text-[11px] font-mono text-ash/80">{item.catalog}</span>
                  </td>
                  <td className="py-3.5 px-4 font-mono text-ash">{item.grossUsdc}</td>
                  <td className="py-3.5 px-4 font-mono text-ash">
                    {item.percent} <span className="text-[10px] text-ash/70">({item.bps})</span>
                  </td>
                  <td className="py-3.5 px-4 text-right font-mono font-bold text-brass">
                    {item.netUsdc}
                  </td>
                  <td className="py-3.5 px-4 font-mono text-ash">#{item.block}</td>
                  <td className="py-3.5 px-4 text-right">
                    <span className="text-paper/80 font-mono text-xs truncate inline-block max-w-[120px]">
                      {item.txHash.slice(0, 10)}···{item.txHash.slice(-4)}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="p-4 bg-[#100F0D] border-t border-hairline flex items-center justify-between text-ash text-xs font-sans">
          <span>Total Filtered Settlement: <span className="font-mono text-brass font-bold">${creatorLifetimeUsdc || "425.00"} USDC</span></span>
          <span className="font-mono text-[11px] text-ash/80">Zero Escrow Holding · Solidity Atomic Payout</span>
        </div>
      </div>

    </div>
  );
}
