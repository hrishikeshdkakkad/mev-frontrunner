import { ethers } from "ethers";
// import * as abi from "./abi.json";
import axios from "axios";
// import { ercAbi } from "../test/erc";
// import * as IUniswapV2Router02 from "@uniswap/v2-periphery/build/IUniswapV2Router02.json";

import { TickMath, FullMath } from '@uniswap/v3-sdk';
// import { JSBI } from 'jsbi';
import JSBI from 'jsbi'

const wssUrl = "ws://127.0.0.1:8545/";
const router = "0xEf1c6E67703c7BD7107eed8303Fbe6EC2554BF6B";

// const interfaceI = new ethers.utils.Interface(abi);

async function main() {
  const provider = new ethers.providers.WebSocketProvider(wssUrl);
  const test = await provider.send("eth_pendingTransactions");

  provider.on("pending", async (tx) => {
    console.log(tx, "tx");
    const txnData = await provider.getTransaction(tx);
    if (txnData && txnData.to) {
      // let decoded = interfaceI.decodeFunctionData(
      //   "execute(bytes calldata commands, bytes[] calldata inputs, uint256 deadline)",
      //   txnData.data
      // );
      // console.log(decoded, "td");
      try {
        const res = await axios.post("http://localhost:30000", txnData);
        const decodedResult = decoder(res.data);
      } catch (error) {
        console.log(error, "error");
      }
      // const result = decodeExecute(decoded);
      // console.log(result, "result");
    }
  });
}


async function logTxn(data: ethers.providers.TransactionResponse) {
  console.log("Posting to Webhook: ", data.hash);
  try {
    const response = await axios.post(
      "https://eoi339avn311ljh.m.pipedream.net",
      data
    );
    console.log(response.status, "status");
  } catch (error) {
    console.log(error, "error");
  }
}

interface IDecoded {
  function: "V3_SWAP_EXACT_IN";
  recipient: string;
  amountIn: string;
  amountOut: string;
  path: string[];
  payerIsUser: boolean;
}

async function priceFromTick(
  baseToken: string,
  quoteToken: string,
  inputAmount: number,
  currentTick: number,
  baseTokenDecimals: number,
  quoteTokenDecimals: number,
): Promise<number> {
  const sqrtRationX96 = TickMath.getSqrtRatioAtTick(currentTick);
  const ratioX192 = JSBI.multiply(sqrtRationX96, sqrtRationX96);
  const baseAmount  = JSBI.BigInt(inputAmount * (10**baseTokenDecimals));
  const shift = JSBI.leftShift(JSBI.BigInt(1), JSBI.BigInt(192));
  const quoteAmount  = FullMath.mulDivRoundingUp(ratioX192, baseAmount, shift);
  const finalAmount  = Number(quoteAmount.toString()) / (10**quoteTokenDecimals);
  console.log(finalAmount);
  return finalAmount;
}


async function decoder(input: IDecoded) {
  // console.log(input, "input");
  const result: any = {};
  const amountOutput = (parseInt(input.amountOut)/10**18)
  const amountInput = (parseInt(input.amountIn)/10**6)
  console.log(amountInput,"Amount In")
  // console.log((parseInt(input.amountOut)/10**18),"Amount Out")
  // console.log(input.path[0],"Token - 0")
  // console.log(input.path[1],"Token - 1")
  const finalAmout = await priceFromTick(
    input.path[0],
    input.path[1],
    amountInput,
    201160,
    6,18
  )
  console.log(amountOutput,"Amount Out")
  console.log(finalAmout,"Final Output")
  console.log(finalAmout - amountOutput,"Difference")
  console.log((((finalAmout - amountOutput)/amountOutput)*100),"The slippage")
  const slippage = (((finalAmout - amountOutput)/amountOutput)*100);

  result['finalAmout'] = finalAmout;
  result['amountOutput'] = amountOutput;
  result['amountInput'] = amountInput;
  result['slippage'] = slippage;


  return result;

  // Todo
  // Example
  // {
  //   function: 'V3_SWAP_EXACT_IN',
  //   recipient: '0x0000000000000000000000000000000000000001',
  //   amountIn: '1000000000000000000',
  //   amountOut: '1788079921085547922193',
  //   path: [
  //     '0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2',
  //     '0x6b175474e89094c44da98b954eedeac495271d0f'
  //   ],
  //   payerIsUser: false
  // }
}

main();
