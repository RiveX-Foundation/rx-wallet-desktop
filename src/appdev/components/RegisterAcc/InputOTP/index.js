import React, { Component } from 'react';
import { Input, Button, Radio, Icon, Tooltip } from 'antd';
import { observer, inject } from 'mobx-react';
import intl from 'react-intl-universal';
import {NotificationContainer, NotificationManager} from 'react-notifications';

import './index.less';
@inject(stores => ({
  language: stores.languageIntl.language,
  setCurrent: current => stores.userRegistration.setCurrent(current),
  wsOTPVerification : type => stores.userRegistration.wsOTPVerification(type),
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

  next = () => {
    this.props.wsOTPVerification('registration');
  }

  back = () => {
    this.props.setCurrent('inputmobile');
  }

  onChange = e => {
  }

  render() {
    return (
      <div>
        <div className="otpinputleftpanel" onClick={this.panelClick}>
          <div className="steppanel">
            <div className="backbutton"><img onClick={this.back} width="20px" src="../../static/image/icon/back.png" /></div>
            <div className="circlewrapper"><div className="innerCircle"></div></div>
            <div className="line"></div>
            <div className="circlewrapper"><div className="outterCircle"><div className="innerCircle"></div></div></div>
            <div className="line"></div>
            <div className="circlewrapper"><div className="innerCircle"></div></div>
          </div>

          <img width="130px" src="../../static/image/graphic/logo.png" />
          <div className="title">{intl.get('Register.CreateAccount')}</div>
          <div className="subtitle">{intl.get('Register.KeyInOTP')}</div>
          <div className="inputwrapper">
            <Input ref={(input) => { this.inputEl1 = input; }} className="inputOTP" id="otpvalue1" onChange={this.inputChanged} />
            <Input ref={(input) => { this.inputEl2 = input; }} className="inputOTP" id="otpvalue2" onChange={this.inputChanged} />
            <Input ref={(input) => { this.inputEl3 = input; }} className="inputOTP" id="otpvalue3" onChange={this.inputChanged} />
            <Input ref={(input) => { this.inputEl4 = input; }} className="inputOTP" id="otpvalue4" onChange={this.inputChanged} />
            <Input ref={(input) => { this.inputEl5 = input; }} className="inputOTP" id="otpvalue5" onChange={this.inputChanged} />
            <Input ref={(input) => { this.inputEl6 = input; }} className="inputOTP" id="otpvalue6" onChange={this.inputChanged} />
          </div>
          <div className="buttonpanel"><Button className="nextbutton" onClick={this.next}><img src="../../static/image/icon/buttonnextarrow.png" /></Button></div>
        </div>
      </div>
    );
  }
}

export default InputOTP;