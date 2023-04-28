import { DAI_ADDRESS, WETH_ADDRESS, WBTC_ADDRESS, USDT_ADDRESS } from '../constants';

export const getCurrency = (address: string): string => {
  switch (address) {
    case WETH_ADDRESS:
      return 'ETH';
    case DAI_ADDRESS:
      return 'DAI';
    case WBTC_ADDRESS:
      return 'WBTC';
    case USDT_ADDRESS:
      return 'USDC';
    default:
      return 'Currency symbol Not Loaded';
  }
};
