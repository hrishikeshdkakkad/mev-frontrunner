import * as dotenv from "dotenv";

import { HardhatUserConfig, task } from "hardhat/config";
import "@nomiclabs/hardhat-etherscan";
import "@nomiclabs/hardhat-waffle";
import "@typechain/hardhat";
import "hardhat-gas-reporter";
import "solidity-coverage";
import "uniswap-v2-deploy-plugin";

dotenv.config();

// This is a sample Hardhat task. To learn how to create your own go to
// https://hardhat.org/guides/create-task.html
task("accounts", "Prints the list of accounts", async (taskArgs, hre) => {
  const accounts = await hre.ethers.getSigners();

  for (const account of accounts) {
    console.log(account.address);
  }
});

// You need to export an object to set up your config
// Go to https://hardhat.org/config/ to learn more

console.log(process.env.MAINNET_URL, "process.env.MAINNET_URL")

const config: HardhatUserConfig = {
  solidity: {
    compilers: [
      {
        version: "0.8.0",
      },
      {
        version: "0.8.4",
      },
      {
        version: "0.8.10",
      },
    ],
  },
  networks: {
    hardhat: {
      mining: {
        auto: true,
        // interval: 10000,
      },
      forking: {
        enabled: true,
        url: process.env.MAINNET_URL as string,
        // blockNumber: 17120665
      },
      chainId: 1,
      allowUnlimitedContractSize: true,
    },
    goerli: {
      url: process.env.GOERLI_URL,
      accounts: [process.env.TEST_PRIVATE_KEY as string],
    },
  },
  gasReporter: {
    enabled: process.env.REPORT_GAS !== undefined,
    currency: "USD",
  },
  etherscan: {
    apiKey: process.env.ETHERSCAN_API_KEY,
  },
};

export default config;
