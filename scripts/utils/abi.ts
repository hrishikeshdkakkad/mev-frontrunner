import { DAI_ADDRESS, WETH_ADDRESS, WBTC_ADDRESS, USDT_ADDRESS } from '../constants';
import { DAIABI, WETHABI, WBTCABI, USDTABI, ERC20ABI } from '../abis';

export const getAbi = (address: string) => {
  switch (address) {
    case WETH_ADDRESS:
      return WETHABI;
    case DAI_ADDRESS:
      return DAIABI;
    case WBTC_ADDRESS:
      return WBTCABI;
    case USDT_ADDRESS:
      return USDTABI;
    default:
      return ERC20ABI;
  }
};
