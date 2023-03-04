import { BigNumber, ethers } from "ethers";
import * as abi from "./abi.json";
import { Result } from "ethers/lib/utils";
import axios from "axios";

const wssUrl =
  "wss://orbital-polished-model.discover.quiknode.pro/5c70c82e34c15428283cc809dd066dcf72f0dd05/";
const router = "0x1111111254EEB25477B68fb85Ed929f73A960582";

const interfaceI = new ethers.utils.Interface(abi);

async function main() {
  const provider = new ethers.providers.WebSocketProvider(wssUrl);
  provider.on("pending", async (tx) => {
    const txnData = await provider.getTransaction(tx);
    if (txnData && txnData.to && txnData.to === router) {
      await logTxn(txnData);
      // const gas = txnData.gasPrice;
      // console.log(txnData.to === router, "txnData.to === router");
      // if (txnData.to === router && txnData.data.includes("0x414bf389")) {
      //   const decoded = interfaceI.decodeFunctionData(
      //     "exactInputSingle((address,address,uint24,address,uint256,uint256,uint256,uint160))",
      //     txnData.data
      //   );
      //   console.log(txnData.hash, "hash");
      //   logTxn(decoded, gas!);
      // }
    }
  });
}

async function logTxn(data: ethers.providers.TransactionResponse) {
  console.log("Posting to Webhook: ", data.hash);
  try {
    console.log(data, "data")
    const response = await axios.post(
      "https://eoi339avn311ljh.m.pipedream.net",
      data
    );
    console.log(response.status, "status");
  } catch (error) {
    console.log(error, "error");
  }
}

main();
