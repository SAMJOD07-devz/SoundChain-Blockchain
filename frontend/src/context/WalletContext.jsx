import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { ethers } from "ethers";
import contractsData from "../contracts/contracts.json";
import { CHAIN_CONFIG, parseEtherError } from "../utils/ethereum";

export const HARDHAT_TEST_ACCOUNTS = [
  {
    id: 0,
    name: "Account #0 (Deployer / Listener)",
    role: "Fan & Listener (Admin)",
    address: "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266",
    privateKey: "0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80",
    description: "Pre-funded with 10,000 ETH",
  },
  {
    id: 1,
    name: "Account #1 (Artist Payee)",
    role: "Artist (50-60% Royalty)",
    address: "0x70997970C51812dc3A010C7d01b50e0d17dc79C8",
    privateKey: "0x59c6995e998f97a5a0044966f0945389dc9e86dae88c7a8412f4603b6b78690d",
    description: "Receives artist royalty splits",
  },
  {
    id: 2,
    name: "Account #2 (Producer Payee)",
    role: "Producer (25-30% Royalty)",
    address: "0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC",
    privateKey: "0x5de4111afa1a4b94908f83103eb1f1706367c2e68ca870fc3fb9a804cdab365a",
    description: "Receives producer royalty splits",
  },
  {
    id: 3,
    name: "Account #3 (Songwriter Payee)",
    role: "Songwriter (15-20% Royalty)",
    address: "0x90F79bf6EB2c4f870365E785982E1f101E93b906",
    privateKey: "0x7c852118294e51e653712a81e05800f419141751be58f605c371e15141b007a6",
    description: "Receives songwriter royalty splits",
  },
];

const WalletContext = createContext();

