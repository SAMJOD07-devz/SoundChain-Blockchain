import React from "react";
import { useParams, Link } from "react-router-dom";
import { useWallet } from "../../context/WalletContext";
import { DEMO_TRACKS } from "../../data/demoTracks";
import { StackedSplitBar } from "../../components/StackedSplitBar";
import { ArrowLeft, Shield, Lock, CheckCircle2, AlertCircle, ExternalLink } from "lucide-react";

export function ManageTrackSplitPage() {
  const { trackId } = useParams();
  const { account, isAdmin } = useWallet();

  const track = DEMO_TRACKS.find((t) => t.id === trackId) || DEMO_TRACKS[0];

  return (
    <div className="space-y-10 py-8 pb-28 max-w-4xl mx-auto font-mono text-xs">
      
      {/* Back link */}
      <div>
        <Link
          to="/app/my-tracks"
          className="inline-flex items-center gap-1.5 text-ash hover:text-paper transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Repertoire Management</span>
        </Link>
      </div>

      {/* Header */}
      <div className="border-b border-hairline pb-6 space-y-2">
        <div className="text-brass uppercase tracking-widest text-[11px]">
          // RIGHTS ALLOCATION MANAGEMENT
        </div>
        <h1 className="font-serif text-3xl sm:text-4xl font-bold text-paper tracking-tight">
          {track.title}
        </h1>
        <p className="text-ash text-xs">
          Catalog: <span className="text-paper">{track.catalogNo}</span> · On-Chain ID:{" "}
          <span className="text-ash/80">{track.bytes32Id.slice(0, 16)}···</span>
        </p>
      </div>

      {/* Access Control Permissions Notice */}
      <div
        className={`p-5 rounded-sm border ${
          isAdmin
            ? "border-brass bg-brass/10 text-paper"
            : "border-hairline bg-[#1A1814] text-ash"
        }`}
      >
        <div className="flex items-start gap-3">
          {isAdmin ? (
            <CheckCircle2 className="w-5 h-5 text-brass flex-shrink-0 mt-0.5" />
          ) : (
            <Lock className="w-5 h-5 text-ash flex-shrink-0 mt-0.5" />
          )}
          <div className="space-y-1">
            <span className="font-bold text-paper text-xs uppercase block">
              {isAdmin ? "PLATFORM ADMINISTRATOR ACCESS (ACCOUNT #0)" : "PAYEE RIGHTS HOLDER ACCESS (VIEW-ONLY)"}
            </span>
            <p className="text-[11px] leading-relaxed">
              {isAdmin
                ? "Your address is verified as the contract deployer and owner. You have full permission to register or adjust basis points on newly minted tracks."
                : "You are connected as a verified royalty recipient. Your shares are mathematically guaranteed on-chain. In accordance with smart contract immutability, modifying basis points after mint requires owner admin approval."}
            </p>
          </div>
        </div>
      </div>

      {/* Stacked Split Bar Visualization */}
      <div className="p-6 bg-[#1A1814] border border-hairline rounded-sm space-y-4">
        <div className="flex items-center justify-between">
          <span className="text-brass uppercase font-bold text-[11px]">
            ACTIVE ALLOCATION DIVISION (10,000 BPS)
          </span>
          <span className="text-paper">Exact 100.0% Allocation</span>
        </div>
        <StackedSplitBar splits={track.splits} />
      </div>

      {/* Collaborators Table */}
      <div className="border border-hairline bg-[#1A1814] rounded-sm overflow-hidden">
        <div className="p-4 bg-[#100F0D] border-b border-hairline flex items-center justify-between">
          <span className="text-ash uppercase text-[10px]">
            COLLABORATOR REGISTRY ({track.splits.length} PAYEES)
          </span>
          <span className="text-ash text-[10px]">Basis Point Calculation</span>
        </div>

        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-hairline text-[10px] text-ash uppercase">
              <th className="py-2.5 px-4">Payee Name</th>
              <th className="py-2.5 px-4">Role</th>
              <th className="py-2.5 px-4 text-right">Percentage</th>
              <th className="py-2.5 px-4 text-right">Basis Points</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-hairline">
            {track.splits.map((s, idx) => (
              <tr key={idx} className="hover:bg-[#100F0D]">
                <td className="py-3 px-4 text-paper font-bold">{s.name}</td>
                <td className="py-3 px-4 text-ash">{s.role}</td>
                <td className="py-3 px-4 text-right text-brass font-bold">{s.percent}%</td>
                <td className="py-3 px-4 text-right text-paper">{s.bps} BPS</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

    </div>
  );
}
