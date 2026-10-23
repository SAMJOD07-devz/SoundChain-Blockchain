import React, { useState } from "react";
import { useWallet, HARDHAT_TEST_ACCOUNTS } from "../context/WalletContext";
import { formatEtherBalance, parseEtherError } from "../utils/ethereum";
import { ethers } from "ethers";
import toast from "react-hot-toast";
import { Copy, Check, RefreshCw, Send, ArrowRight } from "lucide-react";
import { getAllTracks } from "../data/demoTracks";

export function PortfolioPage() {
  const allTracks = getAllTracks();
  const {
    account,
    ethBalance,
    usdcBalance,
    lstnBalance,
    totalListens,
    isTestWalletMode,
    currentTestAccountIndex,
    connectTestWallet,
    refreshBalances,
    getListenTokenContract,
  } = useWallet();

  const [copied, setCopied] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Send LSTN Form State
  const [recipientAddress, setRecipientAddress] = useState("");
  const [sendAmount, setSendAmount] = useState("");
  const [isSending, setIsSending] = useState(false);

  const handleCopy = () => {
    if (account) {
      navigator.clipboard.writeText(account);
      setCopied(true);
      toast.success("Wallet address copied");
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await refreshBalances();
    setTimeout(() => setIsRefreshing(false), 500);
    toast.success("Balances reconciled from blockchain state");
  };

  const handleSendLstn = async (e) => {
    e.preventDefault();
    if (!account) {
      toast.error("Please connect wallet first.");
      return;
    }

    if (!recipientAddress || !ethers.isAddress(recipientAddress)) {
      toast.error("Enter a valid Ethereum recipient address.");
      return;
    }

    const numAmount = parseFloat(sendAmount);
    if (!numAmount || numAmount <= 0) {
      toast.error("Enter a valid amount of LSTN to send.");
      return;
    }

    if (numAmount > parseFloat(lstnBalance)) {
      toast.error("Insufficient LSTN token balance.");
      return;
    }

    setIsSending(true);
    toast.loading("Submitting LSTN transfer...", { id: "transfer-tx" });

    try {
      const token = getListenTokenContract();
      if (!token) throw new Error("ListenToken contract not loaded.");

      const tx = await token.transfer(recipientAddress, ethers.parseUnits(sendAmount, 18));
      await tx.wait();

      toast.success(`Successfully sent ${sendAmount} LSTN!`, { id: "transfer-tx" });
      setRecipientAddress("");
      setSendAmount("");
      await refreshBalances();
    } catch (err) {
      console.error("Transfer error:", err);
      const parsed = parseEtherError(err);
      toast.error(`Transfer failed: ${parsed}`, { id: "transfer-tx" });
    } finally {
      setIsSending(false);
    }
  };

  const currentAccount = HARDHAT_TEST_ACCOUNTS[currentTestAccountIndex] || {
    name: "Account",
    role: "Stakeholder",
    address: account,
  };

  return (
    <div className="space-y-12 py-8 pb-28 max-w-4xl mx-auto">
      
      {/* Header */}
      <div className="border-b border-hairline pb-6 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div className="space-y-2">
          <div className="font-mono text-xs text-brass uppercase tracking-widest">
            // ACCOUNT STATEMENT
          </div>
          <h1 className="font-serif text-3xl sm:text-4xl font-bold text-paper tracking-tight">
            Financial Ledger & Balance Sheet
          </h1>
          <p className="font-mono text-xs text-ash">
            Account: <span className="text-paper">{account || "Disconnected"}</span>
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleCopy}
            className="px-3 py-1.5 border border-hairline hover:border-paper font-mono text-xs text-ash hover:text-paper rounded-sm inline-flex items-center gap-1.5 transition-colors"
          >
            {copied ? <Check className="w-3 h-3 text-brass" /> : <Copy className="w-3 h-3" />}
            <span>Copy Address</span>
          </button>
          <button
            onClick={handleRefresh}
            disabled={isRefreshing}
            className="px-3 py-1.5 border border-hairline hover:border-paper font-mono text-xs text-ash hover:text-paper rounded-sm inline-flex items-center gap-1.5 transition-colors"
          >
            <RefreshCw className={`w-3 h-3 ${isRefreshing ? "animate-spin" : ""}`} />
            <span>Reconcile</span>
          </button>
        </div>
      </div>

      {/* 1. FINANCIAL STATEMENT LAYOUT (Label Left, Value Right, Hairline Dividers) */}
      <section className="bg-[#1A1814] border border-hairline rounded-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-hairline bg-[#100F0D] flex items-center justify-between">
          <span className="font-mono text-xs uppercase tracking-wider text-ash">
            BALANCE SHEET POSITION
          </span>
          <span className="font-mono text-xs text-brass">
            {currentAccount.role}
          </span>
        </div>

        <div className="divide-y divide-hairline font-mono text-xs">
          
          <div className="px-6 py-4 flex items-center justify-between">
            <span className="text-ash">Asset-Backed Royalty Balance ($ USDC)</span>
            <span className="text-paper font-semibold text-sm">
              ${parseFloat(usdcBalance || 0).toLocaleString("en-US", { minimumFractionDigits: 2 })} USDC
            </span>
          </div>

          <div className="px-6 py-4 flex items-center justify-between">
            <span className="text-ash">SoundChain Loyalty Rewards (LSTN)</span>
            <span className="text-brass font-bold text-sm">
              {lstnBalance} LSTN
            </span>
          </div>

          <div className="px-6 py-4 flex items-center justify-between">
            <span className="text-ash">EVM Gas Liquidity (ETH)</span>
            <span className="text-ash font-medium text-xs">
              {formatEtherBalance(ethBalance, 4)} ETH
            </span>
          </div>

          <div className="px-6 py-4 flex items-center justify-between">
            <span className="text-ash">Verified Studio Stream Count</span>
            <span className="text-paper">
              {totalListens} Completed Streams
            </span>
          </div>

          <div className="px-6 py-4 flex items-center justify-between">
            <span className="text-ash">Smart Contract Network</span>
            <span className="text-paper flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-signal" />
              <span>Hardhat Local (Chain ID: 31337)</span>
            </span>
          </div>

          <div className="px-6 py-4 flex items-center justify-between">
            <span className="text-ash">Settlement Protocol</span>
            <span className="text-ash">
              RoyaltySplitter.sol (10,000 BPS Direct)
            </span>
          </div>

        </div>
      </section>

      {/* 2. SIMPLE SEND LSTN FORM */}
      <section className="bg-[#1A1814] border border-hairline p-6 sm:p-8 rounded-sm space-y-6">
        <div className="border-b border-hairline pb-3 flex items-center justify-between">
          <div>
            <span className="font-mono text-xs text-brass uppercase tracking-widest">
              // TOKEN DISBURSEMENT
            </span>
            <h2 className="font-serif text-2xl font-bold text-paper mt-0.5">
              Send LSTN Utility Tokens
            </h2>
          </div>
          <span className="font-mono text-xs text-ash">ERC-20 Transfer</span>
        </div>

        <form onSubmit={handleSendLstn} className="space-y-4 font-mono text-xs">
          <div className="space-y-1.5">
            <label className="block text-ash">Recipient Address (0x...):</label>
            <input
              type="text"
              value={recipientAddress}
              onChange={(e) => setRecipientAddress(e.target.value)}
              placeholder="0x70997970C51812dc3A010C7d01b50e0d17dc79C8"
              className="w-full bg-[#100F0D] border border-hairline rounded-sm px-3.5 py-2.5 text-paper placeholder-ash/50 focus:outline-none focus:border-brass"
            />
          </div>

          <div className="space-y-1.5">
            <div className="flex justify-between text-ash">
              <span>Amount (LSTN):</span>
              <span>Available: {lstnBalance} LSTN</span>
            </div>
            <div className="relative">
              <input
                type="number"
                step="1"
                min="1"
                value={sendAmount}
                onChange={(e) => setSendAmount(e.target.value)}
                placeholder="10"
                className="w-full bg-[#100F0D] border border-hairline rounded-sm px-3.5 py-2.5 text-paper placeholder-ash/50 focus:outline-none focus:border-brass"
              />
              <button
                type="button"
                onClick={() => setSendAmount(lstnBalance)}
                className="absolute right-3 top-2.5 text-[11px] text-brass hover:underline"
              >
                Max
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={isSending}
            className="w-full py-3 bg-brass text-ink font-semibold text-xs rounded-sm hover:bg-brass-light transition-colors disabled:opacity-60 flex items-center justify-center gap-2"
          >
            <Send className="w-3.5 h-3.5" />
            <span>{isSending ? "Executing On-Chain Transfer..." : "Submit Token Transfer"}</span>
          </button>
        </form>
      </section>

      {/* 3. PARTICIPATING ROYALTIES STATEMENT */}
      <section className="space-y-4">
        <div className="flex items-center justify-between border-b border-hairline pb-2 font-mono text-xs">
          <span className="uppercase text-ash">REGISTERED TRACK ENTITLEMENTS</span>
          <span className="text-ash">{allTracks.length} Active Records</span>
        </div>

        <div className="border border-hairline rounded-sm overflow-hidden divide-y divide-hairline bg-[#1A1814] font-mono text-xs">
          {allTracks.map((t, idx) => (
            <div key={idx} className="p-4 flex items-center justify-between hover:bg-[#100F0D] transition-colors">
              <div className="space-y-0.5">
                <div className="font-serif text-sm font-bold text-paper flex items-center gap-2">
                  <span>{t.title}</span>
                  {t.ipfsCid && (
                    <span className="px-1.5 py-0.2 bg-emerald-950/70 text-emerald-400 border border-emerald-800/40 rounded text-[9px]">
                      IPFS
                    </span>
                  )}
                </div>
                <div className="text-[11px] text-ash">{t.artist} · {t.catalogNo}</div>
              </div>
              <div className="text-right">
                <div className="text-brass font-bold">{t.splits?.[0]?.percent || 50}% Primary Split</div>
                <div className="text-[11px] text-ash">{t.splits?.[0]?.bps || 5000} BPS</div>
              </div>
            </div>
          ))}
        </div>
      </section>

    </div>
  );
}