export function WalletProvider({ children }) {
  const [account, setAccount] = useState(null);
  const [chainId, setChainId] = useState(null);
  const [ethBalance, setEthBalance] = useState("0");
  const [usdcBalance, setUsdcBalance] = useState("0");
  const [lstnBalance, setLstnBalance] = useState("0");
  const [totalListens, setTotalListens] = useState(0);
  const [status, setStatus] = useState("disconnected"); // 'disconnected' | 'connecting' | 'connected' | 'wrong_network'
  const [signer, setSigner] = useState(null);
  const [provider, setProvider] = useState(null);
  const [isTestWalletMode, setIsTestWalletMode] = useState(false);
  const [currentTestAccountIndex, setCurrentTestAccountIndex] = useState(0);

  // Role Management ('fan' | 'creator')
  const [userRole, setUserRoleState] = useState(() => {
    return localStorage.getItem("soundchain_user_role") || "fan";
  });

  const setUserRole = (role) => {
    setUserRoleState(role);
    localStorage.setItem("soundchain_user_role", role);
  };

  const toggleUserRole = () => {
    const nextRole = userRole === "fan" ? "creator" : "fan";
    setUserRole(nextRole);
  };

  // Known creator addresses (Hardhat Accounts #1, #2, #3)
  const CREATOR_ADDRESSES = [
    HARDHAT_TEST_ACCOUNTS[1].address.toLowerCase(),
    HARDHAT_TEST_ACCOUNTS[2].address.toLowerCase(),
    HARDHAT_TEST_ACCOUNTS[3].address.toLowerCase(),
  ];

  const isCreatorPayee = account ? CREATOR_ADDRESSES.includes(account.toLowerCase()) : false;
  const isAdmin = account ? account.toLowerCase() === HARDHAT_TEST_ACCOUNTS[0].address.toLowerCase() : false;

  // Auto-detect role when account changes, unless manually overridden
  useEffect(() => {
    if (!account) return;
    const stored = localStorage.getItem("soundchain_user_role");
    if (!stored) {
      if (isCreatorPayee) {
        setUserRoleState("creator");
      } else {
        setUserRoleState("fan");
      }
    }
  }, [account, isCreatorPayee]);

  const isSupportedChain = useCallback((id) => {
    return id === CHAIN_CONFIG.SEPOLIA.chainIdDec || id === CHAIN_CONFIG.HARDHAT.chainIdDec;
  }, []);

  // Refs to avoid infinite dependency cycles
  const accountRef = React.useRef(account);
  accountRef.current = account;
  const providerRef = React.useRef(provider);
  providerRef.current = provider;
  const chainIdRef = React.useRef(chainId);
  chainIdRef.current = chainId;
  const isTestModeRef = React.useRef(isTestWalletMode);
  isTestModeRef.current = isTestWalletMode;
  const testIndexRef = React.useRef(currentTestAccountIndex);
  testIndexRef.current = currentTestAccountIndex;

  // Fetch balances and contract data for connected account
  const refreshBalances = useCallback(async (currentAccount, currentProvider, currentChainId) => {
    const acc = currentAccount || accountRef.current;
    const prov = currentProvider || providerRef.current;
    if (!acc || !prov) return;

    try {
      const ethBal = await prov.getBalance(acc);
      setEthBalance(ethBal.toString());

      // Fetch Stablecoin USDC Balance
      if (contractsData?.MockUSDC?.address) {
        try {
          const usdcContract = new ethers.Contract(
            contractsData.MockUSDC.address,
            contractsData.MockUSDC.abi,
            prov
          );
          const uBal = await usdcContract.balanceOf(acc);
          setUsdcBalance(ethers.formatUnits(uBal, 6));
        } catch (usdcErr) {
          console.warn("Could not fetch MockUSDC balance:", usdcErr);
        }
      }

      // Fetch Platform Reward Token LSTN Balance
      if (contractsData?.ListenToken?.address) {
        try {
          const tokenContract = new ethers.Contract(
            contractsData.ListenToken.address,
            contractsData.ListenToken.abi,
            prov
          );
          const bal = await tokenContract.balanceOf(acc);
          setLstnBalance(bal.toString());

          const listens = await tokenContract.totalListens(acc);
          setTotalListens(Number(listens));
        } catch (contractErr) {
          console.warn("Could not fetch ListenToken data from contract:", contractErr);
        }
      }
    } catch (err) {
      console.error("Error refreshing wallet balances:", err);
    }
  }, []);

  // Helper to get local RPC URL
  const getLocalRpcUrl = () => {
    return "http://127.0.0.1:8545";
  };

  // Connect Local Hardhat Test Wallet Directly (No MetaMask required)
  const connectTestWallet = useCallback(async (accountIndex = 0) => {
    setStatus("connecting");
    try {
      const testAcc = HARDHAT_TEST_ACCOUNTS[accountIndex];
      const rpcUrl = getLocalRpcUrl();
      const rpcProvider = new ethers.JsonRpcProvider(rpcUrl);
      const testSigner = new ethers.Wallet(testAcc.privateKey, rpcProvider);

      setProvider(rpcProvider);
      setSigner(testSigner);
      setAccount(testAcc.address);
      setChainId(31337);
      setIsTestWalletMode(true);
      setCurrentTestAccountIndex(accountIndex);
      setStatus("connected");

      await refreshBalances(testAcc.address, rpcProvider, 31337);
    } catch (err) {
      console.error("Test wallet connection error:", err);
      setStatus("disconnected");
      throw err;
    }
  }, [refreshBalances]);

  // Connect via MetaMask / Browser Wallet
  const connectWallet = async () => {
    if (!window.ethereum) {
      // If MetaMask is not installed, automatically connect local test wallet!
      console.log("No MetaMask found, connecting default Local Hardhat Test Wallet...");
      await connectTestWallet(0);
      return;
    }

    setStatus("connecting");
    try {
      const browserProvider = new ethers.BrowserProvider(window.ethereum);
      const accounts = await browserProvider.send("eth_requestAccounts", []);
      
      if (!accounts || accounts.length === 0) {
        setStatus("disconnected");
        return;
      }

      const network = await browserProvider.getNetwork();
      const currentChainId = Number(network.chainId);
      const userSigner = await browserProvider.getSigner();

      setProvider(browserProvider);
      setSigner(userSigner);
      setAccount(accounts[0]);
      setChainId(currentChainId);
      setIsTestWalletMode(false);

      if (isSupportedChain(currentChainId)) {
        setStatus("connected");
        await refreshBalances(accounts[0], browserProvider, currentChainId);
      } else {
        setStatus("wrong_network");
      }
    } catch (err) {
      setStatus("disconnected");
      throw err;
    }
  };

  // Disconnect Wallet
  const disconnectWallet = () => {
    setAccount(null);
    setChainId(null);
    setSigner(null);
    setEthBalance("0");
    setLstnBalance("0");
    setTotalListens(0);
    setIsTestWalletMode(false);
    setStatus("disconnected");
  };

  // Switch Network to Sepolia
  const switchToSepolia = async () => {
    if (!window.ethereum) return;
    try {
      await window.ethereum.request({
        method: "wallet_switchEthereumChain",
        params: [{ chainId: CHAIN_CONFIG.SEPOLIA.chainIdHex }],
      });
    } catch (error) {
      if (error.code === 4902) {
        await window.ethereum.request({
          method: "wallet_addEthereumChain",
          params: [
            {
              chainId: CHAIN_CONFIG.SEPOLIA.chainIdHex,
              chainName: CHAIN_CONFIG.SEPOLIA.chainName,
              rpcUrls: CHAIN_CONFIG.SEPOLIA.rpcUrls,
              nativeCurrency: CHAIN_CONFIG.SEPOLIA.nativeCurrency,
              blockExplorerUrls: CHAIN_CONFIG.SEPOLIA.blockExplorerUrls,
            },
          ],
        });
      } else {
        throw error;
      }
    }
  };

  // Switch Network to Local Hardhat
  const switchToLocalhost = async () => {
    if (isTestWalletMode) {
      await connectTestWallet(currentTestAccountIndex);
      return;
    }
    if (!window.ethereum) {
      await connectTestWallet(0);
      return;
    }
    try {
      await window.ethereum.request({
        method: "wallet_switchEthereumChain",
        params: [{ chainId: CHAIN_CONFIG.HARDHAT.chainIdHex }],
      });
    } catch (error) {
      if (error.code === 4902) {
        await window.ethereum.request({
          method: "wallet_addEthereumChain",
          params: [
            {
              chainId: CHAIN_CONFIG.HARDHAT.chainIdHex,
              chainName: CHAIN_CONFIG.HARDHAT.chainName,
              rpcUrls: CHAIN_CONFIG.HARDHAT.rpcUrls,
              nativeCurrency: CHAIN_CONFIG.HARDHAT.nativeCurrency,
            },
          ],
        });
      } else {
        throw error;
      }
    }
  };

  // Event Listeners for MetaMask
  useEffect(() => {
    if (!window.ethereum || isTestWalletMode) return;

    const handleAccountsChanged = async (accounts) => {
      if (!accounts || accounts.length === 0) {
        disconnectWallet();
      } else {
        setAccount(accounts[0]);
        if (provider) {
          const userSigner = await provider.getSigner();
          setSigner(userSigner);
          refreshBalances(accounts[0], provider, chainId);
        }
      }
    };

    const handleChainChanged = (newChainIdHex) => {
      const newChainId = parseInt(newChainIdHex, 16);
      setChainId(newChainId);
      if (account && isSupportedChain(newChainId)) {
        setStatus("connected");
        if (provider) refreshBalances(account, provider, newChainId);
      } else if (account) {
        setStatus("wrong_network");
      }
    };

    window.ethereum.on("accountsChanged", handleAccountsChanged);
    window.ethereum.on("chainChanged", handleChainChanged);

    return () => {
      if (window.ethereum?.removeListener) {
        window.ethereum.removeListener("accountsChanged", handleAccountsChanged);
        window.ethereum.removeListener("chainChanged", handleChainChanged);
      }
    };
  }, [isSupportedChain]);

  // Auto-connect Test Wallet on initial mount if running locally
  useEffect(() => {
    connectTestWallet(0).catch(() => {
      console.log("Local node ready on demand.");
    });
  }, []);

  // Instantiate Smart Contracts
  const getRoyaltySplitterContract = useCallback((asAdmin = false) => {
    if (!contractsData?.RoyaltySplitter?.address) return null;
    let runner = signer || provider;

    // Use direct local RPC proxy with test wallet credentials when on test mode or asAdmin
    if ((asAdmin || isTestWalletMode) && HARDHAT_TEST_ACCOUNTS[0]) {
      const rpcUrl = getLocalRpcUrl();
      const adminProvider = new ethers.JsonRpcProvider(rpcUrl);
      const accIndex = asAdmin ? 0 : currentTestAccountIndex;
      runner = new ethers.Wallet(HARDHAT_TEST_ACCOUNTS[accIndex].privateKey, adminProvider);
    }

    if (!runner) return null;
    return new ethers.Contract(
      contractsData.RoyaltySplitter.address,
      contractsData.RoyaltySplitter.abi,
      runner
    );
  }, [signer, provider, isTestWalletMode, currentTestAccountIndex]);

  const getListenTokenContract = useCallback((asAdmin = false) => {
    if (!contractsData?.ListenToken?.address) return null;
    let runner = signer || provider;

    if ((asAdmin || isTestWalletMode) && HARDHAT_TEST_ACCOUNTS[0]) {
      const rpcUrl = getLocalRpcUrl();
      const adminProvider = new ethers.JsonRpcProvider(rpcUrl);
      const accIndex = asAdmin ? 0 : currentTestAccountIndex;
      runner = new ethers.Wallet(HARDHAT_TEST_ACCOUNTS[accIndex].privateKey, adminProvider);
    }

    if (!runner) return null;
    return new ethers.Contract(
      contractsData.ListenToken.address,
      contractsData.ListenToken.abi,
      runner
    );
  }, [signer, provider, isTestWalletMode, currentTestAccountIndex]);

  const getMockUsdcContract = useCallback((asAdmin = false) => {
    if (!contractsData?.MockUSDC?.address) return null;
    let runner = signer || provider;

    if ((asAdmin || isTestWalletMode) && HARDHAT_TEST_ACCOUNTS[0]) {
      const rpcUrl = getLocalRpcUrl();
      const adminProvider = new ethers.JsonRpcProvider(rpcUrl);
      const accIndex = asAdmin ? 0 : currentTestAccountIndex;
      runner = new ethers.Wallet(HARDHAT_TEST_ACCOUNTS[accIndex].privateKey, adminProvider);
    }

    if (!runner) return null;
    return new ethers.Contract(
      contractsData.MockUSDC.address,
      contractsData.MockUSDC.abi,
      runner
    );
  }, [signer, provider, isTestWalletMode, currentTestAccountIndex]);

  return (
    <WalletContext.Provider
      value={{
        account,
        chainId,
        ethBalance,
        usdcBalance,
        lstnBalance,
        totalListens,
        status,
        signer,
        provider,
        contractsData,
        isTestWalletMode,
        currentTestAccountIndex,
        testAccounts: HARDHAT_TEST_ACCOUNTS,
        isCorrectNetwork: isSupportedChain(chainId),
        isSepolia: chainId === CHAIN_CONFIG.SEPOLIA.chainIdDec,
        isLocalhost: chainId === CHAIN_CONFIG.HARDHAT.chainIdDec || isTestWalletMode,
        userRole,
        setUserRole,
        toggleUserRole,
        isCreatorPayee,
        isAdmin,
        creatorLifetimeEth: isCreatorPayee ? "0.0425" : "0.0150",
        creatorLifetimeUsdc: isCreatorPayee ? "425.00" : "150.00",
        connectWallet,
        connectTestWallet,
        disconnectWallet,
        switchToSepolia,
        switchToLocalhost,
        refreshBalances: () => refreshBalances(account, provider, chainId),
        getRoyaltySplitterContract,
        getListenTokenContract,
        getMockUsdcContract,
      }}
    >
      {children}
    </WalletContext.Provider>
  );
}

export function useWallet() {
  const context = useContext(WalletContext);
  if (!context) {
    throw new Error("useWallet must be used within a WalletProvider");
  }
  return context;
}
