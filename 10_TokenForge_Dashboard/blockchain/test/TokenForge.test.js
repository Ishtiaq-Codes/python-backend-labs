import { expect } from "chai";
import hre from "hardhat";
const { ethers } = hre;

describe("TokenForge", function () {
  let TokenForge, token, owner, addr1, addr2;

  beforeEach(async function () {
    TokenForge = await ethers.getContractFactory("TokenForge");
    [owner, addr1, addr2] = await ethers.getSigners();
    token = await TokenForge.deploy();
  });

  describe("Deployment", function () {
    it("Should set the right owner", async function () {
      expect(await token.owner()).to.equal(owner.address);
    });

    it("Should assign the total supply of tokens to the owner", async function () {
      const ownerBalance = await token.balanceOf(owner.address);
      expect(await token.totalSupply()).to.equal(ownerBalance);
    });

    it("Should have correct token name and symbol", async function () {
      expect(await token.name()).to.equal("TokenForge Token");
      expect(await token.symbol()).to.equal("TFT");
    });
  });

  describe("Transactions", function () {
    it("Should transfer tokens between accounts", async function () {
      // Transfer 50 tokens from owner to addr1
      await token.transfer(addr1.address, 50);
      const addr1Balance = await token.balanceOf(addr1.address);
      expect(addr1Balance).to.equal(50);

      // Transfer 50 tokens from addr1 to addr2
      await token.connect(addr1).transfer(addr2.address, 50);
      const addr2Balance = await token.balanceOf(addr2.address);
      expect(addr2Balance).to.equal(50);
    });

    it("Should fail if sender doesn't have enough tokens", async function () {
      const initialOwnerBalance = await token.balanceOf(owner.address);
      
      // Try to send 1 token from addr1 (0 balance) to owner
      await expect(
        token.connect(addr1).transfer(owner.address, 1)
      ).to.be.revertedWithCustomError(token, "ERC20InsufficientBalance");

      // Owner balance shouldn't have changed
      expect(await token.balanceOf(owner.address)).to.equal(initialOwnerBalance);
    });
  });

  describe("Minting", function () {
    it("Should allow owner to mint tokens", async function () {
      await token.mint(addr1.address, 100);
      expect(await token.balanceOf(addr1.address)).to.equal(100);
    });

    it("Should fail if non-owner tries to mint", async function () {
      await expect(
        token.connect(addr1).mint(addr1.address, 100)
      ).to.be.revertedWithCustomError(token, "OwnableUnauthorizedAccount");
    });

    it("Should emit TokenMinted event", async function () {
      await expect(token.mint(addr1.address, 100))
        .to.emit(token, "TokenMinted")
        .withArgs(addr1.address, 100);
    });
  });

  describe("Burning", function () {
    it("Should allow user to burn their own tokens", async function () {
      await token.transfer(addr1.address, 100);
      await token.connect(addr1).burn(50);
      expect(await token.balanceOf(addr1.address)).to.equal(50);
    });

    it("Should fail if user tries to burn more than they have", async function () {
      await expect(
        token.connect(addr1).burn(100)
      ).to.be.revertedWithCustomError(token, "ERC20InsufficientBalance");
    });

    it("Should emit TokenBurned event", async function () {
      await token.transfer(addr1.address, 100);
      await expect(token.connect(addr1).burn(50))
        .to.emit(token, "TokenBurned")
        .withArgs(addr1.address, 50);
    });
  });

  describe("Pausing", function () {
    it("Should allow owner to pause and unpause", async function () {
      await token.pause();
      expect(await token.paused()).to.be.true;

      await token.unpause();
      expect(await token.paused()).to.be.false;
    });

    it("Should prevent transfers when paused", async function () {
      await token.pause();
      await expect(
        token.transfer(addr1.address, 100)
      ).to.be.revertedWithCustomError(token, "EnforcedPause");
    });

    it("Should fail if non-owner tries to pause", async function () {
      await expect(
        token.connect(addr1).pause()
      ).to.be.revertedWithCustomError(token, "OwnableUnauthorizedAccount");
    });
  });
});
