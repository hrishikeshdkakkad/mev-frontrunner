import { expect } from "chai";
import { ethers } from "hardhat";
import * as hre from "hardhat";
import { DAI, DAI_WHALE, POOL_ADDRESS_PROVIDER } from "./constants";

describe("Executer", function () {
  it("It should execute a flash loan", async function () {
    const executor = await ethers.getContractFactory("Executer");

    const execute = await executor.deploy(POOL_ADDRESS_PROVIDER);
    await execute.deployed();
    const token = await ethers.getContractAt("IERC20", DAI);
    const BALANCE_AMOUNT_DAI = ethers.utils.parseEther("2000");
    await hre.network.provider.request({
      method: "hardhat_impersonateAccount",
      params: [DAI_WHALE],
    });
    const signer = await ethers.getSigner(DAI_WHALE);
    await token.connect(signer).transfer(execute.address, BALANCE_AMOUNT_DAI);

    const tx = await execute.createFlashLoan(DAI, 1000);
    await tx.wait();
    const remainingBalance = await token.balanceOf(execute.address);
    expect(remainingBalance.lt(BALANCE_AMOUNT_DAI)).to.be.true;
  });
});
