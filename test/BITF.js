const {
  time,
  loadFixture,
} = require("@nomicfoundation/hardhat-toolbox/network-helpers");
const { anyValue } = require("@nomicfoundation/hardhat-chai-matchers/withArgs");
const { expect } = require("chai");
const { ethers } = require("hardhat");
const { FOUNDERS, MARKETING } = require("../pvKey.js");

describe("BITF", function () {
  async function deploy() {
    const [owner, otherAccount, vcPoolAccount, otherPoolAccount] =
      await ethers.getSigners();
    const marketing = MARKETING;
    const USDTMock = await ethers.deployContract("USDTMock");
    await USDTMock.waitForDeployment();
    const USDTAddress = USDTMock.target;
    const founders = FOUNDERS;
    const saleContract = await ethers.deployContract("TokenSale", [
      USDTAddress,
    ]);
    await saleContract.waitForDeployment();
    const founderPool = await ethers.deployContract("BITFPool", [
      "Founders",
      ethers.parseUnits("53200000", 18),
    ]);
    await founderPool.waitForDeployment();
    const ecoSystem = await ethers.deployContract("BITFPool", [
      "EcoSystem",
      ethers.parseUnits("62000000", 18),
    ]);
    await ecoSystem.waitForDeployment();
    const searchEngine = await ethers.deployContract("BITFPool", [
      "SearchEngine",
      ethers.parseUnits("42200000", 18),
    ]);
    await searchEngine.waitForDeployment();
    const advisors = await ethers.deployContract("BITFPool", [
      "Advisor",
      ethers.parseUnits("22300000", 18),
    ]);
    await advisors.waitForDeployment();
    await advisors.waitForDeployment();
    const vcPool = await ethers.deployContract("VCPool", [
      ethers.parseUnits("100000000", 18),
    ]);
    await vcPool.waitForDeployment();

    const saleContractAddress = saleContract.target;
    const founder = founderPool.target;
    const ecoSystemAddress = ecoSystem.target;
    const searchEngineAddress = searchEngine.target;
    const advisorAddress = advisors.target;
    const vcPoolAddress = vcPool.target;
    const bitfToken = await ethers.deployContract("BITFToken", [
      saleContractAddress,
      marketing,
      founder,
      ecoSystemAddress,
      searchEngineAddress,
      advisorAddress,
      vcPoolAddress,
    ]);

    await bitfToken.waitForDeployment();

    const tokenAddress = bitfToken.target;
    const percents = [75, 15, 10];
    await saleContract.setToken(tokenAddress);
    await saleContract.setPresaleStartTime(2024, 6, 21);
    await saleContract.setPrivateSale1StartTime(2024, 8, 21);
    await saleContract.setPrivateSale2StartTime(2024, 10, 21);
    await saleContract.setPublicSaleStartTime(2024, 11, 21);
    await saleContract.setReleaseTime(2024, 12, 21);
    await saleContract.setProfitReleaseTime(2024, 12, 21);

    await founderPool.setToken(tokenAddress);
    await founderPool.enableFounderPool();
    await founderPool.setFounders(founders, percents);
    await founderPool.setFirstRelease(25, 2025, 10, 21);
    await founderPool.setSecondRelease(30, 2026, 10, 21);
    await founderPool.setThirdRelease(45, 2027, 10, 21);

    await ecoSystem.setToken(tokenAddress);
    await ecoSystem.setFirstRelease(35, 2024, 12, 21);
    await ecoSystem.setSecondRelease(40, 2025, 6, 21);
    await ecoSystem.setThirdRelease(25, 2025, 10, 21);

    await searchEngine.setToken(tokenAddress);
    await searchEngine.setFirstRelease(35, 2024, 12, 21);
    await searchEngine.setSecondRelease(35, 2025, 3, 21);
    await searchEngine.setThirdRelease(30, 2025, 8, 21);

    await advisors.setToken(tokenAddress);
    await advisors.setFirstRelease(20, 2024, 12, 21);
    await advisors.setSecondRelease(40, 2025, 6, 21);
    await advisors.setThirdRelease(40, 2025, 10, 21);

    await vcPool.setToken(tokenAddress);
    await vcPool.setReleaseTime(2024, 12, 21);
    await vcPool.setVC(vcPoolAccount.address, 35);

    return {
      bitfToken,
      marketing,
      saleContract,
      founderPool,
      ecoSystem,
      searchEngine,
      advisors,
      vcPool,
      owner,
      USDTMock,
      otherAccount,
      vcPoolAccount,
      otherPoolAccount,
    };
  }

  describe("Deployment", function () {
    it("Should set the right owner successfully", async function () {
      const {
        bitfToken,
        saleContract,
        founderPool,
        ecoSystem,
        searchEngine,
        advisors,
        owner,
      } = await loadFixture(deploy);
      expect(await bitfToken.owner()).to.equal(owner.address);
      expect(await saleContract.owner()).to.equal(owner.address);
      expect(await founderPool.owner()).to.equal(owner.address);
      expect(await ecoSystem.owner()).to.equal(owner.address);
      expect(await searchEngine.owner()).to.equal(owner.address);
      expect(await advisors.owner()).to.equal(owner.address);
    });

    it("Should set the right amount to separated pools", async function () {
      const {
        bitfToken,
        marketing,
        saleContract,
        founderPool,
        ecoSystem,
        searchEngine,
        advisors,
        owner,
        otherAccount,
      } = await loadFixture(deploy);
      expect(await bitfToken.balanceOf(bitfToken.target)).to.equal(
        ethers.parseUnits("450000", 18)
      );
      expect(await bitfToken.balanceOf(marketing)).to.equal(
        ethers.parseUnits("40000000", 18)
      );
      expect(await bitfToken.balanceOf(saleContract.target)).to.equal(
        ethers.parseUnits("250000000", 18)
      );
      expect(await bitfToken.balanceOf(founderPool.target)).to.equal(
        ethers.parseUnits("53200000", 18)
      );
      expect(await bitfToken.balanceOf(ecoSystem.target)).to.equal(
        ethers.parseUnits("62000000", 18)
      );
      expect(await bitfToken.balanceOf(searchEngine.target)).to.equal(
        ethers.parseUnits("42200000", 18)
      );
      expect(await bitfToken.balanceOf(advisors.target)).to.equal(
        ethers.parseUnits("22300000", 18)
      );
      await bitfToken.connect(owner).toBitForex(otherAccount.address);
      expect(await bitfToken.balanceOf(bitfToken.target)).to.equal(
        ethers.parseUnits("300000", 18)
      );
    });
  });

  describe("ICO - Token Sale", function () {
    it("Sale & Claim Test", async function () {
      ////////////////////////// Presale Test
      console.log("Presale Test:");
      const {
        bitfToken,
        saleContract,
        owner,
        USDTMock,
        vcPool,
        otherAccount,
        vcPoolAccount,
        otherPoolAccount,
      } = await loadFixture(deploy);
      await expect(
        saleContract
          .connect(otherAccount)
          .buyBitfinder(ethers.parseUnits("10000", 18))
      ).to.be.revertedWith("Presale has not started yet");
      const ONE_MONTH_IN_SECS = 30 * 24 * 60 * 60;
      const presaleSlot = ethers.toNumber(
        await saleContract.toTimestamp(2024, 6, 21)
      );
      console.log(presaleSlot);
      let timeslot = presaleSlot + ONE_MONTH_IN_SECS;
      await time.increaseTo(timeslot);
      await USDTMock.connect(owner).transfer(
        otherAccount.address,
        ethers.parseUnits("10000", 18)
      );
      await USDTMock.connect(otherAccount).approve(
        saleContract.target,
        ethers.parseUnits("1000", 18)
      );
      await expect(
        saleContract
          .connect(otherAccount)
          .buyBitfinder(ethers.parseUnits("100000", 18))
      )
        .to.emit(saleContract, "PreSalePurchased")
        .withArgs(
          otherAccount.address,
          ethers.parseUnits("1000", 18),
          ethers.parseUnits("100000", 18)
        );
      expect(await saleContract.presaleBalances(otherAccount)).to.equal(
        ethers.parseUnits("100000", 18)
      );
      console.log(
        `${otherAccount.address} bought 100000 BITF tokens in presale`
      );
      await USDTMock.connect(otherAccount).approve(
        saleContract.target,
        ethers.parseUnits("1000", 18)
      );
      await expect(
        saleContract
          .connect(otherAccount)
          .buyBitfinder(ethers.parseUnits("100000", 18))
      ).to.be.revertedWith("Reached to Max Token contribuiton of Presale");

      ////////////////////////// Private Sale#1
      console.log("Private Sale#1 Test:");
      const TWO_MONTH_IN_SECS = 60 * 24 * 60 * 60;
      timeslot = (await time.latest()) + TWO_MONTH_IN_SECS;
      await time.increaseTo(timeslot);
      await USDTMock.connect(owner).transfer(
        otherAccount.address,
        ethers.parseUnits("200000", 18)
      );
      await USDTMock.connect(otherAccount).approve(
        saleContract.target,
        ethers.parseUnits("200000", 18)
      );
      await expect(
        saleContract
          .connect(otherAccount)
          .buyBitfinder(ethers.parseUnits("6666666", 18))
      )
        .to.emit(saleContract, "PrivateSale1Purchased")
        .withArgs(
          otherAccount.address,
          ethers.parseUnits("19999998", 16),
          ethers.parseUnits("6666666", 18)
        );
      expect(await saleContract.privateSale1Balances(otherAccount)).to.equal(
        ethers.parseUnits("6666666", 18)
      );
      console.log(
        `${otherAccount.address} bought 6666666 BITF tokens in private sale#1`
      );
      await USDTMock.connect(owner).transfer(
        otherAccount.address,
        ethers.parseUnits("1000", 18)
      );
      await USDTMock.connect(otherAccount).approve(
        saleContract.target,
        ethers.parseUnits("1000", 18)
      );
      await expect(
        saleContract
          .connect(otherAccount)
          .buyBitfinder(ethers.parseUnits("100000", 18))
      ).to.be.revertedWith(
        "Reached to Max Token contribuiton of Private sale#1"
      );

      ////////////////////////// Private Sale#2
      console.log("Private Sale#2 Test:");
      timeslot = (await time.latest()) + TWO_MONTH_IN_SECS;
      await time.increaseTo(timeslot);
      await USDTMock.connect(owner).transfer(
        otherAccount.address,
        ethers.parseUnits("350000", 18)
      );
      await USDTMock.connect(otherAccount).approve(
        saleContract.target,
        ethers.parseUnits("350000", 18)
      );
      await expect(
        saleContract
          .connect(otherAccount)
          .buyBitfinder(ethers.parseUnits("7000000", 18))
      )
        .to.emit(saleContract, "PrivateSale2Purchased")
        .withArgs(
          otherAccount.address,
          ethers.parseUnits("350000", 18),
          ethers.parseUnits("7000000", 18)
        );
      expect(await saleContract.privateSale2Balances(otherAccount)).to.equal(
        ethers.parseUnits("7000000", 18)
      );
      console.log(
        `${otherAccount.address} bought 7000000 BITF tokens in private sale#2`
      );
      await USDTMock.connect(owner).transfer(
        otherAccount.address,
        ethers.parseUnits("1000", 18)
      );
      await USDTMock.connect(otherAccount).approve(
        saleContract.target,
        ethers.parseUnits("1000", 18)
      );
      await expect(
        saleContract
          .connect(otherAccount)
          .buyBitfinder(ethers.parseUnits("100000", 18))
      ).to.be.revertedWith(
        "Reached to Max Token contribuiton of Private sale#2"
      );

      ////////////////////////// Public Sale Test
      console.log("Public Sale Test:");
      timeslot = (await time.latest()) + ONE_MONTH_IN_SECS;
      await time.increaseTo(timeslot);
      await USDTMock.connect(owner).transfer(
        otherAccount.address,
        ethers.parseUnits("750", 18)
      );
      await USDTMock.connect(otherAccount).approve(
        saleContract.target,
        ethers.parseUnits("750", 18)
      );
      await expect(
        saleContract
          .connect(otherAccount)
          .buyBitfinder(ethers.parseUnits("10714", 18))
      )
        .to.emit(saleContract, "PublicSalePurchased")
        .withArgs(
          otherAccount.address,
          ethers.parseUnits("74998", 16),
          ethers.parseUnits("10714", 18)
        );
      expect(await saleContract.publicSaleBalances(otherAccount)).to.equal(
        ethers.parseUnits("10714", 18)
      );
      console.log(
        `${otherAccount.address} bought 10714 BITF tokens in public sale`
      );
      expect(await saleContract.publicSaleSold()).to.equal(
        ethers.parseUnits("10714", 18)
      );
      await USDTMock.connect(owner).transfer(
        otherAccount.address,
        ethers.parseUnits("100", 18)
      );
      await USDTMock.connect(otherAccount).approve(
        saleContract.target,
        ethers.parseUnits("100", 18)
      );
      await expect(
        saleContract
          .connect(otherAccount)
          .buyBitfinder(ethers.parseUnits("100", 18))
      ).to.be.revertedWith("Reached to Max Token contribuiton of Public sale");

      ////////////////////////// Presale Claim
      console.log("Presale Claim Test:");
      await expect(
        saleContract
          .connect(otherAccount)
          .claimPresaleToken(ethers.parseUnits("100000", 18))
      ).to.be.revertedWith("Token is not available to release yet");
      timeslot = (await time.latest()) + ONE_MONTH_IN_SECS;
      await time.increaseTo(timeslot);
      await expect(
        saleContract
          .connect(otherAccount)
          .claimPresaleToken(ethers.parseUnits("1000000", 18))
      ).to.be.revertedWith("Claim amount exceeds balance");
      await expect(
        saleContract
          .connect(otherAccount)
          .claimPresaleToken(ethers.parseUnits("100000", 18))
      )
        .to.emit(saleContract, "ClaimPresale")
        .withArgs(otherAccount.address, ethers.parseUnits("100000", 18));
      expect(await bitfToken.balanceOf(otherAccount.address)).to.equal(
        ethers.parseUnits("100000", 18)
      );
      console.log(
        `${otherAccount.address} claimed 100000 BITF tokens in pre sale`
      );

      ////////////////////////// VC Pool Claim Test
      await vcPool.connect(vcPoolAccount).claimToken();
      let vcPoolBalance = await vcPool.releasedAmount(vcPoolAccount.address);
      // 100M * 35% * 7% = 2450000 (1 Month Passed)
      expect(vcPoolBalance).to.equal(ethers.parseUnits("2450000", 18));
      await vcPool.connect(vcPoolAccount).claimToken();
      expect(await vcPool.releasedAmount(vcPoolAccount.address)).to.equal(
        vcPoolBalance
      );
      expect(await bitfToken.balanceOf(vcPoolAccount.address)).to.equal(
        vcPoolBalance
      );

      ////////////////////////// Public Sale Claim
      console.log("Public Sale Claim Test:");
      await expect(
        saleContract
          .connect(otherAccount)
          .claimPublicSaleToken(ethers.parseUnits("10714", 18))
      )
        .to.emit(saleContract, "ClaimPublicSale")
        .withArgs(otherAccount.address, ethers.parseUnits("10714", 18));

      ////////////////////////// Private Sale Claim
      console.log("Private sale Claim Test:");
      await expect(
        saleContract
          .connect(otherAccount)
          .claimPrivateSale1Token(ethers.parseUnits("999999", 18))
      ).to.be.revertedWith("Claim amount exceeds Available Amount");
      await expect(
        saleContract
          .connect(otherAccount)
          .claimPrivateSale2Token(ethers.parseUnits("1000000", 18))
      ).to.be.revertedWith("Claim amount exceeds Available Amount");

      timeslot = (await time.latest()) + ONE_MONTH_IN_SECS;
      await time.increaseTo(timeslot);
      console.log("One month is passed from released time");
      await expect(
        saleContract
          .connect(otherAccount)
          .claimPrivateSale1Token(ethers.parseUnits("999999", 18))
      )
        .to.emit(saleContract, "ClaimPrivateSale1")
        .withArgs(otherAccount.address, ethers.parseUnits("999999", 18));
      expect(await bitfToken.balanceOf(otherAccount.address)).to.equal(
        ethers.parseUnits("1110713", 18)
      );
      console.log(
        `${otherAccount.address} claimed 999999 BITF tokens in private sale#1 Total claimed 1110713 BITF`
      );

      ////////////////////////// VC Pool Claim Test
      await vcPool.connect(vcPoolAccount).claimToken();
      vcPoolBalance = await vcPool.releasedAmount(vcPoolAccount.address);
      // 100M * 35% * 7% * 2 = 4900000 (2 Months Passed)
      expect(vcPoolBalance).to.equal(ethers.parseUnits("4900000", 18));
      await vcPool.connect(vcPoolAccount).claimToken();
      expect(await vcPool.releasedAmount(vcPoolAccount.address)).to.equal(
        vcPoolBalance
      );
      expect(await bitfToken.balanceOf(vcPoolAccount.address)).to.equal(
        vcPoolBalance
      );

      await expect(
        saleContract
          .connect(otherAccount)
          .claimPrivateSale2Token(ethers.parseUnits("1050000", 18))
      )
        .to.emit(saleContract, "ClaimPrivateSale2")
        .withArgs(otherAccount.address, ethers.parseUnits("1050000", 18));
      expect(await bitfToken.balanceOf(otherAccount.address)).to.equal(
        ethers.parseUnits("2160713", 18)
      );
      console.log(
        `${otherAccount.address} claimed 1050000 BITF tokens in private sale#2 Total claimed 2160713 BITF`
      );
      console.log(await USDTMock.balanceOf(saleContract.target));
      await saleContract.connect(owner).withdrawUSDT();
      console.log(await USDTMock.balanceOf(saleContract.target));
    });
  });
});
