import React, { Component } from 'react';
import { Input, Radio, Icon, Tooltip, Button } from 'antd';
import { observer, inject } from 'mobx-react';
import intl from 'react-intl-universal';

import './index.less';
@inject(stores => ({
  setCurrent: current => stores.walletStore.setCurrent(current),
  language: stores.languageIntl.language
}))

@observer
class WalletCreated extends Component {
  state = {
    mobilevalue : ""
  }

  inputChanged = e => {
    this.setState({ mobilevalue : e.target.value }, () => {
      this.props.setMobile(this.state.mobilevalue);
    });
  }

  back = () => {
    this.props.setCurrent("walletlisting");
  }

  render() {
    return (
      <div>
        <div>Wallet Created!</div>
        <Button type="primary" onClick={this.back}>{intl.get('Common.Back')}</Button>
      </div>
    );
  }
}

export default WalletCreated;