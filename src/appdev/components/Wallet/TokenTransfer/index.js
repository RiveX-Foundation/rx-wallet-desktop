import React, { Component } from 'react';
import { Input, Radio, Tooltip, Button } from 'antd';
import { observer, inject } from 'mobx-react';
import intl from 'react-intl-universal';
import { createNotification } from 'utils/helper';

var Tx = require('ethereumjs-tx');
var Web3 = require('web3');
var fs = require('fs');

import './index.less';
import { setDefaultWordlist } from 'bip39';
import Axios from 'axios';

const tokencontract = "0x221535cbced4c264e53373d81b73c29d010832a5"; //XMOO CONTRACDT
const chainid = 0x01; //0x03
const web3Provider = "https://mainnet.infura.io:443";

@inject(stores => ({
  selectedwallet : stores.walletStore.selectedwallet,
  CreateEthAddress : () => stores.walletStore.CreateEthAddress(),
  wsCreateTrx: (fromwalletpublicaddress,towalletpublicaddress,totaltoken) => stores.walletStore.wsCreateTrx(fromwalletpublicaddress,towalletpublicaddress,totaltoken),
  seedphase: stores.walletStore.seedphase,
  ethaddress: stores.walletStore.ethaddress,
  setCurrent: current => stores.walletStore.setCurrent(current),
  settokentransfervalue: (token,receiver) => stores.walletStore.settokentransfervalue(token,receiver),
  language: stores.languageIntl.language
}))

@observer
class TokenTransfer extends Component {
  state = {
    tokenval : 0,
    receiver : "",
  }

  componentDidMount(){
    this.get12SeedPhase();
  }

  inputChanged = e => {
    this.setState({ mobilevalue : e.target.value }, () => {
      this.props.setMobile(this.state.mobilevalue);
    });
  }

  get12SeedPhase = () => {
    const seedel = this.props.seedphase.map((item, i) =>
    {
      return (
        <li key={i}>{item}</li>
      )
    }
    );    
  }

  onChangeTokenValue = e => {
    this.setState({tokenval:e.target.value});
    //this.props.setMnemonic(e.target.value.replace(/^\s+|\s+$/g, '').replace(/\s+/g, ' '));
  }

  onChangeReceiver = e => {
    this.setState({receiver:e.target.value});
    //this.props.setMnemonic(e.target.value.replace(/^\s+|\s+$/g, '').replace(/\s+/g, ' '));
  }

  copy = () => {
    console.log("COPY");
  }

  getCurrentGasPrices = async () => {
    let response = await Axios.get("https://ethgasstation.info/json/ethgasAPI.json");

    let prices = {
      low : response.data.safeLow,
      medium : response.data.average,
      high : 45
    }
    return prices;
  }

  back = () => {
    this.props.setCurrent("walletdetail");
  }

  pastetoken = event => {
    console.log(event.clipboardData);//.items[0].getAsString());
  }

  transfer = async () => {
    var isvalidaddr=true;

    if(!Web3.utils.isAddress(this.state.receiver)){
      createNotification('error',intl.get('Error.InvalidAddress'));
      return;
    }

    if(this.state.receiver == ""){
      createNotification('error',intl.get('Error.Receiveraddressisempty'));
      return;
    }

    if(this.state.tokenval == ""){
      createNotification('error',intl.get('Error.Tokenvalueisempty'));
      return;
    }

    this.props.settokentransfervalue(this.state.tokenval,this.state.receiver);
    this.props.setCurrent("tokentransferconfirmation");

    /*
    const web3 = new Web3(web3Provider);

    //wallettype
    if(this.props.selectedwallet.wallettype == "sharedwallet"){ //PROPOSE TO CLOUD
      this.props.wsCreateTrx(this.props.selectedwallet.publicaddress,this.state.receiver,this.state.tokenval);
    }else{ //DIRECT EXECUTE TRX
      var abiArray = JSON.parse(fs.readFileSync(__dirname + '/containers/Config/tokenabi.json', 'utf-8'));
      var count = await web3.eth.getTransactionCount(this.props.selectedwallet.publicaddress);
      var gasPrices = await this.getCurrentGasPrices();
      console.log(gasPrices);
      //var contractdata = new web3.eth.Contract(abiArray, tokencontract, {from: this.props.selectedwallet.publicaddress}); //).at(this.tokencontract);
      var contractdata = new web3.eth.Contract(abiArray, tokencontract);//, {from: this.props.selectedwallet.publicaddress}); //).at(this.tokencontract);
      var rawTransaction = {
          "from": this.props.selectedwallet.publicaddress,
          "nonce": count,
          "gasPrice": gasPrices.high * 100000000,//"0x04e3b29200",
          "gas": web3.utils.toHex("519990"),//"0x7458",
          "gasLimit": web3.utils.toHex("519990"),//"0x7458",
          "to": tokencontract,
          "value": "0x0",//web3.utils.toHex(web3.utils.toWei(this.state.tokenval, 'ether')),
          "data": contractdata.methods.transfer(this.state.receiver,web3.utils.toWei(this.state.tokenval, 'ether')).encodeABI(),//contract.transfer.getData(this.tokencontract, 10, {from: this.props.selectedwallet.publicaddress}),
          "chainId": chainid
      };

      var privKey = new Buffer(this.props.selectedwallet.privatekey, 'hex');

      var tx = new Tx(rawTransaction);
      tx.sign(privKey);
      var serializedTx = tx.serialize();

      web3.eth.sendSignedTransaction('0x' + serializedTx.toString('hex'), function(err, hash) {
        if (!err) //SUCCESS
            console.log(hash);
        else
            console.log(err);
      });    
    }
    console.log(this.props.selectedwallet);
    console.log(rawTransaction);
    console.log(privKey);
    */
  }

  render() {
    return (
      <div className="tokentransferpanel">
        <div className="title" ><span><img onClick={this.back} width="20px" src="../../static/image/icon/back.png" /></span><span style={{marginLeft:"20px"}}>{intl.get('TokenTransfer.SendToken')}</span></div>
        <div className="centerpanel">
          <center>
            <div className="subtitle">{intl.get("TokenTransfer.ReceipientAddress")}</div>
            <div className="panelwrapper borderradiusfull" style={{marginBottom:"10px"}}><Input className="inputTransparent" onChange={this.onChangeReceiver} /><div className="pasteicon"><img onClick={this.pastetoken} src="../../static/image/icon/paste.png" /></div></div>
            <div className="panelwrapper borderradiusfull" style={{marginBottom:"30px"}}><Input className="inputTransparent" onChange={this.onChangeTokenValue} /><div className="currency">RVX</div></div>
            <div><Button className="curvebutton" onClick={this.transfer} >{intl.get('Token.Transfer')}</Button></div>
          </center>
        </div>
      </div>
    );
  }
}

export default TokenTransfer;