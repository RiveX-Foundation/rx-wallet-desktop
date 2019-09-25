import React, { Component } from 'react';
import { Input, Radio, Icon, Tooltip, Button } from 'antd';
import { observer, inject } from 'mobx-react';
import intl from 'react-intl-universal';
import buttonledger from 'static/image/icon/ledger.png';
import buttonnext from 'static/image/icon/next.png';
import buttontrezor from 'static/image/icon/trezor.png';

const bip39 = require('bip39');

import './index.less';
import { setDefaultWordlist } from 'bip39';

const WAN_PATH = "m/44'/5718350'/0'";
const WALLET_ID = 0x02;
const CHAIN_TYPE = 'WAN';
const LEDGER = 'ledger';

@inject(stores => ({
  setCurrent: current => stores.walletStore.setCurrent(current),
  setselectedimporttype: val => stores.walletStore.setselectedimporttype(val),
  language: stores.languageIntl.language
}))

@observer
class HWWalletSelection extends Component {
  state = {
    seedphase : [],
    mnemonic : "",
    seedphaseel : null,
  }

  inputEl1 = null;
  
  componentDidMount(){
  }

  inputChanged = e => {
    this.setState({ mobilevalue : e.target.value }, () => {
      this.props.setMobile(this.state.mobilevalue);
    });
  }

  basicwallet = () => {
    //this.props.setTotalSignatures(0);
    //this.props.setTotalOwners(0);
    //this.props.setWalletEntryNextDirection("basicwallet");
    //this.props.setCurrent("walletnameentry");
    //this.props.setWalletType("basicwallet");
  }

  sharedwallet = () => {
    this.props.setWalletEntryNextDirection("sharedwallet");
    this.props.setCurrent("createsharewallet");
    //this.props.setCurrent("walletnameentry");
    //this.props.setWalletType("sharedwallet");
  }

  trezor = () => {
    //this.props.setWalletEntryNextDirection("joinwallet");
    //this.props.setCurrent("joinsharewallet");
    //this.props.setWalletType("sharedwallet");
  }

  ledger = () => {
    //this.props.setWalletType("ledger");
    //this.props.setCurrent("walletrestorebyseed");
    //this.props.setTotalSignatures(0);
    //this.props.setTotalOwners(0);
    //this.props.setWalletEntryNextDirection("importwallet");
    //this.props.setCurrent("walletnameentry");
    //this.props.setWalletType("basicwallet");
  }

  selectledger = callback => {
    console.log("connect to ledger")
    wand.request('wallet_connectToLedger', {}, (err, val) => {
      if (err) {
        console.log("HAHAHA");
        callback(err, val);
      } else {
        console.log("HEHEHE");
        this.getPublicKey(callback);
      }
    });
    
    //this.props.setCurrent("walletrestorebyseed");
  }

  getPublicKey = callback => {
    console.log("GET PUBLIC KEY");
    console.log(WALLET_ID);
    console.log(WAN_PATH);
    wand.request('wallet_getPubKeyChainId', {
      walletID: WALLET_ID,
      path: WAN_PATH
    }, (err, val) => {
      this.getPublicKeyDone(err, val);
    });
  }

  getPublicKeyDone = (err, result) => {
    if (err) {
      message.warn(intl.get('HwWallet.Connect.connectFailed'));
    } else {
      console.log(result);
      //this.publicKey = result.publicKey;
      //this.chainCode = result.chainCode;
      //this.deriveAddresses(this.page * this.pageSize, this.pageSize, true);
    }
  }

  selecttrezor = () => {
    //this.props.setCurrent("walletrestorebyprivatekey");
  }

  back = () => {
    this.props.setCurrent("walletdetail");
  }

  render() {
    return (
      <div className="wallettypeselectionpanel fadeInAnim">
        <div className="title" ><span style={{marginLeft:"20px"}}>{intl.get('HWWallet.ConnectHWWallet')}</span></div>
        <div className="centerpanel">
          <center>
            <div className="panelwrapper borderradiusfull spacebetween" onClick={this.selectledger} style={{marginBottom:"10px"}}>
              <div className="panelleft"><img src={buttonledger} /><span>{intl.get('HWWallet.Ledger')}</span></div>
              <div className="panelright"><img src={buttonnext} /></div>
            </div>
            <div className="panelwrapper borderradiusfull spacebetween" onClick={this.selecttrezor} style={{marginBottom:"10px"}}>
              <div className="panelleft"><img src={buttontrezor} /><span>{intl.get('HWWallet.Trezor')}</span></div>
              <div className="panelright"><img src={buttonnext} /></div>
            </div>
          </center>
        </div>

        {
          /*
          <div>
          <Button type="primary" onClick={this.basicwallet} >{intl.get('Wallet.BasicWallet')}</Button>     
          <Button type="primary" onClick={this.sharedwallet} >{intl.get('Wallet.SharedWallet')}</Button>     
          <Button type="primary" onClick={this.joinwallet} >{intl.get('Wallet.JoinWallet')}</Button>     
          <Button type="primary" onClick={this.importwallet} >{intl.get('Wallet.ImportWallet')}</Button>     
          <Button type="primary" onClick={this.trezor} >{intl.get('Wallet.Trezor')}</Button>
          <Button type="primary" onClick={this.ledger} >{intl.get('Wallet.Ledger')}</Button>

          <div className="steps-action">
            <Button type="primary" onClick={this.back} >{intl.get('Common.Back')}</Button>
          </div>
        </div>
        */
        }
      </div>
    );
  }
}

export default HWWalletSelection;