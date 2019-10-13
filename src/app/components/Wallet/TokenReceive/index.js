import React, { Component } from 'react';
import { Input, Radio, Icon, Tooltip, Button } from 'antd';
import { observer, inject } from 'mobx-react';
import intl from 'react-intl-universal';
import './index.less';
import { createNotification } from 'utils/helper';
import buttonback from 'static/image/icon/back.png';
import buttoncopy from 'static/image/icon/copy.png';

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
    // this.loadwallet();
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
    createNotification('info',intl.get('Info.CopyDone'));
    console.log("COPY DONE");
  }

  render() {
    return (
      <div className="tokenreceivepanel fadeInAnim">
        <div className="title" ><span><img onClick={this.back} width="20px" src={buttonback} /></span><span style={{marginLeft:"20px"}}>{intl.get('Token.ReceiveToken')}</span></div>
        <div className="centerpanel">
          <center>
            <div className="inputwrapper">
              <div style={{marginBottom:"10px"}} className="subtitle" >{this.props.selectedWallet.walletname}</div>
              <div className="qrcodectn">
                <div className="inner">
                  <QRCode fgColor="#4954AE" size={180} value={this.props.selectedWallet.publicaddress} />
                </div>
              </div>
              <div className="panelwrapper borderradiusfull">
                <div>{this.props.selectedWallet.publicaddress}</div>
                <img src={buttoncopy} onClick={this.copy} className="copyicon" />
              </div>

              <input style={{marginTop:-99999,position:"absolute"}} ref={(input) => { this.inputEl1 = input; }} type="text" value={this.props.selectedWallet.publicaddress} id="hiddenphase" />
            </div>
          </center>
        </div>
      </div>
    );
  }
}

export default TokenReceive;