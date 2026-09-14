// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title ListenToken
 * @notice ERC-20 token (ListenCoin / LSTN) awarded to users for listening to tracks on SoundChain.
 * @dev Enforces a maximum supply cap of 1,000,000 LSTN and tracks user listening counts.
 */
contract ListenToken is ERC20, Ownable {
    // Maximum token supply: 1,000,000 LSTN (18 decimals)
    uint256 public constant MAX_SUPPLY = 1_000_000 * 10**18;

    // Configurable reward per listening session (default 10 LSTN)
    uint256 public rewardPerListen;

    // Tracking total listens per user wallet address
    mapping(address => uint256) private _totalListens;

    // Events
    event ListenerRewarded(address indexed listener, uint256 amount, uint256 newTotalListens);
    event RewardPerListenUpdated(uint256 oldReward, uint256 newReward);

    // Custom errors
    error MaxSupplyExceeded(uint256 requestedAmount, uint256 currentSupply, uint256 maxSupply);
    error InvalidListenerAddress();
    error InvalidRewardAmount();

    constructor() ERC20("ListenCoin", "LSTN") Ownable() {
        // Default reward: 10 LSTN
        rewardPerListen = 10 * 10**18;
    }

    /**
     * @notice Mints reward tokens to a listener after completing a listening session.
     * @param listener The wallet address of the listener.
     */
    function rewardListener(address listener) external onlyOwner {
        if (listener == address(0)) {
            revert InvalidListenerAddress();
        }
        if (totalSupply() + rewardPerListen > MAX_SUPPLY) {
            revert MaxSupplyExceeded(rewardPerListen, totalSupply(), MAX_SUPPLY);
        }

        _totalListens[listener] += 1;
        _mint(listener, rewardPerListen);

        emit ListenerRewarded(listener, rewardPerListen, _totalListens[listener]);
    }

    /**
     * @notice Updates the reward per listen amount (Admin only).
     * @param newReward Amount in wei (taking 18 decimals into account).
     */
    function setRewardPerListen(uint256 newReward) external onlyOwner {
        if (newReward == 0) {
            revert InvalidRewardAmount();
        }
        uint256 oldReward = rewardPerListen;
        rewardPerListen = newReward;
        emit RewardPerListenUpdated(oldReward, newReward);
    }

    /**
     * @notice Returns the total number of verified listens completed by a user.
     * @param listener Wallet address to query.
     */
    function totalListens(address listener) external view returns (uint256) {
        return _totalListens[listener];
    }
}
