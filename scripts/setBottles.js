const { ethers, getNamedAccounts } = require("hardhat");

//Fonction qui appelle la fonction "setBottles" du contrat
async function main() {
  const { deployer } = await getNamedAccounts();
  const crystallum = await ethers.getContract("Crystallum", deployer);
  console.log(`Got contract Crystallum at ${crystallum.address}`);
  console.log("Setting bottles...");
  const transactionResponse = await crystallum.setBottles(100);
  await transactionResponse.wait(1);
  const numberOfBottles = await crystallum.getNumberOfBottles(deployer);
  console.log(`You have ${numberOfBottles} bottles`);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
