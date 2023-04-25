import { ethers, providers } from "ethers";
// import * as abi from "./abi.json";
import axios from "axios";

import { TickMath, FullMath } from "@uniswap/v3-sdk";
import JSBI from "jsbi";
import { abi as QuoterV2ABI } from "@uniswap/v3-periphery/artifacts/contracts/lens/QuoterV2.sol/QuoterV2.json";
import { abi as PoolABI } from "@uniswap/v3-core/artifacts/contracts/UniswapV3Pool.sol/UniswapV3Pool.json";
import { abi as FactoryABI } from "@uniswap/v3-core/artifacts/contracts/UniswapV3Factory.sol/UniswapV3Factory.json";

const QUOTER2_ADDRESS = "0x61fFE014bA17989E743c5F6cB21bF9697530B21e";
const FACTORY_ADDRESS = "0x1F98431c8aD98523631AE4a59f267346ea31F984";
const WETH_ADDRESS = "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2";
const USDC_ADDRESS = "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48";
const ERC20ABI = require("./erc20.json");
const WETHABI = require("./Weth.json");
const getAbi = (address: string) => {
  return address === WETH_ADDRESS ? WETHABI : ERC20ABI;
};

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
        const decodedResult = decoder(res.data,provider);
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
  quoteTokenDecimals: number
): Promise<number> {
  const sqrtRationX96 = TickMath.getSqrtRatioAtTick(currentTick);
  const ratioX192 = JSBI.multiply(sqrtRationX96, sqrtRationX96);
  const baseAmount = JSBI.BigInt(inputAmount * 10 ** baseTokenDecimals);
  const shift = JSBI.leftShift(JSBI.BigInt(1), JSBI.BigInt(192));
  const quoteAmount = FullMath.mulDivRoundingUp(ratioX192, baseAmount, shift);
  const finalAmount = Number(quoteAmount.toString()) / 10 ** quoteTokenDecimals;
  console.log(finalAmount);
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
  provider: ethers.providers.WebSocketProvider
) {
  const factory = new ethers.Contract(FACTORY_ADDRESS, FactoryABI, provider);
  const poolAddress = await factory.getPool(tokenIn, tokenOut, fee);
  const poolContract = new ethers.Contract(poolAddress, PoolABI, provider);
  const slot0 = await poolContract.slot0();
  const sqrtPriceX96 = slot0.sqrtPriceX96;
  const token0 = await poolContract.token0();
  const token1 = await poolContract.token1();
  const token0IsInput = tokenIn === token0;
  const tokenInAbi = getAbi(tokenIn);
  const tokenOutAbi = getAbi(tokenOut);
  const tokenInContract = new ethers.Contract(tokenIn, tokenInAbi, provider);
  const tokenOutContract = new ethers.Contract(tokenOut, tokenOutAbi, provider);
  const decimalsIn = await tokenInContract.decimals();
  const decimalOut = await tokenOutContract.decimals();
  const quoter = new ethers.Contract(QUOTER2_ADDRESS, QuoterV2ABI, provider);
  const params = {
    tokenIn: tokenIn,
    tokenOut: tokenOut,
    fee: fee,
    amountIn: amountIn,
    sqrtPriceLimitX96: "0",
  };
  const quote = await quoter.callStatic.quoteExactInputSingle(params);
  const sqrtPriceX96After = quote.sqrtPriceX96After;
  console.log("sqrtPriceX96", sqrtPriceX96.toString());
  console.log("sqrtPriceX96After", sqrtPriceX96After.toString());
  const price = sqrtToPrice(
    sqrtPriceX96,
    decimalsIn,
    decimalOut,
    token0IsInput
  );
  const priceAfter = sqrtToPrice(
    sqrtPriceX96After,
    decimalsIn,
    decimalOut,
    token0IsInput
  );
  console.log("price", price);
  console.log("Price After", priceAfter);
  const absoluteChange = price - priceAfter;
  const percentageChange = absoluteChange / price;
  console.log("Percentage Change", (percentageChange * 100).toFixed(3), "%");
  // const feeTier =
  //   amountIn * priceImpact > 1000 ? 3 : amountIn * priceImpact > 100 ? 2 : 1;
}

async function decoder(input: IDecoded,provider: ethers.providers.WebSocketProvider) {
  // console.log(input, "input");
  const result: any = {};
  const amountOutput = parseInt(input.amountOut) / 10 ** 18;
  const amountInput = parseInt(input.amountIn) / 10 ** 6;
  console.log(amountInput, "Amount In");
  // console.log((parseInt(input.amountOut)/10**18),"Amount Out")
  // console.log(input.path[0],"Token - 0")
  // console.log(input.path[1],"Token - 1")
  const finalAmout = await priceFromTick(
    input.path[0],
    input.path[1],
    amountInput,
    201160,
    6,
    18
  );
  const slippage = ((finalAmout - amountOutput) / amountOutput) * 100;
  console.log(amountOutput, "Amount Out");
  console.log(finalAmout, "Final Output");
  console.log(finalAmout - amountOutput, "Difference");
  console.log(slippage, "The slippage");
  console.log("The calculation of Pool Dynamics Begins")
  pooldynamics(input.path[0],input.path[1],'3000',ethers.utils.parseEther(input.amountIn),provider)
  console.log("Finished Calculating Pool dynamics")
  result["finalAmout"] = finalAmout;
  result["amountOutput"] = amountOutput;
  result["amountInput"] = amountInput;
  result["slippage"] = slippage;

  return result;
}

main();
