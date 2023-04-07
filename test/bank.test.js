const { expect } = require("chai");
const { ethers } = require("hardhat");

const emittedEvents = [];
const saveEvents = async (tx) => {
    const receipt = await tx.wait()
    receipt.events.forEach(ev => {
        if (ev.event) {
            emittedEvents.push({
                name: ev.event,
                args: ev.args
            });
        }
    });
}

describe("Bank", function () {

  const eth = (amount) => ethers.utils.parseEther(String(amount));
  const fromEth = (amount) => ethers.utils.formatEther(String(amount));
  
  before(async function () {
    [deployer, otherAccount] = await ethers.getSigners();
    Bank = await ethers.getContractFactory("Bank");
    bank = await Bank.deploy();
    await bank.deployed();
  });

  it('can increase users balance', async function () {
    const tx = await bank.addMoney(eth(100));
    saveEvents(tx);
    expect(await bank.getBalance(deployer.address)).to.equal(eth(100));
  });

  it('can decrease users balance', async function () {
    const tx = await bank.withdrawMoney(eth(100));
    saveEvents(tx);
    expect(await bank.getBalance(deployer.address)).to.equal(0);
  });

  it('can calculate user deposit history from events', async function () {
    saveEvents(await bank.addMoney(eth(20)));
    saveEvents(await bank.addMoney(eth(30)));
    saveEvents(await bank.withdrawMoney(eth(10)));
    saveEvents(await bank.addMoney(eth(50)));
    saveEvents(await bank.withdrawMoney(eth(40)));

    let transactionHistory = "Transaction history:\n---\n";
    let userBalance = 0;
    emittedEvents.forEach(event => {
        if (event.name === 'moneyAdded') {
            transactionHistory += `Deposited: $${parseFloat(fromEth(event.args.amount))} \n`;
            userBalance += parseFloat(fromEth(event.args.amount));
        } else if (event.name === 'moneyWithdrawn') {
            transactionHistory += `Withdrew: $${parseFloat(fromEth(event.args.amount))} \n`;
            userBalance -= parseFloat(fromEth(event.args.amount));
        }
    });
    transactionHistory += `---\nTotal balance: $${userBalance}`;
    console.log('\x1b[36m%s\x1b[0m', transactionHistory);
  });

});