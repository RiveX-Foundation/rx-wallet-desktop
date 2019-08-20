import React, { Component } from 'react';
import { Input, Radio, Icon, Tooltip, Button } from 'antd';
import { observer, inject } from 'mobx-react';
import intl from 'react-intl-universal';
import './index.less';

var Web3 = require('web3');
var QRCode = require('qrcode.react');

@inject(stores => ({
  selectedWallet : stores.walletStore.selectedwallet,
  wallets : stores.walletStore.walletlist,
  LoadTransactionByAddress : addr => stores.walletStore.LoadTransactionByAddress(addr),
  loadWallet: () => stores.walletStore.loadWallet(),
  setCurrent: current => stores.walletStore.setCurrent(current),
  language: stores.languageIntl.language
}))

@observer
class TokenReceive extends Component {

  state = {
  }

  inputEl1 = null;

  componentDidMount(){
    this.loadwallet();
  }
  
  inputChanged = e => {
    this.setState({ mobilevalue : e.target.value }, () => {
      this.props.setMobile(this.state.mobilevalue);
    });
  }

  loadTransaction = () => {
    this.props.LoadTransactionByAddress(this.props.selectedWallet.publicaddress);
  }

  loadwallet = () => {
    this.props.loadWallet();
  }

  back = () => {
    this.props.setCurrent('walletdetail');
  }

  copy = () => {
    this.inputEl1.select();
    document.execCommand('copy');
    console.log("COPY DONE");
  }

  render() {
    return (
      <div>
        <div style={{marginBottom:"100px"}} >{this.props.selectedWallet.walletname}</div>
        <QRCode size="256" value={this.props.selectedWallet.publicaddress} />
        <div style={{marginTop:"100px"}}>{this.props.selectedWallet.publicaddress}</div>
        <Button type="primary" onClick={this.copy}>{intl.get('Backup.copyToClipboard')}</Button>
        <Button type="primary" onClick={this.back} >{intl.get('Common.Back')}</Button>
        <input style={{marginTop:-99999,position:"absolute"}} ref={(input) => { this.inputEl1 = input; }} type="text" value={this.props.selectedWallet.publicaddress} id="hiddenphase" />
      </div>
    );
  }
}

export default TokenReceive;