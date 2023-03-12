const { ethers, getNamedAccounts } = require("hardhat");

//Fonction qui appelle la fonction "send" du contrat
async function main() {
  const { deployer } = await getNamedAccounts();
  const crystallum = await ethers.getContract("Crystallum", deployer);
  console.log(`Got contract Crystallum at ${crystallum.address}`);
  console.log("Sending ETH from contract...");

  const transactionResponse = await crystallum.send(
    "0x8626f6940E2eb28930eFb4CeF49B2d1F2C9C1199",
    {
      value: ethers.utils.parseEther("0.00001"),
    }
  );
  await transactionResponse.wait();
  console.log(transactionResponse);
  const balanceDeployer = await crystallum.getBalance(deployer);
  const balanceReceiver = await crystallum.getBalance(
    "0x8626f6940e2eb28930efb4cef49b2d1f2c9c1199"
  );
  console.log(`Balance of deployer: ${balanceDeployer}`);
  console.log(`Balance of receiver: ${balanceReceiver}`);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
