import React from "react";
import { useParams, Link } from "react-router-dom";
import { useWallet } from "../../context/WalletContext";
import { getAllTracks } from "../../data/demoTracks";
import { resolveIPFS, formatCid } from "../../utils/ipfs";
import { StackedSplitBar } from "../../components/StackedSplitBar";
import { ArrowLeft, Shield, Lock, CheckCircle2, AlertCircle, ExternalLink, UploadCloud } from "lucide-react";

export function ManageTrackSplitPage() {
  const { trackId } = useParams();
  const { account, isAdmin } = useWallet();

  const allTracks = getAllTracks();
  const track = allTracks.find((t) => String(t.id) === String(trackId) || String(t.bytes32Id) === String(trackId)) || allTracks[0];

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
        <div className="text-brass uppercase tracking-widest text-[11px] flex items-center gap-2">
          <span>// RIGHTS ALLOCATION MANAGEMENT</span>
          {track.ipfsCid && (
            <span className="px-1.5 py-0.2 bg-emerald-950/70 text-emerald-400 border border-emerald-800/40 rounded text-[9px] flex items-center gap-1">
              <span className="w-1 h-1 rounded-full bg-emerald-400"></span>
              IPFS VERIFIED
            </span>
          )}
        </div>
        <h1 className="font-serif text-3xl sm:text-4xl font-bold text-paper tracking-tight">
          {track.title}
        </h1>
        <div className="flex flex-wrap items-center gap-4 text-ash text-xs">
          <p>
            Catalog: <span className="text-paper">{track.catalogNo}</span> · Artist: <span className="text-paper">{track.artist}</span>
          </p>
          {track.bytes32Id && (
            <p>
              On-Chain ID:{" "}
              <span className="text-ash/80">
                {track.bytes32Id.length > 20 ? `${track.bytes32Id.slice(0, 18)}···` : track.bytes32Id}
              </span>
            </p>
          )}
          {track.ipfsCid && (
            <a
              href={resolveIPFS(track.ipfsCid)}
              target="_blank"
              rel="noopener noreferrer"
              className="text-brass hover:underline flex items-center gap-1"
            >
              <UploadCloud className="w-3.5 h-3.5" />
              <span>CID: {formatCid(track.ipfsCid, 8, 6)}</span>
              <ExternalLink className="w-3 h-3" />
            </a>
          )}
        </div>
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
            COLLABORATOR REGISTRY ({track.splits?.length || 0} PAYEES)
          </span>
          <span className="text-ash text-[10px]">Basis Point Calculation</span>
        </div>

        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-hairline text-[10px] text-ash uppercase">
              <th className="py-2.5 px-4">Payee / Entity</th>
              <th className="py-2.5 px-4">Role</th>
              <th className="py-2.5 px-4">Wallet Address</th>
              <th className="py-2.5 px-4 text-right">Percentage</th>
              <th className="py-2.5 px-4 text-right">Basis Points</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-hairline">
            {track.splits?.map((s, idx) => (
              <tr key={idx} className="hover:bg-[#100F0D]">
                <td className="py-3 px-4 text-paper font-bold">{s.name || s.role}</td>
                <td className="py-3 px-4 text-ash">{s.role}</td>
                <td className="py-3 px-4 text-ash/80 text-[10px] font-mono">
                  {s.address ? `${s.address.slice(0, 10)}...${s.address.slice(-6)}` : "Registered On-Chain"}
                </td>
                <td className="py-3 px-4 text-right text-brass font-bold">{s.percent}%</td>
                <td className="py-3 px-4 text-right text-paper">{s.bps || Math.round(s.percent * 100)} BPS</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

    </div>
  );
}
