// SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;

import "@openzeppelin/contracts/utils/math/SafeMath.sol";
import "@aave/core-v3/contracts/flashloan/base/FlashLoanSimpleReceiverBase.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@uniswap/v3-periphery/contracts/interfaces/ISwapRouter.sol";
import "@uniswap/v3-periphery/contracts/libraries/TransferHelper.sol";

contract Executer is FlashLoanSimpleReceiverBase {
    ISwapRouter public immutable swapRouter;
    uint24 public constant feeTier = 30000;
    using SafeMath for uint;

    address public constant DAI = 0x6B175474E89094C44Da98b954EedeAC495271d0F; // Hardcoded contract address - this will be dynamic based on identified swap pair while frontrunning
    address public constant WETH9 = 0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2; // Hardcoded contract address - this will be dynamic based on identified swap pair while frontrunning

    modifier onlyOwner() {
        require(msg.sender == owner, "Only owner can call this function.");
        _;
    }

    constructor(
        IPoolAddressesProvider provider,
        ISwapRouter _swapRouter
    ) public FlashLoanSimpleReceiverBase(provider) {
        swapRouter = _swapRouter;
    }

    function borrowFlashLoan(address asset, uint amount) internal onlyOwner {
        address reciever = address(this);
        bytes memory params = "";
        uint16 referralCode = 0;

        POOL.flashLoanSimple(reciever, asset, amount, params, referralCode);
    }

    function swapTokens(uint amountIn) internal onlyOwner returns (uint256 amountOut) {
        TransferHelper.safeTransferFrom(
            WETH9,
            msg.sender,
            address(this),
            amountIn
        );
        TransferHelper.safeApprove(WETH9, address(swapRouter), amountIn);
        ISwapRouter.ExactInputSingleParams memory params = ISwapRouter
            .ExactInputSingleParams({
                tokenIn: WETH9,
                tokenOut: DAI,
                fee: feeTier,
                recipient: msg.sender,
                deadline: block.timestamp,
                amountIn: amountIn,
                amountOutMinimum: 0,
                sqrtPriceLimitX96: 0
            });
        amountOut = swapRouter.exactInputSingle(params);
        return amountOut;
    }

    function executeOperation(
        address asset,
        uint256 amount,
        uint256 premium,
        address initiator,
        bytes calldata params
    ) internal onlyOwner returns (bool)  {
        uint amountOwing = amount.add(premium);
        IERC20(asset).approve(address(POOL), amountOwing);
        return true;
    }
}
