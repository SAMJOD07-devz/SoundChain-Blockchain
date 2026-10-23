# SoundChain — Decentralized Music Royalty Settlement Protocol

> 📖 **Live Presentation & Viva Guide:** A complete step-by-step presentation script, architecture defense, and technical Q&A preparation is in [VIVA_PRESENTATION_WALKTHROUGH.md](./VIVA_PRESENTATION_WALKTHROUGH.md).

**SoundChain** is a decentralized music royalty settlement protocol and listen-to-earn Web3 platform built on Ethereum (Solidity 0.8.20 + Hardhat), Ethers.js v6, and React 18 (Vite + Tailwind CSS + Three.js).

It eliminates the 60-to-180-day royalty escrow delays and opaque 15–35% deductions of traditional streaming intermediaries by automatically executing atomic, mathematically verified splits down to the wei using 10,000 Basis Points (BPS) in the **identical Ethereum block**.

---

## 🎯 Final Phase (v1.0 Release) Implementation Scope

### 1. Smart Contracts & EVM Core (Solidity 0.8.20)
- **`RoyaltySplitter.sol`**:
  - Exact integer math using **10,000 Basis Points (BPS)** ($\sum = 10,000 \equiv 100.00\%$) ensuring zero float rounding loss.
  - **Dual Payment Rails**: Atomic settlement in both native **ETH** (`payRoyalty`) and fiat-backed **USDC** stablecoins (`payRoyaltyUSDC`).
  - **Checks-Effects-Interactions (CEI)** pattern + OpenZeppelin `ReentrancyGuard` preventing recursive call vulnerabilities.
  - Modern low-level `.call{value: amount}("")` dispatches avoiding legacy 2,300 gas stipends.
  - Zero protocol holding escrow: funds are disbursed to collaborators in the exact identical block.
  - Decentralized IPFS metadata binding (`registerTrackWithIpfs`, `updateTrackIpfsCid`).
- **`ListenToken.sol` (`$LSTN`)**:
  - Capped ERC-20 utility token (1,000,000 max supply).
  - **Cryptographic Stream Validation (Anti-Bot Audio Proofs)** via `rewardListenerWithProof`: verifies ECDSA signatures from authorized stream validator oracles.
  - **Replay Attack Defense**: Consumed proof hashes recorded on-chain (`usedProofHashes`) preventing double claims.
  - **Minimum Stream Duration**: Enforces $\ge 10$ seconds of verified active audio playback.
  - Admin/Owner fallback reward and validator key rotation (`setStreamValidator`).
- **`MockUSDC.sol`**:
  - 6-decimal USD-pegged stablecoin for volatility-free artist royalty accounting and realistic fiat-equivalent payouts.
- **18 Passing Unit Tests**:
  - 100% test suite passing covering reentrancy attacks, BPS sum invariants, stablecoin transfers, anti-bot signatures, and replay protection.

### 2. Decentralized IPFS Audio & Metadata Storage
- **Decentralized Storage Engine** (`frontend/src/utils/ipfs.js`):
  - Pinata IPFS cloud pinning (API / JWT) with fallback to local client-side deterministic CIDv1 (base32 SHA-256) multihash.
  - Multi-gateway resolution (`dweb.link`, `pinata.cloud`, `ipfs.io`, `cloudflare-ipfs.com`).
  - Web3 Music Master Recording Metadata Standard generator.
  - Local session blob caching for zero-latency local playback while decentralized pins propagate.

### 3. Audio Engine & Waveform Analysis
- **Dual-Mode Audio Engine** (`frontend/src/utils/audioSynth.js`):
  - Streams real MP3/WAV audio binary blobs directly from IPFS or local upload.
  - Procedural Web Audio API synthesizer fallback (custom Synthwave, Ambient, and Electro-acoustic loops).
  - Web Audio `AnalyserNode` frequency extraction driving the 3D Lacquer Master Disc grooves and the dock waveform visualizer in real time.

### 4. "Studio Ledger" Web3 Interface
- **Bespoke Visual Identity**:
  - Warm analog mastering studio aesthetic (warm ink `#14120F`, tactile paper `#F6F1E7`, brushed brass `#C9A24B`).
  - Google Fonts: *Fraunces* (editorial serif), *Inter* (body), and *IBM Plex Mono* (tabular financial data).
  - Interactive **3D Lacquer Master Disc** in React Three Fiber with dynamic light beams and mouse parallax.
  - Monospace continuous **Live Ledger Strip** streaming recent block transactions.
