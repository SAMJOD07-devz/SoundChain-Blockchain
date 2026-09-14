import React from "react";
import { Link } from "react-router-dom";
import { ArrowRight, ShieldCheck, CheckCircle2, Split, Coins, UserCheck, Terminal } from "lucide-react";

export function HowItWorksPage() {
  return (
    <div className="space-y-16 py-10 pb-28 max-w-4xl mx-auto">
      
      {/* Header */}
      <div className="border-b border-hairline pb-8 space-y-3">
        <div className="font-mono text-xs text-brass uppercase tracking-widest">
          // COURSE EVALUATION & PROTOCOL ARCHITECTURE
        </div>
        <h1 className="font-serif text-4xl sm:text-5xl font-bold text-paper tracking-tight">
          How SoundChain Works
        </h1>
        <p className="text-ash text-base leading-relaxed max-w-2xl">
          An in-depth technical overview of the automated basis-point splitting engine, stream-verified incentives, and the distinct separation between listener discovery and creator studio accounting.
        </p>
      </div>

      {/* 1. THE PROBLEM VS THE SOLUTION */}
      <section className="space-y-6">
        <div className="font-mono text-xs text-brass uppercase tracking-wider">
          01 // ARCHITECTURAL MOTIVATION
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Legacy Model */}
          <div className="p-6 bg-[#1A1814] border border-hairline rounded-sm space-y-3">
            <div className="font-mono text-xs text-rose-400 font-bold">
              TRADITIONAL MUSIC ROYALTIES
            </div>
            <h3 className="font-serif text-xl font-bold text-paper">
              Escrow Black-Boxes & 180-Day Delays
            </h3>
            <ul className="text-xs text-ash space-y-2 leading-relaxed font-mono">
              <li>• Intermediaries take 15–35% administrative cuts.</li>
              <li>• Payouts held in quarterly escrow pools for 60 to 180 days.</li>
              <li>• Payees have zero visibility into exact stream-to-dollar math.</li>
              <li>• Artists, producers, and songwriters receive disparate fragmented checks.</li>
            </ul>
          </div>

          {/* SoundChain Model */}
          <div className="p-6 bg-[#1A1814] border border-brass-dim rounded-sm space-y-3 relative overflow-hidden">
            <div className="font-mono text-xs text-brass font-bold">
              SOUNDCHAIN PROTOCOL
            </div>
            <h3 className="font-serif text-xl font-bold text-paper">
              Atomic On-Chain Settlement
            </h3>
            <ul className="text-xs text-ash space-y-2 leading-relaxed font-mono">
              <li>• 0% intermediary platform fee on royalty splits.</li>
              <li>• 0-second escrow: divided and credited in the identical Ethereum block.</li>
              <li>• Immutable mathematical transparency via verified Solidity contract.</li>
              <li>• All collaborators receive direct wallet deposits simultaneously.</li>
            </ul>
          </div>
        </div>
      </section>

      {/* 2. MATHEMATICAL BASIS-POINT SPLITTING (10,000 BPS) */}
      <section className="p-8 bg-[#1A1814] border border-hairline rounded-sm space-y-6">
        <div className="flex items-center justify-between border-b border-hairline pb-4">
          <div>
            <div className="font-mono text-xs text-brass uppercase tracking-wider">
              02 // MATHEMATICAL SPECIFICATION
            </div>
            <h2 className="font-serif text-2xl font-bold text-paper mt-1">
              10,000 Basis Points Engine
            </h2>
          </div>
          <span className="font-mono text-xs text-signal-light font-bold">100.00% Precision</span>
        </div>

        <p className="text-xs text-ash leading-relaxed">
          Because Ethereum smart contracts do not support floating-point numbers natively, SoundChain enforces an industry-standard **Basis Points (BPS)** scale where <code className="text-paper bg-ink px-1.5 py-0.5 rounded font-mono">10,000 BPS = 100.00%</code>. Every registered track must satisfy:
        </p>

        <div className="p-4 bg-[#100F0D] border border-hairline rounded-sm font-mono text-xs text-brass text-center">
          ∑ (sharesBps[i]) === 10,000 (Exact 100% Invariant)
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2 font-mono text-xs">
          <div className="p-3 bg-[#100F0D] border border-hairline">
            <div className="text-ash">Artist Share:</div>
            <div className="text-paper font-bold text-sm">5,000 BPS (50.0%)</div>
            <div className="text-[10px] text-brass">0.0050 ETH / 0.01 ETH</div>
          </div>
          <div className="p-3 bg-[#100F0D] border border-hairline">
            <div className="text-ash">Producer Share:</div>
            <div className="text-paper font-bold text-sm">3,000 BPS (30.0%)</div>
            <div className="text-[10px] text-brass">0.0030 ETH / 0.01 ETH</div>
          </div>
          <div className="p-3 bg-[#100F0D] border border-hairline">
            <div className="text-ash">Songwriter Share:</div>
            <div className="text-paper font-bold text-sm">2,000 BPS (20.0%)</div>
            <div className="text-[10px] text-brass">0.0020 ETH / 0.01 ETH</div>
          </div>
        </div>
      </section>

      {/* 3. DUAL-PERSONA ARCHITECTURE */}
      <section className="space-y-6">
        <div className="font-mono text-xs text-brass uppercase tracking-wider">
          03 // PERSONA & ROLE-BASED DESIGN
        </div>

        <div className="border border-hairline rounded-sm divide-y divide-hairline bg-[#1A1814]">
          <div className="p-6 space-y-2">
            <div className="flex items-center justify-between font-mono text-xs">
              <span className="text-brass font-bold">1. LISTENER INTERFACE (/app/listen)</span>
              <span className="text-ash">Consumer Experience</span>
            </div>
            <p className="text-xs text-ash leading-relaxed">
              Designed for music discovery and casual engagement. Features track playback, continuous stream-rewards (+10 LSTN utility token minting), token transfers, and personal listening streaks without confusing financial administrative noise.
            </p>
          </div>

          <div className="p-6 space-y-2">
            <div className="flex items-center justify-between font-mono text-xs">
              <span className="text-brass font-bold">2. CREATOR STUDIO INTERFACE (/app/dashboard)</span>
              <span className="text-ash">Financial Workstation</span>
            </div>
            <p className="text-xs text-ash leading-relaxed">
              Designed like a master ledger and financial terminal. Displays live incoming royalty payment feeds, lifetime ETH earned readouts, track share percentage management tables, dense audit-ready payout histories, and administrative track registration.
            </p>
          </div>
        </div>
      </section>

      {/* 4. SECURITY & SMART CONTRACT AUDIT MEASURES */}
      <section className="p-6 bg-[#1A1814] border border-hairline rounded-sm space-y-4">
        <div className="font-mono text-xs text-brass uppercase tracking-wider">
          04 // SECURITY INVARIANTS
        </div>
        <h3 className="font-serif text-2xl font-bold text-paper">
          Tested On-Chain Protections
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 font-mono text-xs">
          <div className="space-y-1">
            <div className="text-paper font-bold">Reentrancy Defense</div>
            <p className="text-ash text-[11px]">
              OpenZeppelin <code className="text-paper">ReentrancyGuard</code> and strict Checks-Effects-Interactions pattern prevent recursive drain attacks.
            </p>
          </div>
          <div className="space-y-1">
            <div className="text-paper font-bold">Zero-Address Validation</div>
            <p className="text-ash text-[11px]">
              Rejects invalid recipient addresses (<code className="text-paper">address(0)</code>) and guarantees funds never burn or lock.
            </p>
          </div>
          <div className="space-y-1">
            <div className="text-paper font-bold">Capped ERC-20 Supply</div>
            <p className="text-ash text-[11px]">
              `ListenToken` enforces a hard cap of 1,000,000 LSTN to safeguard tokenomics from runaway inflation.
            </p>
          </div>
        </div>
      </section>

      {/* CTA Footer */}
      <div className="pt-6 border-t border-hairline flex items-center justify-between">
        <Link
          to="/tracks"
          className="px-6 py-3 bg-brass text-ink font-semibold text-xs rounded-sm hover:bg-brass-light transition-colors inline-flex items-center gap-2"
        >
          <span>Explore Public Catalog</span>
          <ArrowRight className="w-4 h-4" />
        </Link>
        <Link
          to="/app/listen"
          className="font-mono text-xs text-ash hover:text-paper"
        >
          Launch Listener Portal →
        </Link>
      </div>

    </div>
  );
}
