import React, { Component } from 'react';
import { Input, Radio, Icon, Tooltip, Button } from 'antd';
import { observer, inject } from 'mobx-react';
import intl from 'react-intl-universal';
import buttonback from 'static/image/icon/back.png';
import buttonartboard3 from 'static/image/graphic/security01.jpg';
const speakeasy = require("speakeasy");
const base32 = require('hi-base32');
var bcrypt = require('bcryptjs');
import { createNotification } from 'utils/helper';
import Security from '../../Settings/Security';

import './index.less';
@inject(stores => ({
  setCurrent: current => stores.walletStore.setCurrent(current),
  setWalletEntryNextDirection: val => stores.walletStore.setWalletEntryNextDirection(val),
  language: stores.languageIntl.language,
  googleAuthKey: stores.walletStore.googleAuthKey,
  decrypt: text => stores.walletStore.decrypt(text),
  clearGoogleAuthKey: () => stores.walletStore.clearGoogleAuthKey()
}))

@observer
class TwoFARemove extends Component {
  state = {
    mfa : "",
    password:"",
    googleAuthKey:""
  }

  componentDidMount(){
    this.setState({
      googleAuthKey: this.props.decrypt(localStorage.getItem('twofasecret'))});
  }
  _toHex = (key) =>{
    return new Buffer(key, 'ascii').toString('hex');
  }

  back = () => {
    this.props.setCurrent("settings");
  }
  inputChanged = e => {
    switch(e.target.id){
      case "mfa":
        this.setState({mfa:e.target.value});
        break;
      case "password":
        this.setState({ password: e.target.value });
    }
  }

  remove = () => {
    const secretAscii = base32.decode(this.state.googleAuthKey);
    bcrypt.compare(this.state.password, localStorage.getItem('password'), (err, res) => {
      if(res) {
        const secretHex = this._toHex(secretAscii);
        var authcode = speakeasy.totp({
          secret: secretHex,
          encoding: 'hex',
          window: 1
        });
        if(authcode==this.state.mfa){
          createNotification('success','Successfully removed 2FA');
          this.props.clearGoogleAuthKey();
          this.props.setCurrent("settings");
        }else{
          createNotification('error',intl.get('Error.InvalidOTP'));
          this.setState({mfa:""});

        }
      } else {
        createNotification('error',intl.get('Error.Userwrongpassword'));
        this.setState({password:""});
      } 
    });
  }

  render() {
    return (
      <div className="splashcreatebasicwalletpanel fadeInAnim">
        <div className="title" ><span><img onClick={this.back} width="20px" src={buttonback} /></span><span style={{marginLeft:"20px"}}>{'Remove two factor authentication'}</span></div>
        <div className="centerpanel">
          <center>
          <div style={{marginBottom:"30px"}}><img src={buttonartboard3} width="350px" /></div>
        <div className="inputpanel">
            <div className="panelwrapper borderradiusfull">
              <Input id="mfa" value={this.state.mfa} placeholder={intl.get('Auth.EnterOTP')} className="inputTransparent" onChange={this.inputChanged} />
            </div>
            <div className="panelwrapper borderradiusfull">
                <Input.Password id="password" style={{marginLeft:"-40px",paddingLeft:"0px"}} placeholder={intl.get('Register.Password')} className="inputTransparent" onChange={this.inputChanged} onKeyDown={this.onKeyDown} />
              </div>
          <div className="buttonpanel"><Button className="curvebutton" onClick={this.remove}>{'Remove'}</Button></div>
        </div>
        </center>
      </div>
      </div>
    );
  }
}

export default TwoFARemove;