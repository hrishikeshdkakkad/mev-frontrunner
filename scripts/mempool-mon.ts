import { ethers } from "ethers";
import axios from "axios";

import { TickMath, FullMath } from "@uniswap/v3-sdk";
import JSBI from "jsbi";
import { Server, Socket } from "socket.io";
import http from "http";

const wssUrl = "ws://127.0.0.1:8545/";
const router = "0xEf1c6E67703c7BD7107eed8303Fbe6EC2554BF6B";

// const interfaceI = new ethers.utils.Interface(abi);

const server = http.createServer()

const io = new Server(server);

const port = 3070;
server.listen(port, () => {
  console.log(`Server listening at http://localhost:${port}`);
});



async function main() {
  const provider = new ethers.providers.WebSocketProvider(wssUrl);
  const test = await provider.send("eth_pendingTransactions");
  provider.on("pending", async (tx) => {
    console.log(tx, "tx");
    const txnData = await provider.getTransaction(tx);
    if (txnData && txnData.to) {
      try {
        const res = await axios.post("http://localhost:30000", txnData);
        const decodedResult = await decoder(res.data);
        io.sockets.emit("decoded", decodedResult);
        console.log(decodedResult, "dR");
      } catch (error) {
        console.log(error, "error");
      }
    }
  });
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
  quoteTokenDecimals: number
): Promise<number> {
  const sqrtRationX96 = TickMath.getSqrtRatioAtTick(currentTick);
  const ratioX192 = JSBI.multiply(sqrtRationX96, sqrtRationX96);
  const baseAmount = JSBI.BigInt(inputAmount * 10 ** baseTokenDecimals);
  const shift = JSBI.leftShift(JSBI.BigInt(1), JSBI.BigInt(192));
  const quoteAmount = FullMath.mulDivRoundingUp(ratioX192, baseAmount, shift);
  const finalAmount = Number(quoteAmount.toString()) / 10 ** quoteTokenDecimals;
  return finalAmount;
}

async function decoder(input: IDecoded) {
  // console.log(input, "input");
  const result: any = {};
  const amountOutput = parseInt(input.amountOut) / 10 ** 18;
  const amountInput = parseInt(input.amountIn) / 10 ** 6;
  const finalAmout = await priceFromTick(
    input.path[0],
    input.path[1],
    amountInput,
    201160,
    6,
    18
  );
  const slippage = ((finalAmout - amountOutput) / amountOutput) * 100;

  result["finalAmout"] = finalAmout;
  result["amountOutput"] = amountOutput;
  result["amountInput"] = amountInput;
  result["slippage"] = slippage;

  return result;
}

main();
