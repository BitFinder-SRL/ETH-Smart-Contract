// We require the Hardhat Runtime Environment explicitly here. This is optional
// but useful for running the script in a standalone fashion through `node <script>`.
//
// You can also run a script with `npx hardhat run <script>`. If you do that, Hardhat
// will compile your contracts, add the Hardhat Runtime Environment's members to the
// global scope, and execute the script.
const { ethers } = require("hardhat");
const { FOUNDERS, MARKETING, USDT } = require("../pvKey.js");

async function main() {

  const USDTAddress = USDT;
  const marketing = MARKETING;
  const saleContract = await ethers.deployContract("TokenSale", [
    USDTAddress,
  ]);
  await saleContract.waitForDeployment();
  const founderPool = await ethers.deployContract("BITFPool", [
    "Founders",
    ethers.parseUnits("53200000", 18)
  ]);
  await founderPool.waitForDeployment();
  const ecoSystem = await ethers.deployContract("BITFPool", [
    "EcoSystem",
    ethers.parseUnits("62000000", 18)
  ]);
  await ecoSystem.waitForDeployment();
  const searchEngine = await ethers.deployContract("BITFPool", [
    "SearchEngine",
    ethers.parseUnits("42200000", 18)
  ]);
  await searchEngine.waitForDeployment();
  const advisors = await ethers.deployContract("BITFPool", [
    "Advisor",
    ethers.parseUnits("22300000", 18)
  ]);  
  await advisors.waitForDeployment();
  const vcPool =  await ethers.deployContract("VCPool", [
    ethers.parseUnits("100000000", 18)
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
    vcPoolAddress
  ]);

  await bitfToken.waitForDeployment();

  const tokenAddress = bitfToken.target;
  const founders = FOUNDERS;
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

  const totalSupply = await bitfToken.totalSupply();
  const saleContractBalance = await bitfToken.balanceOf(saleContractAddress);
  const vcPoolBalance = await bitfToken.balanceOf(vcPoolAddress);
  const founderPoolBalance = await bitfToken.balanceOf(founder);
  const ecoSystemBalance = await bitfToken.balanceOf(ecoSystemAddress);
  const searchEngineBalance = await bitfToken.balanceOf(searchEngineAddress);
  const advisorBalance = await bitfToken.balanceOf(advisorAddress);

  console.log(`BITFToken is deployed to: ${bitfToken.target}`);
  console.log(`TokenSale Contract is deployed to: ${saleContractAddress}`);
  console.log(`Marketing Pool is deployed to: ${marketing}`);
  console.log(`Founder Pool is deployed to: ${founder}`);
  console.log(`Eco System Pool is deployed to: ${ecoSystemAddress}`);
  console.log(`Search Engine Pool is deployed to: ${searchEngineAddress}`);
  console.log(`Advisor Pool is deployed to: ${advisorAddress}`);
  console.log(`VC Pool is deployed to: ${vcPoolAddress}`);
  console.log(`Total supply is: ${totalSupply}`);
  console.log(`Sale Contract Balance is: ${saleContractBalance}`);
  console.log(`VC Pool Balance is: ${vcPoolBalance}`);
  console.log(`Founder Pool Balance is: ${founderPoolBalance}`);
  console.log(`Eco System Balance is: ${ecoSystemBalance}`);
  console.log(`Search Engine Balance is: ${searchEngineBalance}`);
  console.log(`Advisor Pool Balance is: ${advisorBalance}`);
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
