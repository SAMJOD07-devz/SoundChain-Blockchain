const { ethers } = require("hardhat");
const fs = require("fs");
const path = require("path");

async function main() {
  console.log("----------------------------------------------------");
  console.log("SoundChain Smart Contracts Deployment Starting...");
  console.log("----------------------------------------------------");

  const [deployer, account1, account2, account3] = await ethers.getSigners();
  console.log("Deploying contracts with account:", deployer.address);

  // 1. Deploy RoyaltySplitter
  const RoyaltySplitter = await ethers.getContractFactory("RoyaltySplitter");
  const splitter = await RoyaltySplitter.deploy();
  await splitter.waitForDeployment();
  const splitterAddress = await splitter.getAddress();
  console.log("RoyaltySplitter deployed to:", splitterAddress);

  // 2. Deploy ListenToken
  const ListenToken = await ethers.getContractFactory("ListenToken");
  const token = await ListenToken.deploy();
  await token.waitForDeployment();
  const tokenAddress = await token.getAddress();
  console.log("ListenToken deployed to:", tokenAddress);

  // 3. Register Seeded Demo Tracks
  console.log("\nRegistering Seeded Demo Tracks...");

  // Address payees for local dev (Fallback to deployer & default signers if on testnet)
  const artist = account1 ? account1.address : deployer.address;
  const producer = account2 ? account2.address : deployer.address;
  const songwriter = account3 ? account3.address : deployer.address;

  const tracks = [
    {
      idStr: "track-1",
      title: "Midnight Signals",
      payees: [artist, producer, songwriter],
      sharesBps: [5000, 3000, 2000], // 50%, 30%, 20%
    },
    {
      idStr: "track-2",
      title: "Glass Horizon",
      payees: [artist, producer, songwriter],
      sharesBps: [6000, 2500, 1500], // 60%, 25%, 15%
    },
    {
      idStr: "track-3",
      title: "Afterglow Circuit",
      payees: [artist, producer, songwriter],
      sharesBps: [5500, 2500, 2000], // 55%, 25%, 20%
    },
  ];

  for (const track of tracks) {
    const bytes32Id = ethers.id(track.idStr);
    const tx = await splitter.registerTrack(bytes32Id, track.payees, track.sharesBps);
    await tx.wait();
    console.log(`Registered Track '${track.title}' (ID: ${bytes32Id})`);
  }

  // 4. Export Contract Addresses & ABIs to Frontend
  const frontendContractsDir = path.join(__dirname, "..", "..", "frontend", "src", "contracts");
  if (!fs.existsSync(frontendContractsDir)) {
    fs.mkdirSync(frontendContractsDir, { recursive: true });
  }

  const splitterArtifact = await hre.artifacts.readArtifact("RoyaltySplitter");
  const tokenArtifact = await hre.artifacts.readArtifact("ListenToken");

  const contractsData = {
    network: hre.network.name,
    chainId: hre.network.config.chainId || 31337,
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
