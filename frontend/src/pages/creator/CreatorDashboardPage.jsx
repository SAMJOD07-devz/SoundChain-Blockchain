import React from "react";
import { Link } from "react-router-dom";
import { useWallet } from "../../context/WalletContext";
import { getAllTracks } from "../../data/demoTracks";
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import { ArrowUpRight, TrendingUp, Clock, FileSpreadsheet, Plus, ExternalLink } from "lucide-react";

export function CreatorDashboardPage() {
  const {
    account,
    creatorLifetimeUsdc,
    usdcBalance,
    currentTestAccountIndex,
    testAccounts,
    isAdmin,
  } = useWallet();

  const allTracks = getAllTracks();

  // Active persona resolution (avoids "Fan & Listener" when in Creator view)
  const currentAccount = testAccounts[currentTestAccountIndex];
  const activeRoleLabel = isAdmin
    ? "Platform Rights Administrator"
    : currentAccount?.role?.replace(" Payee", "") || "Primary Rights Holder";

  // Recent incoming payment feed
  const incomingPayments = [
    { track: allTracks[0]?.title || "Midnight Signals", grossUsdc: "$10.00", netUsdc: "+$5.00 USDC", role: "Artist (50%)", time: "2 min ago", hash: "0x8827...2cc0" },
    { track: allTracks[1]?.title || "Glass Horizon", grossUsdc: "$25.00", netUsdc: "+$12.50 USDC", role: "Artist (50%)", time: "18 min ago", hash: "0x4a78...14c3" },
    { track: allTracks[2]?.title || "Afterglow Circuit", grossUsdc: "$15.00", netUsdc: "+$9.00 USDC", role: "Artist (60%)", time: "1 hr ago", hash: "0xfeeb...7e1c" },
    { track: allTracks[0]?.title || "Midnight Signals", grossUsdc: "$20.00", netUsdc: "+$10.00 USDC", role: "Artist (50%)", time: "3 hrs ago", hash: "0x91d4...33a1" },
    { track: allTracks[1]?.title || "Glass Horizon", grossUsdc: "$8.00", netUsdc: "+$4.00 USDC", role: "Artist (50%)", time: "6 hrs ago", hash: "0x33b1...88c2" },
  ];

  // Financial Earnings curve over 30 days ($ USD)
  const earningsData = [
    { day: "Day 1", usdc: 50 },
    { day: "Day 5", usdc: 120 },
    { day: "Day 10", usdc: 180 },
    { day: "Day 15", usdc: 240 },
    { day: "Day 20", usdc: 310 },
    { day: "Day 25", usdc: 380 },
    { day: "Today", usdc: parseFloat(creatorLifetimeUsdc) || 425 },
  ];

  const truncatedAccount = account
    ? `${account.substring(0, 6)}···${account.substring(account.length - 4)}`
    : "Disconnected";

  return (
    <div className="space-y-10 py-8 pb-28 max-w-6xl mx-auto font-sans">
      
      {/* Header (Clean sans subtitle, no // tracked labels) */}
      <div className="border-b border-hairline pb-6 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div className="space-y-1">
          <span className="text-xs text-ash font-medium">
            Royalty accounting and treasury
          </span>
          <h1 className="font-serif text-3xl sm:text-4xl font-bold text-paper tracking-tight">
            Creator Studio
          </h1>
          <p className="text-xs text-ash">
            Active persona: <span className="text-paper font-medium">{activeRoleLabel}</span> · Wallet:{" "}
            <span className="font-mono text-ash/90">{truncatedAccount}</span>
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            to="/app/payouts"
            className="px-3.5 py-2 border border-hairline hover:border-paper/40 text-xs text-ash hover:text-paper rounded inline-flex items-center gap-1.5 transition-colors"
          >
            <FileSpreadsheet className="w-3.5 h-3.5 text-brass" />
            <span>Audit Payout Ledger</span>
          </Link>
          <Link
            to="/app/register-track"
            className="px-4 py-2 bg-brass text-ink font-semibold text-xs rounded hover:bg-brass-light active:scale-98 transition-all inline-flex items-center gap-1.5"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Register Track</span>
          </Link>
        </div>
      </div>

      {/* Hero + Statement Layout (60% Left / 40% Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left (about 60% width): Hero Figure + Area Chart + Recent Payments */}
        <div className="lg:col-span-7 space-y-6">
          
          {/* Main Financial Display Card */}
          <div className="p-6 sm:p-8 bg-[#1B1814] border border-hairline rounded space-y-5">
            <div className="space-y-1">
              <span className="text-xs text-ash font-medium">Lifetime royalties earned</span>
              <div className="flex items-baseline gap-3">
                <span className="font-serif text-4xl sm:text-5xl font-bold text-paper tracking-tight">
                  ${creatorLifetimeUsdc || "425.00"}
                </span>
                <span className="font-mono text-base font-normal text-brass">USDC</span>
              </div>
              <div className="text-xs text-signal-light font-medium flex items-center gap-1 pt-0.5">
                <ArrowUpRight className="w-3.5 h-3.5" />
                <span>+$12.50 settled in the last 24h</span>
              </div>
            </div>

            {/* Gradient Area Chart */}
            <div className="pt-4 border-t border-hairline space-y-2">
              <div className="flex items-center justify-between text-xs text-ash">
                <span className="font-medium">30-day cumulative settlement curve</span>
                <span>Values in $ USD</span>
              </div>

              <div className="h-64 w-full pt-2">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={earningsData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                    <defs>
                      <linearGradient id="creatorBrassGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#C9A24B" stopOpacity={0.35} />
                        <stop offset="95%" stopColor="#C9A24B" stopOpacity={0.0} />
                      </linearGradient>
                    </defs>
                    <XAxis
                      dataKey="day"
                      stroke="#8C8578"
                      fontSize={11}
                      fontFamily="IBM Plex Mono"
                      tickLine={false}
                    />
                    <YAxis
                      stroke="#8C8578"
                      fontSize={11}
                      fontFamily="IBM Plex Mono"
                      tickLine={false}
                      tickFormatter={(v) => `$${v}`}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "#14120F",
                        borderColor: "rgba(138, 114, 56, 0.4)",
                        borderRadius: "4px",
                        fontSize: "12px",
                        fontFamily: "IBM Plex Mono",
                        color: "#F6F1E7",
                      }}
                      formatter={(val) => [`$${val} USDC`, "Settled"]}
                    />
                    <Area
                      type="monotone"
                      dataKey="usdc"
                      stroke="#C9A24B"
                      strokeWidth={2}
                      fillOpacity={1}
                      fill="url(#creatorBrassGrad)"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          {/* Recent Payments Feed */}
          <div className="p-6 bg-[#1B1814] border border-hairline rounded space-y-4">
            <div className="flex items-center justify-between border-b border-hairline pb-3">
              <h2 className="text-sm font-semibold text-paper">Recent incoming distributions</h2>
              <span className="text-[11px] text-signal-light flex items-center gap-1 font-medium">
                <span className="w-1.5 h-1.5 rounded-full bg-signal" />
                Live on-chain
              </span>
            </div>

            <div className="divide-y divide-hairline">
              {incomingPayments.map((item, idx) => (
                <div key={idx} className="py-3 flex items-center justify-between hover:bg-ink-dark/40 px-2 -mx-2 rounded transition-colors">
                  <div className="space-y-0.5">
                    <div className="text-sm text-paper font-medium">{item.track}</div>
                    <div className="text-xs text-ash">
                      Gross: <span className="font-mono text-ash/90">{item.grossUsdc}</span> · {item.role}
                    </div>
                  </div>

                  <div className="text-right space-y-0.5">
                    <div className="font-mono text-xs font-semibold text-paper">{item.netUsdc}</div>
                    <div className="text-[11px] text-ash">{item.time}</div>
                  </div>
                </div>
              ))}
            </div>

            <div className="pt-2 text-right border-t border-hairline">
              <Link to="/app/payouts" className="text-xs text-brass hover:underline inline-flex items-center gap-1 font-medium">
                <span>View complete audit history</span>
                <span aria-hidden="true">→</span>
              </Link>
            </div>
          </div>

        </div>

        {/* Right (about 40% width): Ledger Summary Rows + Registered Masters List */}
        <div className="lg:col-span-5 space-y-6">
          
          {/* Ledger Summary as Financial Statement Rows */}
          <div className="p-6 bg-[#1B1814] border border-hairline rounded space-y-4">
            <div className="border-b border-hairline pb-3">
              <h2 className="text-sm font-semibold text-paper">Ledger summary</h2>
              <span className="text-xs text-ash">Account cap table reconciliation</span>
            </div>

            <div className="divide-y divide-hairline text-xs">
              <div className="py-2.5 flex justify-between items-center">
                <span className="text-ash">Active registered tracks</span>
                <span className="font-mono text-paper font-medium">{allTracks.length} Masters</span>
              </div>
              <div className="py-2.5 flex justify-between items-center">
                <span className="text-ash">Average entitled share</span>
                <span className="font-mono text-paper font-medium">55.0% (5,500 BPS)</span>
              </div>
              <div className="py-2.5 flex justify-between items-center">
                <span className="text-ash">Last payout received</span>
                <span className="font-mono text-paper font-medium">2 min ago</span>
              </div>
              <div className="py-2.5 flex justify-between items-center">
                <span className="text-ash">Pending escrow balance</span>
                <span className="font-mono text-signal-light font-medium">$0.00 (Zero escrow)</span>
              </div>
              <div className="py-2.5 flex justify-between items-center">
                <span className="text-ash">Liquid treasury balance</span>
                <span className="font-mono text-brass font-semibold">
                  ${parseFloat(usdcBalance || 0).toLocaleString("en-US", { minimumFractionDigits: 2 })} USDC
                </span>
              </div>
            </div>
          </div>

          {/* Registered Repertoire Quick Cards */}
          <div className="p-6 bg-[#1B1814] border border-hairline rounded space-y-4">
            <div className="flex items-center justify-between border-b border-hairline pb-3">
              <h2 className="text-sm font-semibold text-paper">Repertoire catalog</h2>
              <Link to="/app/my-tracks" className="text-xs text-brass hover:underline font-medium">
                Manage all →
              </Link>
            </div>

            <div className="space-y-3">
              {allTracks.map((track, idx) => (
                <div key={idx} className="p-3 bg-ink-dark/60 border border-hairline rounded space-y-1.5">
                  <div className="flex justify-between items-start">
                    <div>
                      <div className="font-serif text-sm font-bold text-paper flex items-center gap-2">
                        <span>{track.title}</span>
                        {track.ipfsCid && (
                          <span className="px-1.5 py-0.2 bg-emerald-950/70 text-emerald-400 border border-emerald-800/40 rounded text-[9px]">
                            IPFS
                          </span>
                        )}
                      </div>
                      <div className="text-xs text-ash">{track.catalogNo} · {track.genre}</div>
                    </div>
                    <span className="font-mono text-xs text-brass font-semibold">{track.splits?.[0]?.percent || 50}%</span>
                  </div>

                  <div className="pt-1.5 border-t border-hairline flex justify-between text-xs text-ash">
                    <span className="font-mono text-[11px]">{track.splits?.[0]?.bps || 5000} BPS</span>
                    <Link to={`/app/my-tracks/${track.id}/manage`} className="text-ash hover:text-paper transition-colors">
                      Inspect split →
                    </Link>
                  </div>
                </div>
              ))}
            </div>

            <div className="pt-2">
              <Link
                to="/app/register-track"
                className="w-full py-2 border border-hairline hover:border-brass/60 text-ash hover:text-paper text-xs rounded inline-flex items-center justify-center gap-1.5 transition-colors"
              >
                <Plus className="w-3.5 h-3.5 text-brass" />
                <span>Register new master</span>
              </Link>
            </div>
          </div>

        </div>

      </div>

    </div>
  );
}
