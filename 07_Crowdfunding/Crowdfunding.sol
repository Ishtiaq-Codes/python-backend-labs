// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

contract Crowdfunding {
    address public owner;
    uint256 public goal;
    uint256 public deadline;
    uint256 public totalRaised;
    mapping(address => uint256) public contributions;

    constructor(uint256 _goal, uint256 durationInDays) {
        owner = msg.sender;
        goal = _goal;
        deadline = block.timestamp + (durationInDays * 1 days);
    }

    function contribute() public payable {
        require(block.timestamp < deadline, "Campaign has ended");
        require(msg.value > 0, "Contribution must be > 0");

        contributions[msg.sender] += msg.value;
        totalRaised += msg.value;
    }

    function withdrawFunds() public {
        require(msg.sender == owner, "Only owner can withdraw");
        require(totalRaised >= goal, "Goal not reached");
        require(block.timestamp >= deadline, "Campaign still active");

        payable(owner).transfer(address(this).balance);
    }

    function refund() public {
        require(block.timestamp >= deadline, "Campaign still active");
        require(totalRaised < goal, "Goal was reached");
        require(contributions[msg.sender] > 0, "No contribution to refund");

        uint256 amount = contributions[msg.sender];
        contributions[msg.sender] = 0;
        payable(msg.sender).transfer(amount);
    }
}
