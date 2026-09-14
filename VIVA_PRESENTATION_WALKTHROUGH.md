# SoundChain — Complete Project Presentation & Viva Walkthrough

> **Project Name:** SoundChain (Studio Ledger Protocol)  
> **Architecture:** Ethereum Smart Contracts (Solidity 0.8.20) + React 18 (Vite) + Ethers.js v6 + Tailwind CSS + Three.js / React Three Fiber  
> **Current Release:** 50% Course Milestone Implementation (`v0.5`)  
> **Local Test URL:** `http://localhost:3000` | **Blockchain Node:** `http://127.0.0.1:8545` (Chain ID: `31337`)

---

## 📑 Table of Contents
1. [30-Second Elevator Pitch](#1-30-second-elevator-pitch)
2. [50% Scope Defense (What's Done vs Deferred)](#2-50-scope-defense)
3. [Step-by-Step Live Viva Demonstration Script](#3-step-by-step-live-viva-demonstration-script)
4. [Deep-Dive Technical Concepts (How to Explain the Code)](#4-deep-dive-technical-concepts)
5. [Frequently Asked Viva Questions & Winning Answers](#5-frequently-asked-viva-questions--winning-answers)

---

## 1. 30-Second Elevator Pitch

> *"Good morning/afternoon. Today I am presenting **SoundChain**, a decentralized music royalty settlement protocol and listen-to-earn Web3 platform.*
> 
> *In the traditional music industry, royalties take between 60 to 180 days to pay out, with opaque intermediaries taking 15% to 35% cuts before artists ever see their money. SoundChain replaces this black-box escrow with **automated on-chain smart contracts**.*
> 
> *Using integer-based **10,000 Basis Points (BPS) math**, listener payments are mathematically divided and disbursed directly to collaborators in the **identical Ethereum block** with zero holding escrow. Simultaneously, fans who stream studio masters earn verified **$LSTN ERC-20 utility tokens**.*
> 
> *Our frontend is built with a bespoke **'Studio Ledger'** visual identity—combining the tactile aesthetics of an analog mastering studio with the precision of a high-end financial terminal."*

---

## 2. 50% Scope Defense

If your evaluators ask about the scope of this submission, explain:

### ✅ Included & Working in this 50% Milestone:
1. **Solidity 0.8.20 Contracts**:
   - `RoyaltySplitter.sol`: Basis-point mathematical split, automated ETH payouts, Checks-Effects-Interactions, OpenZeppelin `ReentrancyGuard`.
   - `ListenToken.sol`: Capped ERC-20 utility token (1,000,000 max supply), listener reward logic.
2. **Hardhat Blockchain Suite**: 100% passing unit tests covering access control, BPS validation, and reentrancy defense.
3. **Role-Based Architecture**: Complete decoupling of the **Listener Portal** from the **Creator Studio**.
4. **Interactive Simulators**:
   - On-chain payment simulation executing live contract calls.
   - 12-second stream countdown triggering `rewardListener` token minting.
5. **Zero-Config Testing**: Built-in test wallet modes with 10,000 dummy ETH—no real wallets or mainnet funds involved.

### ⏳ Deferred to the Remaining 50% (Final Project Phase):
- Decentralized IPFS audio binary storage (Pinata / Arweave).
- Cryptographic stream validation backend (anti-bot audio proofs).
- Public Etherscan contract verification on Sepolia testnet.

---

## 3. Step-by-Step Live Viva Demonstration Script

Follow these steps in this exact chronological order during your screen-share presentation:

### 🎬 Step 1: Public Landing Page (`http://localhost:3000`)
1. **Show the Editorial Hero**:
   - Point to the headline: *"Every stream, split the moment it’s paid."*
   - Explain: *"Notice we avoid generic crypto clichés (no neon purple/green or stock coins). We use a bespoke Studio Ledger palette: warm ink, tactile paper, and brushed brass."*
2. **Highlight the 3D Mastering Lacquer Disc**:
   - Move your mouse slightly over the right side of the screen to demonstrate the smooth parallax response.
   - Explain: *"Built in React Three Fiber with physical micro-groove geometry. The light beams fanning out from the edge visually symbolize one incoming payment dividing into multiple collaborator royalty streams."*
3. **Point out the On-Chain Ledger Strip**:
   - Show the continuous horizontal ticker directly beneath the hero: *"This monospace ticker displays real recent block settlements, splits, and token rewards in real time."*

---

### 🎬 Step 2: Technical Architecture (`/how-it-works`)
1. Click **How It Works** in the navbar (or go to `http://localhost:3000/how-it-works`).
2. **Explain the Math**:
   - Show the formula: `∑ (sharesBps[i]) === 10,000`.
   - Explain: *"Smart contracts don't have floating-point decimals. We use 10,000 Basis Points where 100 BPS equals 1.00%, ensuring zero rounding loss down to wei precision."*
3. **Highlight the Security Invariants**:
   - Mention the Checks-Effects-Interactions (CEI) pattern and OpenZeppelin's `ReentrancyGuard` preventing recursive call attacks.

---

### 🎬 Step 3: Tracks Catalog & Stacked-Bar Split (`/tracks`)
1. Click **Catalog** in the navbar.
2. Show the **Asymmetric Editorial Layout**: one featured master cut (`Midnight Signals`) flanked by secondary masters (`Glass Horizon`, `Afterglow Circuit`).
3. **Hover over a track**:
   - Point out the **Horizontal Stacked Bar**:
   - Explain: *"Instead of generic circular pie charts, we use horizontal stacked ledger bars with inline percentages and contributor roles labeled directly on the bar."*

---

### 🎬 Step 4: Live Royalty Payout Simulation (`/track/track-1`)
1. Click on **Midnight Signals** to open the track detail view.
2. Scroll to **Simulate Direct Royalty Payout**:
   - Show the preset buttons: select `0.01 ETH`.
   - Highlight the dynamic anticipated breakdown preview:
     - Artist (Nova Vale, 50%): `+0.0050 ETH`
     - Producer (Kaelen Voss, 30%): `+0.0030 ETH`
     - Songwriter (Elena Rostova, 20%): `+0.0020 ETH`
3. Click **Execute Settlement Simulation**:
   - Watch the stacked bar pulse with warm brass light as the transaction is confirmed on the local blockchain.
   - Point to the **Financial Settlement Voucher**:
     - Real Transaction Hash
     - Block Number
     - Exact ETH credited to each collaborator's wallet address.

---

### 🎬 Step 5: Dual-Persona Navigation & Role Switcher
1. Look at the top navbar next to the wallet pill:
   - Point out the compact **`<RoleSwitcher>`** dropdown: `[ ● Listener Portal ▾ ]`.
   - Click it to show the 3 clear choices:
     - **Listener Portal** (*Stream, earn & wallet*)
     - **Creator Studio** (*Royalty ledger & math*)
     - **Platform Admin** (*Register tracks*)
2. Explain to your evaluators:
   - *"A fan wants to discover and stream music; a creator needs a financial workstation to track earnings and splits. They shouldn't share the same screen."*

---

### 🎬 Step 6: Listener Portal (`/app/listen`, `/app/wallet`, `/app/earnings`)
1. Select **Listener Portal** in the switcher.
2. Notice the **Upper Navbar**:
   - Breadcrumb: `🎧 LISTENER PORTAL / Stream & Earn`
   - Top-right emphasis pill: highlights your **`LSTN Token Balance`** (what fans care about).
3. **Execute Listen-to-Earn**:
   - Click **Stream & Earn (+10 LSTN)** on `Midnight Signals`.
   - Watch the 12-second progress bar advance.
   - Upon completion, observe the notification: *"Session verified! Mints LSTN tokens..."*
   - Watch the LSTN balance pill tick up by **+10 LSTN**!
4. Click **Wallet** (`/app/wallet`):
   - Show the token-balance-first card and the **Send LSTN** transfer form.
5. Click **Earnings** (`/app/earnings`):
   - Show the Recharts 7-day accumulation curve.

---

### 🎬 Step 7: Creator Studio (`/app/dashboard`, `/app/my-tracks`, `/app/payouts`)
1. In the top navbar, open `<RoleSwitcher>` and select **Creator Studio**.
2. Notice how the **Upper Navbar instantly transforms**:
   - Breadcrumb: `🏛️ CREATOR STUDIO / Royalty Accounting`
   - Top-right emphasis pill: Swaps from LSTN to **`Earned: X.XX ETH`** (what creators care about).
3. **Review the Financial Terminal (`/app/dashboard`)**:
   - Point out: *"There are no play buttons here. Creators don't need to stream their own tracks from their financial dashboard—this screen is strictly focused on cash flow and performance."*
   - Show the live incoming payment feed (`+0.0050 ETH · 2 min ago`).
   - Show the 30-day cumulative royalty line chart.
4. Click **My Tracks** (`/app/my-tracks`):
   - Show the financial management table listing the creator's registered tracks, their entitled % share, and total net earned.
5. Click **Payouts** (`/app/payouts`):
   - Show the dense, audit-ready payout ledger.
   - Click **Export CSV Ledger** to demonstrate simulated financial export.

---

### 🎬 Step 8: Platform Admin & Security Gating (`/app/register-track`)
1. In the `<RoleSwitcher>`, select **Platform Admin**.
2. **Explain the Smart Contract Access Control**:
   - Point out the status banner:
     - If on Account #0: *"Administrator Privileges Verified (Account #0)"*
     - If on non-admin accounts: *"Platform Administrator Verification Required (Account #0 Only)"*
3. Show the **Dynamic Repeatable Payee Rows**:
   - Show the live allocation counter: watch it update in real time.
   - When the rows equal exactly 100.0% (10,000 BPS), point out that the counter turns bold brass with a green checkmark!

---

### 🎬 Step 9: Developer Accounts Drawer (`[ ⚡ Dev Accounts ]`)
1. Look at the bottom-right corner of the screen:
   - Click the discreet floating **`[ ⚡ Dev Accounts ]`** button.
2. Explain:
   - *"For viva evaluation, we built this floating developer drawer so we can impersonate any stakeholder (Artist, Producer, Songwriter, or Admin) with one click without needing to open MetaMask."*

---

## 4. Deep-Dive Technical Concepts

Be ready to explain these specific parts of the Solidity code:

### 1. Checks-Effects-Interactions (CEI) Pattern in `RoyaltySplitter.sol`
```solidity
// 1. CHECKS: Validate state and inputs
if (!track.isRegistered) revert TrackNotRegistered(trackId);
if (msg.value == 0) revert ZeroPaymentAmount();

// 2. EFFECTS: Update internal contract state BEFORE sending external calls
track.totalReceived += paymentAmount;

// 3. INTERACTIONS: Disburse funds to external addresses
for (uint256 i = 0; i < payeeCount; i++) {
    (bool success, ) = track.payees[i].call{value: payeeAmount}("");
    if (!success) revert ETHTransferFailed(track.payees[i], payeeAmount);
}
```
*Why this matters:* If an external call invokes a malicious fallback function to re-enter `payRoyalty`, the contract state has already been updated, rendering reentrancy attacks completely impossible.

### 2. Low-Level `.call{value: ...}("")` vs `.transfer()`
Explain:
> *"We intentionally use `.call{value: amount}("")` instead of Solidity's legacy `.transfer()` or `.send()`. In modern Solidity, `.transfer()` has a 2,300 gas limit which causes transactions to fail if the recipient is a smart contract wallet (like Gnosis Safe or account-abstracted wallet). Our implementation checks the boolean return value and protects against reentrancy."*

---

## 5. Frequently Asked Viva Questions & Winning Answers

#### Q1: "Why did you use Basis Points instead of standard percentages?"
> **Answer:** *"EVM smart contracts do not support floating-point numbers. If an artist has a 33.33% share, integer division would create rounding discrepancies and leave 'dust' ETH trapped in the contract. Basis points scale 100% to 10,000 integers. This allows exact division down to 0.01% precision without float errors."*

#### Q2: "Does the smart contract hold royalty payments in escrow?"
> **Answer:** *"No. Traditional music platforms hold money in escrow for 60 to 180 days. SoundChain uses atomic disbursement: as soon as a payment arrives in `payRoyalty()`, the contract loops through the payees and transfers the exact fraction directly to their individual wallets in the exact same transaction block. Zero funds are held by the protocol."*

#### Q3: "What prevents someone from abusing the Listen-to-Earn mechanism to drain tokens?"
> **Answer:** *"Three core defenses: First, `ListenToken.sol` has a hard-coded `MAX_SUPPLY` of 1,000,000 LSTN enforced on-chain. Second, the `rewardListener` function is protected by the `onlyOwner` access modifier, meaning rewards can only be triggered via authorized verified sessions. Third, for our final 50% milestone, we are adding cryptographic stream-proof signatures generated by the audio engine."*

#### Q4: "Why are the Listener and Creator interfaces separated?"
> **Answer:** *"Role-Based Access Control (RBAC) and clean UX. A music fan wants an entertainment experience: playback, track discovery, and earning tokens. A music creator or label needs an enterprise accounting workstation: tracking basis points, reviewing incoming payout transactions, and exporting tax ledgers. Combining them into one screen creates confusion. We modeled this after Spotify vs Spotify for Artists."*

#### Q5: "How does the app protect against accidentally using real money?"
> **Answer:** *"The frontend has network guardrails that strictly allow only Chain ID 31337 (Localhost Hardhat) and Chain ID 11155111 (Sepolia Testnet). If a user connects MetaMask on Ethereum Mainnet (Chain ID 1), the application flags 'Wrong Network' and completely disables transaction execution."*

---

### 🏁 Summary Checklist Before Starting Your Viva:
- [x] Local Hardhat Node running in background (`http://127.0.0.1:8545`)
- [x] Vite Frontend running at **`http://localhost:3000`**
- [x] Smart Contracts compiled and deployed with seed demo tracks
- [x] Test accounts pre-funded with 10,000 test ETH
