// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

contract OwnerAccessControl {
    address public owner;

    constructor() {
        owner = msg.sender;
    }

    modifier onlyOwner() {
        require(msg.sender == owner, "Not owner");
        _;
    }

    function changeOwner(address newOwner) public onlyOwner {
        require(newOwner != address(0), "Invalid address");
        owner = newOwner;
    }

    function restrictedAction() public onlyOwner returns (string memory) {
        return "Action executed successfully by owner";
    }
}
