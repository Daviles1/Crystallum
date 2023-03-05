const { ethers, getNamedAccounts } = require("hardhat");

//Fonction qui appelle la fonction "retrieve" du contrat
async function main() {
  const { deployer } = await getNamedAccounts();
  const crystallum = await ethers.getContract("Crystallum", deployer);
  console.log(`Got contract Crystallum at ${crystallum.address}`);
  console.log("Withdrawing from contract...");
  const transactionResponse = await crystallum.retrieve();
  await transactionResponse.wait();
  console.log("Got it back!");
  console.log(transactionResponse);
  const balance = await crystallum.getBalance(deployer);
  console.log(`Balance of deployer: ${balance}`);
  const numberOfBottles = await crystallum.getNumberOfBottles(deployer);
  console.log(`You have ${numberOfBottles} bottles`);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
