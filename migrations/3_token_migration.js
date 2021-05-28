const Link = artifacts.require("Link");
const Dex = artifacts.require("Dex");

module.exports = async function (deployer, network, accounts) {
  await deployer.deploy(Link);
  // let dex = await Dex.deployed()
  // let link = await Link.deployed()
  // await link.approve(dex.address, 500)
  // dex.addToken(web3.utils.sha3("LINK"), link.address)
  // await dex.deposit(100, web3.utils.sha3("LINK"))
  // let balanceOfLink = await dex.balances(accounts[0], web3.utils.sha3("LINK"));
  // console.log(balanceOfLink);
};
