import React, { Component } from 'react';
import { Input, Radio, Icon, Tooltip, Button } from 'antd';
import { observer, inject } from 'mobx-react';
import intl from 'react-intl-universal';
import './index.less';
import { createNotification } from 'utils/helper';

var Web3 = require('web3');
var QRCode = require('qrcode.react');

@inject(stores => ({
  selectedwalletaddress: stores.setting.selectedwalletaddress,
  wallets : stores.walletStore.walletlist,
  LoadTransactionByAddress : addr => stores.walletStore.LoadTransactionByAddress(addr),
  setCurrent: current => stores.setting.setCurrent(current),
  language: stores.languageIntl.language
}))

@observer
class ExportPrivateKey extends Component {

  state = {
  }

  inputEl1 = null;

  componentDidMount(){
  }
  
  inputChanged = e => {
    this.setState({ mobilevalue : e.target.value }, () => {
      this.props.setMobile(this.state.mobilevalue);
    });
  }

  loadTransaction = () => {
    this.props.LoadTransactionByAddress(this.props.selectedWallet.publicaddress);
  }

  back = () => {
    this.props.setCurrent('managewalletdetail');
  }

  copy = () => {
    this.inputEl1.select();
    document.execCommand('copy');
    createNotification('info',intl.get('Info.CopyDone'));
    console.log("COPY DONE");
  }

  render() {

    const wallet = this.props.wallets.find(x => x.publicaddress == this.props.selectedwalletaddress); 

    return (
      <div className="exportprivatekeypanel fadeInAnim">
        <div className="title" ><span><img onClick={this.back} width="20px" src="../../static/image/icon/back.png" /></span><span style={{marginLeft:"20px"}}>{intl.get('Settings.ExportPrivateKey')}</span></div>
        <div className="centerpanel">
          <center>
            <div className="inputwrapper">
              <div style={{marginBottom:"10px"}} className="subtitle" >{wallet.walletname}</div>
              <QRCode fgColor="#192c57" size="256" value={wallet.privatekey} style={{marginBottom:"30px"}} />
              <div className="panelwrapper borderradiusfull" style={{width:"650px"}}>
                {wallet.privatekey}
                <div className="copyicon"><img src="../../static/image/icon/copy.png" onClick={this.copy} /></div>
              </div>

              <input style={{marginTop:-99999,position:"absolute"}} ref={(input) => { this.inputEl1 = input; }} type="text" value={wallet.privatekey} id="hiddenphase" />
            </div>
          </center>
        </div>
      </div>
    );
  }
}

export default ExportPrivateKey;