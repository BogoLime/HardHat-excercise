// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.6;

import "./Library.sol";
import "./baseContracts.sol";

contract TechnoLimeStore is Products,Transactions {

    function buyProduct (uint _id)  external payable { 
        // Using short-circuiting to prevent more gas-costly code from running in case of condition fail
        if(_id < availableProducts.length && transactions[_id][msg.sender].status != 1){
            // Loading state variables to memory ( to modify and access them) and then saving them to storage again - more gas efficient
            Product memory product= products[_id];
            if(msg.value < product.price || product.quantity < 1)
                // Combined custom error for lower gas consumption
                revert Errors.LessThanPriceOrOutOfStock();

            Transaction memory newTransaction;
            newTransaction.blockNum = block.number;
            newTransaction.price = product.price;
            newTransaction.status = 1;
            // save to storage
            transactions[_id][msg.sender] = newTransaction;

            // accessing the storage variable directly
            products[_id].quantity--;
            
            // Log the transaction
            emit Events.NewTransaction(_id,msg.sender,product.price,block.timestamp);

        }else{
            // Combined custom error for lower gas consumption
            revert Errors.ItemIdWrongOrBoughtAlready();
        }   
        
    }

    
    function returnProduct(uint _id) external {
        // Copying state variables to a new memory variable is not very cheap, so we copy it only in case the transaction exists.
        // This way we save gas everytime someone tries to return a product that he did not buy.
        if (transactions[_id][msg.sender].status == 1){ 
            // Now we can copy to memory, because it will be cheaper when accessing properties multiple times.
            Transaction memory transaction = transactions[_id][msg.sender];
            if((block.number - transaction.blockNum) > 100)
                revert Errors.Blocks100Exceeded();

            // Mark as refunded
            transactions[_id][msg.sender].status = 2;
            // Update quantity
            products[_id].quantity ++;
            //Add new Withdrawal
            pendingWithdrawals[msg.sender]+=transaction.price;

            // Log the return
            emit Events.NewReturn(msg.sender,_id,transaction.price,block.timestamp);
            
        }else {
            //  Using descriptive custom error name instead of string description - to save a bit of gas;
            revert Errors.TransactionNotExistent();
        }
    }


    
}
