// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;
pragma experimental ABIEncoderV2;

import "../contracts/wallet.sol";

contract Dex is Wallet {

    enum Side {
    BUY,
    SELL
    }

    struct Order {
        uint id;
        address trader;
        Side side;
        bytes32 ticker;
        uint amount;
        uint price;
        uint filled;
    }

    uint public nextOrderId = 0;

    mapping(bytes32 => mapping(uint => Order[])) public orderBook;

    function getOrderBook(bytes32 ticker, Side side) view public returns(Order[] memory) {
        return orderBook[ticker][uint(side)];
    }


    //function createLimitOrder(side, ticker, amount, price)
    function createLimitOrder(Side side, bytes32 ticker, uint amount, uint price) public {
        if(side == Side.BUY){
            require(balances[msg.sender]["ETH"] >= amount*price);
        }
        else if(side == Side.SELL) {
            require(balances[msg.sender][ticker] >= amount);
        }

        Order[] storage orders = orderBook[ticker][uint(side)];
        orders.push(Order(nextOrderId, msg.sender, side, ticker, amount, price, 0));

        // Bubble sort
        uint256 i = orders.length > 0 ? orders.length-1 : 0;
        if(side == Side.BUY) {
            while (i > 0) {
                if (orders[i].price < orders[i-1].price) {
                    break;
                }  
                Order memory right = orders[i];
                orders[i] = orders[i-1];
                orders[i-1] = right;
                i--;
            }   
        }
        else if(side == Side.SELL) {
            while (i > 0) {
                if (orders[i].price > orders[i-1].price) {
                    break;
                } 
                Order memory right = orders[i];
                orders[i] = orders[i-1];
                orders[i-1] = right;   
                i--; 
            } 
        }
        nextOrderId++;
    }

    function createMarketOrder(Side side, bytes32 ticker, uint256 amount) public {
        if(side == Side.SELL){
            require(balances[msg.sender][ticker] >= amount, "Insufficient balance");
        }
        uint orderBookSide;
        if(side == Side.BUY){
            orderBookSide = 1;
        }
        else{
            orderBookSide = 0;
        }
        Order[] storage orders = orderBook[ticker][uint(orderBookSide)];

        uint totalFilled;
        
        for (uint256 i = 0; i < orders.length && totalFilled < amount; i++) {
            //How much we can fill from order[i]
            uint leftToFill = amount - totalFilled;
            uint availableToFill = orders[i].amount - orders[i].filled;
            uint amountToTrade;
            if(availableToFill >= leftToFill){
                amountToTrade = leftToFill;
            }
            else if(availableToFill < leftToFill){
                amountToTrade = availableToFill;
            }
            //update totalFilled;
            totalFilled += amountToTrade;

            //Execute the trade & shift balances between buyers and sellers
            orders[i].filled += amountToTrade;
            if(side == Side.BUY){
                //verify that the market buyer has enouth ETH to cover the purchase
                require(balances[msg.sender]["ETH"] >= amountToTrade * orders[i].price);
                //execute the trade
                balances[msg.sender][ticker] += amountToTrade;
                balances[orders[i].trader][ticker] -= amountToTrade;
                balances[msg.sender]["ETH"] -= amountToTrade * orders[i].price;
                balances[orders[i].trader]["ETH"] += amountToTrade * orders[i].price;

            }
            else if(side == Side.SELL){
                balances[msg.sender][ticker] -= amountToTrade;
                balances[orders[i].trader][ticker] += amountToTrade;
                balances[msg.sender]["ETH"] += amountToTrade * orders[i].price;
                balances[orders[i].trader]["ETH"] -= amountToTrade * orders[i].price;
            }
        }
        
        //loop through the orderbook and remove 100% filled orders
        while(orders.length > 0 && orders[0].filled == orders[0].amount){
            //remove the op element by overwriting every  element with the next element in the order list
            for (uint256 i = 0; i < orders.length - 1; i++) {
                orders[i] = orders[i+1];
            }
            orders.pop();
        }
    }
}
