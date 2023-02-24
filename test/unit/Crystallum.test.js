//Running tests to check if the contract is working well
//UNCOMPLETE

const { assert, expect } = require("chai");
const { deployments, ethers } = require("hardhat");

describe("Crystallum", function () {
  let crystallumContract;
  let mockV3Aggregator;
  let deployer;
  const sendValue = ethers.utils.parseEther("1");
  beforeEach(async () => {
    deployer = (await getNamedAccounts()).deployer;
    await deployments.fixture(["all"]);
    crystallumContract = await ethers.getContract("Crystallum", deployer);
    mockV3Aggregator = await ethers.getContract("MockV3Aggregator", deployer);
  });

  describe("constructor", function () {
    it("sets the aggregator addresses correctly", async () => {
      const response = await crystallumContract.getPriceFeed();
      assert.equal(response, mockV3Aggregator.address);
    });
  });
  describe("retrieve", function () {
    beforeEach(async () => {
      await crystallumContract.fundContract({ value: sendValue });
      await crystallumContract.setBottles(10);
    });
    it("withdraws ETH depending of bottles", async () => {
      const startingContractBalance =
        await crystallumContract.provider.getBalance(
          crystallumContract.address
        );
      const startingDeployerBalance =
        await crystallumContract.provider.getBalance(deployer);

      const transactionResponse = await crystallumContract.retrieve();
      const transactionReceipt = await transactionResponse.wait();
      const { gasUsed, effectiveGasPrice } = transactionReceipt;
      const gasCost = gasUsed.mul(effectiveGasPrice);

      const endingContractBalance =
        await crystallumContract.provider.getBalance(
          crystallumContract.address
        );
      const endingDeployerBalance =
        await crystallumContract.provider.getBalance(deployer);

      assert.equal(
        endingContractBalance.add(
          endingDeployerBalance.minus(startingDeployerBalance).add(gasCost)
        ),
        startingContractBalance
      );
    });
  });
});
