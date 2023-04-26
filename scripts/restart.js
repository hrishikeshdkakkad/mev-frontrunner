const Web3 = require('web3');
const web3 = new Web3('http://127.0.0.1:8545/'); // replace with your node URL

async function main() {
  // Get the current transaction count for your account
//   const account = '0x...'; // replace with your account address
//   const nonce = await web3.eth.getTransactionCount(account);

  // Get a list of all pending transactions for your account
  const pendingTxs = await web3.eth.getTransaction();
  const myPendingTxs = pendingTxs.filter(tx => tx.nonce >= nonce && tx.from === account);

  // Cancel each pending transaction individually
  for (const tx of myPendingTxs) {
    const result = await web3.eth.cancelTransaction(tx.hash);
    console.log(`Transaction ${tx.hash} cancelled`);
  }
}

main()
  .then(() => console.log('Done'))
  .catch(error => console.error(error));
