//Crystallum contract
//SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

import "../node_modules/@chainlink/contracts/src/v0.8/interfaces/AggregatorV3Interface.sol";
import "./PriceConverter.sol";

contract Crystallum {
    using PriceConverter for uint256;

    uint256 public constant PRICE_BOTTLE = 0.1 * 10 ** 18;
    address private immutable i_owner;
    mapping(address => uint256) private s_accountToBalance;
    mapping(address => uint256) private s_accountToNumberOfBottles;
    AggregatorV3Interface private s_priceFeed;

    modifier onlyOwner() {
        require(msg.sender == i_owner, "You are not the owner");
        _;
    }

    constructor(address priceFeed) {
        i_owner = msg.sender;
        s_priceFeed = AggregatorV3Interface(priceFeed);
    }

    fallback() external payable {
        fundContract();
    }

    receive() external payable {
        fundContract();
    }

    function setBottles(uint256 _numberOfBottles) public {
        s_accountToNumberOfBottles[payable(msg.sender)] += _numberOfBottles;
    }

    function retrieve() public payable {
        require(
            s_accountToNumberOfBottles[msg.sender] > 0,
            "You have no bottles to retrieve"
        );
        uint256 amount = (s_accountToNumberOfBottles[msg.sender] *
            PRICE_BOTTLE);
        amount = PriceConverter.usdToEth(amount /*, s_priceFeed**/);
        require(
            address(this).balance >= amount,
            "Not enough balance to transfer"
        );
        (bool success, ) = msg.sender.call{value: amount}("");
        require(success, "Failing to send ether");
        s_accountToBalance[msg.sender] += amount;
        s_accountToNumberOfBottles[msg.sender] = 0;
    }

    function fundContract() public payable {}

    // function send(address payable _to) public payable {
    //     require(_to != address(0), "Adresse invalide");

    //     _to.transfer(msg.value);

    //     s_accountToBalance[msg.sender] -= msg.value;
    // }

    function getOwner() public view returns (address) {
        return i_owner;
    }

    function getBalance(address _address) public view returns (uint256) {
        return s_accountToBalance[_address];
    }

    function getNumberOfBottles(
        address _address
    ) public view returns (uint256) {
        return s_accountToNumberOfBottles[_address];
    }

    function getPriceFeed() public view returns (AggregatorV3Interface) {
        return s_priceFeed;
    }
}
