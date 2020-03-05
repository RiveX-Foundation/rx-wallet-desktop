import React, { Component } from 'react';
import { Input, Radio, Icon, Tooltip, Button } from 'antd';
import { observer, inject } from 'mobx-react';
import intl from 'react-intl-universal';
import { toJS } from "mobx";

const bip39 = require('bip39');

import './index.less';
import { setDefaultWordlist } from 'bip39';
import buttonback from 'static/image/icon/back.png';

@inject(stores => ({
  seedphase: stores.walletStore.seedphase,
  seedphaseinstring : stores.walletStore.seedphaseinstring,
  mnemonicpassword: stores.walletStore.mnemonicpassword,
  mnemonicpasswordconfirm: stores.walletStore.mnemonicpasswordconfirm,
  generate12SeedPhase : () => stores.walletStore.generate12SeedPhase(),
  setSeedPhase: seedphase => stores.walletStore.setSeedPhase(seedphase),
  setSeedPhaseInString: seedphase => stores.walletStore.setSeedPhaseInString(seedphase),
  setCurrent: current => stores.walletStore.setCurrent(current),
  setcurrentReg: current => stores.userRegistration.setCurrent(current),
  language: stores.languageIntl.language,
  setPendingPassword: password => stores.walletStore.setPendingPassword(password)

}))

@observer
class WalletCreation extends Component {
  state = {
    seedphase : [],
    mnemonic : "",
    seedphaseel : null,
    nextbuttonstyle : {display:"none"},
    mnemonicpassword:"",
    mnemonicpasswordconfirm:""
  }

  inputEl1 = null;
  
  onChange = e => {

  }

  componentDidMount(){
    var seed = this.props.generate12SeedPhase();
    this.generateSeedPhaseList(seed);
  }


  generateSeedPhaseList = seed => {
    let mnemonic = "";
    //if(this.props.seedphaseinstring!=""){
    //  mnemonic = this.props.seedphaseinstring;
    //}else{
      mnemonic = seed;
    //}
    this.setState({mnemonic : mnemonic});
    this.setState({seedphase : mnemonic.split(" ") });


    const seedphase = mnemonic.split(" ");
    //this.props.setSeedPhase(mnemonic.split(" "));
    //this.props.setSeedPhaseInString(mnemonic);
    const seedel = seedphase.map((item, i) =>
    {
      // console.log(item)
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
    // This is just personal preference.
    // I prefer to not show the the whole text area selected.
    //e.target.focus();
    //setCopySuccess('Copied!');
  }

  next = () => {
    let mnemonic = this.state.mnemonic;
    this.props.setPendingPassword(this.state.mnemonicpassword);
    this.props.setSeedPhase(mnemonic.split(" "));
    this.props.setSeedPhaseInString(mnemonic);
    this.props.setCurrent("walletkeyinseed");
    this.props.setcurrentReg("walletkeyinseed");
  }
  inputChanged = e => {
    console.log("switching: "+ e.target.id);
    switch(e.target.id){
      case "password":
        this.setState({ mnemonicpassword: e.target.value },() => {this.validatepassword();});
       // this.props.setPassword(e.target.value);
        break;
      case "confirmpassword":
        console.log("CONFIRMING PASSWORD");
        this.setState({ mnemonicpasswordconfirm: e.target.value },() => {this.validatepassword();});
       // this.props.setPasswordConfirm(e.target.value);
        break;
      }
  }

  onKeyDown = (e) => {
    
  }

  validatepassword = () => {
    console.log("validating password: ");
    console.log(this.state.mnemonicpassword);
    console.log(this.state.mnemonicpasswordconfirm);

    if(this.state.mnemonicpassword == this.state.mnemonicpasswordconfirm){
      this.setState({nextbuttonstyle : {display:"inline-block"}});
    }else if(this.state.mnemonicpassword=="" || this.state.mnemonicpasswordconfirm){
      this.setState({nextbuttonstyle : {display:"none"}});
    }
  }
  back = () => {
    this.props.setcurrentReg("createwalletlogin");
    this.props.setCurrent("backupwallettutorial");
  }

  render() {
    const { seedphaseel } = this.state;
    const { nextbuttonstyle } = this.state;

    return (
      <div className="walletcreationpanel fadeInAnim">
        <div className="title" ><span><img onClick={this.back} width="20px" src={buttonback} /></span><span style={{marginLeft:"20px"}}>{intl.get('Wallet.RecoveryPhrase')}</span></div>
        <div className="centerpanel">
          <center>
            <div style={{width:"600px"}}>
              <div className="hint">{intl.get('Wallet.WriteDownRecoveryPhrase')}</div>
              <ul>{this.state.seedphaseel}</ul>       
              <div><Button className="copybutton" onClick={this.copy} >{intl.get('Backup.copyToClipboard')}</Button></div>
              <div className="hint2" style={{marginTop:"40px"}}>{intl.get('Wallet.NeverShareRecovery')}</div>
              
              <div className="inputpanel">
            <center>
              <div className="panelwrapper borderradiusfull">
                <Input.Password id="password" style={{marginLeft:"-40px",paddingLeft:"0px"}} placeholder={intl.get('Register.Password')} className="inputTransparent" onChange={this.inputChanged} onKeyDown={this.onKeyDown} />
              </div>

              <div className="panelwrapper borderradiusfull">
                <Input.Password id="confirmpassword" style={{marginLeft:"-40px",paddingLeft:"0px"}} placeholder={intl.get('Register.ConfirmPassword')} className="inputTransparent" onChange={this.inputChanged} onKeyDown={this.onKeyDown} />
              </div>
            </center>
          </div>
          <div><Button style={nextbuttonstyle} className="curvebutton"  onClick={this.next} >{intl.get('Wallet.IHaveBackupMySeed')}</Button></div>
              <input onChange={this.onChange} style={{marginTop:-99999,position:"absolute"}} ref={(input) => { this.inputEl1 = input; }} type="text" value={this.state.mnemonic} id="hiddenphase" />
            </div>
          </center>
        </div>
      </div>
    );
  }
}

export default WalletCreation;