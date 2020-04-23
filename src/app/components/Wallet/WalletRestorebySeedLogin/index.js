import React, { Component } from 'react';
import { Input, Radio, Tooltip, Button } from 'antd';
import { observer, inject } from 'mobx-react';
import intl from 'react-intl-universal';
import { createNotification } from 'utils/helper';
import buttonback from 'static/image/icon/back.png';
import { createFirstAddr } from '../../../utils/helper';
import {WALLETID,WANPATH} from '../../../utils/support'
var bcrypt = require('bcryptjs');

const { TextArea } = Input;

import './index.less';
import { setDefaultWordlist } from 'bip39';
@inject(stores => ({
  CreateEthAddress : (dappwallet) => stores.walletStore.CreateEthAddress(dappwallet),
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
  addWANAddress: newAddr => stores.wanAddress.addAddress(newAddr),
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
      createNotification('error',intl.get('Error.Passwordlonger'));
    }
    else{ //encrypt here
      var dappwallet = false;
      var wallets = localStorage.getItem("wallets");
      console.log(wallets);
      if(wallets==null || wallets=="[]"){
      dappwallet=true;
      var seed = this.state.seedphase;
      var pass = this.state.password;
      console.log("Seed: "+seed);
      wand.request('phrase_has', null, (err, val) => {
        if(!val){

      const { addWANAddress } = this.props
     
      wand.request('phrase_import', { phrase: seed, pwd:pass }, err => {
        if (err) {
          console.log("failed to import: "+err)
          return;
        }
        wand.request('wallet_unlock', { pwd: pass }, async (err, val) => {
          if (err) {
            console.log("registration failed"+ err);
          } else {
            try {
              let [wanAddrInfo] = await Promise.all([
                createFirstAddr(WALLETID.NATIVE, 'WAN', `${WANPATH}0`, 'Account1')
               // createFirstAddr(WALLETID.NATIVE, 'ETH', `${ETHPATH}0`, 'ETH-Account1')
              ]);
              addWANAddress(wanAddrInfo);
            
             // addETHAddress(ethAddrInfo);
              //addBTCAddress(btcMainAddInfo);
             // this.props.setMnemonicStatus(true);
              //this.props.setAuth(true);
              this.setState({ loading: false });
            } catch (err) {
              console.log('createFirstAddr:', err);
             // this.setState({ loading: false });
             // message.warn(intl.get('Register.createFirstAddr'));
            }
          }
        })
      
      });
    }
      });
    }
    
      bcrypt.hash(this.state.password, 10, (err, hash) => {
      this.props.setPassword(hash);
      localStorage.setItem('password',hash);
      });
      this.props.setSeedPhaseInString(this.state.seedphase,this.state.password);
      this.props.CreateEthAddress(dappwallet);
      this.props.setCurrent("walletcreated");
      this.props.wsLogin();
      this.props.setRequestSignIn(false);
      this.props.setcurrentReg("inputmobile");
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