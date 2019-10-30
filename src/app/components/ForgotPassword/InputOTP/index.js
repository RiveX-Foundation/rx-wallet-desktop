import React, { Component } from 'react';
import { Input, Radio, Icon, Tooltip } from 'antd';
import { observer, inject } from 'mobx-react';
import intl from 'react-intl-universal';

import './index.less';
@inject(stores => ({
  language: stores.languageIntl.language,
  setOTP: otp => stores.userRegistration.setOTP(otp)
}))

@observer
class InputOTP extends Component {
  state = {
    otpvalue1 : "",
    otpvalue2 : "",
    otpvalue3 : "",
    otpvalue4 : "",
    otpvalue5 : ""
  }

  inputEl1 = null;
  inputEl2 = null;
  inputEl3 = null;
  inputEl4 = null;
  inputEl5 = null;
  inputEl6 = null;

  inputChanged = e => {
    switch(e.target.id){
      case "otpvalue1":
        this.setState({ otpvalue1 : e.target.value });
        this.inputEl2.focus();
        break;
      case "otpvalue2":
        this.setState({ otpvalue2 : e.target.value });
        this.inputEl3.focus();
        break;
      case "otpvalue3":
        this.setState({ otpvalue3 : e.target.value });
        this.inputEl4.focus();
        break;
      case "otpvalue4":
        this.setState({ otpvalue4 : e.target.value });
        this.inputEl5.focus();
        break;
      case "otpvalue5":
        this.setState({ otpvalue5 : e.target.value });
        this.inputEl6.focus();
        break;
      case "otpvalue6":
        this.setState({ otpvalue6 : e.target.value }, () => {
          this.setOTPVal()});
        break;
      }
  }

  setOTPVal(){
    this.props.setOTP(this.state.otpvalue1 + this.state.otpvalue2 + this.state.otpvalue3 + this.state.otpvalue4 + this.state.otpvalue5 + this.state.otpvalue6);
  }

  inputConfirm = e => {
    this.props.setconfirmPwd(e.target.value);
  }

  onChange = e => {
  }

  render() {
    return (
      <div className="textc fadeInAnim">
        <h1 className="mneCom-h1">{intl.get('Mnemonic.InputPwd.createAWANWallet')}</h1>
        <div className="mne-input">
          <Input ref={(input) => { this.inputEl1 = input; }} className="inputOTP" id="otpvalue1" onChange={this.inputChanged} />
          <Input ref={(input) => { this.inputEl2 = input; }} className="inputOTP" id="otpvalue2" onChange={this.inputChanged} />
          <Input ref={(input) => { this.inputEl3 = input; }} className="inputOTP" id="otpvalue3" onChange={this.inputChanged} />
          <Input ref={(input) => { this.inputEl4 = input; }} className="inputOTP" id="otpvalue4" onChange={this.inputChanged} />
          <Input ref={(input) => { this.inputEl5 = input; }} className="inputOTP" id="otpvalue5" onChange={this.inputChanged} />
          <Input ref={(input) => { this.inputEl6 = input; }} className="inputOTP" id="otpvalue6" onChange={this.inputChanged} />
        </div>
      </div>
    );
  }
}

export default InputOTP;