import { expect } from "chai";
import { ethers } from "hardhat";
import { ercAbi } from "./erc";
import { UniswapV2RouterLocal } from "../scripts/routerv2";

describe("SwapSol", function () {
  const SwapRouterAddress = "0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D";
  const WETH_ADDRESS = "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2";
  const DAI_ADDRESS = "0x6B175474E89094C44Da98b954EedeAC495271d0F";
  const DAI_DECIMALS = 18;

  it("Should provide a caller with more DAI than they started with after a swap", async function () {
    /* Deploy the SimpleSwap contract */
    const simpleSwapFactory = await ethers.getContractAt(
      UniswapV2RouterLocal,
      SwapRouterAddress
    );
    // const simpleSwap = await simpleSwapFactory.deploy(simpleSwapFactory);
    // await simpleSwap.deployed();
    let signers = await ethers.getSigners();

    /* Connect to WETH and wrap some eth  */
    const WETH = new ethers.Contract(WETH_ADDRESS, ercAbi, signers[0]);
    const deposit = await WETH.deposit({
      value: ethers.utils.parseEther("1"),
    });
    await deposit.wait();

    /* Check Initial DAI Balance */
    const DAI = new ethers.Contract(DAI_ADDRESS, ercAbi, signers[0]);
    const expandedDAIBalanceBefore = await DAI.balanceOf(signers[0].address);
    const DAIBalanceBefore = Number(
      ethers.utils.formatUnits(expandedDAIBalanceBefore, DAI_DECIMALS)
    );

    console.log("DAI Balance Before: ", DAIBalanceBefore);

    await WETH.approve(simpleSwapFactory.address, ethers.utils.parseEther("1"));

    const amountIn = ethers.utils.formatUnits("1");
    const deadline = Math.floor(Date.now() / 1000) + 60 * 10;

    const swap = await simpleSwapFactory
      .connect(signers[0])
      .swapExactTokensForTokens(
        ethers.utils.parseUnits("1","ether"),
        2,
        [DAI.address],
        signers[0].address,
        deadline,
        {
          gasLimit: 300000,
        }
      );
    const swap2 = await swap.wait();
    console.log(swap2, "swap");

    const expandedDAIBalanceAfter = await DAI.balanceOf(signers[0].address);

    const DAIBalanceAfter = Number(
      ethers.utils.formatUnits(expandedDAIBalanceAfter, DAI_DECIMALS)
    );

    console.log("DAI Balance After: ", DAIBalanceAfter);

    expect(DAIBalanceAfter).is.greaterThan(DAIBalanceBefore);
  });
});
