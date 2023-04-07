// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.9;

contract Bank {
    event moneyAdded(address user, uint256 amount);
    event moneyWithdrawn(address user, uint256 amount);

    mapping(address => uint) userBalance;

    function addMoney(uint256 amount) public {
        userBalance[msg.sender] += amount;
        emit moneyAdded(msg.sender, amount);
    }

    function withdrawMoney(uint256 amount) public {
        require(userBalance[msg.sender] >= amount, "Not enough money");
        userBalance[msg.sender] -= amount;
        emit moneyWithdrawn(msg.sender, amount);
    }

    function getBalance(address user) public view returns (uint) {
        return userBalance[user];
    }
}
