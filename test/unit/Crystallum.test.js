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
    const priceFeedAddress = "0x8A753747A1Fa494EC906cE90E9f37563A8AF630e"; // Kovan ETH/USD Price Feed
    s_priceFeed = await ethers.getContractAt(
      "MockV3Aggregator",
      priceFeedAddress
    );
    crystallum = await Crystallum.deploy(s_priceFeed.address);
    await crystallum.deployed();
  });

  it("should deploy correctly", async function () {
    expect(await crystallum.getOwner()).to.equal(owner.address);
  });

  it("should allow owner to set number of bottles", async function () {
    const numberOfBottles = 10;
    await crystallum.setBottles(numberOfBottles);
    expect(await crystallum.getNumberOfBottles(owner.address)).to.equal(
      numberOfBottles
    );
  });

  it("should retrieve the correct amount for a user", async function () {
    const numberOfBottles = 10;
    await crystallum.setBottles(numberOfBottles);
    const initialBalance = await owner.getBalance();
    await crystallum.retrieve();
    const newBalance = await owner.getBalance();
    const expectedBalance = initialBalance.add(
      ethers.utils.parseEther("1").mul(numberOfBottles)
    );
    expect(newBalance).to.equal(expectedBalance);
  });

  it("should not allow users with no bottles to retrieve", async function () {
    await expect(crystallum.retrieve()).to.be.revertedWith(
      "You have no bottles to retrieve"
    );
  });

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

  it("should allow users to send ETH to other addresses", async function () {
    const initialBalance = await addr1.getBalance();
    const amount = ethers.utils.parseEther("1");
    await crystallum.send(addr1.address, { value: amount });
    const newBalance = await addr1.getBalance();
    const expectedBalance = initialBalance.add(amount);
    expect(newBalance).to.equal(expectedBalance);
  });

  it("should not allow users to send ETH to invalid addresses", async function () {
    await expect(
      crystallum.send("0x0000000000000000000000000000000000000000", {
        value: ethers.utils.parseEther("1"),
      })
    ).to.be.revertedWith("Adresse invalide");
  });
  // Test retrieving ETH from contract
  // Test "should retrieve ETH from contract and update balances"
  it("should retrieve ETH from contract and update balances", async function () {
    // Deploy Crystallum contract
    const Crystallum = await ethers.getContractFactory("Crystallum");
    const crystallum = await Crystallum.deploy(s_priceFeed.address);

    // Get initial balance of account
    const initialBalance = await ethers.provider.getBalance(addr1.address);

    // Send some ETH to the contract
    const value = ethers.utils.parseEther("1");
    await crystallum.fundContract({ value: value });

    // Set number of bottles for the account
    const numberOfBottles = 1;
    await crystallum.setBottles(numberOfBottles);

    // Retrieve ETH from the contract
    await crystallum.retrieve();

    // Check updated balances
    const expectedBalance = initialBalance.add(value);
    const account1Balance = await ethers.provider.getBalance(addr1.address);
    const crystallumBalance = await ethers.provider.getBalance(
      crystallum.address
    );

    expect(account1Balance).to.equal(expectedBalance);
    expect(crystallumBalance).to.equal(0);
  });

  // Test "should send ETH to another address and update balances"
  it("should send ETH to another address and update balances", async function () {
    // Deploy Crystallum contract
    const Crystallum = await ethers.getContractFactory("Crystallum");
    const crystallum = await Crystallum.deploy(s_priceFeed.address);

    // Get initial balances of accounts
    const initialSenderBalance = await ethers.provider.getBalance(
      addr1.address
    );
    const initialRecipientBalance = await ethers.provider.getBalance(
      addr2.address
    );

    // Send some ETH to the contract
    const value = ethers.utils.parseEther("1");
    await crystallum.fundContract({ value: value });

    // Send ETH from contract to recipient
    const recipient = addr2.address;
    const senderBalanceBefore = await ethers.provider.getBalance(
      crystallum.address
    );
    const tx = await crystallum.send(recipient, { value: value });
    const senderBalanceAfter = await ethers.provider.getBalance(
      crystallum.address
    );

    // Check updated balances
    const expectedSenderBalance = initialSenderBalance.sub(value);
    const expectedRecipientBalance = initialRecipientBalance.add(value);
    const actualSenderBalance = senderBalanceBefore
      .sub(senderBalanceAfter)
      .add(value);
    const actualRecipientBalance = await ethers.provider.getBalance(recipient);

    expect(actualSenderBalance).to.equal(expectedSenderBalance);
    expect(actualRecipientBalance).to.equal(expectedRecipientBalance);
  });
});
