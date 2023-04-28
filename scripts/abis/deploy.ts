import { ethers } from "hardhat";

async function main() {
  const Executor = await ethers.getContractFactory("Executer");
  const executor = await Executor.deploy("0xC911B590248d127aD18546B186cC6B324e99F02c");

  await executor.deployed();

  console.log("Executor deployed to:", executor.address);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
