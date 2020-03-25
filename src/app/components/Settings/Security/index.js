import React, { Component } from 'react';
import { Input, InputNumber, Tooltip, Button, Radio, Icon } from 'antd';
import { observer, inject } from 'mobx-react';
import intl from 'react-intl-universal';
import { createNotification } from 'utils/helper';
import unlock from 'static/image/graphic/lockunlock01.png';
import lock from 'static/image/graphic/lockunlock02.png';
const { currency } = require('../../../../../config/common/currency');
const { TextArea } = Input;
var QRCode = require('qrcode.react');

import './index.less';
import { setDefaultWordlist } from 'bip39';
@inject(stores => ({
  mobile : stores.userRegistration.mobile,
  update2FA : info => stores.setting.update2FA(info),
  language: stores.languageIntl.language,
  twoFAType: stores.userRegistration.twoFAType,
  twoFAPassword: stores.userRegistration.twoFAPassword,
  setPassword: password => stores.walletStore.setPassword(password),
  twoFAPassword: stores.userRegistration.twoFAPassword,
  googleAuthKey: stores.walletStore.googleAuthKey,
  setCurrent: current => stores.walletStore.setCurrent(current)
}))

@observer
class Security extends Component {

  inputEl1 = null;

  state = {
    value : "password",
    password : "",
    googleAuthKey:""
  }

  componentDidMount(){
    console.log(this.props.twoFAType);
    this.setState({
      value : this.props.twoFAType,
      password : this.props.twoFAPassword,
      googleAuthKey: localStorage.getItem('twofasecret')
    });
    console.log(this.state.googleAuthKey);
  }

  start2fa = () => {
    this.props.setCurrent('twofawarning');
  }

  disable2fa = () => {
    this.props.setCurrent('twofaremove');
  }

  onChange = e => {
    this.setState({value:e.target.value});
  }

  passwordChanged = e => {
    this.setState({password:e.target.value});
  }

  save = () => {
    if(this.state.value == "password" && this.state.password == "") {
      createNotification('error',intl.get('Error.Passwordisempty'));
      return;
    } else if(this.state.value == "password" && this.state.password!=""){
      this.props.setPassword(this.state.password);
      
    }

    var info = {
      twoFAType : this.state.value,
      password : this.state.password
    }
    
   // this.props.update2FA(info);
  }

  render() {
    var totpurl = "otpauth://totp/RVXWallet?secret=" + this.state.googleAuthKey;
    var smstext = intl.get('Settings.2FASecurity.SMS');
    var smsdisabled = false;
    if(this.props.mobile == "") {  smsdisabled=true; }

    return (
      <div className="currencypanel fadeInAnim">
       {/* <div className="title" ><span>{intl.get('Settings.2FASecurity')}</span></div>*/}
        <div className="centerpanel" style={{marginTop:"-50px"}}>
          <div className="inputpanel">
            <Radio.Group onChange={this.onChange} value={this.state.value}>
             {/* <div>
                <Radio value="password">
                  {intl.get('Settings.2FASecurity.SecurityCode')}
                </Radio>
                <br/><br/>
                <div className="panelwrapper borderradiusfull">
                  <Input.Password
                    id="name" 
                    value={this.state.password} 
                    placeholder={this.state.password} 
                    className="inputTransparent" 
                    onChange={this.passwordChanged} />
                </div> 
                <div><Button className="curvebutton" onClick={this.save} >{intl.get('Common.Save')}</Button></div>   
                <br/>          
             </div>*/}
              {
                !smsdisabled && 
                <div>
                  <Radio value="sms">{smstext}</Radio>
                  <br/><br/><br/>
                </div>
              }
              <div>
              {
              this.state.googleAuthKey == "" || this.state.googleAuthKey==null &&
              <React.Fragment>
              <div className="title" style={{marginTop:"30px",paddingLeft:"0px"}}><span className="lock">{intl.get('Settings.2FASecurity.Disabled')}</span></div>
              <img src={unlock} style={{width:"150px"}} />
             <Button className="curvebutton" onClick={this.start2fa} >{intl.get('Settings.2FASecurity.Enable')}</Button>
              </React.Fragment>                
            }
               {
              this.state.googleAuthKey !=null  &&
              <React.Fragment>
                <div className="title" style={{marginTop:"30px",paddingLeft:"0px"}}><span className="lock">{intl.get('Settings.2FASecurity.Enabled')}</span></div>
                <img src={lock} style={{width:"150px"}} />
                <div><Button className="curvebutton" onClick={this.disable2fa} >{intl.get('Settings.2FASecurity.Disable')}</Button></div>
              </React.Fragment>                
            } 
                <br/><br/>
              </div>
            </Radio.Group>
          </div>
        </div>
      </div>
    );
  }
}

export default Security;