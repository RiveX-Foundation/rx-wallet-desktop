const { ipcRenderer } = require('electron');
const uuid = require('uuid/v1');
var Web3 = require('web3');
var ethers = require("ethers");

//import WalletConnectProvider from "@walletconnect/web3-provider";
//var HDWalletProvider = require("truffle-hdwallet-provider");
//var provider = new HDWalletProvider("2dc9fee24ebbffa67bb61397405cc32cf742e10bd1ae2552b473507dd82477c9", "https://mainnet.infura.io/v3/c941387bd4d8467285c24d75ad3574a4");
//var web3 = new Web3(new Web3.providers.HttpProvider('https://mainnet.infura.io/v3/c941387bd4d8467285c24d75ad3574a4'));
//var web3 = new Web3(provider);
class Web3Eth {
  constructor() {
    this._callback = {}; //Save all callback funcs
    console.log("cosntructor");
    ipcRenderer.on('dapp-message', this.dexMessageHandler.bind(this));
  }


  // ---------------------------------
  // Functions called by DEX
  // function name same to web3 protocol
  getAccounts(cb) {
    const msg = {
      method: "getAddresses",
      id: uuid(),
      cb: cb
    };

    this.saveCb(msg);
    this.sendToHost([msg.method, msg.id]);
  }


  sign(message, address, cb) {
    const msg = {
      method: "signPersonalMessage",
      id: uuid(),
      cb: cb,
      message: message,
      address: address
    };

    this.saveCb(msg);
    this.sendToHost([msg.method, msg.id, msg.message, msg.address]);
  }

  sendTransaction(tx, cb) {
    const msg = {
      method: "sendTransaction",
      id: uuid(),
      cb: cb,
      message: tx,
    };

    this.saveCb(msg);
    this.sendToHost([msg.method, msg.id, msg.message]);
  }

  getChainId(cb) {
    const msg = {
      method: "loadNetworkId",
      id: uuid(),
      cb: cb
    };

    this.saveCb(msg);
    this.sendToHost([msg.method, msg.id]);
  }
  // -------------------------------

  // -------------------------------
  // Functions used for internal data transfer
  sendToHost(obj) {
    ipcRenderer.sendToHost('dapp-message', obj);
  }
  enable() {
    return "0xa3152a3e96653f87c47421c8d7a7aeec626439ee";
  }

  saveCb(msg) {
    this._callback[msg.method + '#' + msg.id] = {};
    this._callback[msg.method + '#' + msg.id].cb = msg.cb;
  }

  runCb(msg) {
    if (this._callback[msg.method + '#' + msg.id] &&
      this._callback[msg.method + '#' + msg.id].cb) {
      this._callback[msg.method + '#' + msg.id].cb(msg.err, msg.val);
      this.removeCb(msg);
    } else {
      console.log('can not found cb.');
    }
  }

  removeCb(msg) {
    delete this._callback[msg.method + '#' + msg.id];
  }

  dexMessageHandler(event, data) {
    console.log("DAPP EVENT: "+event);
    console.log("DAPP DATA: "+data);
    const msg = data;
    this.runCb(msg);
  }
  // --------------------------------
}
//window.web3 = web3; 
//console.log(new Web3Eth());
//window.ethereum = web3;
window.ethereum ={ eth: new Web3Eth() };
//window.web3 = web3; 
window.injectWeb3 = false;