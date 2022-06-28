const { expect, use } = require("chai");
const { ethers } = require("hardhat");
const { solidity } = require( "ethereum-waffle");
const { types } = require("hardhat/config")



use(solidity);

describe("USElection", function (){
  let usElectionFactory;
  let usElectionContract
  before (async()=>{
    
    usElectionFactory = await ethers.getContractFactory("USElection")
    usElectionContract = await usElectionFactory.deploy()
    await usElectionContract.deployed()
  });
  it("Should return 0 as the current leader before any voting has been done", async()=>{
     expect( await usElectionContract.currentLeader()).to.equal(0)
  })
  it("Should return election status", async ()=>{
    expect(await usElectionContract.electionEnded()).to.equal(false)
  })
  it("Should return election status when being invoked by NOT owner", async ()=>{
    const [owner, adr1] = await ethers.getSigners()
    const contract = await usElectionContract.connect(adr1)
    expect(await contract.electionEnded()).to.equal(false)
  })
  it("Should submit state result and get 1 as the new leader", async ()=>{
    const StateResult = ["Ohio",2,3,2]
    const Trx = await usElectionContract.submitStateResult(StateResult)
    await Trx.wait()
    expect(await usElectionContract.currentLeader()).to.equal(2)
  })
  it("Should revert when trying to submit a tie", async ()=>{
    const StateResult = ["Washington",2,2,2]
    await expect(usElectionContract.submitStateResult(StateResult)).to.be.revertedWith("There cannot be a tie")
  })
  it("Should revert when trying to submit without any State Seats", async ()=>{
    const StateResult = ["Colorado",2,4,0]
    await expect(usElectionContract.submitStateResult(StateResult)).to.be.revertedWith("States must have at least 1 seat")
  })
  it("Should emit an event when submiting a vote", async () => {
    const StateResult = ["Colorado",2,4,6]
    await expect(usElectionContract.submitStateResult(StateResult)).to.emit(usElectionContract,"LogStateResult")

  })
  it("Should revert when trying to submit the same State", async ()=>{
    const StateResult = ["Colorado",2,4,5]
    await expect( usElectionContract.submitStateResult(StateResult)).to.be.revertedWith("This state result was already submitted!")
  })
  it("Submit vote and show new Leader", async () =>{
    const StateResult = ["Iowa",10,1,10]
    const Trx = await usElectionContract.submitStateResult(StateResult)
    await Trx.wait()
    expect(await usElectionContract.currentLeader()).to.equal(1)
  })
  it("Should prevent ending and revert if NOT Owner tries to end the Election", async () =>{
    const [owner, adr1] = await ethers.getSigners()
    const contract = await usElectionContract.connect(adr1)
    await expect(contract.endElection()).to.be.revertedWith("Ownable: caller is not the owner");
    expect(await usElectionContract.electionEnded()).to.equal(false)
  })
  it("Should end the election and emit an event", async () =>{
    await expect(usElectionContract.endElection()).to.emit(usElectionContract,"LogElectionEnded")
  })
  it("Should confirm the election has ended", async () =>{
    expect(await usElectionContract.electionEnded()).to.equal(true)
  })
  it("Should revert on second try to end the Election", async () =>{
    await expect(usElectionContract.endElection()).to.be.revertedWith("The election has ended already")
  })
  it("Should revert on vote submits after election has ended", async () =>{
    const StateResult = ["Misisipi",1,1,3]
    await expect( usElectionContract.submitStateResult(StateResult)).to.be.revertedWith("The election has ended already")
  })
  it ("Should return the real leader after calling currentLeader()", async ()=>{
    const leader = await usElectionContract.currentLeader()
    let loser;
    leader === 1 ? loser = 2 : loser = 1
    expect(await usElectionContract.seats(leader)).to.be.gt(await usElectionContract.seats(loser))
    
  })


}

)