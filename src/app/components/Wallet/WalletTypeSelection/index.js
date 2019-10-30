import React, { Component } from 'react';
import { Input, Radio, Icon, Tooltip, Button } from 'antd';
import { observer, inject } from 'mobx-react';
import intl from 'react-intl-universal';
import buttoncreatesharedwallet from 'static/image/icon/createsharedwallet.png';
import buttonnext from 'static/image/icon/next.png';
import buttonjoinsharedwallet from 'static/image/icon/joinsharedwallet.png';
import buttonback from 'static/image/icon/back.png';
const bip39 = require('bip39');

import './index.less';
import { setDefaultWordlist } from 'bip39';
@inject(stores => ({
  seedphase: stores.walletStore.seedphase,
  seedphaseinstring : stores.walletStore.seedphaseinstring,
  setSeedPhase: seedphase => stores.walletStore.setSeedPhase(seedphase),
  setSeedPhaseInString: seedphase => stores.walletStore.setSeedPhaseInString(seedphase),
  setCurrent: current => stores.walletStore.setCurrent(current),
  setTotalSignatures: totalsignatures => stores.walletStore.setTotalSignatures(totalsignatures),
  setTotalOwners: totalowners => stores.walletStore.setTotalOwners(totalowners),
  setWalletType: wallettype => stores.walletStore.setWalletType(wallettype),
  setWalletEntryNextDirection: val => stores.walletStore.setWalletEntryNextDirection(val),
  language: stores.languageIntl.language
}))

@observer
class WalletTypeSelection extends Component {
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

  joinwallet = () => {
    this.props.setWalletEntryNextDirection("joinwallet");
    this.props.setCurrent("joinsharewallet");
    //this.props.setWalletType("sharedwallet");
  }

  importwallet = () => {
    //this.props.setTotalSignatures(0);
    //this.props.setTotalOwners(0);
    //this.props.setWalletEntryNextDirection("importwallet");
    //this.props.setCurrent("walletnameentry");
    //this.props.setWalletType("basicwallet");
  }

  trezor = () => {
  }

  ledger = () => {
  }

  back = () => {
    // this.props.setCurrent("walletlisting");
    this.props.setCurrent("selectedwallet");
  }

  render() {
    return (
      <div className="wallettypeselectionpanel fadeInAnim">
        {/* <div className="title" ><span style={{marginLeft:"20px"}}>{intl.get('Wallet.SHAREDWALLET')}</span></div> */}
        <div className="title" ><span><img onClick={this.back} width="20px" src={buttonback} /></span><span style={{marginLeft:"20px"}}>{intl.get('Wallet.SHAREDWALLET')}</span></div>
        <div className="centerpanel">
          <center>
            <div className="panelwrapper borderradiusfull spacebetween" onClick={this.sharedwallet} style={{marginBottom:"10px"}}>
              <div className="panelleft"><img src={buttoncreatesharedwallet} /><span>{intl.get('Wallet.CreateSharedWallet')}</span></div>
              <div className="panelright"><img src={buttonnext} /></div>
            </div>
            <div className="panelwrapper borderradiusfull spacebetween" onClick={this.joinwallet} style={{marginBottom:"10px"}}>
              <div className="panelleft"><img src={buttonjoinsharedwallet} /><span>{intl.get('Wallet.JoinSharedWallet')}</span></div>
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

export default WalletTypeSelection;