export interface OriginalNoInterferenceTransaction {
  tokenIn: string;
  tokenOut: string;
  fee: string;
  amountIn: { hex: string; _isBigNumber: true };
  sqrtPriceLimitX96: string;
}

export interface Frontrun {
  tokenIn: string;
  tokenOut: string;
  fee: string;
  amountIn: { _hex: string; _isBigNumber: true };
  sqrtPriceLimitX96: string;
  inputCurrency: string;
  outputCurrency: string;
}

export interface Txn {
  hash: string;
  type: number;
  accessList: [];
  blockHash: string;
  blockNumber: number;
  transactionIndex: number;
  confirmations: number;
  from: string;
  gasPrice: { _hex: string; _isBigNumber: true };
  maxPriorityFeePerGas: { _hex: string; _isBigNumber: true };
  maxFeePerGas: { _hex: string; _isBigNumber: true };
  gasLimit: { _hex: string; _isBigNumber: true };
  to: string;
  value: { _hex: string; _isBigNumber: true };
  nonce: number;
  data: string;
  r: string;
  s: string;
  v: number;
  creates: null;
  chainId: number;
}

export interface DataItem {
  originalNoInterferenceTransaction: OriginalNoInterferenceTransaction;
  originalExpectedOutput: number;
  originalNoInterferenceTransactionOutput: number;
  originalSlippage: number;
  frontrun: Frontrun;
  originalTransactionwithInterferenceOutput: number;
  MEV: number;
  frontrunnable: boolean;
  tokenIn: string;
  decimalsIn: any;
  frontrunOutput: number;
  frontrunInput: number;
  decimalsOut: any;
  tokenOut: string;
  PriceImact: number;
  txn: Txn;
}
