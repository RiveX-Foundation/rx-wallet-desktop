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
class Dex extends Component {
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
        <iframe frameBorder="0" width="100%" height="100%" src="http://167.99.77.158:3000/" ></iframe>
      </div>
    );
  }
}

export default Dex;