- **Role-Based Architecture**:
  - **Listener Portal** (`/app/listen`, `/app/wallet`, `/app/earnings`): Discovery, audio streaming, verified Listen-to-Earn (+10 LSTN) with cryptographic stream vouchers, and token transfers.
  - **Creator Studio** (`/app/dashboard`, `/app/my-tracks`, `/app/payouts`): Real-time incoming royalty stream, 30-day accumulation analytics, track percentage management, and CSV export.
  - **Protocol Analytics** (`/analytics`): Macro royalty volume settled, latency metrics, and cap table distributions.
  - **Platform Admin** (`/app/register-track`): Hardhat Account #0 gated track onboarding with live 10,000 BPS validation and IPFS audio/cover upload.
- **Testing Ergonomics**:
  - Floating **Developer Accounts Drawer** (`[ ⚡ Dev Accounts ]`) allowing one-click switching between Artist, Producer, Songwriter, and Admin accounts without opening MetaMask.

---

## ⚙️ Prerequisites

- **Node.js**: `v18.x` or higher (tested on Node v20/v24).
- **Hardhat**: Bundled in `contracts/package.json`.
- **MetaMask Extension**: Optional (the app includes 4 built-in test accounts pre-funded with 10,000 ETH and 10,000 USDC).

---

## 🚀 Localhost Execution (Quick Start)

Run the entire application locally with a local Ethereum blockchain node:

### 1. Install Dependencies

In your project root:

```bash
# Install smart contract dependencies
cd contracts
npm install

# Install frontend dependencies
cd ../frontend
npm install
```

### 2. Compile Contracts & Run Test Suite

```bash
cd contracts
npx hardhat test
```
*Executes all 18 unit tests covering CEI, reentrancy defense, BPS math, stablecoin splits, and cryptographic stream proofs.*

### 3. Start Local Hardhat Blockchain Node

In a separate terminal window:

```bash
cd contracts
npx hardhat node
```

*Starts a local Ethereum RPC node at `http://127.0.0.1:8545` (Chain ID: `31337`) with 20 pre-funded test accounts (10,000 ETH each).*

### 4. Deploy Smart Contracts & Seed Demo Tracks

In your primary terminal:

```bash
cd contracts
npx hardhat run scripts/deploy.js --network localhost
```

This command automatically:
1. Deploys `MockUSDC` and mints 10,000 USDC to all local test accounts.
2. Deploys `RoyaltySplitter` linked to MockUSDC.
3. Deploys `ListenToken` configured with deployer stream validation.
4. Onboards 3 master tracks with 10,000 BPS splits and IPFS CIDs.
5. Exports updated ABIs and contract addresses directly into `frontend/src/contracts/`.

### 5. Launch the Frontend Application

```bash
cd ../frontend
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your web browser.

---

## 🧑‍💻 Pre-Funded Developer Test Accounts

For evaluation without MetaMask setup, click **`[ ⚡ Dev Accounts ]`** in the bottom-right corner to switch roles:

| Account | Role | Address | Entitled Split |
|---|---|---|---|
| **Account #0** | Deployer / Admin / Oracle | `0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266` | Admin & Stream Validator |
| **Account #1** | Primary Artist (Nova Vale) | `0x70997970C51812dc3A010C7d01b50e0d17dc79C8` | 50.0% – 60.0% BPS |
| **Account #2** | Sound Producer (Kaelen Voss) | `0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC` | 25.0% – 30.0% BPS |
| **Account #3** | Songwriter (Elena Rostova) | `0x90F79bf6EB2c4f870365E785982E1f101E93b906` | 15.0% – 20.0% BPS |

---

## 🎬 Viva / Project Evaluation Walkthrough

For a step-by-step spoken script, live demonstration sequence, and deep-dive technical explanations for evaluators, refer to:
👉 **[VIVA_PRESENTATION_WALKTHROUGH.md](./VIVA_PRESENTATION_WALKTHROUGH.md)**

---

## 📜 Academic Disclaimer

Built for academic demonstration and blockchain protocol evaluation. All transactions execute on the local Hardhat test network (Chain ID: `31337`). No real-world funds or financial liabilities are involved.