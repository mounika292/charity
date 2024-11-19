const hre = require("hardhat");

async function main() {
  // Get the contract factory
  const Charity = await hre.ethers.getContractFactory("Charity");

  // Deploy the contract
  const charity = await Charity.deploy();

  // Wait for the contract deployment transaction to be mined
  await charity.deployTransaction.wait();

  // Log the deployed contract address
  console.log("Charity contract deployed to:", charity.address);
}

// Execute main function and handle errors
main().catch((error) => {
  console.error("Error deploying contract:", error);
  process.exitCode = 1;
});
