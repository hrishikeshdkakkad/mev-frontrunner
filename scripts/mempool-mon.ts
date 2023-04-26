import { ethers, providers } from "ethers";
// import * as abi from "./abi.json";
import axios from "axios";

import { TickMath, FullMath } from "@uniswap/v3-sdk";
import { Server } from "socket.io";
import http from "http";
import cors from "cors";

import JSBI from "jsbi";
import { abi as QuoterV2ABI } from "@uniswap/v3-periphery/artifacts/contracts/lens/QuoterV2.sol/QuoterV2.json";
import { abi as PoolABI } from "@uniswap/v3-core/artifacts/contracts/UniswapV3Pool.sol/UniswapV3Pool.json";
import { abi as FactoryABI } from "@uniswap/v3-core/artifacts/contracts/UniswapV3Factory.sol/UniswapV3Factory.json";

const QUOTER2_ADDRESS = "0x61fFE014bA17989E743c5F6cB21bF9697530B21e";
const FACTORY_ADDRESS = "0x1F98431c8aD98523631AE4a59f267346ea31F984";

const DAI_ADDRESS = "0x6B175474E89094C44Da98b954EedeAC495271d0F";
const WBTC_ADDRESS = "0x2260FAC5E5542a773Aa44fBCfeDf7C193bc2C599";
const WETH_ADDRESS = "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2";
const USDC_ADDRESS = "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48";
const USDT_ADDRESS = "0xdAC17F958D2ee523a2206206994597C13D831ec7";

const ERC20ABI = require("./erc20.json");
const WETHABI = require("./Weth.json");
const DAIABI = require("./Dai.json");
const WBTCABI = require("./Wbtc.json");
const USDTABI = require("./Usdt.json");

const getAbi = (address: string): string => {
  if (address === WETH_ADDRESS) {
    return WETHABI;
  } else if (address === DAI_ADDRESS) {
    return DAIABI;
  } else if (address === WBTC_ADDRESS) {
    return WBTCABI;
  } else if (address === USDT_ADDRESS) {
    return USDTABI;
  } else {
    return ERC20ABI;
  }
};

const wssUrl = "ws://127.0.0.1:8545/";
const router = "0xEf1c6E67703c7BD7107eed8303Fbe6EC2554BF6B";

// const interfaceI = new ethers.utils.Interface(abi);

const server = http.createServer();

const io = new Server(server, {
  cors: {
    origin: "http://localhost:3000",
    methods: ["GET", "POST"],
  },
});

const port = 3070;
server.listen(port, () => {
  console.log(`Server listening at http://localhost:${port}`);
});

