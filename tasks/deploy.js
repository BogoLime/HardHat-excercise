task("deployContract", "Deploying the contract to the test network")
.setAction(async (taskArgs, hre) =>{
    await hre.run('compile');
    const contract = await hre.run("deploy", {contractName:"USElection"})
    await hre.run("getInfo",{contractAddr:contract.address, contractName:"USElection"})
    await hre.run ("verifyContract",{contractAddr:contract.address})
})

subtask("deploy", "Subtask for deploying the contract")
.addParam("contractName", "Contract name to load into ContractFactory","",types.string)
.setAction(async ({contractName},hre) => {
    const provider  = await hre.ethers.getDefaultProvider("ropsten")
    const wallet = new hre.ethers.Wallet(process.env["PRIVATE_KEY"],provider)
    console.log(`The deployer address is ${wallet.address}`)
    console.log(`The deployer balance is ${(await wallet.getBalance()).toString()}`)


    const Factory = await hre.ethers.getContractFactory(contractName,wallet)
    const contract = await  Factory.deploy() 
    console.log(`Started deploying contract -- ${contractName} --  `)

    await contract.deployed()
    console.log(` Successfully deployed contract -- ${contractName} -- `)

    return contract
})

subtask ("getInfo", " Getting important info on deployed contract")
.addParam("contractAddr", "The adress of the deployed contract to get the info of.", "",types.string)
.addParam("contractName", "Contract name to load into ContractFactory","",types.string)
.setAction( async ({contractAddr,contractName},hre) =>{
    const provider  = await hre.ethers.getDefaultProvider("ropsten")
    const factory = await hre.ethers.getContractFactory("USElection")
    let contract = await factory.attach(contractAddr)

    const balance  = await provider.getBalance(contractAddr)

    console.log(`The balance of contract -- ${contractName} -- currently is ${balance}`)

    console.log(`The contract has been deployed at ${contract.address}`)

    console.log(` The block number is ${await provider.getBlockNumber()}`)

    
})

subtask ("verifyContract", "Verifies the contract")
.addParam("contractAddr", "The adress of the deployed contract to verify against.", "",types.string)
.setAction(async({contractAddr},hre) =>{
    console.log("Starting verification process of contract")
    await hre.run("verify:verify", {
        address:contractAddr
    })
})


