//Crystallum contract
//SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

import "../node_modules/@chainlink/contracts/src/v0.8/interfaces/AggregatorV3Interface.sol";

//Library PriceConverter to convert usd to eth and eth to usd

library PriceConverter {
    function getPrice(
        AggregatorV3Interface priceFeed
    ) internal view returns (uint256) {
        (, int256 answer, , , ) = priceFeed.latestRoundData();
        return uint256(answer * 10000000000);
    }

    function ethToUsd(
        uint256 ethAmount,
        AggregatorV3Interface priceFeed
    ) internal view returns (uint256) {
        uint256 ethPrice = getPrice(priceFeed);
        uint256 ethAmountInUsd = (ethPrice * ethAmount) / 1000000000000000000;
        return ethAmountInUsd;
    }

    function usdToEth(
        uint usdAmount,
        AggregatorV3Interface priceFeed
    ) internal view returns (uint256) {
        uint256 ethPrice = getPrice(priceFeed);
        uint256 usdAmountInEth = (usdAmount / ethPrice) * 1000000000000000000;
        return usdAmountInEth;
    }
}

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

    function setBottles(uint256 _numberOfBottles) private {
        s_accountToNumberOfBottles[payable(msg.sender)] += _numberOfBottles;
    }

    function retrieve() public {
        require(
            s_accountToNumberOfBottles[msg.sender] > 0,
            "You have no bottles to retrieve"
        );
        uint256 amount = (s_accountToNumberOfBottles[payable(msg.sender)] *
            PRICE_BOTTLE) / 10 ** 18;
        amount = amount.usdToEth(s_priceFeed);
        bool sendSuccess = payable(msg.sender).send(amount);
        require(sendSuccess, "Send failed");
        s_accountToBalance[msg.sender] += amount;
        s_accountToNumberOfBottles[msg.sender] = 0;
    }

    function fundContract() public payable {}

    function send(address payable _to) external payable {
        require(_to != address(0), "Adresse invalide");

        require(msg.value > 0, "Montant insuffisant");

        _to.transfer(msg.value);
    }

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
