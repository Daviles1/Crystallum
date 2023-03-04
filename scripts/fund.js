const { ethers, getNamedAccounts } = require("hardhat");

async function main() {
  const { deployer } = await getNamedAccounts();
  const crystallum = await ethers.getContract("Crystallum", deployer);
  console.log(`Got contract Crystallum at ${crystallum.address}`);
  console.log("Funding contract...");
  const transactionResponse = await crystallum.fundContract({
    value: ethers.utils.parseEther("100"),
  });
  await transactionResponse.wait();
  console.log("Funded!");
  console.log(transactionResponse);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
