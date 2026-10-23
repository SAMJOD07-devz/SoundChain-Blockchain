import React, { useState } from "react";
import { Link } from "react-router-dom";
import { StudioDisc3D } from "../components/StudioDisc3D";
import { LiveLedgerStrip } from "../components/LiveLedgerStrip";
import { StackedSplitBar } from "../components/StackedSplitBar";
import { TrackCoverArt } from "../components/TrackCoverArt";
import { getAllTracks } from "../data/demoTracks";
import { ArrowRight, Play, Disc3, Shield, Activity } from "lucide-react";

export function HomePage() {
  const [hoveredTrackId, setHoveredTrackId] = useState(null);

  const allTracks = getAllTracks();
  const featuredTrack = allTracks[0];
  const secondaryTracks = allTracks.slice(1, 4);

  return (
    <div className="space-y-16 pb-20 font-sans">
      
      {/* 1. EDITORIAL ASYMMETRIC HERO SECTION */}
      <section className="relative pt-10 md:pt-16 overflow-visible min-h-[580px] flex items-center">
        <div className="w-full grid grid-cols-1 lg:grid-cols-12 gap-8 items-center relative z-10">
          
          {/* Left Column: Asymmetric Editorial Typography (<60ch) */}
          <div className="lg:col-span-7 space-y-6 pr-0 lg:pr-6">
            
            {/* Small Sans Tagline (No // prefix) */}
            <div className="flex items-center gap-3">
              <span className="text-xs text-ash font-medium">
                Ethereum royalty settlement protocol
              </span>
              <span className="h-[1px] w-8 bg-hairline" />
              <span className="text-xs text-ash/80">Local Node 8545</span>
            </div>

            {/* Large Headline (Fraunces Serif, Single Brass Highlight) */}
            <h1 className="font-serif text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-paper leading-[1.1]">
              Every stream, <br />
              <span className="italic font-normal text-brass">split the moment</span> <br />
              it’s paid.
            </h1>

            {/* Subhead: Plain Language, UI Sans */}
            <p className="text-ash text-base sm:text-lg leading-relaxed max-w-[54ch]">
              SoundChain eliminates music royalty escrow. Using basis-point smart contracts, listener payments are mathematically divided and disbursed directly to collaborators in the same block.
            </p>

            {/* Call to Actions (Brass Fill + Outline, UI Sans) */}
            <div className="flex flex-wrap items-center gap-4 pt-2">
              <Link
                to="/tracks"
                className="px-6 py-3 bg-brass text-ink font-semibold text-sm rounded hover:bg-brass-light active:scale-98 transition-all flex items-center gap-2 shadow-sm"
              >
                <span>Explore Tracks</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                to="/how-it-works"
                className="px-6 py-3 border border-hairline text-paper hover:border-paper/40 font-medium text-sm rounded transition-colors"
              >
                How It Works
              </Link>
            </div>

            {/* Ledger Metric Footnote (Numbers in Mono, Labels in Sans) */}
            <div className="pt-6 border-t border-hairline grid grid-cols-3 gap-6 max-w-[50ch]">
              <div>
                <div className="font-mono text-lg font-bold text-paper">10,000</div>
                <div className="text-xs text-ash">Basis Points / 100%</div>
              </div>
              <div>
                <div className="font-mono text-lg font-bold text-paper">0 Escrow</div>
                <div className="text-xs text-ash">Direct Settlement</div>
              </div>
              <div>
                <div className="font-mono text-lg font-bold text-paper">+10 LSTN</div>
                <div className="text-xs text-ash">Per Stream Reward</div>
              </div>
            </div>

          </div>

          {/* Right Column: 3D Scene (Generous breathing room, no hard clipping) */}
          <div className="lg:col-span-5 h-[420px] lg:h-[520px] relative overflow-visible flex items-center justify-center">
            <div className="w-full h-full">
              <StudioDisc3D />
            </div>
          </div>

        </div>
      </section>

      {/* 2. LIVE ON-CHAIN LEDGER STRIP (Continuous Ticker) */}
      <section className="-mx-4 sm:-mx-6 lg:-mx-8">
        <LiveLedgerStrip />
      </section>

      {/* 3. ASYMMETRIC EDITORIAL TRACK CATALOG */}
      <section className="space-y-8 pt-6">
        
        {/* Section Header (Clean sans subtitle) */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-hairline pb-4">
          <div>
            <span className="text-xs text-ash font-medium">
              Record catalog
            </span>
            <h2 className="font-serif text-3xl font-bold text-paper tracking-tight mt-1">
              Active Mastering Cuts
            </h2>
          </div>
          <Link
            to="/tracks"
            className="text-xs text-ash hover:text-paper flex items-center gap-1.5 transition-colors font-medium"
          >
            <span>View full catalog</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {/* Asymmetric Grid: 1 Large Master Highlight + 2 Secondary Cards */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
          
          {/* Featured Primary Master (7 cols) */}
          <div className="lg:col-span-7 bg-[#1B1814] border border-hairline rounded p-6 sm:p-8 flex flex-col justify-between space-y-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="font-mono text-xs text-ash">{featuredTrack.catalogNo}</span>
                <span className="text-xs text-signal-light font-medium">Featured cut</span>
              </div>

              <div className="flex flex-col sm:flex-row gap-6 items-start sm:items-center">
                <TrackCoverArt track={featuredTrack} size="lg" />
                <div className="space-y-2">
                  <h3 className="font-serif text-3xl font-bold text-paper">
                    <Link to={`/track/${featuredTrack.id}`} className="hover:text-brass transition-colors">
                      {featuredTrack.title}
                    </Link>
                  </h3>
                  <p className="text-sm text-ash">
                    By <span className="text-paper font-medium">{featuredTrack.artist}</span> · {featuredTrack.album}
                  </p>
                  <p className="text-xs text-ash leading-relaxed max-w-md pt-1">
                    {featuredTrack.description}
                  </p>
                </div>
              </div>
            </div>

            {/* Split Breakdown */}
            <div className="pt-4 border-t border-hairline space-y-2">
              <div className="flex items-center justify-between text-xs text-ash">
                <span className="font-medium">On-chain payee allocation</span>
                <span className="font-mono text-[11px]">{featuredTrack.splits.length} Collaborators</span>
              </div>
              <StackedSplitBar splits={featuredTrack.splits} showLabels={true} />
              <div className="pt-2 flex justify-between items-center text-xs">
                <span className="font-mono text-[11px] text-ash">{featuredTrack.duration}</span>
                <Link to={`/track/${featuredTrack.id}`} className="text-brass hover:underline font-medium">
                  Inspect split details →
                </Link>
              </div>
            </div>
          </div>

          {/* Secondary Master Cuts (5 cols) */}
          <div className="lg:col-span-5 space-y-6 flex flex-col justify-between">
            {secondaryTracks.map((track) => (
              <div
                key={track.id}
                className="p-5 bg-[#1B1814] border border-hairline rounded space-y-4 hover:border-brass/40 transition-colors"
              >
                <div className="flex items-start gap-4">
                  <TrackCoverArt track={track} size="sm" />
                  <div className="space-y-1 min-w-0 flex-1">
                    <div className="flex items-center justify-between text-xs text-ash font-mono">
                      <span>{track.catalogNo}</span>
                      <span>{track.duration}</span>
                    </div>
                    <h4 className="font-serif text-lg font-bold text-paper truncate hover:text-brass transition-colors">
                      <Link to={`/track/${track.id}`}>{track.title}</Link>
                    </h4>
                    <p className="text-xs text-ash truncate">{track.artist}</p>
                  </div>
                </div>

                <div className="pt-2 border-t border-hairline space-y-1.5">
                  <StackedSplitBar splits={track.splits} showLabels={false} />
                  <div className="pt-1 text-right">
                    <Link to={`/track/${track.id}`} className="text-xs text-ash hover:text-paper font-medium">
                      Inspect split →
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>

        </div>
      </section>

      {/* 4. PROTOCOL MECHANICS (No // labels, clean cards) */}
      <section id="protocol-ledger" className="border-t border-hairline pt-14 space-y-8">
        <div className="max-w-xl space-y-1">
          <span className="text-xs text-ash font-medium">
            Protocol specifications
          </span>
          <h2 className="font-serif text-3xl font-bold text-paper tracking-tight">
            Built like a mastering studio, accounted like a bank.
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          
          <div className="p-6 bg-[#1B1814] border border-hairline rounded space-y-2.5">
            <h3 className="font-serif text-lg font-bold text-paper">
              10,000 Basis Points
            </h3>
            <p className="text-xs text-ash leading-relaxed">
              Every track registers payees whose collective basis points total exactly 10,000 (100.00%). Payouts calculate atomically inside Solidity using precision integer math without float rounding loss.
            </p>
          </div>

          <div className="p-6 bg-[#1B1814] border border-hairline rounded space-y-2.5">
            <h3 className="font-serif text-lg font-bold text-paper">
              Zero Holding Escrow
            </h3>
            <p className="text-xs text-ash leading-relaxed">
              When a user simulates or sends a payment, the contract does not hold balances in an escrow pool. Funds disburse instantly to each payee’s Ethereum wallet in the identical transaction block.
            </p>
          </div>

          <div className="p-6 bg-[#1B1814] border border-hairline rounded space-y-2.5">
            <h3 className="font-serif text-lg font-bold text-paper">
              Listen-to-Earn Rewards
            </h3>
            <p className="text-xs text-ash leading-relaxed">
              Fans who stream studio lacquers earn on-chain ERC-20 utility tokens (`LSTN`). Complete playback triggers verified minting backed by cryptographic anti-bot ECDSA signatures.
            </p>
          </div>

        </div>
      </section>

    </div>
  );
}
