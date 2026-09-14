const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("SoundChain Smart Contracts", function () {
  let RoyaltySplitter, splitter;
  let ListenToken, token;
  let owner, artist, producer, songwriter, listener, attacker;

  beforeEach(async function () {
    [owner, artist, producer, songwriter, listener, attacker] = await ethers.getSigners();

    RoyaltySplitter = await ethers.getContractFactory("RoyaltySplitter");
    splitter = await RoyaltySplitter.deploy();
    await splitter.waitForDeployment();

    ListenToken = await ethers.getContractFactory("ListenToken");
    token = await ListenToken.deploy();
    await token.waitForDeployment();
  });

  describe("RoyaltySplitter Contract", function () {
    const trackId = ethers.id("test-track-1");
    const payees = [];
    const sharesBps = [5000, 3000, 2000]; // 50%, 30%, 20%

    beforeEach(function () {
      payees[0] = artist.address;
      payees[1] = producer.address;
      payees[2] = songwriter.address;
    });

    it("Should register a track successfully with valid 10000 BPS", async function () {
      await expect(splitter.registerTrack(trackId, payees, sharesBps))
        .to.emit(splitter, "TrackRegistered")
        .withArgs(trackId, payees, sharesBps);

      const [storedPayees, storedShares] = await splitter.getTrackPayees(trackId);
      expect(storedPayees.length).to.equal(3);
      expect(storedShares[0]).to.equal(5000n);
      expect(storedShares[1]).to.equal(3000n);
      expect(storedShares[2]).to.equal(2000n);
    });

    it("Should reject track registration if shares total is not 10000 BPS", async function () {
      const invalidShares = [5000, 3000, 1000]; // Sum = 9000 (90%)
      await expect(
        splitter.registerTrack(trackId, payees, invalidShares)
      ).to.be.revertedWithCustomError(splitter, "InvalidTotalShares");
    });

    it("Should reject duplicate track registration", async function () {
      await splitter.registerTrack(trackId, payees, sharesBps);
      await expect(
        splitter.registerTrack(trackId, payees, sharesBps)
      ).to.be.revertedWithCustomError(splitter, "TrackAlreadyRegistered");
    });

    it("Should reject track registration by non-owner", async function () {
      await expect(
        splitter.connect(artist).registerTrack(trackId, payees, sharesBps)
      ).to.be.revertedWith("Ownable: caller is not the owner");
    });

    it("Should accurately distribute ETH royalties according to payee basis points", async function () {
      await splitter.registerTrack(trackId, payees, sharesBps);

      const paymentAmount = ethers.parseEther("1.0"); // 1 ETH

      const artistInitial = await ethers.provider.getBalance(artist.address);
      const producerInitial = await ethers.provider.getBalance(producer.address);
      const songwriterInitial = await ethers.provider.getBalance(songwriter.address);

      await expect(splitter.connect(listener).payRoyalty(trackId, { value: paymentAmount }))
        .to.emit(splitter, "RoyaltyDistributed")
        .withArgs(trackId, listener.address, paymentAmount);

      const artistFinal = await ethers.provider.getBalance(artist.address);
      const producerFinal = await ethers.provider.getBalance(producer.address);
      const songwriterFinal = await ethers.provider.getBalance(songwriter.address);

      // 50% of 1.0 ETH = 0.5 ETH
      expect(artistFinal - artistInitial).to.equal(ethers.parseEther("0.5"));
      // 30% of 1.0 ETH = 0.3 ETH
      expect(producerFinal - producerInitial).to.equal(ethers.parseEther("0.3"));
      // 20% of 1.0 ETH = 0.2 ETH
      expect(songwriterFinal - songwriterInitial).to.equal(ethers.parseEther("0.2"));

      expect(await splitter.getTotalReceived(trackId)).to.equal(paymentAmount);
    });

    it("Should prevent reentrancy attacks during royalty payouts", async function () {
      const AttackerFactory = await ethers.getContractFactory("ReentrancyAttacker");
      const attackerContract = await AttackerFactory.deploy(await splitter.getAddress());
      await attackerContract.waitForDeployment();

      const maliciousPayees = [await attackerContract.getAddress(), artist.address];
      const maliciousShares = [5000, 5000]; // 50%, 50%
      const reentrantTrackId = ethers.id("reentrant-track");

      await splitter.registerTrack(reentrantTrackId, maliciousPayees, maliciousShares);
      await attackerContract.setTargetTrack(reentrantTrackId);

      // Trigger payRoyalty: should fail safely when attacker tries to reenter payRoyalty
      await expect(
        splitter.connect(listener).payRoyalty(reentrantTrackId, { value: ethers.parseEther("1.0") })
      ).to.be.reverted;
    });
  });

  describe("ListenToken (LSTN) Contract", function () {
    it("Should initialize with correct name, symbol, and default reward", async function () {
      expect(await token.name()).to.equal("ListenCoin");
      expect(await token.symbol()).to.equal("LSTN");
      expect(await token.rewardPerListen()).to.equal(ethers.parseEther("10"));
    });

    it("Should reward a listener and update listening counts", async function () {
      await expect(token.rewardListener(listener.address))
        .to.emit(token, "ListenerRewarded")
        .withArgs(listener.address, ethers.parseEther("10"), 1n);

      expect(await token.balanceOf(listener.address)).to.equal(ethers.parseEther("10"));
      expect(await token.totalListens(listener.address)).to.equal(1n);

      // Reward again
      await token.rewardListener(listener.address);
      expect(await token.balanceOf(listener.address)).to.equal(ethers.parseEther("20"));
      expect(await token.totalListens(listener.address)).to.equal(2n);
    });

    it("Should allow admin to update reward per listen", async function () {
      await expect(token.setRewardPerListen(ethers.parseEther("25")))
        .to.emit(token, "RewardPerListenUpdated")
        .withArgs(ethers.parseEther("10"), ethers.parseEther("25"));

      expect(await token.rewardPerListen()).to.equal(ethers.parseEther("25"));
    });

    it("Should reject non-owner reward and reward update calls", async function () {
      await expect(
        token.connect(listener).rewardListener(listener.address)
      ).to.be.revertedWith("Ownable: caller is not the owner");

      await expect(
        token.connect(listener).setRewardPerListen(ethers.parseEther("20"))
      ).to.be.revertedWith("Ownable: caller is not the owner");
    });

    it("Should enforce the max supply cap of 1,000,000 LSTN", async function () {
      // Set reward near max supply
      const maxCap = ethers.parseEther("1000000");
      await token.setRewardPerListen(maxCap);
      await token.rewardListener(listener.address); // Mints 1,000,000 LSTN

      expect(await token.totalSupply()).to.equal(maxCap);

      // Next reward should revert with MaxSupplyExceeded
      await expect(
        token.rewardListener(listener.address)
      ).to.be.revertedWithCustomError(token, "MaxSupplyExceeded");
    });
  });
});
