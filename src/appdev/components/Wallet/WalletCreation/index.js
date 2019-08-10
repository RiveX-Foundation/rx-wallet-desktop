import React, { Component } from 'react';
import { Input, Radio, Icon, Tooltip, Button } from 'antd';
import { observer, inject } from 'mobx-react';
import intl from 'react-intl-universal';

const bip39 = require('bip39');

import './index.less';
import { setDefaultWordlist } from 'bip39';
@inject(stores => ({
  setSeedPhase: seedphase => stores.walletStore.setSeedPhase(seedphase),
  setSeedPhaseInString: seedphase => stores.walletStore.setSeedPhaseInString(seedphase),
  language: stores.languageIntl.language
}))

@observer
class WalletCreation extends Component {
  state = {
    seedphase : [],
    seedphaseel : null
  }

  componentDidMount(){
    this.generate12SeedPhase();
  }

  inputChanged = e => {
    this.setState({ mobilevalue : e.target.value }, () => {
      this.props.setMobile(this.state.mobilevalue);
    });
  }

  generate12SeedPhase = () => {
    const mnemonic = bip39.generateMnemonic();
    this.state.seedphase = mnemonic.split(" ");
    this.props.setSeedPhase(mnemonic.split(" "));
    this.props.setSeedPhaseInString(mnemonic);
    console.log(this.state.seedphase);
    const seedel = this.state.seedphase.map((item, i) =>
    {
      return (
        <li key={i}>{item}</li>
      )
    }
    );    
    this.setState({ seedphaseel : seedel }); 
  }

  copy = () => {
    console.log("COPY");
  }

  render() {
    const { seedphaseel } = this.state;
    console.log(this.state.seedphaseel);
    return (
      <div>
          <ul>{this.state.seedphaseel}</ul>       
          <Button type="primary" onClick={this.copy} >Copy{intl.get('Register.Copy')}</Button>           
      </div>
    );
  }
}

export default WalletCreation;