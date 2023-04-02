pragma solidity ^0.8.0;

import "../interface/IERC20.sol";



interface FlashLoanReceiver {
    function executeOperation(
        address _reserve,
        uint256 _amount,
        uint256 _fee,
        bytes calldata _params
    ) external;
}

interface AaveLendingPool {
    function flashLoan(
        address _receiver,
        address _reserve,
        uint256 _amount,
        bytes calldata _params
    ) external;
}

interface UniswapV2Router02 {
    function swapExactTokensForTokens(
        uint amountIn,
        uint amountOutMin,
        address[] calldata path,
        address to,
        uint deadline
    ) external returns (uint[] memory amounts);
}

contract FlashSwap {
    address public constant AAVE_LENDING_POOL_ADDRESS =
        0x7d2768dE32b0b80b7a3454c06BdAc94A69DDc7A9;
    address public constant UNISWAP_ROUTER_ADDRESS =
        0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D;
    address public constant DAI_ADDRESS =
        0x6B175474E89094C44Da98b954EedeAC495271d0F;
    address public constant WETH_ADDRESS =
        0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2;
    uint public constant AMOUNT = 1000 ether;

    function startFlashSwap() external {
        bytes memory params = abi.encode(msg.sender);
        AaveLendingPool lendingPool = AaveLendingPool(
            AAVE_LENDING_POOL_ADDRESS
        );
        lendingPool.flashLoan(address(this), DAI_ADDRESS, AMOUNT, params);
    }

    function executeOperation(
        address _reserve,
        uint256 _amount,
        uint256 _fee,
        bytes calldata _params
    ) external {
        address payable borrower = payable(abi.decode(_params, (address)));
        require(_reserve == DAI_ADDRESS, "Invalid asset borrowed");
        IERC20 dai = IERC20(DAI_ADDRESS);
        IERC20 weth = IERC20(WETH_ADDRESS);
        require(
            dai.approve(UNISWAP_ROUTER_ADDRESS, _amount),
            "Failed to approve DAI for Uniswap"
        );
        address[] memory path = new address[](2);
        path[0] = DAI_ADDRESS;
        path[1] = WETH_ADDRESS;
        uint[] memory amounts = UniswapV2Router02(UNISWAP_ROUTER_ADDRESS)
            .swapExactTokensForTokens(
                _amount,
                0,
                path,
                address(this),
                block.timestamp + 1800
            );
        require(
            weth.approve(UNISWAP_ROUTER_ADDRESS, amounts[1]),
            "Failed to approve WETH for Uniswap"
        );
        path[0] = WETH_ADDRESS;
        path[1] = DAI_ADDRESS;
        UniswapV2Router02(UNISWAP_ROUTER_ADDRESS).swapExactTokensForTokens(
            amounts[1],
            0,
            path,
            borrower,
            block.timestamp + 1800
        );
        require(
            dai.transferFrom(
                address(this),
                AAVE_LENDING_POOL_ADDRESS,
                AMOUNT + _fee
            ),
            "Failed to repay flashloan"
        );
    }
}
