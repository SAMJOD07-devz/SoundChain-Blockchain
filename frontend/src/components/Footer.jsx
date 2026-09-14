import React from "react";

export function Footer() {
  return (
    <footer className="w-full border-t border-hairline bg-[#0E0D0B] mt-32 text-ash select-none">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 pb-8 border-b border-hairline">
          
          {/* Brand & Purpose */}
          <div className="md:col-span-2 space-y-2.5">
            <div className="font-serif text-xl font-bold tracking-tight text-paper">
              SOUND<span className="italic font-normal text-brass">CHAIN</span>
            </div>
            <p className="text-xs text-ash leading-relaxed max-w-sm">
              An automated, trustless protocol for instant basis-point royalty settlement and stream-verified listener rewards. Built on Ethereum testnet.
            </p>
          </div>

          {/* On-Chain Protocol Architecture */}
          <div className="space-y-2">
            <div className="font-mono text-[11px] uppercase tracking-wider text-paper font-semibold">
              PROTOCOL CONTRACTS
            </div>
            <ul className="font-mono text-xs space-y-1.5 text-ash">
              <li className="flex items-center gap-2">
                <span className="text-brass">§</span>
                <span>RoyaltySplitter.sol (10,000 BPS)</span>
              </li>
              <li className="flex items-center gap-2">
                <span className="text-brass">§</span>
                <span>ListenToken.sol (ERC-20 LSTN)</span>
              </li>
              <li className="flex items-center gap-2">
                <span className="text-brass">§</span>
                <span>CEI & ReentrancyGuard</span>
              </li>
            </ul>
          </div>

          {/* Network Nodes */}
          <div className="space-y-2">
            <div className="font-mono text-[11px] uppercase tracking-wider text-paper font-semibold">
              EXECUTION ENVIRONMENT
            </div>
            <div className="font-mono text-xs space-y-1.5 text-ash">
              <div className="flex items-center gap-2 text-paper">
                <span className="w-1.5 h-1.5 rounded-full bg-signal" />
                <span>Localhost 8545 (31337)</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-ash" />
                <span>Sepolia Testnet (11155111)</span>
              </div>
            </div>
          </div>

        </div>

        {/* Bottom Colophon */}
        <div className="pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 font-mono text-xs text-ash/60">
          <div>
            SoundChain Protocol Ledger · All payouts executed directly via EVM smart contracts.
          </div>
          <div className="text-ash/50">
            FRAUNCES / INTER / IBM PLEX MONO
          </div>
        </div>
      </div>
    </footer>
  );
}
