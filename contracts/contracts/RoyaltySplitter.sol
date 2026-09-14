// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title RoyaltySplitter
 * @notice Manages music track registration and automatic ETH royalty distributions based on basis-point shares.
 * @dev Basis points scale: 10000 BPS = 100%. Protected against reentrancy.
 */
contract RoyaltySplitter is Ownable, ReentrancyGuard {
    // Basis points constant (100.00%)
    uint256 public constant TOTAL_BPS = 10000;

    struct Track {
        bytes32 trackId;
        address[] payees;
        uint256[] sharesBps;
        uint256 totalReceived;
        bool isRegistered;
    }

    // Mapping from trackId to Track details
    mapping(bytes32 => Track) private _tracks;

    // Track list array for enumeration
    bytes32[] private _trackIds;

    // Events
    event TrackRegistered(bytes32 indexed trackId, address[] payees, uint256[] sharesBps);
    event RoyaltyDistributed(bytes32 indexed trackId, address indexed sender, uint256 totalAmount);
    event PayeePaid(bytes32 indexed trackId, address indexed payee, uint256 amount);

    // Custom errors for gas efficiency and clear error reporting
    error TrackAlreadyRegistered(bytes32 trackId);
    error TrackNotRegistered(bytes32 trackId);
    error EmptyPayeesList();
    error MismatchedArrayLengths();
    error ZeroAddressPayee();
    error ZeroSharePayee();
    error InvalidTotalShares(uint256 totalBps);
    error ZeroPaymentAmount();
    error ETHTransferFailed(address payee, uint256 amount);

    constructor() Ownable() {}

    /**
     * @notice Registers a new track with payee addresses and their corresponding basis points shares.
     * @param trackId Unique bytes32 identifier for the track.
     * @param payees Array of wallet addresses receiving royalties.
     * @param sharesBps Array of shares in basis points (must sum to 10000 BPS = 100%).
     */
    function registerTrack(
        bytes32 trackId,
        address[] calldata payees,
        uint256[] calldata sharesBps
    ) external onlyOwner {
        if (_tracks[trackId].isRegistered) {
            revert TrackAlreadyRegistered(trackId);
        }
        if (payees.length == 0) {
            revert EmptyPayeesList();
        }
        if (payees.length != sharesBps.length) {
            revert MismatchedArrayLengths();
        }

        uint256 totalBps = 0;
        for (uint256 i = 0; i < payees.length; i++) {
            if (payees[i] == address(0)) {
                revert ZeroAddressPayee();
            }
            if (sharesBps[i] == 0) {
                revert ZeroSharePayee();
            }
            totalBps += sharesBps[i];
        }

        if (totalBps != TOTAL_BPS) {
            revert InvalidTotalShares(totalBps);
        }

        Track storage track = _tracks[trackId];
        track.trackId = trackId;
        track.payees = payees;
        track.sharesBps = sharesBps;
        track.totalReceived = 0;
        track.isRegistered = true;

        _trackIds.push(trackId);

        emit TrackRegistered(trackId, payees, sharesBps);
    }

    /**
     * @notice Pays ETH royalty for a given track and automatically distributes it to registered payees.
     * @param trackId Unique bytes32 identifier of the registered track.
     */
    function payRoyalty(bytes32 trackId) external payable nonReentrant {
        Track storage track = _tracks[trackId];
        if (!track.isRegistered) {
            revert TrackNotRegistered(trackId);
        }
        if (msg.value == 0) {
            revert ZeroPaymentAmount();
        }

        // Checks-Effects-Interactions: Update state before external calls
        uint256 paymentAmount = msg.value;
        track.totalReceived += paymentAmount;

        emit RoyaltyDistributed(trackId, msg.sender, paymentAmount);

        // Distribute funds among payees
        uint256 payeeCount = track.payees.length;
        for (uint256 i = 0; i < payeeCount; i++) {
            address payee = track.payees[i];
            uint256 shareBps = track.sharesBps[i];
            uint256 payeeAmount = (paymentAmount * shareBps) / TOTAL_BPS;

            if (payeeAmount > 0) {
                (bool success, ) = payee.call{value: payeeAmount}("");
                if (!success) {
                    revert ETHTransferFailed(payee, payeeAmount);
                }
                emit PayeePaid(trackId, payee, payeeAmount);
            }
        }
    }

    /**
     * @notice Get payees and basis points shares for a track.
     * @param trackId Unique bytes32 identifier of the track.
     * @return payees Array of payee addresses.
     * @return sharesBps Array of shares in basis points.
     */
    function getTrackPayees(bytes32 trackId)
        external
        view
        returns (address[] memory payees, uint256[] memory sharesBps)
    {
        if (!_tracks[trackId].isRegistered) {
            revert TrackNotRegistered(trackId);
        }
        Track storage track = _tracks[trackId];
        return (track.payees, track.sharesBps);
    }

    /**
     * @notice Returns total ETH received and distributed for a given track.
     * @param trackId Unique bytes32 identifier of the track.
     */
    function getTotalReceived(bytes32 trackId) external view returns (uint256) {
        if (!_tracks[trackId].isRegistered) {
            revert TrackNotRegistered(trackId);
        }
        return _tracks[trackId].totalReceived;
    }

    /**
     * @notice Returns whether a track is registered.
     */
    function isTrackRegistered(bytes32 trackId) external view returns (bool) {
        return _tracks[trackId].isRegistered;
    }

    /**
     * @notice Returns all registered track IDs.
     */
    function getAllTrackIds() external view returns (bytes32[] memory) {
        return _trackIds;
    }
}
