//Crystallum contract
//SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

import "@chainlink/contracts/src/v0.8/interfaces/AggregatorV3Interface.sol";

library PriceConverter {
    //Fonction qui permet de récupérer le prix de l'Ether (ne marche pas pour l'instant à cause de l'oracle Chainlink)
    function getPrice()
        internal
        view
        returns (
            // AggregatorV3Interface priceFeed
            uint256
        )
    {
        // (, int256 answer, , , ) = priceFeed.latestRoundData();
        // return uint256(answer * 10000000000);
        return 2000;
    }

    function ethToUsd(
        uint256 ethAmount
    )
        internal
        view
        returns (
            // AggregatorV3Interface priceFeed
            uint256
        )
    {
        uint256 ethPrice = getPrice /*priceFeed**/();
        uint256 ethAmountInUsd = (ethPrice * ethAmount) / 10 ** 18;
        return ethAmountInUsd;
    }

    function usdToEth(
        uint usdAmount
    )
        internal
        view
        returns (
            // AggregatorV3Interface priceFeed
            uint256
        )
    {
        uint256 ethPrice = getPrice /*priceFeed**/();
        uint256 usdAmountInEth = usdAmount / ethPrice;
        return usdAmountInEth;
    }
}
