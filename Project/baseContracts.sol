// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.6;

import "./Library.sol";


contract Ownable {
    address owner;

    // In this version of the Store only EOA can be owners and not smart contracts.
    constructor () {
        uint size;
        address sender = msg.sender;
        assembly { size:=extcodesize(sender)}
        // Revert instantiation if the creator is not an EOA
        if (size > 0)
            revert Errors.NotAnEOA();
        owner = msg.sender;    

    }

    modifier isOwner(){
        if(msg.sender != owner)
            revert Errors.NotAnAdmin();
        _;
    }

}


// Contract storing all Products related code
contract Products is Ownable {
     struct Product {
        uint price;
        uint quantity;
        string name;
        bool exists;
    }

    // Using the iterable mapping technique
    // Checking available products - and their id (the index in the array)
    string[] availableProducts;
    mapping(uint => Product) public products;

    // 0(1) lookup time when checking if a product already exists before adding it to store
    mapping(string => bool) productMap;

    // calldata is cheaper 
    function addNewProduct(string calldata _name, uint _price,uint _quantity) external isOwner{
         if (!productMap[_name]){
             Product memory product;
             product.price = _price;
             product.quantity = _quantity;
             product.name = _name;
             product.exists = true;
             products[availableProducts.length] = product;
             productMap[_name] = true;
             availableProducts.push(_name);
         }else{
            //  Using descriptive custom error name instead of string description - to save a bit of gas;
             revert Errors.ProductExists();
         }
        
    }


    function addQuantity(uint _id,uint _quantity) external isOwner{
        if (products[_id].exists){
            products[_id].quantity += _quantity;
        }else{
            //  Using descriptive custom error name instead of string description - to save a bit of gas;
            revert Errors.ProductNotExistent();
        }
    }
    

    function showAvailableProducts() external view returns (string[] memory){
        return availableProducts;
    }

}

// Contract storing all Transactions related code
contract Transactions {
     struct Transaction {
        uint blockNum;
        uint price;
        // 1-paid, 2-refunded - prevent refunding from happening more than once
        uint status; 
    }

     // Storing all transactions
    mapping(uint => mapping(address => Transaction)) public transactions;

    // Keeping track of the funds that have to be refunded to the buyers
    mapping (address =>uint) public pendingWithdrawals;


     // Following the best practices and creating a separate function for ether withdrawal 
    // instead of doing it automatically when a buyer returns a product
    function withdraw() external {
        if (pendingWithdrawals[msg.sender] > 0){
            // Following the Checks-Effects-Interactions Pattern - to prevent from Re-entrancy Attack and multiple Refunding
            uint amount = pendingWithdrawals[msg.sender];
            // Refund of 15K Gas for reassigning a storage value to 0.
            pendingWithdrawals[msg.sender]=0;
            // Refunding the buyer - low level call is a bit cheaper than transfer (but riskier)
            payable(msg.sender).call{value:amount}("");

             // Log the refund
            emit Events.NewRefund(msg.sender,amount,block.timestamp);
        }else{
            //  Using descriptive custom error name instead of string description - to save a bit of gas;
            revert Errors.NothingToRefund();
        }
    }

}