// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.6;

library Errors {

    /// This address of the owner must belong to an EOA, not a smart contract
    error NotAnEOA();

     /// This address is not an admin
    error NotAnAdmin();

    /// Can't add a product that already exists
    error ProductExists();

    /// Product doesn't exist
    error ProductNotExistent();

    /// ProductID doesn't exist or it has been bought once already by this address
    error ItemIdWrongOrBoughtAlready();

    /// Money sent is less than Product price or Product out of Stock
    error LessThanPriceOrOutOfStock();

    ///Transaction doesn't exist
    error TransactionNotExistent();

    ///More than 100 blocks have passed since the product has been bought
    error Blocks100Exceeded();

    /// No products returned or Buyer already refunded
    error NothingToRefund();
}

library Events {

    /// Event emmitted when a new product is purchased
    event NewTransaction(uint indexed productId,address indexed buyer,uint amount, uint time);
    /// Event emmitted when a new product returned
    event NewReturn(address indexed buyer,uint productId,uint amount, uint time);
    /// Event emmitted when a buyer has been refunded
    event NewRefund(address indexed buyer,uint amount, uint time);

}

