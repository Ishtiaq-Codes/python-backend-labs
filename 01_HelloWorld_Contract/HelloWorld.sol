// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

contract HelloWorld {
    string public message;

    constructor() {
        message = "Hello Blockchain";
    }

    function setMessage(string memory newMessage) public {
        message = newMessage;
    }
}
