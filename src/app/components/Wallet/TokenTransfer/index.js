import React, { Component } from 'react';
import { Input, Radio, Tooltip, Button } from 'antd';
import { observer, inject } from 'mobx-react';
import intl from 'react-intl-universal';
import { createNotification } from 'utils/helper';
import buttonback from 'static/image/icon/back.png';
import buttonpaste from 'static/image/icon/paste.png';
import iWanUtils from '../../../utils/iwanUtils';
const { API_EthGas } = require('../../../../../config/common/index');

var Tx = require('ethereumjs-tx');
var Web3 = require('web3');
//var fs = require('fs');

import './index.less';
import { setDefaultWordlist } from 'bip39';
import Axios from 'axios';

@inject(stores => ({
  selectedwallet : stores.walletStore.selectedwallet,
  selectednetwork : stores.network.selectednetwork,
  CreateEthAddress : (dappwallet) => stores.walletStore.CreateEthAddress(dappwallet),
  wsCreateTrx: (fromwalletpublicaddress,towalletpublicaddress,totaltoken) => stores.walletStore.wsCreateTrx(fromwalletpublicaddress,towalletpublicaddress,totaltoken),
  seedphase: stores.walletStore.seedphase,
  ethaddress: stores.walletStore.ethaddress,
  setCurrent: current => stores.walletStore.setCurrent(current),
  settokentransfervalue: (token,receiver) => stores.walletStore.settokentransfervalue(token,receiver),
  language: stores.languageIntl.language,
  selectedTokenAsset:stores.walletStore.selectedTokenAsset,
  setMFA: status => stores.walletStore.setMFA(status)
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
  }

  onChangeReceiver = e => {
    this.setState({receiver:e.target.value});
  }

  copy = () => {
    console.log("COPY");
  }

  getCurrentGasPrices = async () => {
    let response = await Axios.get(API_EthGas);

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
    this.inputEl1.select();
    document.execCommand('paste');
    console.log(event.clipboardData);//.items[0].getAsString());
  }

  transfer = async () => {
    if(localStorage.getItem('twofasecret')!=null){
      this.props.setMFA(true);
    } else{
      this.props.setMFA(false);
    }
    var isvalidaddr=true;

    var checksumaddr = "";
    
    console.log("Transfer");

    try{
      checksumaddr = Web3.utils.toChecksumAddress(this.state.receiver)
      console.log("Checksum Addr", checksumaddr);
    }catch(e){
      createNotification('error',intl.get('Error.InvalidAddress'));
      return;
    }

    if(!Web3.utils.isAddress(checksumaddr)){ //if(iWanUtils.checkHash(this.state.receiver))
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

  }

  render() {
    return (
      <div className="tokentransferpanel fadeInAnim">
        <div className="title" ><span><img onClick={this.back} width="20px" src={buttonback} /></span><span style={{marginLeft:"20px"}}>{intl.get('TokenTransfer.SendToken')}</span></div>
        <div className="centerpanel">
          <center>
            <div className="subtitle">{intl.get("TokenTransfer.ReceipientAddress")}</div>
            <div className="panelwrapper borderradiusfull" style={{marginBottom:"10px"}}><Input className="inputTransparent" ref={(input) => { this.inputEl1 = input; }} onChange={this.onChangeReceiver} /><img onClick={this.pastetoken} src={buttonpaste} className="pasteicon" /></div>
            <div className="panelwrapper borderradiusfull" style={{marginBottom:"30px"}}><Input className="inputTransparent" onChange={this.onChangeTokenValue} /><div className="currency">{this.props.selectedTokenAsset.AssetCode.toUpperCase()}</div></div>
            <div><Button className="curvebutton" onClick={this.transfer} >{intl.get('Token.Transfer')}</Button></div>
          </center>
        </div>
      </div>
    );
  }
}

export default TokenTransfer;