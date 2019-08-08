import React, { Component } from 'react';
import { Input, Radio, Icon, Tooltip } from 'antd';
import { observer, inject } from 'mobx-react';
import intl from 'react-intl-universal';

import './index.less';
@inject(stores => ({
  email: stores.userRegistration.email,
  name: stores.userRegistration.name,
  password: stores.userRegistration.password,
  confirmpassword: stores.userRegistration.confirmpassword,
  language: stores.languageIntl.language,
  setOTP: otp => stores.userRegistration.setOTP(otp),
  setName: name => stores.userRegistration.setName(name),
  setPassword: password => stores.userRegistration.setPassword(password),
  setConfirmPassword: password => stores.userRegistration.setConfirmPassword(password),
  setEmail: email => stores.userRegistration.setEmail(email),
}))

@observer
class InputUserInfo extends Component {
  state = {
    name : "",
    email : "",
    password : "",
    confirmpassword : ""
  }

  inputChanged = e => {
    switch(e.target.id){
      case "name":
        this.props.setName(e.target.value);
        break;
      case "email":
        this.props.setEmail(e.target.value);
        break;
      case "password":
        this.props.setPassword(e.target.value);
        break;
      case "confirmpassword":
        this.props.setConfirmPassword(e.target.value);
        break;
      }
  }

  onChange = e => {
  }

  render() {
    return (
      <div className="textc">
        <h1 className="mneCom-h1">{intl.get('Mnemonic.InputPwd.createAWANWallet')}</h1>
        <div className="mne-input">
          <p className="pwdTitle">{intl.get('Mnemonic.InputPwd.Name')}:</p>
          <Input id="name" onChange={this.inputChanged} />
          <p className="pwdTitle">{intl.get('Mnemonic.InputPwd.Email')}:</p>
          <Input id="email" onChange={this.inputChanged} />
          <p className="pwdTitle">{intl.get('Mnemonic.InputPwd.newPassword')}:</p>
          <Input.Password id="password" onChange={this.inputChanged} />
          <p className="pwdTitle">{intl.get('Mnemonic.InputPwd.confirmPassword')}:</p>
          <Input.Password id="confirmpassword" onChange={this.inputChanged} />
        </div>
      </div>
    );
  }
}

export default InputUserInfo;