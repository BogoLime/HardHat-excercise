require('dotenv').config()
const hre = require("hardhat");
const {abi} = require("../artifacts/contracts/USElection.sol/USElection.json")

const run = async function() {
    const provider = await new hre.ethers.getDefaultProvider("ropsten",{infura: process.env["INFURA_KEY"]})
	const wallet = new hre.ethers.Wallet(process.env["PRIVATE_KEY"],provider)
    const balance = await wallet.getBalance()
    console.log(hre.ethers.utils.formatEther(balance,18))
    
    const contract = new hre.ethers.Contract("0x70A56b232C6e6B794Fc41c9F1492A44a4e9d122E", abi, wallet )

    const hasEnded  = await contract.electionEnded()
    console.log("The election has ended:", hasEnded)

    const transaction = await contract.submitStateResult(["Luisiana",4,5,41])

    console.log(`Contract transaction hash is: ${transaction.hash}`)

    const trxReceipt = await transaction.wait()

    if(trxReceipt.status !== 1){
        console.log("Transaction failed")
        return
    }
    
    const haveResults = await contract.resultsSubmitted("Luisiana")
    console.log("Results for Colorado:", haveResults)

    const currLeader = await contract.currentLeader()
    console.log("Current Leader", currLeader)

}

run()