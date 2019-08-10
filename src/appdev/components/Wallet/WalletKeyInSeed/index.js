import React, { Component } from 'react';
import { Input, Radio, Tooltip, Button } from 'antd';
import { observer, inject } from 'mobx-react';
import intl from 'react-intl-universal';

const { TextArea } = Input;

import './index.less';
import { setDefaultWordlist } from 'bip39';
@inject(stores => ({
  CreateEthAddress : () => stores.walletStore.CreateEthAddress(),
  seedphase: stores.walletStore.seedphase,
  ethaddress: stores.walletStore.ethaddress,
  language: stores.languageIntl.language
}))

@observer
class WalletKeyInSeed extends Component {
  state = {
    seedphaseel : null
  }

  componentDidMount(){
    this.get12SeedPhase();
  }

  inputChanged = e => {
    this.setState({ mobilevalue : e.target.value }, () => {
      this.props.setMobile(this.state.mobilevalue);
    });
  }

  get12SeedPhase = () => {
    const seedel = this.props.seedphase.map((item, i) =>
    {
      return (
        <li key={i}>{item}</li>
      )
    }
    );    
  }

  onChange = e => {
    //this.props.setMnemonic(e.target.value.replace(/^\s+|\s+$/g, '').replace(/\s+/g, ' '));
  }

  copy = () => {
    console.log("COPY");
  }

  next = () => {
  }

  render() {
    const { seedphaseel } = this.state;
    console.log(this.state.seedphaseel);
    return (
      <div>
        <div><TextArea className="mne-textarea" rows={4} onChange={this.onChange} /></div>
          <ul>{this.state.seedphaseel}</ul>       
          <Button type="primary" onClick={this.copy} >Copy{intl.get('Register.Next')}</Button>           
      </div>
    );
  }
}

export default WalletKeyInSeed;