async function main() {
  const provider = new ethers.providers.WebSocketProvider(wssUrl);
  const test = await provider.send("eth_pendingTransactions");
  provider.on("pending", async (tx) => {
    // console.log(tx, "tx");
    const txnData = await provider.getTransaction(tx);
    if (txnData && txnData.to) {
      try {
        const res = await axios.post("http://localhost:30000", txnData);
        // console.log(res, "res")
        const decodedResult = await decoder(res.data, provider);
        io.sockets.emit("decoded", decodedResult);
      } catch (error) {
        console.log(error, "error");
      }
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
  token0IsInput: any
): Promise<number> {
  const sqrtRationX96 = TickMath.getSqrtRatioAtTick(currentTick);
  const ratioX192 = JSBI.multiply(sqrtRationX96, sqrtRationX96);
  const baseAmount = JSBI.BigInt(inputAmount * 10 ** baseTokenDecimals);
  const shift = JSBI.leftShift(JSBI.BigInt(1), JSBI.BigInt(192));
  const quoteAmount = FullMath.mulDivRoundingUp(ratioX192, baseAmount, shift);
  let finalAmount = Number(quoteAmount.toString()) / 10 ** quoteTokenDecimals;
  if (!token0IsInput) {
    finalAmount = 1 / finalAmount;
  }
  return finalAmount;
}
function sqrtToPrice(
  sqrt: number,
  decimals0: number,
  decimals1: number,
  token0IsInput: boolean
): number {
  const numerator = sqrt ** 2;
  const denominator = 2 ** 198;
  let ratio = numerator / denominator;
  const shiftDecimals = 10 ** (decimals0 - decimals1);
  ratio = ratio * shiftDecimals;
  if (!token0IsInput) {
    ratio = 1 / ratio;
  }
  return ratio;
}

async function pooldynamics(
  tokenIn: string,
  tokenOut: string,
  fee: string,
  amountIn: ethers.BigNumber,
  amountOut: string,
  provider: ethers.providers.WebSocketProvider
) {
  const result: any = {};
  const factory = new ethers.Contract(FACTORY_ADDRESS, FactoryABI, provider);
  const poolAddress = await factory.getPool(tokenIn, tokenOut, fee);
  const poolContract = new ethers.Contract(poolAddress, PoolABI, provider);
  const slot0 = await poolContract.slot0();
  const sqrtPriceX96 = slot0.sqrtPriceX96;
  // console.log("the tick is", slot0.tick);34er
  const token0 = await poolContract.token0();
  const token1 = await poolContract.token1();
  const token0IsInput = tokenIn == token0;
  const tokenInAbi = getAbi(tokenIn);
  const tokenOutAbi = getAbi(tokenOut);
  const tokenInContract = new ethers.Contract(tokenIn, tokenInAbi, provider);
  const tokenOutContract = new ethers.Contract(tokenOut, tokenOutAbi, provider);
  const decimalsIn = await tokenInContract.decimals();
  const decimalOut = await tokenOutContract.decimals();
  const quoter = new ethers.Contract(QUOTER2_ADDRESS, QuoterV2ABI, provider);
  // const etherAmount = ethers.utils.formatEther(amountIn);
  // console.log("The ether amount",etherAmount)
  const params = {
    tokenIn: tokenIn,
    tokenOut: tokenOut,
    fee: fee,
    amountIn: amountIn,
    sqrtPriceLimitX96: "0",
  };
  result['originalNoInterferenceTransaction'] = params;

  const quote = await quoter.callStatic.quoteExactInputSingle(params);
  const sqrtPriceX96After = quote.sqrtPriceX96After;
  const outputAmount = quote.amountOut.toString() / 10 ** decimalOut;
  const expectedAmount = parseInt(amountOut)/ 10 ** decimalOut
  // console.log("The expected output", expectedAmount)
  // console.log("the outputAmount", outputAmount);
  result['originalExpectedOutput'] = expectedAmount
  result['originalNoInterferenceTransactionOutput'] = outputAmount
  const slippage = ((outputAmount - expectedAmount) / expectedAmount) * 100;
  // console.log("the slippage is ",slippage.toFixed(3),"%")
  result['originalSlippage'] = slippage
  const new_params = {
    tokenIn: tokenIn,
    tokenOut: tokenOut,
    fee: fee,
    amountIn: amountIn.mul(1000),
    sqrtPriceLimitX96: "0",
  };
  result['frontrun'] = new_params;
  const new_quote = await quoter.callStatic.quoteExactInputSingle(new_params);
  const new_sqrtPriceX96After = new_quote.sqrtPriceX96After;
  let new_outputAmount = new_quote.amountOut.toString() / 10 ** decimalOut;
  new_outputAmount = new_outputAmount/1000
  // console.log("the outputAmount new", new_outputAmount);
  result['originalTransactionwithInterferenceOutput'] = new_outputAmount
  // console.log("The maximum extractable value is",outputAmount - new_outputAmount)
  result['MEV'] = outputAmount - new_outputAmount
  // const pricebefore = sqrtToPrice(
  //   sqrtPriceX96,
  //   decimalsIn,
  //   decimalOut,
  //   token0IsInput
  // );
  // const priceAfter = sqrtToPrice(
  //   sqrtPriceX96After,
  //   decimalsIn,
  //   decimalOut,
  //   token0IsInput
  // );
  // console.log("pricebefore", pricebefore);
  // console.log("Price After", priceAfter);
  const absoluteChange = outputAmount - new_outputAmount;
  const percentageChange = (absoluteChange / outputAmount)*100;
  result['frontrunnable'] = percentageChange < slippage ? true : false
  // console.log("Percentage Change", (percentageChange).toFixed(3), "%");
  result['PriceImact'] = percentageChange
  // if(percentageChange < slippage){
  //   // console.log("percentageChange",percentageChange)
  //   // console.log("slippage",slippage)
  //   console.log("Front running successful")
  // }
  // else{
  //   console.log("The FrontRunning is not possible")
  // }
  return result
}

async function decoder(
  input: IDecoded,
  provider: ethers.providers.WebSocketProvider
) {
  // console.log(input, "input");
  const result: any = {};
  // const amountOutput = parseInt(input.amountOut) / 10 ** 18;
  // const amountInput = parseInt(input.amountIn) / 10 ** 6;
  // console.log(amountInput, "Amount In");
  // // console.log((parseInt(input.amountOut)/10**18),"Amount Out")
  // // console.log(input.path[0],"Token - 0")
  // // console.log(input.path[1],"Token - 1")
  // const finalAmout = await priceFromTick(
  //   input.path[0],
  //   input.path[1],
  //   amountInput,
  //   201160,
  //   6,
  //   18
  // );
  // const slippage = ((finalAmout - amountOutput) / amountOutput) * 100;
  // console.log(amountOutput, "Amount Out");
  // console.log(finalAmout, "Final Output");
  // console.log(finalAmout - amountOutput, "Difference");
  // console.log(slippage, "The slippage");
  // console.log("The calculation of Pool Dynamics Begins");
  const outputParams = await pooldynamics(
    input.path[0],
    input.path[1],
    "500",
    ethers.BigNumber.from(input.amountIn),
    input.amountOut,
    provider
  );
  console.log("output pramas",outputParams)
  
  // console.log("Finished Calculating Pool dynamics");
  // result["finalAmout"] = finalAmout;
  // result["amountOutput"] = amountOutput;
  // result["amountInput"] = amountInput;
  // result["slippage"] = slippage;

  return result;
}

main();
