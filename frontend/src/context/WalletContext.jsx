import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from "react";
import { ethers } from "ethers";
import contractsData from "../contracts/contracts.json";
import { CHAIN_CONFIG, parseEtherError } from "../utils/ethereum";
// ==============================================================================
// PUBLIC HARDHAT TEST ACCOUNTS (Localhost Chain ID: 31337)
// NOTE: These are standard, publicly known test keys derived from Hardhat's default
// mnemonic ("test test test test test test test test test test test junk").
// These accounts contain NO REAL ASSETS and are strictly for local emulated dev/testing.
// DO NOT USE THESE KEYS WITH REAL ASSETS OR ON ETHEREUM MAINNET.
// ==============================================================================
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

// Rich baseline demo balances (persisted in localStorage)
const DEFAULT_TEST_BALANCES = {
  [HARDHAT_TEST_ACCOUNTS[0].address.toLowerCase()]: {
    eth: "10000.0",
    usdc: "5000.00",
    lstn: "250",
    totalListens: 25,
    lifetimeUsdc: "0.00",
  },
  [HARDHAT_TEST_ACCOUNTS[1].address.toLowerCase()]: {
    eth: "10000.0",
    usdc: "1250.00",
    lstn: "80",
    totalListens: 8,
    lifetimeUsdc: "425.00",
  },
  [HARDHAT_TEST_ACCOUNTS[2].address.toLowerCase()]: {
    eth: "10000.0",
    usdc: "750.00",
    lstn: "45",
    totalListens: 4,
    lifetimeUsdc: "250.00",
  },
  [HARDHAT_TEST_ACCOUNTS[3].address.toLowerCase()]: {
    eth: "10000.0",
    usdc: "500.00",
    lstn: "30",
    totalListens: 3,
    lifetimeUsdc: "175.00",
  },
};

const STORAGE_KEY_BALANCES = "soundchain_test_balances";

function getStoredBalances() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_BALANCES);
    if (!raw) return DEFAULT_TEST_BALANCES;
    const parsed = JSON.parse(raw);
    return { ...DEFAULT_TEST_BALANCES, ...parsed };
  } catch {
    return DEFAULT_TEST_BALANCES;
  }
}

function saveStoredBalances(data) {
  try {
    localStorage.setItem(STORAGE_KEY_BALANCES, JSON.stringify(data));
  } catch (err) {
    console.warn("Could not save to localStorage:", err);
  }
}

const WalletContext = createContext();

