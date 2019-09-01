import React, { Component } from 'react';
import { Input, Radio, Icon, Tooltip, Button } from 'antd';
import { observer, inject } from 'mobx-react';
import intl from 'react-intl-universal';

import './index.less';
@inject(stores => ({
  setCurrent: current => stores.walletStore.setCurrent(current),
  setWalletEntryNextDirection: val => stores.walletStore.setWalletEntryNextDirection(val),
  language: stores.languageIntl.language
}))

@observer
class SplashBasicWalletCreation extends Component {
  state = {
    mobilevalue : ""
  }

  back = () => {
    this.props.setCurrent("walletdetail");
  }

  create = () => {
    this.props.setWalletEntryNextDirection("basicwallet");
    this.props.setCurrent("walletnameentry");
  }

  render() {
    return (
      <div className="splashcreatebasicwalletpanel">
        <div className="title" ><span><img onClick={this.back} width="20px" src="../../static/image/icon/back.png" /></span><span style={{marginLeft:"20px"}}>{intl.get('Wallet.CreateBasicWallet')}</span></div>
        <div className="centerpanel">
          <div style={{marginBottom:"30px"}}><img src="../../static/image/graphic/splashcreatbasicwallet.png" /></div>
          <Button className="curvebutton" onClick={this.create}>{intl.get('Wallet.CREATE')}</Button>
          <div className="hint">{intl.get('Wallet.newbasicwallet')}</div>
        </div>
      </div>
    );
  }
}

export default SplashBasicWalletCreation;