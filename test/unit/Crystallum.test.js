//Code permettant de tester le contrat pour voir si il marche bien

const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("Crystallum", function () {
  let owner;

  let addr1;
  let addr2;
  let addrs;

  let crystallum;

  beforeEach(async function () {
    [owner, addr1, addr2, ...addrs] = await ethers.getSigners();

    const Crystallum = await ethers.getContractFactory("Crystallum");
    const priceFeedAddress = "0xD4a33860578De61DBAbDc8BFdb98FD742fA7028e";
    s_priceFeed = await ethers.getContractAt(
      "MockV3Aggregator",
      priceFeedAddress
    );

    crystallum = await Crystallum.deploy(s_priceFeed.address);
    await crystallum.deployed();
  });
  describe("Constructor", function () {
    it("should deploy correctly", async function () {
      expect(await crystallum.getOwner()).to.equal(owner.address);
    });
  });

  describe("Bottles", function () {
    it("should allow owner to set number of bottles", async function () {
      const numberOfBottles = 10;
      await crystallum.setBottles(numberOfBottles);
      expect(await crystallum.getNumberOfBottles(owner.address)).to.equal(
        numberOfBottles
      );
    });
  });

  describe("Retrieve", function () {
    beforeEach(async function () {
      const amount = ethers.utils.parseEther("10");
      await crystallum.fundContract({
        value: amount,
      });
      const numberOfBottles = 10;
      await crystallum.setBottles(numberOfBottles);
    });
    it("should retrieve the correct amount for a user", async function () {
      const numberOfBottles = 10;
      const priceBottle = 0.1;
      const amountUsd = numberOfBottles * priceBottle;
      const amountEth = (amountUsd / 2000) * 10 ** 18;

      const initialBalance = await owner.getBalance();

      const transactionResponse = await crystallum.retrieve();
      const transactionReceipt = await transactionResponse.wait();
      const { gasUsed, effectiveGasPrice } = transactionReceipt;

      const gasCost = gasUsed.mul(effectiveGasPrice);

      const newBalance = await owner.getBalance();
      const expectedBalance = initialBalance.sub(gasCost).add(amountEth);
      expect(newBalance).to.equal(expectedBalance);
    });
  });

  describe("No bottles", function () {
    it("should not allow users with no bottles to retrieve", async function () {
      await expect(crystallum.retrieve()).to.be.revertedWith(
        "You have no bottles to retrieve"
      );
    });
  });

  describe("Fund", function () {
    it("should allow users to fund the contract", async function () {
      const initialBalance = await owner.getBalance();
      const amount = ethers.utils.parseEther("1");
      const transactionResponse = await crystallum.fundContract({
        value: amount,
      });
      const transactionReceipt = await transactionResponse.wait();
      const { gasUsed, effectiveGasPrice } = transactionReceipt;
      const gasCost = gasUsed.mul(effectiveGasPrice);
      const newBalance = await owner.getBalance();
      const expectedBalance = initialBalance.sub(amount).sub(gasCost);
      expect(newBalance.toString()).to.equal(expectedBalance.toString());
    });
  });

  describe("Send", function () {
    beforeEach(async function () {
      const amount = ethers.utils.parseEther("1");
      await crystallum.fundContract({
        value: amount,
      });
      await crystallum.setBottles(10000);
      await crystallum.retrieve();
    });
    it("should allow users to send ETH to other addresses", async function () {
      const amount = ethers.utils.parseEther("0.1");
      const initialBalanceAddr1 = await addr1.getBalance();
      const initialBalanceOwner = await owner.getBalance();

      const transactionResponse = await crystallum.send(addr1.address, {
        value: amount,
      });
      const transactionReceipt = await transactionResponse.wait();
      const { gasUsed, effectiveGasPrice } = transactionReceipt;
      const gasCost = gasUsed.mul(effectiveGasPrice);

      const newBalanceAddr1 = await addr1.getBalance();
      const newBalanceOwner = await owner.getBalance();

      const expectedBalanceAddr1 = initialBalanceAddr1.add(amount);
      const expectedBalanceOwner = initialBalanceOwner.sub(amount).sub(gasCost);

      expect(newBalanceAddr1).to.equal(expectedBalanceAddr1);
      expect(newBalanceOwner).to.equal(expectedBalanceOwner);
    });

    it("should not allow users to send ETH to invalid addresses", async function () {
      await expect(
        crystallum.send("0x0000000000000000000000000000000000000000", {
          value: ethers.utils.parseEther("1"),
        })
      ).to.be.revertedWith("Adresse invalide");
    });
  });
});
