const Web3 = require('web3');
const web3 = new Web3('https://ropsten.infura.io/v3/fb5bc44cdda345a8ba5eba8ca51e2462');
const contractAddress = "0x38b21692457c58fe5794990ffc5955aa1a6ebd0a";
const contractAbi = require('./ABI_JSON.json');
const contract = new web3.eth.Contract(contractAbi, contractAddress);

// Example of how the events log of the contract might be used to get all addresses that have ever bought a product
const getAllBuyersOfProduct = async function (productId){
    try{
    let result = await contract.getPastEvents("NewTransaction",{fromBlock: 0,filter: {productId}});
    let buyersOfProduct = {productID:productId,transactions:[]}
    for(let res of result){
        buyersOfProduct.transactions.push({
            buyer: res.returnValues.buyer,
            amount: res.returnValues.amount
        })
    }
    console.log(buyersOfProduct)

    }catch(err){
    console.log(err)
    }
    
}


getAllBuyersOfProduct(0)