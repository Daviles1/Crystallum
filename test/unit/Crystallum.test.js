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

  // describe("Send", function () {
  //   beforeEach(async function () {
  //     const amount = ethers.utils.parseEther("10");
  //     await crystallum.send(addr1.address, { value: amount });
  //   });
  //   it("should allow users to send ETH to other addresses", async function () {
  //     const initialBalance = await addr1.getBalance();
  //     const transactionResponse = await crystallum.send(addr1.address, {
  //       value: amount,
  //     });
  //     const transactionReceipt = await transactionResponse.wait();
  //     const newBalance = await addr1.getBalance();
  //     const expectedBalance = initialBalance.add(amount);
  //     expect(newBalance).to.equal(expectedBalance);
  //   });

  //   it("should not allow users to send ETH to invalid addresses", async function () {
  //     await expect(
  //       crystallum.send("0x0000000000000000000000000000000000000000", {
  //         value: ethers.utils.parseEther("1"),
  //       })
  //     ).to.be.revertedWith("Adresse invalide");
  //   });
  //   it("should send ETH to another address and update balances", async function () {
  //     const initialSenderBalance = await ethers.provider.getBalance(
  //       addr1.address
  //     );
  //     const initialRecipientBalance = await ethers.provider.getBalance(
  //       addr2.address
  //     );

  //     const value = ethers.utils.parseEther("1");
  //     await crystallum.fundContract({ value: value });

  //     const recipient = addr2.address;
  //     const senderBalanceBefore = await ethers.provider.getBalance(
  //       crystallum.address
  //     );
  //     const tx = await crystallum.send(recipient, { value: value });
  //     const senderBalanceAfter = await ethers.provider.getBalance(
  //       crystallum.address
  //     );

  //     const expectedSenderBalance = initialSenderBalance.sub(value);
  //     const expectedRecipientBalance = initialRecipientBalance.add(value);
  //     const actualSenderBalance = senderBalanceBefore
  //       .sub(senderBalanceAfter)
  //       .add(value);
  //     const actualRecipientBalance = await ethers.provider.getBalance(
  //       recipient
  //     );

  //     expect(actualSenderBalance).to.equal(expectedSenderBalance);
  //     expect(actualRecipientBalance).to.equal(expectedRecipientBalance);
  //   });
  // });
});
