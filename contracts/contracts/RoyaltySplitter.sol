// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";

/**
 * @title RoyaltySplitter
 * @notice Manages music track registration and automatic asset-backed USDC / ETH royalty distributions based on basis-point shares.
 * @dev Basis points scale: 10000 BPS = 100%. Protected against reentrancy.
 */
contract RoyaltySplitter is Ownable, ReentrancyGuard {
    using SafeERC20 for IERC20;

    // Basis points constant (100.00%)
    uint256 public constant TOTAL_BPS = 10000;

    // Stablecoin payment token (e.g. USDC)
    IERC20 public usdcToken;

    struct Track {
        bytes32 trackId;
        address[] payees;
        uint256[] sharesBps;
        uint256 totalReceived;
        uint256 totalUsdcReceived;
        bool isRegistered;
        string ipfsCid;
    }

    // Mapping from trackId to Track details
    mapping(bytes32 => Track) private _tracks;

    // Track list array for enumeration
    bytes32[] private _trackIds;

    // Events
    event TrackRegistered(bytes32 indexed trackId, address[] payees, uint256[] sharesBps, string ipfsCid);
    event TrackIpfsCidUpdated(bytes32 indexed trackId, string ipfsCid);
    event RoyaltyDistributed(bytes32 indexed trackId, address indexed sender, uint256 totalAmount);
    event PayeePaid(bytes32 indexed trackId, address indexed payee, uint256 amount);
    event RoyaltyDistributedUSDC(bytes32 indexed trackId, address indexed sender, uint256 totalAmount);
    event PayeePaidUSDC(bytes32 indexed trackId, address indexed payee, uint256 amount);
    event UsdcTokenUpdated(address indexed oldToken, address indexed newToken);

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
    error UsdcNotConfigured();

    constructor(address _usdcToken) Ownable() {
        if (_usdcToken != address(0)) {
            usdcToken = IERC20(_usdcToken);
        }
    }

    /**
     * @notice Allows owner to configure or update the USDC settlement token address.
     */
    function setUsdcToken(address _usdcToken) external onlyOwner {
        address oldToken = address(usdcToken);
        usdcToken = IERC20(_usdcToken);
        emit UsdcTokenUpdated(oldToken, _usdcToken);
    }

    /**
     * @notice Registers a new track with payee addresses, basis points shares, and decentralized IPFS CID.
     * @param trackId Unique bytes32 identifier for the track.
     * @param payees Array of wallet addresses receiving royalties.
     * @param sharesBps Array of shares in basis points (must sum to 10000 BPS = 100%).
     * @param ipfsCid IPFS Content Identifier pointing to the audio master and metadata JSON.
     */
    function registerTrackWithIpfs(
        bytes32 trackId,
        address[] calldata payees,
        uint256[] calldata sharesBps,
        string memory ipfsCid
    ) public onlyOwner {
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
        track.totalUsdcReceived = 0;
        track.isRegistered = true;
        track.ipfsCid = ipfsCid;

        _trackIds.push(trackId);

        emit TrackRegistered(trackId, payees, sharesBps, ipfsCid);
    }

    /**
     * @notice Track registration without an initial IPFS CID.
     */
    function registerTrack(
        bytes32 trackId,
        address[] calldata payees,
        uint256[] calldata sharesBps
    ) external onlyOwner {
        registerTrackWithIpfs(trackId, payees, sharesBps, "");
    }

    /**
     * @notice Updates the IPFS CID for a previously registered track.
     * @param trackId Unique bytes32 identifier of the track.
     * @param ipfsCid New IPFS Content Identifier for the track.
     */
    function updateTrackIpfsCid(bytes32 trackId, string memory ipfsCid) external onlyOwner {
        if (!_tracks[trackId].isRegistered) {
            revert TrackNotRegistered(trackId);
        }
        _tracks[trackId].ipfsCid = ipfsCid;
        emit TrackIpfsCidUpdated(trackId, ipfsCid);
    }

    /**
     * @notice Returns the IPFS CID for a given track.
     * @param trackId Unique bytes32 identifier of the track.
     */
    function getTrackIpfsCid(bytes32 trackId) external view returns (string memory) {
        if (!_tracks[trackId].isRegistered) {
            revert TrackNotRegistered(trackId);
        }
        return _tracks[trackId].ipfsCid;
    }

    /**
     * @notice Pays stable USDC royalty for a track and atomically distributes to registered payees.
     * @param trackId Unique bytes32 identifier of the registered track.
     * @param amount Amount of USDC (6 decimals) to disburse.
     */
    function payRoyaltyUSDC(bytes32 trackId, uint256 amount) external nonReentrant {
        Track storage track = _tracks[trackId];
        if (!track.isRegistered) {
            revert TrackNotRegistered(trackId);
        }
        if (amount == 0) {
            revert ZeroPaymentAmount();
        }
        if (address(usdcToken) == address(0)) {
            revert UsdcNotConfigured();
        }

        // Pull payment from sender
        usdcToken.safeTransferFrom(msg.sender, address(this), amount);

        track.totalUsdcReceived += amount;
        emit RoyaltyDistributedUSDC(trackId, msg.sender, amount);

        // Distribute funds among payees
        uint256 payeeCount = track.payees.length;
        for (uint256 i = 0; i < payeeCount; i++) {
            address payee = track.payees[i];
            uint256 shareBps = track.sharesBps[i];
            uint256 payeeAmount = (amount * shareBps) / TOTAL_BPS;

            if (payeeAmount > 0) {
                usdcToken.safeTransfer(payee, payeeAmount);
                emit PayeePaidUSDC(trackId, payee, payeeAmount);
            }
        }
    }

    /**
     * @notice Legacy ETH royalty fallback.
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
     * @notice Returns total USDC received and distributed for a given track.
     * @param trackId Unique bytes32 identifier of the track.
     */
    function getTotalUsdcReceived(bytes32 trackId) external view returns (uint256) {
        if (!_tracks[trackId].isRegistered) {
            revert TrackNotRegistered(trackId);
        }
        return _tracks[trackId].totalUsdcReceived;
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
