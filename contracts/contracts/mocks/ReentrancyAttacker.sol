// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "../RoyaltySplitter.sol";

contract ReentrancyAttacker {
    RoyaltySplitter public splitter;
    bytes32 public targetTrackId;

    constructor(address payable _splitter) {
        splitter = RoyaltySplitter(_splitter);
    }

    function setTargetTrack(bytes32 _trackId) external {
        targetTrackId = _trackId;
    }

    receive() external payable {
        if (address(splitter).balance >= 0.01 ether) {
            // Attempt reentrancy call back into payRoyalty
            splitter.payRoyalty{value: 0.01 ether}(targetTrackId);
        }
    }
}
