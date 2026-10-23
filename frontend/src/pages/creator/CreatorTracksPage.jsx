import React from "react";
import { Link } from "react-router-dom";
import { useWallet } from "../../context/WalletContext";
import { getAllTracks } from "../../data/demoTracks";
import { formatCid } from "../../utils/ipfs";
import { TrackCoverArt } from "../../components/TrackCoverArt";
import { ArrowRight, Settings, ExternalLink, Plus, ShieldCheck } from "lucide-react";

export function CreatorTracksPage() {
  const { account } = useWallet();
  const allTracks = getAllTracks();

  // Management data for creator's tracks
  const tracksData = allTracks.map((t, idx) => {
    const artistSplit = t.splits?.find((s) => s.role === "Artist") || t.splits?.[0] || { percent: 50, bps: 5000 };
    return {
      id: t.id,
      title: t.title,
      catalogNo: t.catalogNo,
      role: "Primary Artist",
      sharePercent: artistSplit.percent,
      shareBps: artistSplit.bps || Math.round(artistSplit.percent * 100),
      totalGross: idx === 0 ? "$420.00 USDC" : idx === 1 ? "$280.00 USDC" : idx === 2 ? "$150.00 USDC" : "$0.00 USDC",
      creatorNet: idx === 0 ? "$210.00 USDC" : idx === 1 ? "$168.00 USDC" : idx === 2 ? "$82.50 USDC" : "$0.00 USDC",
      lastPayout: idx === 0 ? "14 mins ago" : idx === 1 ? "2 hours ago" : idx === 2 ? "Yesterday" : "Recently Registered",
      splits: t.splits,
      ipfsCid: t.ipfsCid,
    };
  });

  return (
    <div className="space-y-8 py-8 pb-28 max-w-6xl mx-auto text-ash">
      
      {/* Header */}
      <div className="border-b border-hairline pb-6 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div className="space-y-1.5">
          <p className="text-brass text-xs font-semibold uppercase tracking-wider">
            Repertoire Management
          </p>
          <h1 className="font-serif text-3xl sm:text-4xl font-bold text-paper tracking-tight">
            My Registered Repertoire
          </h1>
          <p className="text-ash text-sm">
            Studio masters and rights contracts where your address is registered as an active royalty payee.
          </p>
        </div>

        <Link
          to="/app/register-track"
          className="px-4 py-2 bg-brass text-ink font-semibold text-xs rounded-sm hover:bg-brass-light transition-colors inline-flex items-center gap-1.5 self-start sm:self-auto"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Register New Track</span>
        </Link>
      </div>

      {/* Financial Statement Repertoire Table */}
      <div className="border border-hairline bg-[#1A1814] rounded-sm overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-hairline bg-[#100F0D] text-[11px] font-medium uppercase text-ash tracking-wider">
                <th className="py-3.5 px-4">Master Title</th>
                <th className="py-3.5 px-4 font-sans">Catalog / ID</th>
                <th className="py-3.5 px-4 font-sans">Your Role</th>
                <th className="py-3.5 px-4 font-sans">Entitled Share</th>
                <th className="py-3.5 px-4 text-right font-sans">Net Earned</th>
                <th className="py-3.5 px-4 text-right font-sans">Last Distribution</th>
                <th className="py-3.5 px-4 text-center font-sans">Manage</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-hairline">
              {tracksData.map((item) => (
                <tr key={item.id} className="hover:bg-[#100F0D]/60 transition-colors">
                  <td className="py-3.5 px-4">
                    <div className="flex items-center gap-3">
                      <TrackCoverArt trackId={item.id} size={42} showGrooves={false} className="shrink-0" />
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-serif text-sm font-bold text-paper">
                            {item.title}
                          </span>
                          {item.ipfsCid && (
                            <span className="px-1.5 py-0.2 bg-emerald-950/70 text-emerald-400 border border-emerald-800/40 rounded text-[9px] font-mono flex items-center gap-1">
                              <span className="w-1 h-1 rounded-full bg-emerald-400"></span>
                              IPFS
                            </span>
                          )}
                        </div>
                        <span className="text-[11px] font-mono text-ash/80">
                          {item.ipfsCid ? `CID: ${formatCid(item.ipfsCid, 6, 4)}` : "Solidity 0.8.20"}
                        </span>
                      </div>
                    </div>
                  </td>
                  <td className="py-3.5 px-4 font-mono text-paper">
                    {item.catalogNo}
                  </td>
                  <td className="py-3.5 px-4 font-sans text-ash">
                    {item.role}
                  </td>
                  <td className="py-3.5 px-4 font-mono">
                    <span className="text-brass font-bold">{item.sharePercent}%</span>
                    <span className="text-[10px] text-ash/70 ml-1">({item.shareBps} BPS)</span>
                  </td>
                  <td className="py-3.5 px-4 text-right font-mono">
                    <span className="text-paper font-bold block">{item.creatorNet}</span>
                    <span className="text-[10px] text-ash/70">Gross: {item.totalGross}</span>
                  </td>
                  <td className="py-3.5 px-4 text-right font-sans text-ash text-[11px]">
                    {item.lastPayout}
                  </td>
                  <td className="py-3.5 px-4 text-center">
                    <Link
                      to={`/app/my-tracks/${item.id}/manage`}
                      className="px-2.5 py-1 border border-hairline hover:border-brass text-brass rounded-sm inline-flex items-center gap-1 transition-colors text-xs font-sans"
                    >
                      <Settings className="w-3 h-3" />
                      <span>Manage</span>
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="p-4 bg-[#100F0D] border-t border-hairline flex items-center justify-between text-ash text-xs font-sans">
          <span>Total Participating Tracks: <span className="font-mono text-paper font-semibold">{tracksData.length}</span> Masters</span>
          <span className="font-mono text-[11px] text-ash/80">All payouts settled directly via RoyaltySplitter.sol</span>
        </div>
      </div>

    </div>
  );
}
