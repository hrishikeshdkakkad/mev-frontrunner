import { ethers, providers } from "ethers";
import axios from "axios";

import { TickMath, FullMath, FACTORY_ADDRESS } from "@uniswap/v3-sdk";
import { Server } from "socket.io";
import http from "http";
import cors from "cors";

import JSBI from "jsbi";
import { abi as QuoterV2ABI } from "@uniswap/v3-periphery/artifacts/contracts/lens/QuoterV2.sol/QuoterV2.json";
import { abi as PoolABI } from "@uniswap/v3-core/artifacts/contracts/UniswapV3Pool.sol/UniswapV3Pool.json";
import { abi as FactoryABI } from "@uniswap/v3-core/artifacts/contracts/UniswapV3Factory.sol/UniswapV3Factory.json";
import { WETHABI, DAIABI, WBTCABI, USDTABI, ERC20ABI } from "./abis";
import {
  WETH_ADDRESS,
  DAI_ADDRESS,
  WBTC_ADDRESS,
  USDT_ADDRESS,
  QUOTER2_ADDRESS,
} from "./constants";

const getAbi = (address: string) => {
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

const getCurrency = (address: string): string => {
  console.log(address, "Add");
  if (address === WETH_ADDRESS) {
    return "ETH";
  } else if (address === DAI_ADDRESS) {
    return "DAI";
  } else if (address === WBTC_ADDRESS) {
    return "WBTC";
  } else if (address === USDT_ADDRESS) {
    return "USDC";
  } else {
    return "Currency symbol Not Loaded";
  }
};

const wssUrl = "ws://127.0.0.1:8545/";
const router = "0xEf1c6E67703c7BD7107eed8303Fbe6EC2554BF6B";
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
  await provider.send("eth_pendingTransactions");
  provider.on("pending", async (tx) => {
    const txnData = await provider.getTransaction(tx);
    if (txnData && txnData.to) {
      try {
        const res = await axios.post("http://localhost:30000", txnData);
        const decodedResult = await decoder(res.data, provider);
        decodedResult["txn"] = txnData;
        io.sockets.emit("decoded", decodedResult);
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

async function getPoolAddress(
  tokenIn: string,
  tokenOut: string,
  fee: string,
  provider: ethers.providers.WebSocketProvider
) {
  const factory = new ethers.Contract(FACTORY_ADDRESS, FactoryABI, provider);
  return await factory.getPool(tokenIn, tokenOut, fee);
}

async function getDecimalValue(
  token: string,
  provider: ethers.providers.WebSocketProvider
) {
  const tokenAbi = getAbi(token);
  const tokenContract = new ethers.Contract(token, tokenAbi, provider);
  return await tokenContract.decimals();
}

async function getQuote(
  params: object,
  decimalOut: number,
  quoter: ethers.Contract
) {
  const quote = await quoter.callStatic.quoteExactInputSingle(params);
  const amountOut = quote.amountOut.toString() / 10 ** decimalOut;
  return amountOut;
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
  const poolAddress = await getPoolAddress(tokenIn, tokenOut, fee, provider);
  const poolContract = new ethers.Contract(poolAddress, PoolABI, provider);
  const slot0 = await poolContract.slot0();
  const sqrtPriceX96 = slot0.sqrtPriceX96;
  const decimalsIn = await getDecimalValue(tokenIn, provider);
  const decimalOut = await getDecimalValue(tokenOut, provider);

  result.tokenIn = getCurrency(tokenIn);
  result.tokenOut = getCurrency(tokenOut);
  result.decimalsIn = decimalsIn;
  result.decimalsOut = decimalOut;

  const quoter = new ethers.Contract(QUOTER2_ADDRESS, QuoterV2ABI, provider);
  const params1 = {
    tokenIn,
    tokenOut,
    fee,
    amountIn,
    sqrtPriceLimitX96: "0",
  };

  result.originalNoInterferenceTransaction = params1;
  const outputAmount = await getQuote(params1, decimalOut, quoter);
  const expectedAmount = parseInt(amountOut) / 10 ** decimalOut;
  result.originalExpectedOutput = expectedAmount;
  result.originalNoInterferenceTransactionOutput = outputAmount;
  const slippage = ((outputAmount - expectedAmount) / expectedAmount) * 100;
  result.originalSlippage = slippage;

  const frontrunMultiplier = 1000;
  const params2 = {
    tokenIn,
    tokenOut,
    fee,
    amountIn: amountIn.mul(frontrunMultiplier),
    sqrtPriceLimitX96: "0",
  };

  result.frontrun = {
    ...params2,
    inputCurrency: getCurrency(tokenIn),
    outputCurrency: getCurrency(tokenOut),
  };
  const newOutputAmount = await getQuote(params2, decimalOut, quoter);
  result.frontrunOutput = newOutputAmount;
  result.frontrunInput = frontrunMultiplier;
  const originalTransactionwithInterferenceOutput = newOutputAmount / 1000;
  result.originalTransactionwithInterferenceOutput =
    originalTransactionwithInterferenceOutput;
  result.MEV = outputAmount - originalTransactionwithInterferenceOutput;
  const absoluteChange =
    outputAmount - originalTransactionwithInterferenceOutput;
  const percentageChange = (absoluteChange / outputAmount) * 100;
  result.frontrunnable = percentageChange < slippage;
  result.PriceImact = percentageChange;

  return result;
}

async function decoder(
  input: IDecoded,
  provider: ethers.providers.WebSocketProvider
) {
  const outputParams = await pooldynamics(
    input.path[0],
    input.path[1],
    "500",
    ethers.BigNumber.from(input.amountIn),
    input.amountOut,
    provider
  );

  return outputParams;
}

main();
