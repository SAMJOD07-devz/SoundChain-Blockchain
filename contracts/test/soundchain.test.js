const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("SoundChain Smart Contracts", function () {
  let RoyaltySplitter, splitter;
  let ListenToken, token;
  let MockUSDC, usdc;
  let owner, artist, producer, songwriter, listener, attacker;

  beforeEach(async function () {
    [owner, artist, producer, songwriter, listener, attacker] = await ethers.getSigners();

    MockUSDC = await ethers.getContractFactory("MockUSDC");
    usdc = await MockUSDC.deploy();
    await usdc.waitForDeployment();

    RoyaltySplitter = await ethers.getContractFactory("RoyaltySplitter");
    splitter = await RoyaltySplitter.deploy(await usdc.getAddress());
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
        .withArgs(trackId, payees, sharesBps, "");

      const [storedPayees, storedShares] = await splitter.getTrackPayees(trackId);
      expect(storedPayees.length).to.equal(3);
      expect(storedShares[0]).to.equal(5000n);
      expect(storedShares[1]).to.equal(3000n);
      expect(storedShares[2]).to.equal(2000n);
      expect(await splitter.getTrackIpfsCid(trackId)).to.equal("");
    });

    it("Should register track with decentralized IPFS CID and allow CID updates", async function () {
      const ipfsTrackId = ethers.id("ipfs-track-1");
      const sampleCid = "ipfs://bafybeicv3l6s76evptz7i7y3w3r2764f6oowc4yq4c33f677n6h66s4a2y";

      await expect(splitter.registerTrackWithIpfs(ipfsTrackId, payees, sharesBps, sampleCid))
        .to.emit(splitter, "TrackRegistered")
        .withArgs(ipfsTrackId, payees, sharesBps, sampleCid);

      expect(await splitter.getTrackIpfsCid(ipfsTrackId)).to.equal(sampleCid);

      // Update IPFS CID
      const updatedCid = "ipfs://bafybeifk4v2i46a2tcvh7q3q2w7jnv5g3wom5qvwg43v36v45f2a4f4b2y";
      await expect(splitter.updateTrackIpfsCid(ipfsTrackId, updatedCid))
        .to.emit(splitter, "TrackIpfsCidUpdated")
        .withArgs(ipfsTrackId, updatedCid);

      expect(await splitter.getTrackIpfsCid(ipfsTrackId)).to.equal(updatedCid);
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

    it("Should accurately distribute stable USDC royalties according to payee basis points", async function () {
      await splitter.registerTrack(trackId, payees, sharesBps);

      const usdcPayment = ethers.parseUnits("100", 6); // 100 USDC ($100.00)
      // Mint 100 USDC to listener and approve splitter
      await usdc.mint(listener.address, usdcPayment);
      await usdc.connect(listener).approve(await splitter.getAddress(), usdcPayment);

      const artistInitial = await usdc.balanceOf(artist.address);
      const producerInitial = await usdc.balanceOf(producer.address);
      const songwriterInitial = await usdc.balanceOf(songwriter.address);

      await expect(splitter.connect(listener).payRoyaltyUSDC(trackId, usdcPayment))
        .to.emit(splitter, "RoyaltyDistributedUSDC")
        .withArgs(trackId, listener.address, usdcPayment);

      const artistFinal = await usdc.balanceOf(artist.address);
      const producerFinal = await usdc.balanceOf(producer.address);
      const songwriterFinal = await usdc.balanceOf(songwriter.address);

      // 50% of $100 = $50 (50 * 10^6)
      expect(artistFinal - artistInitial).to.equal(ethers.parseUnits("50", 6));
      // 30% of $100 = $30 (30 * 10^6)
      expect(producerFinal - producerInitial).to.equal(ethers.parseUnits("30", 6));
      // 20% of $100 = $20 (20 * 10^6)
      expect(songwriterFinal - songwriterInitial).to.equal(ethers.parseUnits("20", 6));

      expect(await splitter.getTotalUsdcReceived(trackId)).to.equal(usdcPayment);
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

    describe("Cryptographic Stream Proofs & Anti-Bot Verification", function () {
      const streamTrackId = ethers.id("stream-test-track");
      let chainId;
      let tokenAddress;

      beforeEach(async function () {
        const net = await ethers.provider.getNetwork();
        chainId = net.chainId;
        tokenAddress = await token.getAddress();
      });

      async function generateStreamProof(signerWallet, listenerAddr, track, seconds, nonceVal) {
        const msgHash = ethers.solidityPackedKeccak256(
          ["address", "bytes32", "uint256", "uint256", "uint256", "address"],
          [listenerAddr, track, seconds, nonceVal, chainId, tokenAddress]
        );
        const sig = await signerWallet.signMessage(ethers.getBytes(msgHash));
        return { msgHash, sig };
      }

      it("Should mint tokens upon submitting a valid cryptographic stream proof", async function () {
        const listenSeconds = 12;
        const nonce = 1001;
        const { sig, msgHash } = await generateStreamProof(owner, listener.address, streamTrackId, listenSeconds, nonce);

        await expect(
          token.connect(listener).rewardListenerWithProof(listener.address, streamTrackId, listenSeconds, nonce, sig)
        )
          .to.emit(token, "StreamProofVerified")
          .withArgs(listener.address, streamTrackId, listenSeconds, nonce, msgHash)
          .and.to.emit(token, "ListenerRewarded")
          .withArgs(listener.address, ethers.parseEther("10"), 1n);

        expect(await token.balanceOf(listener.address)).to.equal(ethers.parseEther("10"));
        expect(await token.totalListens(listener.address)).to.equal(1n);
        expect(await token.usedProofHashes(msgHash)).to.be.true;
      });

      it("Should reject stream proof if playback duration is less than 10 seconds", async function () {
        const shortDuration = 8;
        const nonce = 1002;
        const { sig } = await generateStreamProof(owner, listener.address, streamTrackId, shortDuration, nonce);

        await expect(
          token.connect(listener).rewardListenerWithProof(listener.address, streamTrackId, shortDuration, nonce, sig)
        ).to.be.revertedWithCustomError(token, "InsufficientStreamDuration");
      });

      it("Should reject stream proof signed by unauthorized attacker", async function () {
        const listenSeconds = 15;
        const nonce = 1003;
        // Attacker attempts to forge validator signature
        const { sig } = await generateStreamProof(attacker, listener.address, streamTrackId, listenSeconds, nonce);

        await expect(
          token.connect(listener).rewardListenerWithProof(listener.address, streamTrackId, listenSeconds, nonce, sig)
        ).to.be.revertedWithCustomError(token, "InvalidStreamProofSignature");
      });

      it("Should prevent replay attacks by rejecting duplicate proof hashes", async function () {
        const listenSeconds = 14;
        const nonce = 1004;
        const { sig } = await generateStreamProof(owner, listener.address, streamTrackId, listenSeconds, nonce);

        // First redemption succeeds
        await token.connect(listener).rewardListenerWithProof(listener.address, streamTrackId, listenSeconds, nonce, sig);

        // Second redemption with identical proof reverts
        await expect(
          token.connect(listener).rewardListenerWithProof(listener.address, streamTrackId, listenSeconds, nonce, sig)
        ).to.be.revertedWithCustomError(token, "ProofAlreadyConsumed");
      });

      it("Should allow owner to rotate stream validator and accept proofs from new validator", async function () {
        const newValidator = producer;
        await expect(token.setStreamValidator(newValidator.address))
          .to.emit(token, "StreamValidatorUpdated")
          .withArgs(owner.address, newValidator.address);

        expect(await token.streamValidator()).to.equal(newValidator.address);

        // Proof signed by new validator succeeds
        const { sig } = await generateStreamProof(newValidator, listener.address, streamTrackId, 12, 1005);
        await expect(
          token.connect(listener).rewardListenerWithProof(listener.address, streamTrackId, 12, 1005, sig)
        ).to.emit(token, "ListenerRewarded");
      });
    });
  });
});
