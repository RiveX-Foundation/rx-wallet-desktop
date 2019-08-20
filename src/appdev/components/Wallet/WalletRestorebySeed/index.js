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
  setSeedPhaseInString: val => stores.walletStore.setSeedPhaseInString(val),
  seedphase: stores.walletStore.seedphase,
  ethaddress: stores.walletStore.ethaddress,
  language: stores.languageIntl.language
}))

@observer
class WalletRestorebySeed extends Component {
  state = {
    seedphase : ""
  }

  componentDidMount(){
  }

  onChange = e => {
    this.setState({seedphase:e.target.value});// e.target.value.replace(/^\s+|\s+$/g, '').replace(/\s+/g, ' '));
  }

  copy = () => {
    console.log("COPY");
  }

  next = () => {
    this.props.setSeedPhaseInString(this.state.seedphase);
    this.props.CreateEthAddress();
    this.props.setCurrent("walletdetail");
  }

  back = () => {
    this.props.setCurrent("wallettypeselection");
  }

  render() {
    return (
      <div>
        <div><TextArea className="mne-textarea" rows={4} onChange={this.onChange} /></div>
          <div className="steps-action">
            <Button type="primary" onClick={this.next} >{intl.get('Register.next')}</Button>
            <Button type="primary" onClick={this.back} >{intl.get('Common.Back')}</Button>
          </div>
      </div>
    );
  }
}

export default WalletRestorebySeed;