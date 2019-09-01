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
  generate12SeedPhase : () => stores.walletStore.generate12SeedPhase(),
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
    var seed = this.props.generate12SeedPhase();
    this.generateSeedPhaseList(seed);
  }

  inputChanged = e => {
    this.setState({ mobilevalue : e.target.value }, () => {
      this.props.setMobile(this.state.mobilevalue);
    });
  }

  generateSeedPhaseList = seed => {
    
    
    let mnemonic = "";
    if(this.props.seedphaseinstring!=""){
      mnemonic = this.props.seedphaseinstring;
    }else{
      mnemonic = seed;
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
    this.props.setCurrent("backupwalletutorial");
  }

  render() {
    const { seedphaseel } = this.state;
    console.log(this.state.seedphaseel);
    return (
      <div className="walletcreationpanel">
        <div className="title" ><span><img onClick={this.back} width="20px" src="../../static/image/icon/back.png" /></span><span style={{marginLeft:"20px"}}>{intl.get('Wallet.RecoveryPhrase')}</span></div>
        <div className="centerpanel">
          <center>
            <div style={{width:"600px"}}>
              <div className="hint">{intl.get('Wallet.WriteDownRecoveryPhrase')}</div>
              <ul>{this.state.seedphaseel}</ul>       
              <div><Button className="copybutton" onClick={this.copy} >{intl.get('Backup.copyToClipboard')}</Button></div>
              <div className="hint2" style={{marginTop:"40px"}}>{intl.get('Wallet.NeverShareRecovery')}</div>
              <div><Button className="curvebutton"  onClick={this.next} >{intl.get('Wallet.IHaveBackupMySeed')}</Button></div>

              <input style={{marginTop:-99999,position:"absolute"}} ref={(input) => { this.inputEl1 = input; }} type="text" value={this.state.mnemonic} id="hiddenphase" />
            </div>
          </center>
        </div>
      </div>
    );
  }
}

export default WalletCreation;