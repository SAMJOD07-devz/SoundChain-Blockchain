// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title MockUSDC
 * @notice Standard ERC-20 Mock USD Coin (USDC) representing a 1:1 USD asset-backed fiat-pegged stablecoin.
 * @dev Uses 6 decimals to mirror authentic Circle USDC.
 */
contract MockUSDC is ERC20, Ownable {
    uint8 private _decimals;

    constructor() ERC20("USD Coin", "USDC") Ownable() {
        _decimals = 6;
        // Pre-mint 10,000,000 USDC to contract deployer
        _mint(msg.sender, 10_000_000 * 10**6);
    }

    function decimals() public view virtual override returns (uint8) {
        return _decimals;
    }

    /**
     * @notice Minting faucet for local testing and developer wallets.
     */
    function mint(address to, uint256 amount) external {
        _mint(to, amount);
    }

    function faucet(address to, uint256 amount) external {
        _mint(to, amount);
    }
}
