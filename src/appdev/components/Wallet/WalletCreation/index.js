import React, { Component } from 'react';
import { Input, Radio, Icon, Tooltip, Button } from 'antd';
import { observer, inject } from 'mobx-react';
import intl from 'react-intl-universal';

const bip39 = require('bip39');

import './index.less';
import { setDefaultWordlist } from 'bip39';
@inject(stores => ({
  seedphase: stores.walletStore.seedphase,
  seedphaseinstring : stores.walletStore.seedphaseinstring,
  setSeedPhase: seedphase => stores.walletStore.setSeedPhase(seedphase),
  setSeedPhaseInString: seedphase => stores.walletStore.setSeedPhaseInString(seedphase),
  setCurrent: current => stores.walletStore.setCurrent(current),
  language: stores.languageIntl.language
}))

@observer
class WalletCreation extends Component {
  state = {
    seedphase : [],
    mnemonic : "",
    seedphaseel : null,
  }

  inputEl1 = null;
  
  componentDidMount(){
    this.generate12SeedPhase();
  }

  inputChanged = e => {
    this.setState({ mobilevalue : e.target.value }, () => {
      this.props.setMobile(this.state.mobilevalue);
    });
  }

  generate12SeedPhase = () => {
    
    
    let mnemonic = "";
    if(this.props.seedphaseinstring!=""){
      mnemonic = this.props.seedphaseinstring;
    }else{
      mnemonic = bip39.generateMnemonic();
    }
    this.setState({mnemonic : mnemonic});
    this.setState({seedphase : mnemonic.split(" ") });


    const seedphase = mnemonic.split(" ");
    this.props.setSeedPhase(mnemonic.split(" "));
    this.props.setSeedPhaseInString(mnemonic);
    const seedel = seedphase.map((item, i) =>
    {
      return (
        <li key={i}>{item}</li>
      )
    }
    );    
    this.setState({ seedphaseel : seedel }); 
  }

  copy = () => {
    this.inputEl1.select();
    document.execCommand('copy');
    console.log("COPY DONE");
    // This is just personal preference.
    // I prefer to not show the the whole text area selected.
    //e.target.focus();
    //setCopySuccess('Copied!');
  }

  next = () => {
    this.props.setCurrent("walletkeyinseed");
  }

  back = () => {
    this.props.setCurrent("walletnameentry");
  }

  render() {
    const { seedphaseel } = this.state;
    console.log(this.state.seedphaseel);
    return (
      <div>
          <ul>{this.state.seedphaseel}</ul>       
          <Button type="primary" onClick={this.copy} >{intl.get('Backup.copyToClipboard')}</Button>     
          <div className="steps-action">
            <Button type="primary" onClick={this.next} >{intl.get('Register.next')}</Button>
            <input style={{marginTop:-99999,position:"absolute"}} ref={(input) => { this.inputEl1 = input; }} type="text" value={this.state.mnemonic} id="hiddenphase" />
            <Button type="primary" onClick={this.back} >{intl.get('Common.Back')}</Button>
          </div>
      </div>
    );
  }
}

export default WalletCreation;