import React from "react";
import { Link } from "react-router-dom";
import { useWallet } from "../../context/WalletContext";
import { DEMO_TRACKS } from "../../data/demoTracks";
import { StackedSplitBar } from "../../components/StackedSplitBar";
import { ArrowRight, Settings, ExternalLink, Plus } from "lucide-react";

export function CreatorTracksPage() {
  const { account } = useWallet();

  // Simulated management data for creator's tracks
  const tracksData = [
    {
      id: DEMO_TRACKS[0].id,
      title: DEMO_TRACKS[0].title,
      catalogNo: DEMO_TRACKS[0].catalogNo,
      role: "Primary Artist",
      sharePercent: 50,
      shareBps: 5000,
      totalGross: "0.420 ETH",
      creatorNet: "0.210 ETH",
      lastPayout: "14 mins ago",
      splits: DEMO_TRACKS[0].splits,
    },
    {
      id: DEMO_TRACKS[1].id,
      title: DEMO_TRACKS[1].title,
      catalogNo: DEMO_TRACKS[1].catalogNo,
      role: "Primary Artist",
      sharePercent: 60,
      shareBps: 6000,
      totalGross: "0.280 ETH",
      creatorNet: "0.168 ETH",
      lastPayout: "2 hours ago",
      splits: DEMO_TRACKS[1].splits,
    },
    {
      id: DEMO_TRACKS[2].id,
      title: DEMO_TRACKS[2].title,
      catalogNo: DEMO_TRACKS[2].catalogNo,
      role: "Primary Artist",
      sharePercent: 55,
      shareBps: 5500,
      totalGross: "0.150 ETH",
      creatorNet: "0.082 ETH",
      lastPayout: "Yesterday",
      splits: DEMO_TRACKS[2].splits,
    },
  ];

  return (
    <div className="space-y-10 py-8 pb-28 max-w-6xl mx-auto font-mono text-xs">
      
      {/* Header */}
      <div className="border-b border-hairline pb-6 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div className="space-y-1.5">
          <div className="text-brass uppercase tracking-widest text-[11px]">
            // REPERTOIRE MANAGEMENT
          </div>
          <h1 className="font-serif text-3xl sm:text-4xl font-bold text-paper tracking-tight">
            My Registered Repertoire
          </h1>
          <p className="text-ash text-xs">
            Studio masters and rights contracts where your address is registered as an active royalty payee.
          </p>
        </div>

        <Link
          to="/app/register-track"
          className="px-4 py-2 bg-brass text-ink font-semibold text-xs rounded-sm hover:bg-brass-light transition-colors inline-flex items-center gap-1.5"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Register New Track</span>
        </Link>
      </div>

      {/* Financial Statement Repertoire Table */}
      <div className="border border-hairline bg-[#1A1814] rounded-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-hairline bg-[#100F0D] text-[10px] uppercase text-ash tracking-wider">
                <th className="py-3 px-4">Master Title</th>
                <th className="py-3 px-4">Catalog / ID</th>
                <th className="py-3 px-4">Your Role</th>
                <th className="py-3 px-4">Entitled Share</th>
                <th className="py-3 px-4 text-right">Net Earned</th>
                <th className="py-3 px-4 text-right">Last Distribution</th>
                <th className="py-3 px-4 text-center">Manage</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-hairline">
              {tracksData.map((item) => (
                <tr key={item.id} className="hover:bg-[#100F0D] transition-colors">
                  <td className="py-4 px-4">
                    <span className="font-serif text-sm font-bold text-paper block">
                      {item.title}
                    </span>
                    <span className="text-[10px] text-ash">Solidity 0.8.20</span>
                  </td>
                  <td className="py-4 px-4 text-ash">
                    <span className="text-paper">{item.catalogNo}</span>
                  </td>
                  <td className="py-4 px-4 text-ash">
                    {item.role}
                  </td>
                  <td className="py-4 px-4">
                    <span className="text-brass font-bold">{item.sharePercent}%</span>
                    <span className="text-[10px] text-ash/60 ml-1">({item.shareBps} BPS)</span>
                  </td>
                  <td className="py-4 px-4 text-right">
                    <span className="text-paper font-bold block">{item.creatorNet}</span>
                    <span className="text-[10px] text-ash">Gross: {item.totalGross}</span>
                  </td>
                  <td className="py-4 px-4 text-right text-ash">
                    {item.lastPayout}
                  </td>
                  <td className="py-4 px-4 text-center">
                    <Link
                      to={`/app/my-tracks/${item.id}/manage`}
                      className="px-2.5 py-1 border border-hairline hover:border-brass text-brass rounded-sm inline-flex items-center gap-1 transition-colors"
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

        <div className="p-4 bg-[#100F0D] border-t border-hairline flex items-center justify-between text-ash text-[11px]">
          <span>Total Participating Tracks: 3 Masters</span>
          <span>All payouts settled directly via RoyaltySplitter.sol</span>
        </div>
      </div>

    </div>
  );
}
