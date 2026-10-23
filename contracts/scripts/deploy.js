const { ethers } = require("hardhat");
const fs = require("fs");
const path = require("path");

async function main() {
  console.log("----------------------------------------------------");
  console.log("SoundChain Smart Contracts Deployment Starting...");
  console.log("----------------------------------------------------");

  const signers = await ethers.getSigners();
  const deployer = signers[0];
  const account1 = signers[1];
  const account2 = signers[2];
  const account3 = signers[3];
  console.log("Deploying contracts with account:", deployer.address);

  // 1. Deploy MockUSDC (1:1 USD asset-backed stablecoin, 6 decimals)
  const MockUSDC = await ethers.getContractFactory("MockUSDC");
  const usdc = await MockUSDC.deploy();
  await usdc.waitForDeployment();
  const usdcAddress = await usdc.getAddress();
  console.log("MockUSDC deployed to:", usdcAddress);

  // Seed 10,000 USDC each to all available test signers so they can test real-time payments
  const seedAmount = ethers.parseUnits("10000", 6);
  for (let i = 0; i < Math.min(signers.length, 10); i++) {
    await usdc.mint(signers[i].address, seedAmount);
  }
  console.log("Seeded 10,000 USDC to all local developer test accounts.");

  // 2. Deploy RoyaltySplitter with USDC token address
  const RoyaltySplitter = await ethers.getContractFactory("RoyaltySplitter");
  const splitter = await RoyaltySplitter.deploy(usdcAddress);
  await splitter.waitForDeployment();
  const splitterAddress = await splitter.getAddress();
  console.log("RoyaltySplitter deployed to:", splitterAddress);

  // 3. Deploy ListenToken (LSTN loyalty/reward token)
  const ListenToken = await ethers.getContractFactory("ListenToken");
  const token = await ListenToken.deploy();
  await token.waitForDeployment();
  const tokenAddress = await token.getAddress();
  console.log("ListenToken deployed to:", tokenAddress);

  // 4. Register Seeded Demo Tracks
  console.log("\nRegistering Seeded Demo Tracks with IPFS...");

  const artist = account1 ? account1.address : deployer.address;
  const producer = account2 ? account2.address : deployer.address;
  const songwriter = account3 ? account3.address : deployer.address;

  const tracks = [
    {
      idStr: "track-1",
      title: "Midnight Signals",
      payees: [artist, producer, songwriter],
      sharesBps: [5000, 3000, 2000], // 50%, 30%, 20%
      ipfsCid: "ipfs://bafybeicv3l6s76evptz7i7y3w3r2764f6oowc4yq4c33f677n6h66s4a2y",
    },
    {
      idStr: "track-2",
      title: "Glass Horizon",
      payees: [artist, producer, songwriter],
      sharesBps: [6000, 2500, 1500], // 60%, 25%, 15%
      ipfsCid: "ipfs://bafybeifk4v2i46a2tcvh7q3q2w7jnv5g3wom5qvwg43v36v45f2a4f4b2y",
    },
    {
      idStr: "track-3",
      title: "Afterglow Circuit",
      payees: [artist, producer, songwriter],
      sharesBps: [5500, 2500, 2000], // 55%, 25%, 20%
      ipfsCid: "ipfs://bafybeih4j3z7a4a2w6c5k6d3y7a5q6w3e2r1t4y5u6i7o8p9a0s1d2f3g4",
    },
  ];

  for (const track of tracks) {
    const bytes32Id = ethers.id(track.idStr);
    const tx = await splitter.registerTrackWithIpfs(bytes32Id, track.payees, track.sharesBps, track.ipfsCid);
    await tx.wait();
    console.log(`Registered Track '${track.title}' (ID: ${bytes32Id}, IPFS: ${track.ipfsCid})`);
  }

  // 5. Export Contract Addresses & ABIs to Frontend
  const frontendContractsDir = path.join(__dirname, "..", "..", "frontend", "src", "contracts");
  if (!fs.existsSync(frontendContractsDir)) {
    fs.mkdirSync(frontendContractsDir, { recursive: true });
  }

  const splitterArtifact = await hre.artifacts.readArtifact("RoyaltySplitter");
  const tokenArtifact = await hre.artifacts.readArtifact("ListenToken");
  const usdcArtifact = await hre.artifacts.readArtifact("MockUSDC");

  const contractsData = {
    network: hre.network.name,
    chainId: hre.network.config.chainId || 31337,
    MockUSDC: {
      address: usdcAddress,
      abi: usdcArtifact.abi,
    },
    RoyaltySplitter: {
      address: splitterAddress,
      abi: splitterArtifact.abi,
    },
    ListenToken: {
      address: tokenAddress,
      abi: tokenArtifact.abi,
    },
    seededTrackIds: {
      "track-1": ethers.id("track-1"),
      "track-2": ethers.id("track-2"),
      "track-3": ethers.id("track-3"),
    },
  };

  fs.writeFileSync(
    path.join(frontendContractsDir, "contracts.json"),
    JSON.stringify(contractsData, null, 2)
  );

  fs.writeFileSync(
    path.join(frontendContractsDir, "MockUSDC.json"),
    JSON.stringify(usdcArtifact, null, 2)
  );

  fs.writeFileSync(
    path.join(frontendContractsDir, "RoyaltySplitter.json"),
    JSON.stringify(splitterArtifact, null, 2)
  );

  fs.writeFileSync(
    path.join(frontendContractsDir, "ListenToken.json"),
    JSON.stringify(tokenArtifact, null, 2)
  );

  console.log("\nExported contract ABIs & addresses to frontend/src/contracts/");
  console.log("----------------------------------------------------");
  console.log("Deployment Complete!");
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
