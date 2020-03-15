import React, { Component } from 'react';
import { Input, Radio, Tooltip, Button } from 'antd';
import { observer, inject } from 'mobx-react';
import intl from 'react-intl-universal';
import { createNotification } from 'utils/helper';
import buttonback from 'static/image/icon/back.png';
var bcrypt = require('bcryptjs');

const { TextArea } = Input;

import './index.less';
import { setDefaultWordlist } from 'bip39';
@inject(stores => ({
  CreateEthAddress : () => stores.walletStore.CreateEthAddress(),
  setCurrent: current => stores.walletStore.setCurrent(current),
  setWalletName: walletname => stores.walletStore.setWalletName(walletname),
  setSeedPhaseInString: (val,pass) => stores.walletStore.setSeedPhaseInString(val,pass),
  setPassword: password => stores.walletStore.setPassword(password),
  setRequestSignIn : val => stores.session.setRequestSignIn(val),
  setRequestForgotPassword : val => stores.session.setRequestForgotPassword(val),
  setcurrentReg: current => stores.userRegistration.setCurrent(current),
  seedphase: stores.walletStore.seedphase,
  ethaddress: stores.walletStore.ethaddress,
  language: stores.languageIntl.language,
  wsLogin : () => stores.userRegistration.wsLogin(),
}))

@observer
class WalletRestorebySeedLogin extends Component {
  state = {
    seedphase : "",
    walletname : "",
    password :""
  }

  componentDidMount(){
  }

  onChange = e => {
    this.setState({seedphase:e.target.value});// e.target.value.replace(/^\s+|\s+$/g, '').replace(/\s+/g, ' ')); 
  }

  copy = () => {
    console.log("COPY");
  }

  WalletNameOnChange = e => {
    this.setState({walletname:e.target.value}, () => {
      this.props.setWalletName(this.state.walletname);
    })
    
  }

  PasswordOnChange = e => {
    this.setState({password:e.target.value});
    
  }
  backToLogin = () => {
    console.log("back to login");
    this.props.setcurrentReg("inputmobile");
    this.props.setRequestSignIn(false);
    this.props.setRequestForgotPassword(false);
  }

  next = () => {

    //console.log(document.execCommand('paste'));
    //return;

    if(this.state.walletname == ""){
      createNotification('error',intl.get('Error.Walletnameisempty'));
      return;
    }

    if(this.state.seedphase == ""){
      createNotification('error',intl.get('Error.Mnemonicphraseisempty'));
      return;
    }

    if(this.state.seedphase.split(' ').length == 12 || this.state.seedphase.split(' ').length == 24){
    }else{
      createNotification('error',intl.get('Error.InvalidMnemonicphrase'));
      return;
    }
    console.log("log in");
    if(localStorage.getItem('password')!=null){
      //createNotification('error','Password already exists, not saving.');
    }
    if(this.state.password=="" || this.state.password.length < 6){
      createNotification('error','Password must not be empty and shorter than 6 characters');
    }
    else{ //encrypt here
      bcrypt.hash(this.state.password, 10, (err, hash) => {
      this.props.setPassword(hash);
      localStorage.setItem('password',hash);
      });
      this.props.setSeedPhaseInString(this.state.seedphase,this.state.password);
      this.props.CreateEthAddress();
      this.props.setCurrent("walletcreated");
      this.props.wsLogin();
      this.props.setRequestSignIn(false);
    }
    
  }

  back = () => {
    this.props.setCurrent("wallettypeselection");
  }

  render() {
    return (
      <div className="walletkeyinseedpanel fadeInAnim">
        <div className="title" ><span><img onClick={this.backToLogin} width="20px" src={buttonback} /></span><span style={{marginLeft:"20px"}}>{intl.get('Wallet.RESTOREMNEMONICPHRASE')}</span></div>
        <div className="centerpanel">
          <center>
            <div className="inputwrapper">
              <div className="subtitle">{intl.get('Wallet.walletname')}</div>
              <div className="panelwrapper borderradiusfull" style={{width:"150px"}}>
                <input className="inputTransparent" onChange={this.WalletNameOnChange} />
              </div>

              <div className="subtitle">{intl.get('Wallet.Mnemonicphrase')}</div>
              <div className="panelwrapper borderradiusfull" style={{width:"600px"}}>
                <input className="inputTransparent" onChange={this.onChange} />
              </div>

              <div className="subtitle">{intl.get('Wallet.InputPassword')}</div>
              <div className="panelwrapper borderradiusfull" style={{width:"150px"}}>
              <Input id="password" type="password" className="inputTransparent" value={this.state.password} onChange={this.PasswordOnChange} />
              </div>

              <Button className="curvebutton" onClick={this.next} >{intl.get('Settings.Restore')}</Button>
            </div>
          </center>
        </div>
      </div>
    );
  }
}

export default WalletRestorebySeedLogin;