import { ethers } from "ethers";

/**
 * Truncate an Ethereum wallet address for display
 */
export function truncateAddress(address) {
  if (!address) return "";
  return `${address.substring(0, 6)}...${address.substring(address.length - 4)}`;
}

/**
 * Format Wei or Eth string to ETH with specified decimal precision
 */
export function formatEth(weiOrEth, decimals = 4) {
  if (weiOrEth === undefined || weiOrEth === null || weiOrEth === "") return "0.00";
  try {
    if (typeof weiOrEth === "string" && weiOrEth.includes(".")) {
      const num = parseFloat(weiOrEth);
      return isNaN(num)
        ? "0.00"
        : num.toLocaleString(undefined, {
            minimumFractionDigits: 2,
            maximumFractionDigits: decimals,
          });
    }
    const formatted = ethers.formatEther(weiOrEth);
    const num = parseFloat(formatted);
    return num.toLocaleString(undefined, {
      minimumFractionDigits: 2,
      maximumFractionDigits: decimals,
    });
  } catch (err) {
    const num = parseFloat(weiOrEth);
    return isNaN(num) ? "0.00" : num.toFixed(decimals);
  }
}

export const formatEtherBalance = formatEth;

/**
 * Format LSTN token Wei (18 decimals)
 */
export function formatLstn(wei, decimals = 2) {
  if (wei === undefined || wei === null) return "0";
  try {
    const formatted = ethers.formatUnits(wei, 18);
    const num = parseFloat(formatted);
    return num.toLocaleString(undefined, {
      minimumFractionDigits: 0,
      maximumFractionDigits: decimals,
    });
  } catch (err) {
    return "0";
  }
}

/**
 * Parse contract & provider errors into clear human-readable strings.
 * Ensures users never see raw hex RPC errors.
 */
export function parseEtherError(error) {
  if (!error) return "An unknown error occurred.";

  // Handle user rejection in MetaMask
  if (
    error.code === 4001 ||
    error.action === "sendTransaction" && error.code === "ACTION_REJECTED" ||
    (error.message && error.message.toLowerCase().includes("user rejected"))
  ) {
    return "Transaction was cancelled in MetaMask.";
  }

  // Handle insufficient funds
  if (
    error.code === "INSUFFICIENT_FUNDS" ||
    (error.message && error.message.toLowerCase().includes("insufficient funds"))
  ) {
    return "Insufficient test ETH balance in your wallet.";
  }

  // Handle wrong network
  if (error.message && error.message.includes("network")) {
    return "Please switch your wallet to Sepolia Testnet or Local Hardhat network.";
  }

  // Handle connection / RPC fetch failure
  if (error.message && error.message.toLowerCase().includes("failed to fetch")) {
    return "Unable to reach local blockchain node. Please ensure 'npx hardhat node' is running.";
  }

  // Custom contract reverts
  if (error.reason) {
    return `Smart Contract Revert: ${error.reason}`;
  }

  if (error.shortMessage) {
    return error.shortMessage;
  }

  if (typeof error === "string") {
    return error;
  }

  if (error.message) {
    // Clean up technical prefixes
    const cleanMsg = error.message
      .replace(/execution reverted: /gi, "")
      .replace(/MetaMask Tx Signature: /gi, "");
    if (cleanMsg.length < 120) return cleanMsg;
  }

  return "Transaction failed on-chain. Please check your network and balance.";
}

/**
 * Target chain constants
 */
export const CHAIN_CONFIG = {
  SEPOLIA: {
    chainIdHex: "0xaa36a7",
    chainIdDec: 11155111,
    chainName: "Ethereum Sepolia Testnet",
    nativeCurrency: { name: "Sepolia ETH", symbol: "ETH", decimals: 18 },
    rpcUrls: ["https://rpc.sepolia.org", "https://ethereum-sepolia-rpc.publicnode.com"],
    blockExplorerUrls: ["https://sepolia.etherscan.io"],
  },
  HARDHAT: {
    chainIdHex: "0x7a69",
    chainIdDec: 31337,
    chainName: "Localhost Hardhat Node",
    nativeCurrency: { name: "Test ETH", symbol: "ETH", decimals: 18 },
    rpcUrls: ["http://127.0.0.1:8545"],
  },
};
