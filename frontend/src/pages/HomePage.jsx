import React, { useState } from "react";
import { Link } from "react-router-dom";
import { StudioDisc3D } from "../components/StudioDisc3D";
import { LiveLedgerStrip } from "../components/LiveLedgerStrip";
import { StackedSplitBar } from "../components/StackedSplitBar";
import { getAllTracks } from "../data/demoTracks";
import { ArrowRight, Play, Disc3, Shield, Activity } from "lucide-react";

export function HomePage() {
  const [hoveredTrackId, setHoveredTrackId] = useState(null);

  const allTracks = getAllTracks();
  const featuredTrack = allTracks[0];
  const secondaryTracks = allTracks.slice(1, 4);

  return (
    <div className="space-y-16 pb-20">
      
      {/* 1. EDITORIAL ASYMMETRIC HERO SECTION */}
      <section className="relative pt-12 md:pt-20 overflow-visible min-h-[580px] flex items-center">
        <div className="w-full grid grid-cols-1 lg:grid-cols-12 gap-12 items-center relative z-10">
          
          {/* Left Column: Asymmetric Editorial Typography (<60ch) */}
          <div className="lg:col-span-7 space-y-8 pr-0 lg:pr-6">
            
            {/* Studio Note */}
            <div className="flex items-center gap-3">
              <span className="font-mono text-xs uppercase tracking-widest text-brass font-medium">
                // MASTERING LEDGER V0.5
              </span>
              <span className="h-[1px] w-12 bg-hairline" />
              <span className="font-mono text-xs text-ash">ETHEREUM DEPLOYMENT</span>
            </div>

            {/* Large Asymmetric Headline (Fraunces Serif) */}
            <h1 className="font-serif text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-paper leading-[1.1]">
              Every stream, <br />
              <span className="italic font-normal text-brass">split the moment</span> <br />
              it’s paid.
            </h1>

            {/* Subhead: Plain Language, Narrow Column */}
            <p className="text-ash text-base sm:text-lg leading-relaxed max-w-[54ch]">
              SoundChain eliminates music royalty escrow. Using basis-point smart contracts, listener payments are mathematically divided and disbursed directly to collaborators in the same block.
            </p>

            {/* Call to Actions (Brass Fill + Outline) */}
            <div className="flex flex-wrap items-center gap-4 pt-2">
              <Link
                to="/tracks"
                className="px-6 py-3.5 bg-brass text-ink font-semibold text-sm rounded-sm hover:bg-brass-light transition-colors flex items-center gap-2.5 shadow-sm"
              >
                <span>Explore Tracks</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
              <a
                href="#protocol-ledger"
                className="px-6 py-3.5 border border-hairline text-paper hover:border-brass-dim font-medium text-sm rounded-sm transition-colors"
              >
                How It Works
              </a>
            </div>

            {/* Ledger Metric Footnote */}
            <div className="pt-6 border-t border-hairline grid grid-cols-3 gap-6 max-w-[50ch]">
              <div>
                <div className="font-mono text-lg font-bold text-paper">10,000</div>
                <div className="font-mono text-[11px] text-ash uppercase">Basis Points / 100%</div>
              </div>
              <div>
                <div className="font-mono text-lg font-bold text-brass">0 Escrow</div>
                <div className="font-mono text-[11px] text-ash uppercase">Direct Settlement</div>
              </div>
              <div>
                <div className="font-mono text-lg font-bold text-paper">+10 LSTN</div>
                <div className="font-mono text-[11px] text-ash uppercase">Per Stream Reward</div>
              </div>
            </div>

          </div>

          {/* Right Column: 3D Scene Bleeding Off the Canvas Edge */}
          <div className="lg:col-span-5 h-[420px] lg:h-[540px] relative overflow-visible flex items-center justify-center pointer-events-auto">
            <div className="absolute -right-8 sm:-right-16 lg:-right-28 top-0 bottom-0 w-[120%] lg:w-[150%] max-w-none">
              <StudioDisc3D />
            </div>
          </div>

        </div>
      </section>

      {/* 2. LIVE ON-CHAIN LEDGER STRIP (Full Width Monospace Continuous Ticker) */}
      <section className="-mx-4 sm:-mx-6 lg:-mx-8">
        <LiveLedgerStrip />
      </section>

      {/* 3. ASYMMETRIC EDITORIAL TRACK CATALOG */}
      <section className="space-y-8 pt-6">
        
        {/* Section Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-hairline pb-4">
          <div>
            <span className="font-mono text-xs uppercase tracking-widest text-ash">
              01 // RECORD CATALOGUE
            </span>
            <h2 className="font-serif text-3xl font-bold text-paper tracking-tight mt-1">
              Active Mastering Lacquers
            </h2>
          </div>
          <Link
            to="/tracks"
            className="text-xs font-mono text-brass hover:text-brass-light flex items-center gap-1.5 transition-colors"
          >
            <span>View Full Ledger Archive</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {/* Asymmetric Grid: 1 Large Master Highlight + 2 Stacked Flanking Cards */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
          
          {/* Featured Lacquer Cut (Spans 7 cols) */}
          <div className="lg:col-span-7 bg-[#1A1814] border border-hairline p-6 sm:p-8 rounded-sm flex flex-col justify-between group">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="font-mono text-xs text-brass font-semibold">
                  FEATURED MASTER // {featuredTrack.catalogNo}
                </span>
                <span className="font-mono text-xs text-ash">{featuredTrack.genre} · {featuredTrack.duration}</span>
              </div>

              <h3 className="font-serif text-3xl sm:text-4xl font-bold text-paper group-hover:text-brass transition-colors">
                <Link to={`/track/${featuredTrack.id}`}>
                  {featuredTrack.title}
                </Link>
              </h3>

              <p className="font-mono text-sm text-ash">
                Primary Artist: <span className="text-paper">{featuredTrack.artist}</span>
              </p>

              <p className="text-sm text-ash leading-relaxed max-w-lg">
                {featuredTrack.description}
              </p>
            </div>

            {/* Hover-revealed / Active Stacked Split Bar */}
            <div className="pt-8 mt-6 border-t border-hairline space-y-2">
              <div className="flex items-center justify-between text-xs font-mono text-ash">
                <span className="uppercase tracking-wider">COLLABORATOR ROYALTY SPLIT</span>
                <span className="text-paper font-medium">10,000 BPS (100%)</span>
              </div>
              <StackedSplitBar splits={featuredTrack.splits} />
              <div className="pt-4 flex items-center justify-between">
                <Link
                  to={`/track/${featuredTrack.id}`}
                  className="px-4 py-2.5 bg-brass text-ink font-semibold text-xs rounded-sm hover:bg-brass-light transition-colors inline-flex items-center gap-2"
                >
                  <Play className="w-3.5 h-3.5 fill-current" />
                  <span>Simulate Payment & Listen</span>
                </Link>
                <span className="font-mono text-[11px] text-ash">
                  Contract: 0x5FbD...0aa3
                </span>
              </div>
            </div>
          </div>

          {/* Supporting Lacquer Cuts (Spans 5 cols, 2 stacked items) */}
          <div className="lg:col-span-5 flex flex-col gap-6">
            {secondaryTracks.map((track) => {
              const isHovered = hoveredTrackId === track.id;
              return (
                <div
                  key={track.id}
                  onMouseEnter={() => setHoveredTrackId(track.id)}
                  onMouseLeave={() => setHoveredTrackId(null)}
                  className="bg-[#1A1814] border border-hairline hover:border-brass-dim p-6 rounded-sm flex-1 flex flex-col justify-between transition-colors group"
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between font-mono text-xs">
                      <span className="text-ash">{track.catalogNo}</span>
                      <span className="text-ash">{track.duration}</span>
                    </div>

                    <h4 className="font-serif text-2xl font-bold text-paper group-hover:text-brass transition-colors">
                      <Link to={`/track/${track.id}`}>
                        {track.title}
                      </Link>
                    </h4>

                    <p className="font-mono text-xs text-ash">
                      {track.artist} · <span className="text-paper/80">{track.genre}</span>
                    </p>
                  </div>

                  {/* Horizontal Stacked Bar on Hover */}
                  <div className="pt-4 mt-4 border-t border-hairline space-y-1.5">
                    <div className="flex items-center justify-between text-[11px] font-mono text-ash">
                      <span>PAYEE DIVISION</span>
                      <span>3 Collaborators</span>
                    </div>
                    <StackedSplitBar
                      splits={track.splits}
                      showLabels={isHovered}
                      className="transition-all duration-300"
                    />
                    <div className="pt-2 text-right">
                      <Link
                        to={`/track/${track.id}`}
                        className="font-mono text-xs text-brass hover:underline inline-flex items-center gap-1"
                      >
                        Inspect Ledger →
                      </Link>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

        </div>
      </section>

      {/* 4. PROTOCOL MECHANICS (MASTERING LEDGER) */}
      <section id="protocol-ledger" className="border-t border-hairline pt-16 space-y-10">
        <div className="max-w-xl">
          <span className="font-mono text-xs uppercase tracking-widest text-ash">
            02 // PROTOCOL SPECIFICATIONS
          </span>
          <h2 className="font-serif text-3xl font-bold text-paper tracking-tight mt-1">
            Built like a mastering studio, accounted like a bank.
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          
          <div className="p-6 bg-[#1A1814] border border-hairline rounded-sm space-y-3">
            <div className="font-mono text-xs text-brass font-bold">
              01 // BASIS POINT ARITHMETIC
            </div>
            <h3 className="font-serif text-xl font-bold text-paper">
              10,000 BPS Math
            </h3>
            <p className="text-xs text-ash leading-relaxed">
              Every track registers payees whose collective basis points total exactly 10,000 (100.00%). Payouts calculate atomically inside Solidity using precision integer math.
            </p>
          </div>

          <div className="p-6 bg-[#1A1814] border border-hairline rounded-sm space-y-3">
            <div className="font-mono text-xs text-brass font-bold">
              02 // DIRECT DISBURSEMENT
            </div>
            <h3 className="font-serif text-xl font-bold text-paper">
              Zero Holding Escrow
            </h3>
            <p className="text-xs text-ash leading-relaxed">
              When a user simulates or sends a payment, the contract does not hold balances in an escrow pool. Funds disburse instantly to each payee’s Ethereum wallet in the same transaction.
            </p>
          </div>

          <div className="p-6 bg-[#1A1814] border border-hairline rounded-sm space-y-3">
            <div className="font-mono text-xs text-brass font-bold">
              03 // STREAM INCENTIVES
            </div>
            <h3 className="font-serif text-xl font-bold text-paper">
              Listen-to-Earn Rewards
            </h3>
            <p className="text-xs text-ash leading-relaxed">
              Fans who stream studio lacquers earn on-chain ERC-20 utility tokens (`LSTN`). Complete playback triggers verified minting with zero platform middleman take.
            </p>
          </div>

        </div>
      </section>

    </div>
  );
}
