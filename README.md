# SoundChain — Decentralized Music Royalty Settlement Protocol

> 📖 **Live Presentation & Viva Guide:** A complete step-by-step presentation script, architecture defense, and Q&A preparation is in [VIVA_PRESENTATION_WALKTHROUGH.md](./VIVA_PRESENTATION_WALKTHROUGH.md).

**SoundChain** is a decentralized music royalty settlement protocol and listen-to-earn Web3 application built on Ethereum (Solidity 0.8.20 + Hardhat) and React 18 (Vite + Tailwind CSS + Three.js).

It eliminates the 60-to-180-day royalty escrow delays and opaque 15–35% deductions of traditional streaming platforms by automatically executing atomic, mathematically verified splits down to the wei using 10,000 Basis Points (BPS).

---

## 🎯 Features & 50% Milestone Implementation

### 1. Smart Contracts & EVM Core
- **`RoyaltySplitter.sol`**:
  - Exact integer math using **10,000 Basis Points (BPS)** ($\sum = 10,000 \equiv 100.00\%$) ensuring zero float rounding loss.
  - **Checks-Effects-Interactions (CEI)** pattern + OpenZeppelin `ReentrancyGuard` preventing recursive call vulnerabilities.
  - Modern low-level `.call{value: amount}("")` dispatches avoiding legacy 2,300 gas stipends.
  - Zero protocol holding escrow: funds are disbursed to collaborators in the exact identical block.
- **`ListenToken.sol` (`$LSTN`)**:
  - Capped ERC-20 utility token (1,000,000 max supply).
  - Admin-gated `rewardListener` functionality for verified listening sessions.
- **100% Passing Test Suite**:
  - Unit tests covering reentrancy attack prevention, BPS sum validation, and access control.

### 2. "Studio Ledger" Web3 Interface
- **Bespoke Visual Identity**:
  - Warm analog mastering studio aesthetic (warm ink `#14120F`, tactile paper `#F6F1E7`, brushed brass `#C9A24B`).
  - Google Fonts: *Fraunces* (editorial serif), *Inter* (body), and *IBM Plex Mono* (tabular financial data).
  - Interactive **3D Lacquer Master Disc** in React Three Fiber with dynamic light beams and mouse parallax.
  - Monospace continuous **Live Ledger Strip** streaming recent block transactions.
- **Role-Based Architecture**:
  - **Listener Portal** (`/app/listen`, `/app/wallet`, `/app/earnings`): Discovery, audio streaming, verified Listen-to-Earn (+10 LSTN), and wallet transfers.
  - **Creator Studio** (`/app/dashboard`, `/app/my-tracks`, `/app/payouts`): Real-time incoming royalty stream, 30-day accumulation analytics, track percentage management, and CSV export.
  - **Platform Admin** (`/app/register-track`): Hardhat Account #0 gated track onboarding with live 10,000 BPS validation.
- **Testing Ergonomics**:
  - Floating **Developer Accounts Drawer** (`[ ⚡ Dev Accounts ]`) allowing one-click switching between Artist, Producer, Songwriter, and Admin accounts without opening MetaMask.

---

## ⚙️ Prerequisites

- **Node.js**: `v18.x` or higher (tested on Node v20/v24).
- **MetaMask Extension** (optional for local demo; app includes built-in test wallets).
- **Testnet ETH**: Localhost Hardhat test ETH or Sepolia.

---

## 🚀 Quick Start & Installation

### 1. Clone & Install Dependencies

```bash
git clone https://github.com/SAMJOD07-devz/SoundChain-Blockchain.git
cd SoundChain-Blockchain

# Install Smart Contract Dependencies
cd contracts
npm install

# Install Frontend Dependencies
cd ../frontend
npm install
```

---

## 🛠️ Smart Contracts Setup & Local Deployment

### 1. Compile Contracts & Run Tests

```bash
cd contracts

# Compile Solidity 0.8.20 smart contracts
npx hardhat compile

# Execute test suite (11 unit tests covering reentrancy & BPS rules)
npx hardhat test
```

### 2. Run Local Hardhat Blockchain Node

In a separate terminal window:

```bash
cd contracts
npx hardhat node
```

*Starts a local Ethereum RPC node at `http://127.0.0.1:8545` (Chain ID: `31337`) with pre-funded accounts (10,000 ETH each).*

### 3. Deploy Smart Contracts & Register Seed Tracks

In your main terminal:

```bash
cd contracts
npx hardhat run scripts/deploy.js --network localhost
```

> *This automatically exports `contracts.json`, `RoyaltySplitter.json`, and `ListenToken.json` directly into `frontend/src/contracts/`.*

---

## 💻 Running the Frontend Application

```bash
cd frontend
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 🌐 Sepolia Testnet Deployment Configuration

To deploy to Ethereum Sepolia Testnet:

1. Copy `.env.example` to `.env` in `contracts/`:
   ```bash
   cp contracts/.env.example contracts/.env
   ```
2. Configure your RPC URL and private key:
   ```env
   SEPOLIA_RPC_URL=https://rpc.sepolia.org
   PRIVATE_KEY=your_testnet_private_key_here
   ```
3. Run deploy command:
   ```bash
   npx hardhat run scripts/deploy.js --network sepolia
   ```

---

## 🎬 Live Presentation / Viva Demonstration

For a step-by-step spoken script, 50% milestone defense, and answers to common evaluators' questions, see:
👉 **[VIVA_PRESENTATION_WALKTHROUGH.md](./VIVA_PRESENTATION_WALKTHROUGH.md)**

---

## 📜 License & Academic Disclaimer

Built for educational demonstration and blockchain course evaluation. All smart contracts operate on Ethereum local testnets or testnet faucets. No real funds or financial liabilities are involved.