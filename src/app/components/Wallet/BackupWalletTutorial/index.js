import React, { Component } from 'react';
import { Input, Radio, Icon, Tooltip, Button } from 'antd';
import { observer, inject } from 'mobx-react';
import intl from 'react-intl-universal';
import buttonback from 'static/image/icon/back.png';
import buttonartboard3 from 'static/image/graphic/artboard3.png';

import './index.less';
@inject(stores => ({
  setCurrent: current => stores.walletStore.setCurrent(current),
  setWalletEntryNextDirection: val => stores.walletStore.setWalletEntryNextDirection(val),
  language: stores.languageIntl.language
}))

@observer
class BackupWalletTutorial extends Component {
  state = {
    mobilevalue : ""
  }

  back = () => {
    this.props.setCurrent("walletnameentry");
  }

  create = () => {
    this.props.setWalletEntryNextDirection("basicwallet");
    this.props.setCurrent("walletcreation");
  }

  render() {
    return (
      <div className="splashcreatebasicwalletpanel fadeInAnim">
        <div className="title" ><span><img onClick={this.back} width="20px" src={buttonback} /></span><span style={{marginLeft:"20px"}}>{intl.get('Wallet.BackupWallet')}</span></div>
        <div className="centerpanel">
          <div style={{marginBottom:"30px"}}><img src={buttonartboard3} width="350px" /></div>
          <div className="guidelabel">
            <ul>
              <li>{intl.get('BackupTutorial.guide1')}</li>
              <li>{intl.get('BackupTutorial.guide2')}</li>
              <li>{intl.get('BackupTutorial.guide3')}</li>
            </ul>
          </div>
          <div className="buttonpanel"><Button className="curvebutton" onClick={this.create}>{intl.get('Common.GotIt')}</Button></div>
        </div>
      </div>
    );
  }
}

export default BackupWalletTutorial;