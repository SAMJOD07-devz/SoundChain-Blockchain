import React, { useState } from "react";
import { useWallet, HARDHAT_TEST_ACCOUNTS } from "../context/WalletContext";
import { parseEtherError } from "../utils/ethereum";
import { ethers } from "ethers";
import toast from "react-hot-toast";
import { Plus, Trash2, CheckCircle2, AlertCircle, FilePlus, ArrowRight } from "lucide-react";

export function AdminPage() {
  const {
    account,
    getRoyaltySplitterContract,
    connectTestWallet,
    isTestWalletMode,
    isAdmin,
  } = useWallet();

  // Form State
  const [title, setTitle] = useState("");
  const [artist, setArtist] = useState("");
  const [catalogNo, setCatalogNo] = useState("SL-004");
  const [payees, setPayees] = useState([
    { role: "Artist", address: HARDHAT_TEST_ACCOUNTS[1].address, percent: "50" },
    { role: "Producer", address: HARDHAT_TEST_ACCOUNTS[2].address, percent: "30" },
    { role: "Songwriter", address: HARDHAT_TEST_ACCOUNTS[3].address, percent: "20" },
  ]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [registeredTracks, setRegisteredTracks] = useState([]);

  // Calculate total percentage and BPS
  const totalPercent = payees.reduce((acc, p) => acc + (parseFloat(p.percent) || 0), 0);
  const totalBps = Math.round(totalPercent * 100);
  const isExact100 = Math.abs(totalPercent - 100) < 0.001;

  // Add new payee row
  const handleAddPayee = () => {
    setPayees([
      ...payees,
      { role: "Collaborator", address: "", percent: "0" },
    ]);
  };

  // Remove payee row
  const handleRemovePayee = (index) => {
    if (payees.length <= 1) {
      toast.error("Track must have at least one payee.");
      return;
    }
    setPayees(payees.filter((_, i) => i !== index));
  };

  // Update payee field
  const handleUpdatePayee = (index, field, value) => {
    const updated = [...payees];
    updated[index][field] = value;
    setPayees(updated);
  };

  // Submit on-chain track registration
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!account) {
      toast.error("Connect admin wallet (Account #0) first.");
      await connectTestWallet(0);
      return;
    }

    if (!title.trim() || !artist.trim()) {
      toast.error("Please provide both title and artist.");
      return;
    }

    if (!isExact100) {
      toast.error(`Total shares must equal exactly 100% (currently ${totalPercent}%).`);
      return;
    }

    // Validate addresses
    for (let p of payees) {
      if (!p.address || !ethers.isAddress(p.address)) {
        toast.error(`Invalid Ethereum address: ${p.address || "(empty)"}`);
        return;
      }
    }

    setIsSubmitting(true);
    toast.loading("Registering track in RoyaltySplitter smart contract...", { id: "admin-reg" });

    try {
      const splitter = getRoyaltySplitterContract();
      if (!splitter) throw new Error("RoyaltySplitter contract not loaded.");

      // Generate unique bytes32 ID
      const seedString = `${title.trim()}-${catalogNo}-${Date.now()}`;
      const trackId = ethers.keccak256(ethers.toUtf8Bytes(seedString));

      const payeeAddresses = payees.map((p) => p.address.trim());
      const sharesBps = payees.map((p) => Math.round(parseFloat(p.percent) * 100));

      const tx = await splitter.registerTrack(trackId, payeeAddresses, sharesBps);
      const receipt = await tx.wait();

      toast.success(`Track '${title}' successfully registered on-chain!`, { id: "admin-reg" });

      setRegisteredTracks([
        {
          id: trackId,
          title,
          artist,
          catalogNo,
          totalBps,
          payeesCount: payees.length,
          txHash: receipt.hash,
        },
        ...registeredTracks,
      ]);

      // Reset form
      setTitle("");
      setArtist("");
      setCatalogNo(`SL-00${registeredTracks.length + 5}`);
    } catch (err) {
      console.error("Track registration error:", err);
      const parsed = parseEtherError(err);
      toast.error(`Registration failed: ${parsed}`, { id: "admin-reg" });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-12 py-8 pb-28 max-w-4xl mx-auto font-mono text-xs">
      
      {/* Header */}
      <div className="border-b border-hairline pb-6 space-y-2">
        <div className="text-brass uppercase tracking-widest text-[11px]">
          // MASTERING STUDIO BACK-OFFICE
        </div>
        <h1 className="font-serif text-3xl sm:text-4xl font-bold text-paper tracking-tight">
          Track Registration & Split Ledger
        </h1>
        <p className="text-ash text-xs leading-relaxed max-w-xl">
          Internal administrative tool for registering new studio masters into `RoyaltySplitter.sol`. Only the contract deployer (Account #0) possesses permission to write to this registry.
        </p>
      </div>

      {/* Admin Gating Status Banner */}
      {!isAdmin ? (
        <div className="p-5 bg-[#1A1814] border border-hairline rounded-sm space-y-2">
          <div className="flex items-center gap-2 text-brass font-bold uppercase text-xs">
            <AlertCircle className="w-4 h-4" />
            <span>Platform Administrator Verification Required</span>
          </div>
          <p className="text-ash text-xs leading-relaxed">
            Only the platform admin (<span className="text-paper">Account #0</span>) can write new tracks to the smart contract registry. You are currently viewing this form in inspection mode. To register tracks during your evaluation demo, switch to <span className="text-paper">Account #0 (Deployer / Admin)</span> in the wallet dropdown.
          </p>
        </div>
      ) : (
        <div className="p-4 bg-brass/10 border border-brass-dim rounded-sm flex items-center justify-between text-paper">
          <div className="flex items-center gap-2 text-brass font-bold uppercase text-xs">
            <CheckCircle2 className="w-4 h-4" />
            <span>Administrator Privileges Verified (Account #0)</span>
          </div>
          <span className="text-ash text-[11px]">Deployer Signature Active</span>
        </div>
      )}

      {/* Utilitarian Registration Form */}
      <form onSubmit={handleSubmit} className="bg-[#1A1814] border border-hairline p-6 sm:p-8 rounded-sm space-y-8">
        
        {/* Track Metadata Row */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          <div className="space-y-1.5 sm:col-span-1">
            <label className="text-ash uppercase text-[10px] tracking-wider block">
              Catalog Number:
            </label>
            <input
              type="text"
              value={catalogNo}
              onChange={(e) => setCatalogNo(e.target.value)}
              className="w-full bg-[#100F0D] border border-hairline rounded-sm px-3 py-2 text-paper focus:outline-none focus:border-brass"
            />
          </div>

          <div className="space-y-1.5 sm:col-span-1">
            <label className="text-ash uppercase text-[10px] tracking-wider block">
              Master Title:
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Tape Loop No. 4"
              className="w-full bg-[#100F0D] border border-hairline rounded-sm px-3 py-2 text-paper placeholder-ash/40 focus:outline-none focus:border-brass"
            />
          </div>

          <div className="space-y-1.5 sm:col-span-1">
            <label className="text-ash uppercase text-[10px] tracking-wider block">
              Primary Recording Artist:
            </label>
            <input
              type="text"
              value={artist}
              onChange={(e) => setArtist(e.target.value)}
              placeholder="e.g. Sylvan Echo"
              className="w-full bg-[#100F0D] border border-hairline rounded-sm px-3 py-2 text-paper placeholder-ash/40 focus:outline-none focus:border-brass"
            />
          </div>
        </div>

        {/* Dynamic Repeatable Payee Rows */}
        <div className="space-y-4 pt-4 border-t border-hairline">
          <div className="flex items-center justify-between">
            <span className="text-ash uppercase text-[10px] tracking-wider">
              COLLABORATOR ROYALTY RECIPIENTS ({payees.length})
            </span>
            <button
              type="button"
              onClick={handleAddPayee}
              className="text-brass hover:text-brass-light flex items-center gap-1 text-xs"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Payee Row</span>
            </button>
          </div>

          <div className="space-y-3">
            {payees.map((payee, idx) => (
              <div
                key={idx}
                className="grid grid-cols-12 gap-3 p-3 bg-[#100F0D] border border-hairline rounded-sm items-center"
              >
                {/* Role Description */}
                <div className="col-span-3 sm:col-span-2">
                  <input
                    type="text"
                    value={payee.role}
                    onChange={(e) => handleUpdatePayee(idx, "role", e.target.value)}
                    placeholder="Role"
                    className="w-full bg-transparent border-b border-hairline px-1 py-1 text-paper focus:outline-none focus:border-brass"
                  />
                </div>

                {/* Wallet Address */}
                <div className="col-span-6 sm:col-span-7">
                  <input
                    type="text"
                    value={payee.address}
                    onChange={(e) => handleUpdatePayee(idx, "address", e.target.value)}
                    placeholder="0x..."
                    className="w-full bg-transparent border-b border-hairline px-1 py-1 text-paper placeholder-ash/40 focus:outline-none focus:border-brass text-[11px]"
                  />
                </div>

                {/* Percent Input */}
                <div className="col-span-2 sm:col-span-2 flex items-center gap-1">
                  <input
                    type="number"
                    step="0.1"
                    min="0"
                    max="100"
                    value={payee.percent}
                    onChange={(e) => handleUpdatePayee(idx, "percent", e.target.value)}
                    className="w-full bg-transparent border-b border-hairline px-1 py-1 text-paper text-right focus:outline-none focus:border-brass"
                  />
                  <span className="text-ash">%</span>
                </div>

                {/* Remove Button */}
                <div className="col-span-1 text-right">
                  <button
                    type="button"
                    onClick={() => handleRemovePayee(idx)}
                    className="text-ash/50 hover:text-rose-400 transition-colors p-1"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Live BPS & Percentage Calculation Display */}
        <div className="p-4 bg-[#100F0D] border border-hairline rounded-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-0.5">
            <span className="text-[10px] text-ash uppercase">
              TOTAL ROYALTY ALLOCATION
            </span>
            <div className="flex items-center gap-2">
              <span className={`text-base font-bold ${isExact100 ? "text-brass" : "text-ash"}`}>
                {totalPercent.toFixed(1)}% / 100.0%
              </span>
              <span className="text-ash/60">({totalBps.toLocaleString()} / 10,000 BPS)</span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {isExact100 ? (
              <span className="flex items-center gap-1.5 text-brass font-semibold">
                <CheckCircle2 className="w-4 h-4" />
                <span>EXACT 100% ALLOCATION VERIFIED</span>
              </span>
            ) : (
              <span className="flex items-center gap-1.5 text-ash">
                <AlertCircle className="w-4 h-4" />
                <span>
                  {totalPercent < 100
                    ? `Remaining to allocate: ${(100 - totalPercent).toFixed(1)}%`
                    : `Exceeds 100% by ${(totalPercent - 100).toFixed(1)}%`}
                </span>
              </span>
            )}
          </div>
        </div>

        {/* Submit Registration Button */}
        <button
          type="submit"
          disabled={!isExact100 || isSubmitting || !isAdmin}
          className="w-full py-3 bg-brass text-ink font-semibold text-xs rounded-sm hover:bg-brass-light transition-colors disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          <FilePlus className="w-4 h-4" />
          <span>
            {!isAdmin
              ? "Platform Admin Signature Required (Account #0 Only)"
              : isSubmitting
              ? "Writing Track to Solidity Contract..."
              : "Register Track in RoyaltySplitter"}
          </span>
        </button>

      </form>

      {/* Newly Registered Tracks Session Log */}
      {registeredTracks.length > 0 && (
        <section className="space-y-4">
          <div className="text-ash uppercase text-[11px] pb-2 border-b border-hairline">
            RECENTLY REGISTERED MASTERS THIS SESSION ({registeredTracks.length})
          </div>
          <div className="border border-hairline divide-y divide-hairline bg-[#1A1814] rounded-sm">
            {registeredTracks.map((item, idx) => (
              <div key={idx} className="p-4 flex items-center justify-between">
                <div>
                  <div className="text-paper font-bold">{item.title} ({item.catalogNo})</div>
                  <div className="text-ash text-[11px]">Artist: {item.artist} · {item.payeesCount} Payees</div>
                  <div className="text-ash/60 text-[10px] truncate max-w-sm">ID: {item.id}</div>
                </div>
                <div className="text-right">
                  <div className="text-brass">10,000 BPS</div>
                  <div className="text-[10px] text-signal-light">Confirmed On-Chain</div>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

    </div>
  );
}
