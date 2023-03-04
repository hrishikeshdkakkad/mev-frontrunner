import { ethers } from "ethers";
import * as abi from "./abi.json";
import axios from "axios";
import InputDataDecoder from "ethereum-input-data-decoder";
import { ercAbi } from "../test/erc";

const wssUrl = "ws://127.0.0.1:8545/";
const router = "0xEf1c6E67703c7BD7107eed8303Fbe6EC2554BF6B";

const interfaceI = new ethers.utils.Interface(abi);

const decoder = new InputDataDecoder(ercAbi);

async function main() {
  const provider = new ethers.providers.WebSocketProvider(wssUrl);
  const test = await provider.send("eth_pendingTransactions");

  provider.on("pending", async (tx) => {
    console.log(tx, "tx");
    const txnData = await provider.getTransaction(tx);
    console.log(txnData, "txnData");
    if (txnData && txnData.to && txnData.to === router) {
      const result = decoder.decodeData(txnData.data);
      console.log(result, "result");
      await logTxn(txnData);
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

main();
