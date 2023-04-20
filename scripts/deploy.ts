import { ethers } from "hardhat";

async function main() {
  const Uniswap = await ethers.getContractFactory("SimpleSwap");
  const uniswap = await Uniswap.deploy("Hello, Hardhat!");

  await uniswap.deployed();

  console.log("Greeter deployed to:", uniswap.address);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
