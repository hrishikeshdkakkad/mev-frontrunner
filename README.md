**Uniswap Sandwich Attack Simulator**


This is a blockchain simulation project that aims to replicate a Uniswap sandwich attack using smart contracts, flashloans, and the Uniswap v3 interface. The project consists of several components, including a decoding infrastructure, a frontend simulator, smart contracts, and deployment scripts.

**Project Hierarchy**

The project repository is structured as follows:

 * **blockchain-simulation-frontend:** Contains the frontend simulator, which allows users to place and sign a Uniswap transaction and visualize its effects.
 *  **uniswap-universal-decoder:** Contains the decoding infrastructure, including the mempool watcher script that monitors the Ethereum mempool for transactions and decodes their details.
 * **contracts:** Contains the Solidity smart contracts used in the project, including the flashloan contract, the Uniswap pool contract, and the decoder contract.
 * **interface:** Contains the interface files for the contracts, including the IUniswapV3Pool and IFlashLoanReceiver interfaces.
 *  **scripts:** Contains the deployment scripts, including the deploy.ts script that deploys the contracts to the Goerli network.
 *  **test:** Contains the test files for the contracts, including the decoding calc test that checks the decoding of transaction details.

**Installation**

* Clone the repository to your local machine.
* Install the dependencies by running

command:

    npm install
   
inside the **root**, **universal-decoder**, and **blockchain-simulation-frontend** folders
Start the frontend simulator by running npm start inside the blockchain-simulation-frontend folder.
* Create a .env file and add your alchemy endpoint as defined in the .env.example file
* From the root folder run the following command to deploy all the contracts to goreli.

command:

    $npx hardhat scripts/deploy.ts
* Start your local Hardhat node as well

command:

    npx hardhat node --network hardhat
* In a new terminal run the below command the root folder to start mempool monitoring scripts

command:

    ts-node scripts/mempool.ts
* In a new terminal and run the below command from the root folder to start the universial decode api. 

command:

    node uniswap-universal-decoder/app.js
* Make sure you have the front end, local hardhat node, mempool monitoring script, universal decoder script before proceeding to the next step.
* Now set your meta mask wallet on HardHat
* Go to the UniSwap interface and place and sign a swap
* You will see all the information about the transaction on the frontend in real-time
* Your SETUP is now complete


