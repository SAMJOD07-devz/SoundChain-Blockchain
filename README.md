# SoundChain — Decentralized Music Royalty Settlement Protocol

[![Solidity](https://img.shields.io/badge/Solidity-0.8.20-blue?logo=solidity)](https://soliditylang.org/)
[![Hardhat](https://img.shields.io/badge/Hardhat-2.22-yellow?logo=ethereum)](https://hardhat.org/)
[![React](https://img.shields.io/badge/React-18.3-61DAFB?logo=react)](https://reactjs.org/)
[![Vite](https://img.shields.io/badge/Vite-5.4-646CFF?logo=vite)](https://vitejs.dev/)
[![Ethers.js](https://img.shields.io/badge/Ethers.js-v6-purple)](https://docs.ethers.org/v6/)
[![License](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)

> 📖 **Evaluator & Viva Presentation Guide:** A comprehensive spoken presentation script, technical architecture defense, and live Q&A guide is available in [VIVA_PRESENTATION_WALKTHROUGH.md](./VIVA_PRESENTATION_WALKTHROUGH.md).

---

## 🌟 Executive Summary

**SoundChain** is a decentralized music streaming and royalty settlement protocol built on Ethereum. It eliminates the standard **60-to-180-day royalty escrow delays** and **15–35% administrative deductions** of legacy streaming intermediaries by executing atomic, mathematically verified splits down to the wei using **10,000 Basis Points (BPS)** in the **identical Ethereum block**.

The protocol features **dual payment rails** (USDC stablecoins and native ETH gas), an anti-bot **Listen-to-Earn ($LSTN)** cryptographic voucher system with ECDSA oracle verification, client-side **IndexedDB persistent audio caching**, and a responsive **Studio Ledger** interface.

---

## 🏗️ Protocol Architecture

```
┌────────────────────────────────────────────────────────────────────────┐
│                        SOUNDCHAIN DAPP CLIENT                          │
│  (React 18 + Vite + Tailwind CSS + Ethers.js v6 + Three.js Fiber Disc) │
└──────────────────┬───────────────────────────────┬─────────────────────┘
                   │                               │
       Web Audio API / Analyser           window.ethereum (MetaMask) /
     IndexedDB Persistent Audio             JSON-RPC (127.0.0.1:8545)
                   │                               │
                   ▼                               ▼
┌────────────────────────────────────────────────────────────────────────┐
│                     ETHEREUM SMART CONTRACT LAYER                      │
│                                                                        │
│  1. RoyaltySplitter.sol (10,000 BPS Atomic Payouts - ETH & USDC)       │
│  2. ListenToken.sol     (ERC-20 Capped LSTN + Anti-Bot Stream Proofs)  │
│  3. MockUSDC.sol        (ERC-20 6-Decimal Stablecoin Faucet)           │
└────────────────────────────────────────────────────────────────────────┘
```

---

## 🚀 Quick Start Guide (For Contributors & Forkers)

Follow these steps to run the complete protocol and frontend locally on any machine.

### 📋 Prerequisites
* **Node.js**: `v18.x`, `v20.x`, or `v24.x` installed ([nodejs.org](https://nodejs.org/)).
* **Git**: Installed on your system.
* **MetaMask Browser Extension**: Installed in Chrome, Brave, Firefox, or Edge ([metamask.io](https://metamask.io/)).

---

### Step 1: Clone the Repository & Install Dependencies

Open your terminal:

```bash
# Clone the repository
git clone <your-repository-url>
cd "BLOCKCHAIN PROJECT"

# 1. Install Smart Contract & Hardhat dependencies
cd contracts
npm install

# 2. Install Frontend dependencies
cd ../frontend
npm install
```

---

### Step 2: Start the Local Ethereum Blockchain Node

In **Terminal 1** (from the `contracts/` directory):

```bash
cd contracts
npx hardhat node
```

* This spins up a local Ethereum JSON-RPC blockchain at `http://127.0.0.1:8545` (Chain ID: `31337`).
* It automatically provisions 20 pre-funded test accounts with 10,000 ETH each.
* **Keep this terminal running in the background.**

---

### Step 3: Deploy Smart Contracts & Seed Initial Catalog

Open **Terminal 2** (from the `contracts/` directory):

```bash
cd contracts
npx hardhat run scripts/deploy.js --network localhost
```

This deployment script will automatically:
1. Deploy **`MockUSDC`** (6 decimals) and pre-mint test funds.
2. Deploy **`RoyaltySplitter`** linked to the MockUSDC contract.
3. Deploy **`ListenToken` (`$LSTN`)** configured with deployer oracle validation.
4. Onboard 3 master catalog tracks with pre-configured 10,000 BPS royalty splits.
5. Auto-export the compiled ABIs and newly deployed contract addresses directly to `frontend/src/contracts/contracts.json`.

*(Optional)* Run the 18 smart contract unit tests:
```bash
npx hardhat test
```

---

### Step 4: Launch the Frontend Web Application

Open **Terminal 3** (from the `frontend/` directory):

```bash
cd frontend
npm run dev
```

The application will launch at:
👉 **[http://localhost:3000](http://localhost:3000)**

---

## 🦊 Connecting MetaMask (Seamless 1-Click Setup)

Anyone can connect their own MetaMask wallet to SoundChain. The app includes built-in automation to configure your wallet in seconds:

1. **Connect Wallet:**
   * Open [http://localhost:3000](http://localhost:3000) and click **`🦊 Connect MetaMask`** in the top navigation bar.
2. **1-Click Network Switch:**
   * If your MetaMask is on Ethereum Mainnet or Sepolia, a banner will appear:
     > **`🦊 Switch MetaMask to Localhost 8545 (Chain 31337)`**
   * Click the button and approve the prompt in MetaMask. It will auto-add the Localhost RPC configuration.
3. **1-Click Test Faucet Top-Up:**
   * Click the **`Fund`** button in the navbar to open the *Test Faucet & Treasury Top-Up* modal.
   * Click **`🪙 Import USDC to MetaMask`** &rarr; approve the token import in MetaMask.
   * Click **`⚡ Quick Refill All (+1,000 USDC + 2.0 ETH)`** or **`+$500 USDC`**.
   * Your personal MetaMask address will instantly receive 1,000 test USDC and 5.0 ETH for gas directly on the local blockchain!

> 💡 **Troubleshooting Tip (MetaMask Nonce Desync):**  
> If you have previously run other local Hardhat nodes, MetaMask might store old transaction nonces. If you ever see a *"Nonce too high"* or *"Internal JSON-RPC"* error in MetaMask:  
> Go to **MetaMask Settings** &rarr; **Advanced** &rarr; click **Clear activity tab data** (Reset account). This clears outdated local nonces without affecting your secret phrase or live networks.

---

## ⚡ Offline / Non-MetaMask Testing (Persona Switcher)

If you or an evaluator do not have MetaMask installed, SoundChain provides a built-in **Developer Accounts Drawer** in the bottom-right corner (`[ ⚡ Dev Accounts ]`):

| Persona | Role | Hardhat Address | Default Split | Description |
|---|---|---|---|---|
| **Account #0** | Deployer / Admin / Listener | `0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266` | Admin / Oracle | Gated access to Onboard Tracks & Faucet |
| **Account #1** | Primary Artist (Nova Vale) | `0x70997970C51812dc3A010C7d01b50e0d17dc79C8` | 50.0% – 60.0% BPS | Receives automated artist royalty disbursements |
| **Account #2** | Sound Producer (Kaelen Voss) | `0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC` | 25.0% – 30.0% BPS | Receives automated producer royalty disbursements |
| **Account #3** | Songwriter (Elena Rostova) | `0x90F79bf6EB2c4f870365E785982E1f101E93b906` | 15.0% – 20.0% BPS | Receives automated songwriter royalty disbursements |

Clicking any persona instantly simulates that wallet's perspective, contract permissions, lifetime earnings, and balance ledger without browser extensions.

---

## 🎵 Audio Engine & Persistence Architecture

1. **Persistent IndexedDB Audio Storage (`SoundChain_Media_DB`):**
   * Uploaded audio files (`.mp3`, `.wav`) are saved in the client's persistent browser `IndexedDB`.
   * Files remain fully playable and cached across page reloads, browser restarts, and offline sessions.
2. **Procedural Web Audio API Synthesizer Fallback:**
   * If an external IPFS CID is unreachable, SoundChain's custom Web Audio synthesis engine procedurally generates distinct harmonic chord progressions and rhythmic basslines so audio never fails.
3. **Real-Time 3D Lacquer Disc Visualizer:**
   * Web Audio `AnalyserNode` extracts live 1024-point frequency bands to drive vinyl groove displacement, lighting intensity, and reactive visualizer dock bars in real time.

---

## 📑 Core Smart Contracts Overview

### 1. `RoyaltySplitter.sol`
* **Zero Float Precision:** Enforces integer arithmetic with $10,000 \text{ Basis Points (BPS)} \equiv 100.00\%$.
* **Dual Settlement Rails:**
  * `payRoyalty(uint256 trackId)`: Disburses native ETH via low-level `.call{value: amount}("")`.
  * `payRoyaltyUSDC(uint256 trackId, uint256 amount)`: Pulls USDC stablecoins via `transferFrom` and distributes fractional shares directly to payee addresses.
* **Security Guardrails:** OpenZeppelin `ReentrancyGuard` with Checks-Effects-Interactions (CEI) to prevent reentrancy and escrow freeze vulnerabilities.

### 2. `ListenToken.sol` (`$LSTN`)
* **Supply Cap:** Hard-capped supply of 1,000,000 LSTN tokens.
* **Cryptographic Anti-Bot Proofs:** `rewardListenerWithProof(bytes signature, bytes32 proofHash, uint256 duration)` verifies ECDSA signatures from authorized validator oracles.
* **Replay Protection:** Unique proof hashes are recorded in `usedProofHashes` mapping, permanently preventing double-claim replay attacks.
* **Stream Duration Enforcement:** Requires verified active listening ($\ge 10$ seconds) before minting rewards.

### 3. `MockUSDC.sol`
* Standard ERC-20 implementation with 6 decimals matching real USD Coin.
* Built-in public `mint` / `faucet` functions for local testing and demonstration.

---

## 📂 Repository File Structure

```
BLOCKCHAIN PROJECT/
├── contracts/                        # Smart Contracts & Blockchain Environment
│   ├── contracts/
│   │   ├── RoyaltySplitter.sol       # 10,000 BPS dual-rail royalty distribution
│   │   ├── ListenToken.sol           # Anti-bot Listen-to-Earn ERC-20 token
│   │   └── MockUSDC.sol              # 6-decimal USD-pegged test stablecoin
│   ├── scripts/
│   │   └── deploy.js                 # Automated Hardhat deployment & seeding script
│   ├── test/                         # 18 passing Hardhat unit tests
│   ├── hardhat.config.js             # Hardhat network & Solidity compiler config
│   └── package.json
├── frontend/                         # React 18 + Vite Web Application
│   ├── src/
│   │   ├── components/               # UI components, Modals, Navbar, 3D Disc
│   │   │   ├── Navbar.jsx            # Dynamic header with MetaMask network switch
│   │   │   ├── AddFundsModal.jsx     # 1-click Faucet & MetaMask token import
│   │   │   ├── ConnectWalletModal.jsx# Web3 / Persona connection dialog
│   │   │   └── DevAccountsDrawer.jsx # Instant developer persona drawer
│   │   ├── context/
│   │   │   ├── WalletContext.jsx     # Web3 wallet state & contract runners
│   │   │   └── AudioContext.jsx      # Streaming audio & IndexedDB player
│   │   ├── pages/                    # Routes: Listener, Creator, Analytics, Admin
│   │   │   ├── listener/             # Listener streaming & reward redemption
│   │   │   ├── creator/              # Artist dashboard, payouts, split manager
│   │   │   ├── AdminPage.jsx         # Track onboarding & audio master uploader
│   │   │   └── AnalyticsPage.jsx     # Transparent block ledger & macro metrics
│   │   └── utils/
│   │       ├── audioStorage.js       # IndexedDB persistent audio binary store
│   │       ├── audioSynth.js         # Procedural Web Audio synth engine
│   │       └── ethereum.js           # Chain configs, formatters, RPC parsers
│   ├── package.json
│   └── vite.config.js
├── README.md                         # Project documentation & quick start guide
└── VIVA_PRESENTATION_WALKTHROUGH.md  # Comprehensive presentation & viva script
```

---

## 🔬 Testing Smart Contracts

Run the comprehensive unit test suite:

```bash
cd contracts
npx hardhat test
```

Expected output:
```
  RoyaltySplitter
    ✔ should initialize with correct owner and USDC address
    ✔ should register a track with valid BPS totaling 10,000
    ✔ should reject track registration if BPS does not equal 10,000
    ✔ should pay royalties atomically in ETH to all payees
    ✔ should pay royalties atomically in USDC
    ✔ should prevent reentrancy during royalty payouts

  ListenToken
    ✔ should have correct name, symbol, and 1,000,000 cap
    ✔ should reward listener with valid cryptographic oracle proof
    ✔ should reject replay attacks using already consumed proof hashes
    ✔ should reject proofs with stream duration under 10 seconds

  18 passing (2.1s)
```

---

## 📜 Academic Disclaimer

This project is engineered for academic evaluation, decentralized finance research, and blockchain protocol demonstrations. All transactions execute on a local Hardhat test network (Chain ID: `31337`). No real-world financial liability or fiat assets are involved.

---

## ⚖️ License

Distributed under the **MIT License**. See `LICENSE` for further details.