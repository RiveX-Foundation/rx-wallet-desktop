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
  otptransfertoken: stores.walletStore.otptransfertoken,
  setotptransfertoken: () => stores.walletStore.setotptransfertoken(),
  setsuccessulhash: (val) => stores.walletStore.setsuccessulhash(val),
  ethaddress: stores.walletStore.ethaddress,
  setCurrent: current => stores.walletStore.setCurrent(current),
  wsRequestTransferOTP: () => stores.walletStore.wsRequestTransferOTP(),
  tokentransferreceiver: stores.walletStore.tokentransferreceiver,
  tokentransfertoken: stores.walletStore.tokentransfertoken,
  language: stores.languageIntl.language
}))

@observer
class TokenTransferConfirmation extends Component {
  state = {
    tokenval : 0,
    receiver : "",
    otp: "notvalid"
  }

  componentDidMount(){
    this.props.setotptransfertoken("");
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

  requestotp = () => {
    this.props.wsRequestTransferOTP();
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
    this.props.setCurrent("tokentransfer");
  }

  OTPChange = e => {
    this.setState({otp:e.target.value});
  }

  pastetoken = event => {
    console.log(event.clipboardData);//.items[0].getAsString());
  }

  transfer = async () => {

    if(this.props.otptransfertoken == "" || this.state.otp != this.props.otptransfertoken){
      createNotification("error",intl.get('Error.InvalidOTP'));
      return;
    }

    const web3 = new Web3(web3Provider);

    //wallettype
    if(this.props.selectedwallet.wallettype == "sharedwallet"){ //PROPOSE TO CLOUD
      this.props.wsCreateTrx(this.props.selectedwallet.publicaddress,this.props.tokentransferreceiver,this.props.tokentransfertoken);
    }else{ //DIRECT EXECUTE TRX
      createNotification('info',intl.get('Info.Waiting'));

      var abiArray = JSON.parse(fs.readFileSync(__dirname + '/containers/Config/tokenabi.json', 'utf-8'));
      var count = await web3.eth.getTransactionCount(this.props.selectedwallet.publicaddress);
      var gasPrices = await this.getCurrentGasPrices();
      console.log(gasPrices);
      //var contractdata = new web3.eth.Contract(abiArray, tokencontract, {from: this.props.selectedwallet.publicaddress}); //).at(this.tokencontract);
      var contractdata = new web3.eth.Contract(abiArray, tokencontract);//, {from: this.props.selectedwallet.publicaddress}); //).at(this.tokencontract);
      var rawTransaction = {};
      try{
        rawTransaction = {
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
          if (!err) { //SUCCESS
            console.log(hash);
            this.props.setsuccessulhash(hash);
            this.props.setCurrent("tokentransfersuccessful");
          }else{
            //createNotification('error',e);
            createNotification('error',intl.get('Error.TransactionFailed'));
            console.log(err);
          }
        });    
      }catch(e){
        createNotification('error',intl.get('Error.TransactionFailed'));
        console.log("ERR",e);
      }
    }

  //console.log(this.props.selectedwallet);
  //console.log(rawTransaction);
  //console.log(privKey);
    
    /*
    
    
    */
  }

  render() {
    return (
      <div className="tokentransferconfirmationpanel fadeInAnim">
        <div className="title" ><span><img onClick={this.back} width="20px" src="../../static/image/icon/back.png" /></span><span style={{marginLeft:"20px"}}>{intl.get('TokenTransfer.Confirmation')}</span></div>
        <div className="centerpanel">
          <center>
            <div className="subtitle">{this.props.selectedwallet.walletname}</div>
            <div className="panelwrapper borderradiusfull spacebetween" style={{marginBottom:"10px"}}>
              <div className="panellabel">{intl.get('TokenTransferConfirmation.From')}</div>
              <div className="panelvalue">{this.props.selectedwallet.publicaddress}</div>
            </div>
            <div className="panelwrapper borderradiusfull" style={{marginBottom:"10px"}}>
              <div className="spacebetween">
                <div className="panellabel">{intl.get('TokenTransferConfirmation.To')}</div><div className="panelvalue">{this.props.tokentransferreceiver}</div>
              </div>
              <div className="spacebetween" style={{marginTop:"10px"}}>
                <div className="panellabel">{intl.get('TokenTransferConfirmation.Amount')}</div><div className="panelvalue">{this.props.tokentransfertoken} RVX</div>
              </div>
            </div>
            <div className="width600 spacebetween" style={{marginBottom:"30px"}}>
              <div className="panelwrapper borderradiusfull spacebetween" style={{width:"440px",paddingTop:"5px",paddingBottom:"5px"}}>
                <div className="panellabel" style={{paddingLeft:"0px"}}><Input className="inputTransparent otpinputclass" onChange={this.OTPChange} placeholder={intl.get('Auth.EnterOTP')} /></div>
              </div>
              <div className="panelvalue" style={{paddingRight:"0px"}}><Button className="radiusbutton" onClick={this.requestotp} >{intl.get('Auth.RequestOTP')}</Button></div>
            </div>

            <div><Button className="curvebutton" onClick={this.transfer} >{intl.get('Wallet.Confirm')}</Button></div>
          </center>
        </div>
      </div>
    );
  }
}

export default TokenTransferConfirmation;