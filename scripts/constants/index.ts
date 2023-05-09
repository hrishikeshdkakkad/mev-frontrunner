export const QUOTER2_ADDRESS = "0x61fFE014bA17989E743c5F6cB21bF9697530B21e";
export const FACTORY_ADDRESS = "0x1F98431c8aD98523631AE4a59f267346ea31F984";

export const DAI_ADDRESS = "0x6b175474e89094c44da98b954eedeac495271d0f";
export const WBTC_ADDRESS = "0x2260FAC5E5542a773Aa44fBCfeDf7C193bc2C599";
export const WETH_ADDRESS = "0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2";
export const USDC_ADDRESS = "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48";
export const USDT_ADDRESS = "0xdAC17F958D2ee523a2206206994597C13D831ec7";

export const executorABI = [
  {
    inputs: [
      {
        internalType: "contract IPoolAddressesProvider",
        name: "provider",
        type: "address",
      },
    ],
    stateMutability: "nonpayable",
    type: "constructor",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: false,
        internalType: "address",
        name: "asset",
        type: "address",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "val",
        type: "uint256",
      },
    ],
    name: "Log",
    type: "event",
  },
  {
    inputs: [],
    name: "ADDRESSES_PROVIDER",
    outputs: [
      {
        internalType: "contract IPoolAddressesProvider",
        name: "",
        type: "address",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "POOL",
    outputs: [
      {
        internalType: "contract IPool",
        name: "",
        type: "address",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "asset",
        type: "address",
      },
      {
        internalType: "uint256",
        name: "amount",
        type: "uint256",
      },
    ],
    name: "createFlashLoan",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "asset",
        type: "address",
      },
      {
        internalType: "uint256",
        name: "amount",
        type: "uint256",
      },
      {
        internalType: "uint256",
        name: "premium",
        type: "uint256",
      },
      {
        internalType: "address",
        name: "initiator",
        type: "address",
      },
      {
        internalType: "bytes",
        name: "params",
        type: "bytes",
      },
    ],
    name: "executeOperation",
    outputs: [
      {
        internalType: "bool",
        name: "",
        type: "bool",
      },
    ],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [],
    name: "receivePayment",
    outputs: [],
    stateMutability: "payable",
    type: "function",
  },
];
