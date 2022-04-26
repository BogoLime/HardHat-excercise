

## How I structured the contract
I tried to structure the code into logically contained parts, so that it has a structure that is easier to understand and to maintain.
- I have created two libraries with all the Error and Event types.
- I have encapsulated logically related state variables and functions in separate contracts ( baseContracts.sol ), that then get inherited in the main contract ( TechnoLime.sol ).

### baseContracts.sol
 - contract Ownable - this one should be quite self-explanatory.
 - contract Products - this one contains all the logic related to creating, storing and updating the Products in the Store
 - contract Transactions - this one contains the state variables related to Transactions - which get created when a product is purchased(Transaction) and returned(Refund).
 
### TechnoLime.sol
 - contract TechnoLimeStore - this is the main contract (that actually gets deployed) - it inherits from all the above contracts. It also defines the functions for buying and returning a product. Since these functions modify state variables from both Products & Transactions contracts, they are defined here.


## How I solved the task requirements

### The administrator (owner) of the store should be able to add new products and the quantity of them.
- I created the Ownable contract, which set's the owner of the store and declares a modifier isOwner() which is applied to the addNewProduct() and addQuantity() functions in the Products contract. 
- I wanted to modify this a bit and allow only EOA's (let's call them humans) to become owners of the store and prevent contracts from being owners. I used simple Inline Assembly code to check if the caller is a contract.

### The administrator should not be able to add the same product twice, just quantity.
- adding a product is done by calling the addNewProduct() function.
- calling addNewProduct() always checks to see if product exists already.
- adding quantity is done by calling the addQuantity() function.
- I've created an additional mapping storing the strings of the already added products. This consumes more storage space, but instead of looping trough the array of product names every time to check if the the product is in it, I can save a lot of operations because of the constant lookup time that the mapping would give me.

### Buyers (clients) should be able to see the available products and buy them by their id.
- Once the owner adds a product with the addNewProduct() function, it's name get's appended to a storage array called availableProducts. It has a getter function showAvailableProducts().
- The index of each item in the array also acts as an ID of the product. The actual Products with their details - price/quantity get stored on a separate mapping called products. Where they get accessed by their id.
- Example:   string[] availableProducts : [car,laptop,phone] / mapping ( 0 => {name:car,price:5000,quantity:2})
- Since the mapping is not iterable, storing the product names in an array allows the clients to quickly see all of them and then refrence them trough their index(id). This again consumes more storage space initially, but saves on extra for loops, which in the long run should be more efficient.

### Buyers should be able to return products if they are not satisfied (within a certain period in blocktime: 100 blocks).
- return is done by calling the returnProduct() function.
- Every successfull call to  buyProduct() creates a new Transaction that stores the amount, the blockNumber and also the status as number / 0 - doesn't exist, 1- paid, 2- refunded/. Those statuses are used to check and prevent buyers from purchasing the same product or returning it a second time.
- Substracting the current block time from the purchase block time, to check if 100 blocks have passed.
- Returning a product means that the buyer must be refunded. After doing a research, I came to the conclusion that it is a better and more secure practice to create a separate function, that the user must call explicitly to get his money back. A state variable called pendingWithdrawals keeps track of the money that has to be returned to the buyer. If a return is successful, those money get added in pendingWithdrawals for that account(buyer).
- withdrawal is done calling the withdraw() function.

### A client cannot buy the same product more than one time.
- calling  buyProduct() always checks to see if there is a Transaction for the same product with the same address.

### The clients should not be able to buy a product more times than the quantity in the store unless a product is returned or added by the administrator (owner)
- every product has a quantity attribute which gets updated. Calling  buyProduct() always checks to see if quantity is above 0.

### Everyone should be able to see the addresses of all clients that have ever bought a given product.
- At first I created a state variable mapping that stores all addresses that have purchased a product. This was easier to implement, but not very efficient and costly - since storing data in contract storage is one of the most expensive things. The array of buyers could grow indeffinately, which is why I changed my approach and decided to use Events as a way to log every Transaction. This way they can get "queried" later by their indexed parameters. So I switched from storing in storage to loging as Events - which allows me to get all the historiacal data of all buyers of a product in a more gas-efficient way.
- **I've included a simple example with web3.js in Node.js** that shows how this approach might work.

## How I tried to decrease gas-costs
- minimizing storage usage as much as possible.
- copying storage variables to memory when accessing them multiple times. In the TechnoLimeStore contract I have used this approach. Since this is a simpler contract and I'm accessing the storage variables only a few times, this doesn't justify the cost of creating a new memory variable. But my presumption is that, if the contract was more complicated, including a lot of checks - using local variable would be the much better option.
- minimizing usage of loops
- using shortcircuiting to reduce code size and prevent costlier code from running if basic conditions have not been met - like for example trying to buy a product using an ID that doesn't exist. 
- using custom error names, instead of string descriptions with require(). Using the name of the error as a description is cheaper than sending a decoded string.
- using Events to log actions, that can be checked later, instead of storing in storage
- using calldata when possible

## NOTES
- I have deployed the contract to Ropsten testnet to test it. I also used a node on Infura to connect to the network with web3.js and try some of the functionality.
- Reverting with Custom Errors in Remix IDE worked great. But I didn't know that errors are not actually being returned on the testnet. So this is probably something that I can improve upon in the contracts. Using a try/catch block to catch the errors and then emit an Event that will log what happened and thus give a better explanation of why a transaction failed.