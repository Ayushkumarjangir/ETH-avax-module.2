// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.9;

contract Assessment {
    address payable public owner;
    mapping(address => uint256) public balanceOf;

    event Deposit(address indexed account, uint256 amount);
    event Withdraw(address indexed account, uint256 amount);

    constructor(uint256 initBalance) payable {
        owner = payable(msg.sender);
        balanceOf[msg.sender] = initBalance;
    }

    function getBalance() public view returns(uint256) {
        return balanceOf[msg.sender];
    }

    function deposit() public payable {
    require(msg.value > 0, "Amount must be greater than 0");

    uint256 previousBalance = balanceOf[msg.sender];
    uint256 newBalance = previousBalance + msg.value;

    // Check for potential overflow
    require(newBalance >= previousBalance, "Overflow detected");

    balanceOf[msg.sender] = newBalance;

    // Emit the event
    emit Deposit(msg.sender, msg.value);
}

    function withdraw(uint256 _withdrawAmount) public {
        require(_withdrawAmount > 0, "Amount must be greater than 0");
        require(balanceOf[msg.sender] >= _withdrawAmount, "Insufficient balance");

        uint256 previousBalance = balanceOf[msg.sender];
        balanceOf[msg.sender] -= _withdrawAmount;

        // Transfer the amount to the sender
        payable(msg.sender).transfer(_withdrawAmount);

        // Emit the event
        emit Withdraw(msg.sender, _withdrawAmount);
        assert(balanceOf[msg.sender] == previousBalance - _withdrawAmount);
    }
}
