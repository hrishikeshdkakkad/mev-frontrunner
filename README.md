Steps for Deployment
Run npm install inside the following folders:
Root
Universal-decoder
Frontend-simulator
Run npm start for all the folders in a new tab
Create a .env file and add your Alchemy endpoint as defined in the .env.example file
From the root folder, run $npx hardhat scripts/deploy.ts. This will deploy all the relevant contracts to Goerli.
Start your local Hardhat node as well
Start the Mempool Watcher script by running ts-node scripts/mempool.ts in the terminal
Set your MetaMask wallet on HardHat
Go to the UniSwap interface and place and sign a swap
You will see all the information about the transaction on the frontend in real-time
Your setup is now complete!
Note: Make sure to have the required software and tools installed, such as Node.js and Git, before starting the deployment process.
