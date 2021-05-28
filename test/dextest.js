//ETH deposit >= buy order value
//Token deposit >= sell order amount
//Buy order book should be ordered from highest to lowest
//Sell order book should be ordered from lowest to highest

const Dex = artifacts.require("Dex");
const Link = artifacts.require("Link");
const truffleAssert = require("truffle-assertions");

contract.skip("Dex", accounts => {

    it("ETH deposit >= buy order value", async () => {
        let dex = await Dex.deployed()
        let link = await Link.deployed()

        await dex.addToken(web3.utils.sha3("LINK"), link.address, {from: accounts[0]})

        await truffleAssert.reverts(
            //function createLimitOrder(side, ticker, amount, price)
            dex.createLimitOrder(0, web3.utils.sha3("LINK"), 10, 1)
        )
   
        await dex.depositEth({value: 20})       

        await truffleAssert.passes(
            //function createLimitOrder(side, ticker, amount, price)
            dex.createLimitOrder(0, web3.utils.sha3("LINK"), 10, 1)
        )
    })

    it("Token deposit >= sell order amount", async () => {
        let dex = await Dex.deployed()
        let link = await Link.deployed()

        await dex.addToken(web3.utils.sha3("LINK"), link.address, {from: accounts[0]})

        await truffleAssert.reverts(
            //function createLimitOrder(side, ticker, amount, price)
            dex.createLimitOrder(1, web3.utils.sha3("LINK"), 10, 1)
        )

        await link.approve(dex.address, 500);
        await dex.deposit(100, web3.utils.sha3("LINK"));

        await truffleAssert.passes(
            //function createLimitOrder(side, ticker, amount, price)
            await dex.createLimitOrder(1, web3.utils.sha3("LINK"), 10, 1)
        )
    })

    it("Buy order book should be ordered from highest to lowest", async () => {
        let dex = await Dex.deployed()
        let link = await Link.deployed()

        await link.approve(dex.address, 500);
        await dex.depositEth({value: 3000});
        await dex.createLimitOrder(0, web3.utils.sha3("LINK"), 10, 1);
        await dex.createLimitOrder(0, web3.utils.sha3("LINK"), 10, 3);
        await dex.createLimitOrder(0, web3.utils.sha3("LINK"), 10, 2);

        //Buy order book should be ordered from highest to lowest
        let orderbook = await dex.getOrderBook(web3.utils.sha3("LINK"), 0);
        assert(orderbook.length >0);
        console.log(orderbook);
        for (let i = 0; i < orderbook.length - 1; i++) {
            assert(orderbook[i].price >= orderbook[i+1].price, "not right order in buy book")
        } 
    })

    it("Sell order book should be ordered from lowest to highest", async () => {
        let dex = await Dex.deployed()
        let link = await Link.deployed()

        await link.approve(dex.address, 500);
        await dex.createLimitOrder(1, web3.utils.sha3("LINK"), 10, 1);
        await dex.createLimitOrder(1, web3.utils.sha3("LINK"), 10, 3);
        await dex.createLimitOrder(1, web3.utils.sha3("LINK"), 10, 2);

        //Sell order book should be ordered from lowest to highest
        let orderbook = await dex.getOrderBook(web3.utils.sha3("LINK"), 1);
        assert(orderbook.length >0);
        for (let i=0; i<orderbook.length-1; i++) {
            assert(orderbook[i].price <= orderbook[i+1].price, "not right order in sell book")
        }      
    })

    //when creating a sell market order, the seller needs to have enough tokens for the trade
    it("Sell order book should be ordered from lowest to highest", async () => {
        let dex = await Dex.deployed()
        let link = await Link.deployed()

        await link.approve(dex.address, 500);
        await dex.createLimitOrder(1, web3.utils.sha3("LINK"), 10, 1);
        await dex.createLimitOrder(1, web3.utils.sha3("LINK"), 10, 3);
        await dex.createLimitOrder(1, web3.utils.sha3("LINK"), 10, 2);

        //Sell order book should be ordered from lowest to highest
        let orderbook = await dex.getOrderBook(web3.utils.sha3("LINK"), 1);
        assert(orderbook.length >0);
        for (let i=0; i<orderbook.length-1; i++) {
            assert(orderbook[i].price <= orderbook[i+1].price, "not right order in sell book")
        }      
    })




})