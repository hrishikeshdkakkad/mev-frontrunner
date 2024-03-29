import { ethers } from "ethers";
import { useSigner, useContract } from "wagmi";
import WETHArtifact from "../abis/WETH.json";

const WETH_ADDRESS = "0x82aF49447D8a07e3bd95BD0d56f35241523fBab1";
const WETH_DECIMALS = 18;

const useWETH = () => {
  const { data: signer } = useSigner();
  const WETHContract = useContract({
    address: WETH_ADDRESS,
    abi: WETHArtifact.abi,
    signerOrProvider: signer,
  });

  const deposit = async (amount: number) => {
    if (!WETHContract)
      throw new Error("WETH contract has not been initialized");

    const parsedAmount = ethers.utils.parseUnits(
      amount.toString(),
      WETH_DECIMALS
    );

    console.log("Before txn");

    const txn = await WETHContract.deposit({ value: parsedAmount });
    console.log(txn, "WETH");
    txn.wait();
    return txn;
  };

  const approve = async (address: string, amount: number) => {
    if (!WETHContract)
      throw new Error("WETH contract has not been initialized");

    const parsedAmount = ethers.utils.parseUnits(
      amount.toString(),
      WETH_DECIMALS
    );

    const txn = await WETHContract.approve(address, parsedAmount);
    console.log(txn, "after approve")
    return txn;
  };

  return { deposit, approve };
};

export default useWETH;
