import React, { Component } from 'react';
import { Input, Radio, Tooltip, Button } from 'antd';
import { observer, inject } from 'mobx-react';
import intl from 'react-intl-universal';

const { TextArea } = Input;

import './index.less';
import { setDefaultWordlist } from 'bip39';
@inject(stores => ({
  CreateEthAddress : () => stores.walletStore.CreateEthAddress(),
  setCurrent: current => stores.walletStore.setCurrent(current),
  setWalletName: walletname => stores.walletStore.setWalletName(walletname),
  seedphase: stores.walletStore.seedphase,
  ethaddress: stores.walletStore.ethaddress,
  language: stores.languageIntl.language,
  WalletEntryNextDirection: stores.walletStore.WalletEntryNextDirection
}))

@observer
class WalletNameEntry extends Component {
  state = {
  }

  componentDidMount(){
  }

  onChange = e => {
    this.props.setWalletName(e.target.value);
  }

  next = () => {
    switch(this.props.WalletEntryNextDirection){
      case "basicwallet":
          this.props.setCurrent("walletcreation");
          break;
      case "sharedwallet":
          this.props.setCurrent("createsharewallet");
          break;
      case "importwallet":
          this.props.setCurrent("walletrestorebyseed");
          break;
    }
  }

  back = () => {
    this.props.setCurrent("wallettypeselection");
  }

  render() {
    const { seedphaseel } = this.state;
    console.log(this.state.seedphaseel);
    return (
      <div>
        <div><Input onChange={this.onChange} /></div>
        <div className="steps-action">
          <Button type="primary" onClick={this.next} >{intl.get('Register.next')}</Button>
          <Button type="primary" onClick={this.back} >{intl.get('Common.Back')}</Button>
        </div>
      </div>
    );
  }
}

export default WalletNameEntry;