export function WalletProvider({ children }) {
  const [account, setAccount] = useState(null);
  const [chainId, setChainId] = useState(null);
  const [ethBalance, setEthBalance] = useState("10000.0");
  const [usdcBalance, setUsdcBalance] = useState("5000.00");
  const [lstnBalance, setLstnBalance] = useState("250");
  const [totalListens, setTotalListens] = useState(25);
  const [status, setStatus] = useState("disconnected"); // 'disconnected' | 'connecting' | 'connected' | 'wrong_network'
  const [signer, setSigner] = useState(null);
  const [provider, setProvider] = useState(null);
  const [isTestWalletMode, setIsTestWalletMode] = useState(false);
  const [currentTestAccountIndex, setCurrentTestAccountIndex] = useState(0);
  const [isNodeOnline, setIsNodeOnline] = useState(false);

  // Modal Visibility States
  const [isConnectModalOpen, setIsConnectModalOpen] = useState(false);
  const [isAddFundsModalOpen, setIsAddFundsModalOpen] = useState(false);

  const openConnectModal = useCallback(() => setIsConnectModalOpen(true), []);
  const closeConnectModal = useCallback(() => setIsConnectModalOpen(false), []);

  const openAddFundsModal = useCallback(() => setIsAddFundsModalOpen(true), []);
  const closeAddFundsModal = useCallback(() => setIsAddFundsModalOpen(false), []);

  // Mutable refs to prevent circular re-render cascades
  const accountRef = useRef(account);
  accountRef.current = account;
  const providerRef = useRef(provider);
  providerRef.current = provider;
  const signerRef = useRef(signer);
  signerRef.current = signer;
  const isNodeOnlineRef = useRef(isNodeOnline);
  isNodeOnlineRef.current = isNodeOnline;
  const testIndexRef = useRef(currentTestAccountIndex);
  testIndexRef.current = currentTestAccountIndex;
  const isTestModeRef = useRef(isTestWalletMode);
  isTestModeRef.current = isTestWalletMode;

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

  const getLocalRpcUrl = () => "http://127.0.0.1:8545";

  // Check if Local Hardhat Node is reachable
  const checkNodeLiveness = useCallback(async () => {
    try {
      const res = await fetch("http://127.0.0.1:8545", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ jsonrpc: "2.0", method: "eth_blockNumber", params: [], id: 1 }),
        signal: AbortSignal.timeout(1200),
      });
      const data = await res.json();
      const online = !!data?.result;
      setIsNodeOnline(online);
      isNodeOnlineRef.current = online;
      return online;
    } catch {
      setIsNodeOnline(false);
      isNodeOnlineRef.current = false;
      return false;
    }
  }, []);

  useEffect(() => {
    checkNodeLiveness();
    const interval = setInterval(checkNodeLiveness, 12000);
    return () => clearInterval(interval);
  }, [checkNodeLiveness]);

  // Dynamic Lifetime figures
  const storedStore = getStoredBalances();
  const currentKey = account ? account.toLowerCase() : HARDHAT_TEST_ACCOUNTS[0].address.toLowerCase();
  const accountMeta = storedStore[currentKey] || DEFAULT_TEST_BALANCES[HARDHAT_TEST_ACCOUNTS[0].address.toLowerCase()];

  const creatorLifetimeUsdc = isCreatorPayee ? (accountMeta.lifetimeUsdc || "425.00") : "150.00";
  const creatorLifetimeEth = isCreatorPayee ? "0.0425" : "0.0150";

  // Refresh balances (Contract with graceful fallback to persistent state)
  const refreshBalances = useCallback(async (currentAccount, currentProvider) => {
    const acc = currentAccount || accountRef.current;
    if (!acc) return;

    const lower = acc.toLowerCase();
    const balances = getStoredBalances();
    const localAcc = balances[lower] || {
      eth: "10.0",
      usdc: "500.00",
      lstn: "50",
      totalListens: 5,
      lifetimeUsdc: "0.00",
    };

    let syncedWithChain = false;

    // Attempt live chain reconciliation if node is online
    const prov = currentProvider || providerRef.current;
    if (prov && isNodeOnlineRef.current) {
      try {
        const ethBal = await prov.getBalance(acc);
        const ethStr = ethers.formatEther(ethBal);
        setEthBalance(ethStr);
        localAcc.eth = ethStr;

        if (contractsData?.MockUSDC?.address) {
          try {
            const usdcContract = new ethers.Contract(
              contractsData.MockUSDC.address,
              contractsData.MockUSDC.abi,
              prov
            );
            const uBal = await usdcContract.balanceOf(acc);
            const formattedUsdc = ethers.formatUnits(uBal, 6);
            setUsdcBalance(formattedUsdc);
            localAcc.usdc = formattedUsdc;
          } catch (usdcErr) {
            console.warn("USDC balance read warning:", usdcErr);
          }
        }

        if (contractsData?.ListenToken?.address) {
          try {
            const tokenContract = new ethers.Contract(
              contractsData.ListenToken.address,
              contractsData.ListenToken.abi,
              prov
            );
            const bal = await tokenContract.balanceOf(acc);
            const formattedLstn = ethers.formatUnits(bal, 18);
            const lstnVal = formattedLstn.split(".")[0] || "0";
            setLstnBalance(lstnVal);
            localAcc.lstn = lstnVal;

            const listens = await tokenContract.totalListens(acc);
            setTotalListens(Number(listens));
            localAcc.totalListens = Number(listens);
          } catch (contractErr) {
            console.warn("ListenToken balance read warning:", contractErr);
          }
        }

        balances[lower] = localAcc;
        saveStoredBalances(balances);
        syncedWithChain = true;
      } catch (err) {
        console.warn("Chain sync unavailable, utilizing local persistent ledger:", err);
      }
    }

    if (!syncedWithChain) {
      setEthBalance(localAcc.eth || "10.0");
      setUsdcBalance(localAcc.usdc || "500.00");
      setLstnBalance(localAcc.lstn || "50");
      setTotalListens(Number(localAcc.totalListens || 0));
    }
  }, []);

  // Connect Local Hardhat Test Wallet Directly (No MetaMask required)
  const connectTestWallet = useCallback(async (accountIndex = 0) => {
    setStatus("connecting");
    try {
      const testAcc = HARDHAT_TEST_ACCOUNTS[accountIndex];
      const rpcUrl = "http://127.0.0.1:8545";
      const rpcProvider = new ethers.JsonRpcProvider(rpcUrl);
      const testSigner = new ethers.Wallet(testAcc.privateKey, rpcProvider);

      setProvider(rpcProvider);
      providerRef.current = rpcProvider;
      setSigner(testSigner);
      signerRef.current = testSigner;
      setAccount(testAcc.address);
      accountRef.current = testAcc.address;
      setChainId(31337);
      setIsTestWalletMode(true);
      isTestModeRef.current = true;
      setCurrentTestAccountIndex(accountIndex);
      testIndexRef.current = accountIndex;
      setStatus("connected");

      // Load initial balances immediately from storage
      const balances = getStoredBalances();
      const localAcc = balances[testAcc.address.toLowerCase()] || DEFAULT_TEST_BALANCES[testAcc.address.toLowerCase()];
      if (localAcc) {
        setEthBalance(localAcc.eth || "10000.0");
        setUsdcBalance(localAcc.usdc || "5000.00");
        setLstnBalance(localAcc.lstn || "250");
        setTotalListens(Number(localAcc.totalListens || 25));
      }

      // Check if node is online and sync
      const online = await checkNodeLiveness();
      if (online) {
        await refreshBalances(testAcc.address, rpcProvider);
      }
    } catch (err) {
      console.error("Test wallet connection error:", err);
      const testAcc = HARDHAT_TEST_ACCOUNTS[accountIndex];
      setAccount(testAcc.address);
      accountRef.current = testAcc.address;
      setChainId(31337);
      setIsTestWalletMode(true);
      isTestModeRef.current = true;
      setCurrentTestAccountIndex(accountIndex);
      testIndexRef.current = accountIndex;
      setStatus("connected");

      const balances = getStoredBalances();
      const localAcc = balances[testAcc.address.toLowerCase()];
      if (localAcc) {
        setEthBalance(localAcc.eth);
        setUsdcBalance(localAcc.usdc);
        setLstnBalance(localAcc.lstn);
        setTotalListens(Number(localAcc.totalListens));
      }
    }
  }, [checkNodeLiveness, refreshBalances]);

  // Connect via MetaMask / Browser Wallet
  const connectWallet = useCallback(async () => {
    if (typeof window === "undefined" || !window.ethereum) {
      throw new Error(
        "MetaMask extension was not detected in your browser. Please install MetaMask from https://metamask.io/ to connect."
      );
    }

    setStatus("connecting");
    try {
      const browserProvider = new ethers.BrowserProvider(window.ethereum);
      const accounts = await browserProvider.send("eth_requestAccounts", []);

      if (!accounts || accounts.length === 0) {
        setStatus("disconnected");
        return null;
      }

      let network = await browserProvider.getNetwork();
      let currentChainId = Number(network.chainId);

      // If MetaMask is on an unsupported chain (e.g. Mainnet), try auto-switching to Localhost Hardhat
      if (!isSupportedChain(currentChainId)) {
        try {
          await window.ethereum.request({
            method: "wallet_switchEthereumChain",
            params: [{ chainId: CHAIN_CONFIG.HARDHAT.chainIdHex }],
          });
          network = await browserProvider.getNetwork();
          currentChainId = Number(network.chainId);
        } catch (switchErr) {
          if (switchErr.code === 4902 || switchErr.message?.includes("Unrecognized chain ID")) {
            try {
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
              network = await browserProvider.getNetwork();
              currentChainId = Number(network.chainId);
            } catch (addErr) {
              console.warn("Could not auto-add Localhost chain:", addErr);
            }
          }
        }
      }

      const userSigner = await browserProvider.getSigner();

      setProvider(browserProvider);
      providerRef.current = browserProvider;
      setSigner(userSigner);
      signerRef.current = userSigner;
      setAccount(accounts[0]);
      accountRef.current = accounts[0];
      setChainId(currentChainId);
      setIsTestWalletMode(false);
      isTestModeRef.current = false;
      localStorage.setItem("soundchain_wallet_preference", "metamask");

      if (isSupportedChain(currentChainId)) {
        setStatus("connected");
        await refreshBalances(accounts[0], browserProvider);
      } else {
        setStatus("wrong_network");
      }
      return accounts[0];
    } catch (err) {
      console.error("MetaMask connection failed:", err);
      setStatus("disconnected");
      throw err;
    }
  }, [isSupportedChain, refreshBalances]);

  // Disconnect Wallet
  const disconnectWallet = useCallback(() => {
    setAccount(null);
    accountRef.current = null;
    setChainId(null);
    setSigner(null);
    signerRef.current = null;
    setEthBalance("0");
    setUsdcBalance("0");
    setLstnBalance("0");
    setTotalListens(0);
    setIsTestWalletMode(false);
    isTestModeRef.current = false;
    localStorage.setItem("soundchain_wallet_preference", "disconnected");
    setStatus("disconnected");
  }, []);

  // Switch Network to Sepolia
  const switchToSepolia = useCallback(async () => {
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
  }, []);

  // Switch Network to Local Hardhat
  const switchToLocalhost = useCallback(async () => {
    if (!window.ethereum) {
      if (isTestModeRef.current) {
        await connectTestWallet(testIndexRef.current);
      }
      return;
    }
    try {
      await window.ethereum.request({
        method: "wallet_switchEthereumChain",
        params: [{ chainId: CHAIN_CONFIG.HARDHAT.chainIdHex }],
      });
    } catch (error) {
      if (error.code === 4902 || error.message?.includes("Unrecognized chain ID") || error.code === -32603) {
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
  }, [connectTestWallet]);

  // Register Custom Token (USDC / LSTN) in MetaMask via wallet_watchAsset
  const importTokenToMetaMask = useCallback(async (symbol = "USDC") => {
    if (typeof window === "undefined" || !window.ethereum) {
      throw new Error("MetaMask is not detected in your browser.");
    }
    const token = symbol === "LSTN" ? {
      address: contractsData.ListenToken?.address,
      symbol: "LSTN",
      decimals: 18,
    } : {
      address: contractsData.MockUSDC?.address,
      symbol: "USDC",
      decimals: 6,
    };

    if (!token.address) {
      throw new Error(`${symbol} contract address is not configured.`);
    }

    return await window.ethereum.request({
      method: "wallet_watchAsset",
      params: {
        type: "ERC20",
        options: token,
      },
    });
  }, []);

  // Handle MetaMask accountsChanged & chainChanged events
  useEffect(() => {
    if (typeof window === "undefined" || !window.ethereum) return;

    const handleAccountsChanged = async (accounts) => {
      // If user is intentionally running the offline/demo personas, skip
      if (isTestModeRef.current) return;

      if (!accounts || accounts.length === 0) {
        disconnectWallet();
      } else {
        const nextAccount = accounts[0];
        setAccount(nextAccount);
        accountRef.current = nextAccount;
        setStatus("connected");
        try {
          const browserProvider = new ethers.BrowserProvider(window.ethereum);
          setProvider(browserProvider);
          providerRef.current = browserProvider;
          const userSigner = await browserProvider.getSigner();
          setSigner(userSigner);
          signerRef.current = userSigner;
          await refreshBalances(nextAccount, browserProvider);
        } catch (e) {
          console.error("MetaMask account change sync warning:", e);
        }
      }
    };

    const handleChainChanged = async (chainIdHex) => {
      if (isTestModeRef.current) return;
      const decChainId = parseInt(chainIdHex, 16);
      setChainId(decChainId);
      if (isSupportedChain(decChainId)) {
        setStatus("connected");
        try {
          const browserProvider = new ethers.BrowserProvider(window.ethereum);
          await refreshBalances(accountRef.current, browserProvider);
        } catch (e) {
          console.error("MetaMask chain change sync warning:", e);
        }
      } else {
        setStatus("wrong_network");
      }
    };

    window.ethereum.on?.("accountsChanged", handleAccountsChanged);
    window.ethereum.on?.("chainChanged", handleChainChanged);

    return () => {
      window.ethereum.removeListener?.("accountsChanged", handleAccountsChanged);
      window.ethereum.removeListener?.("chainChanged", handleChainChanged);
    };
  }, [disconnectWallet, isSupportedChain, refreshBalances]);

  // Initial Wallet Connection on Mount (respects user preference)
  useEffect(() => {
    const initConnection = async () => {
      const pref = localStorage.getItem("soundchain_wallet_preference");

      // 1. Explicitly disconnected by user: do not auto-connect
      if (pref === "disconnected") {
        setStatus("disconnected");
        return;
      }

      // 2. MetaMask preference: try re-connecting if authorized
      if (typeof window !== "undefined" && window.ethereum) {
        try {
          const accounts = await window.ethereum.request({ method: "eth_accounts" });
          if (accounts && accounts.length > 0) {
            await connectWallet();
            return;
          }
        } catch (err) {
          console.warn("MetaMask auto-check error:", err);
        }
      }

      // 3. If preference is explicitly "metamask" but not currently unlocked, wait for user
      if (pref === "metamask") {
        setStatus("disconnected");
        return;
      }

      // 4. Test wallet preference: reconnect test persona
      if (pref === "test") {
        connectTestWallet(0).catch(() => {});
        return;
      }

      // 5. Default state for new sessions: keep disconnected so user can connect MetaMask or choose a test account
      setStatus("disconnected");
    };

    initConnection();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Instantiate Smart Contracts
  const getRoyaltySplitterContract = useCallback((asAdmin = false) => {
    if (!contractsData?.RoyaltySplitter?.address) return null;
    let runner = signerRef.current || providerRef.current;

    if ((asAdmin || isTestModeRef.current) && HARDHAT_TEST_ACCOUNTS[0]) {
      const adminProvider = new ethers.JsonRpcProvider("http://127.0.0.1:8545");
      const accIndex = asAdmin ? 0 : testIndexRef.current;
      runner = new ethers.Wallet(HARDHAT_TEST_ACCOUNTS[accIndex].privateKey, adminProvider);
    }

    if (!runner) return null;
    return new ethers.Contract(
      contractsData.RoyaltySplitter.address,
      contractsData.RoyaltySplitter.abi,
      runner
    );
  }, []);

  const getListenTokenContract = useCallback((asAdmin = false) => {
    if (!contractsData?.ListenToken?.address) return null;
    let runner = signerRef.current || providerRef.current;

    if ((asAdmin || isTestModeRef.current) && HARDHAT_TEST_ACCOUNTS[0]) {
      const adminProvider = new ethers.JsonRpcProvider("http://127.0.0.1:8545");
      const accIndex = asAdmin ? 0 : testIndexRef.current;
      runner = new ethers.Wallet(HARDHAT_TEST_ACCOUNTS[accIndex].privateKey, adminProvider);
    }

    if (!runner) return null;
    return new ethers.Contract(
      contractsData.ListenToken.address,
      contractsData.ListenToken.abi,
      runner
    );
  }, []);

  const getMockUsdcContract = useCallback((asAdmin = false) => {
    if (!contractsData?.MockUSDC?.address) return null;
    let runner = signerRef.current || providerRef.current;

    if ((asAdmin || isTestModeRef.current) && HARDHAT_TEST_ACCOUNTS[0]) {
      const adminProvider = new ethers.JsonRpcProvider("http://127.0.0.1:8545");
      const accIndex = asAdmin ? 0 : testIndexRef.current;
      runner = new ethers.Wallet(HARDHAT_TEST_ACCOUNTS[accIndex].privateKey, adminProvider);
    }

    if (!runner) return null;
    return new ethers.Contract(
      contractsData.MockUSDC.address,
      contractsData.MockUSDC.abi,
      runner
    );
  }, []);

  // ==========================================
  // ADD FUNDS / FAUCET FUNCTIONALITY
  // ==========================================
  const addFunds = useCallback(async ({ asset = "USDC", amount = 100, targetAddress }) => {
    const target = targetAddress || accountRef.current || HARDHAT_TEST_ACCOUNTS[0].address;
    const lower = target.toLowerCase();
    const balances = getStoredBalances();
    const accState = balances[lower] || {
      eth: "10.0",
      usdc: "500.00",
      lstn: "50",
      totalListens: 5,
      lifetimeUsdc: "0.00",
    };

    const numAmount = parseFloat(amount) || 0;

    if (asset === "ALL") {
      accState.usdc = (parseFloat(accState.usdc || 0) + 1000).toFixed(2);
      accState.eth = (parseFloat(accState.eth || 0) + 2.0).toFixed(4);
      accState.lstn = String(Math.round(parseFloat(accState.lstn || 0) + 100));
    } else if (asset === "USDC") {
      accState.usdc = (parseFloat(accState.usdc || 0) + numAmount).toFixed(2);
    } else if (asset === "ETH") {
      accState.eth = (parseFloat(accState.eth || 0) + numAmount).toFixed(4);
    } else if (asset === "LSTN") {
      accState.lstn = String(Math.round(parseFloat(accState.lstn || 0) + numAmount));
    }

    // Persist to storage immediately
    balances[lower] = accState;
    saveStoredBalances(balances);

    // If current active account is the target, update reactive state
    if (accountRef.current && accountRef.current.toLowerCase() === lower) {
      setEthBalance(accState.eth);
      setUsdcBalance(accState.usdc);
      setLstnBalance(accState.lstn);
    }

    // Attempt on-chain faucet if node is online
    if (isNodeOnlineRef.current) {
      try {
        if (asset === "USDC" || asset === "ALL") {
          const usdcContract = getMockUsdcContract(true);
          if (usdcContract) {
            const mintUnits = ethers.parseUnits(asset === "ALL" ? "1000" : String(numAmount), 6);
            if (typeof usdcContract.faucet === "function") {
              const tx = await usdcContract.faucet(target, mintUnits);
              await tx.wait();
            } else if (typeof usdcContract.mint === "function") {
              const tx = await usdcContract.mint(target, mintUnits);
              await tx.wait();
            }
          }
          // Also guarantee at least 5.0 ETH gas liquidity on the local node if balance is low
          try {
            const rpcProvider = new ethers.JsonRpcProvider("http://127.0.0.1:8545");
            const curEth = await rpcProvider.getBalance(target);
            if (curEth < ethers.parseEther("1.0")) {
              await rpcProvider.send("hardhat_setBalance", [
                target,
                ethers.toBeHex(ethers.parseEther("5.0")),
              ]);
            }
          } catch (gasErr) {
            console.warn("Gas top-up check skipped:", gasErr);
          }
        }

        if (asset === "ETH" || asset === "ALL") {
          try {
            const rpcProvider = new ethers.JsonRpcProvider("http://127.0.0.1:8545");
            const currentBal = await rpcProvider.getBalance(target);
            const addWei = ethers.parseEther(asset === "ALL" ? "2.0" : String(numAmount));
            const newWei = currentBal + addWei;
            await rpcProvider.send("hardhat_setBalance", [
              target,
              ethers.toBeHex(newWei),
            ]);
          } catch (ethErr) {
            console.warn("hardhat_setBalance skipped:", ethErr);
          }
        }
      } catch (chainErr) {
        console.warn("On-chain faucet call skipped (local ledger credited):", chainErr);
      }
    }

    return { success: true, updated: accState };
  }, [getMockUsdcContract]);

  // Reset balances back to initial default
  const resetBalances = useCallback(async (targetAddress) => {
    const target = targetAddress || accountRef.current || HARDHAT_TEST_ACCOUNTS[0].address;
    const lower = target.toLowerCase();
    const balances = getStoredBalances();
    const defaultVal = DEFAULT_TEST_BALANCES[lower] || {
      eth: "10.0",
      usdc: "500.00",
      lstn: "50",
      totalListens: 5,
      lifetimeUsdc: "0.00",
    };

    balances[lower] = { ...defaultVal };
    saveStoredBalances(balances);

    if (accountRef.current && accountRef.current.toLowerCase() === lower) {
      setEthBalance(defaultVal.eth);
      setUsdcBalance(defaultVal.usdc);
      setLstnBalance(defaultVal.lstn);
      setTotalListens(Number(defaultVal.totalListens || 0));
    }

    return { success: true, reset: defaultVal };
  }, []);

  // Seamless Royalty Payment Execution (On-chain with graceful simulated fallback)
  const executeRoyaltyPayment = useCallback(async ({ track, amountUsdc, simulatedSplits }) => {
    const numAmount = parseFloat(amountUsdc);
    if (isNaN(numAmount) || numAmount <= 0) {
      throw new Error("Invalid payment amount");
    }

    const currentUsdc = parseFloat(usdcBalance || 0);
    if (currentUsdc < numAmount) {
      throw new Error(`Insufficient USDC balance ($${currentUsdc.toFixed(2)} available). Please add funds.`);
    }

    let onChainSuccess = false;
    let txHash = "";
    let blockNumber = 21849200 + Math.floor(Math.random() * 100);

    // Attempt on-chain payout if node is live
    if (isNodeOnlineRef.current) {
      try {
        const splitter = getRoyaltySplitterContract();
        const usdc = getMockUsdcContract();

        if (splitter && usdc) {
          const splitterAddress = await splitter.getAddress();
          const units = ethers.parseUnits(String(numAmount), 6);

          const allowance = await usdc.allowance(accountRef.current, splitterAddress);
          if (allowance < units) {
            const approveTx = await usdc.approve(splitterAddress, ethers.parseUnits("1000000", 6));
            await approveTx.wait();
          }

          const tx = await splitter.payRoyaltyUSDC(track.bytes32Id || ethers.id(track.id), units);
          const receipt = await tx.wait();
          txHash = receipt.hash;
          blockNumber = receipt.blockNumber;
          onChainSuccess = true;
        }
      } catch (err) {
        console.warn("On-chain settlement failed, executing guaranteed local atomic settlement:", err);
      }
    }

    // Execute atomic balance settlement in persistent state
    const balances = getStoredBalances();
    const payerKey = (accountRef.current || HARDHAT_TEST_ACCOUNTS[0].address).toLowerCase();
    const payerState = balances[payerKey] || { ...DEFAULT_TEST_BALANCES[payerKey] };

    payerState.usdc = Math.max(0, parseFloat(payerState.usdc || 0) - numAmount).toFixed(2);
    balances[payerKey] = payerState;

    // Credit recipient payees proportionally
    const splits = simulatedSplits || track.splits || [];
    splits.forEach((split, idx) => {
      const payeeAddr = split.address || HARDHAT_TEST_ACCOUNTS[Math.min(idx + 1, 3)].address;
      const payeeKey = payeeAddr.toLowerCase();
      const payeeState = balances[payeeKey] || { ...DEFAULT_TEST_BALANCES[payeeKey] };
      const credited = numAmount * (parseFloat(split.percent || 0) / 100);

      payeeState.usdc = (parseFloat(payeeState.usdc || 0) + credited).toFixed(2);
      payeeState.lifetimeUsdc = (parseFloat(payeeState.lifetimeUsdc || 0) + credited).toFixed(2);
      balances[payeeKey] = payeeState;
    });

    saveStoredBalances(balances);

    // Update active user state
    setUsdcBalance(payerState.usdc);

    if (!onChainSuccess) {
      txHash = "0x" + Array.from({ length: 64 }, () => Math.floor(Math.random() * 16).toString(16)).join("");
    }

    return {
      success: true,
      hash: txHash,
      blockNumber,
      onChain: onChainSuccess,
      newPayerBalance: payerState.usdc,
    };
  }, [usdcBalance, getRoyaltySplitterContract, getMockUsdcContract]);

  // Seamless Listen-to-Earn Reward Mint
  const claimListeningRewardLocal = useCallback(async ({ track, totalSec }) => {
    const activeAcc = accountRef.current || HARDHAT_TEST_ACCOUNTS[0].address;
    const lower = activeAcc.toLowerCase();
    const balances = getStoredBalances();
    const userState = balances[lower] || { ...DEFAULT_TEST_BALANCES[lower] };

    userState.lstn = String(Math.round(parseFloat(userState.lstn || 0) + 10));
    userState.totalListens = Number(userState.totalListens || 0) + 1;

    balances[lower] = userState;
    saveStoredBalances(balances);

    setLstnBalance(userState.lstn);
    setTotalListens(userState.totalListens);

    return {
      success: true,
      rewardEarned: "+10.00 LSTN",
      totalListens: userState.totalListens,
      newLstnBalance: userState.lstn,
    };
  }, []);

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
        isMetaMaskConnected: !isTestWalletMode && Boolean(account),
        hasMetaMask: typeof window !== "undefined" && Boolean(window.ethereum),
        currentTestAccountIndex,
        testAccounts: HARDHAT_TEST_ACCOUNTS,
        isCorrectNetwork: isSupportedChain(chainId),
        isSepolia: chainId === CHAIN_CONFIG.SEPOLIA.chainIdDec,
        isLocalhost: chainId === CHAIN_CONFIG.HARDHAT.chainIdDec || isTestWalletMode,
        isNodeOnline,
        userRole,
        setUserRole,
        toggleUserRole,
        isCreatorPayee,
        isAdmin,
        creatorLifetimeEth,
        creatorLifetimeUsdc,
        connectWallet,
        connectTestWallet,
        disconnectWallet,
        switchToSepolia,
        switchToLocalhost,
        importTokenToMetaMask,
        refreshBalances: () => refreshBalances(accountRef.current, providerRef.current),
        getRoyaltySplitterContract,
        getListenTokenContract,
        getMockUsdcContract,
        // Modal Controls
        isConnectModalOpen,
        openConnectModal,
        closeConnectModal,
        isAddFundsModalOpen,
        openAddFundsModal,
        closeAddFundsModal,
        // Faucet & Execution Helpers
        addFunds,
        resetBalances,
        executeRoyaltyPayment,
        claimListeningRewardLocal,
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
