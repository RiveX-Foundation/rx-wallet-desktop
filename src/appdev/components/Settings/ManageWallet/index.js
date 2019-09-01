import React, { Component } from 'react';
import { Input, Radio, Icon, Tooltip, Button } from 'antd';
import { observer, inject } from 'mobx-react';
import intl from 'react-intl-universal';

const bip39 = require('bip39');

import './index.less';
import { setDefaultWordlist } from 'bip39';
@inject(stores => ({
  setCurrent: current => stores.walletStore.setCurrent(current),
  setselectedimporttype: val => stores.walletStore.setselectedimporttype(val),
  walletlist: stores.walletStores.walletlist,
  language: stores.languageIntl.language
}))

@observer
class ManageWallet extends Component {
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

  selectseedphrase = () => {
    this.props.setCurrent("walletrestorebyseed");
  }

  selectprivatekey = () => {
    this.props.setCurrent("walletrestorebyprivatekey");
  }

  back = () => {
    this.props.setCurrent("walletdetail");
  }

  render() {
    return (
      <div className="wallettypeselectionpanel">
        <div className="title" ><span style={{marginLeft:"20px"}}>{intl.get('Wallet.IMPORTWALLET')}</span></div>
        <div className="centerpanel">
          <center>
            {
              this.props.selectedwalletlist.map((item, i) =>
                {
                  return (
                    <div key={i} className="panelwrapper borderradiusfull spacebetween" onClick={this.selectseedphrase} style={{marginBottom:"10px"}}>
                      <div className="panelleft"><img src="../../static/image/icon/mnemonicphrase.png" /><span>{intl.get('Wallet.Mnemonicphrase')}</span></div>
                      <div className="panelright"><img src="../../static/image/icon/next.png" /></div>
                    </div>

<li key={i} onClick={this.selectWallet} data-publicaddress={item.publicaddress}>
                      <div className='walletname'>{item.walletname}</div>
                      <div className='walletbalance'>{item.rvx_balance} RVX</div>
                    </li> 
                  )
                }
              )
            }

            <div className="panelwrapper borderradiusfull spacebetween" onClick={this.selectprivatekey} style={{marginBottom:"10px"}}>
              <div className="panelleft"><img src="../../static/image/icon/privatekey.png" /><span>{intl.get('Wallet.PrivateKey')}</span></div>
              <div className="panelright"><img src="../../static/image/icon/next.png" /></div>
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

export default ManageWallet;