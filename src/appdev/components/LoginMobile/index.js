import React, { Component } from 'react';
import { Input, Button, Icon, Tooltip } from 'antd';
import { observer, inject } from 'mobx-react';
import intl from 'react-intl-universal';

import './index.less';
@inject(stores => ({
  setRequestSignIn : val => stores.session.setRequestSignIn(val),
  setMobile: mobile => stores.userRegistration.setMobile(mobile),
  setPassword: password => stores.userRegistration.setPassword(password),
  wsLogin : () => stores.userRegistration.wsLogin(),
  language: stores.languageIntl.language
}))

@observer
class LoginMobile extends Component {
  inputChanged = e => {
    switch(e.target.id){
      case "loginmobile":
        this.props.setMobile(e.target.value);
        break;
      case "loginpassword":
        this.props.setPassword(e.target.value);
        break;
    }
  }

  login = () => {
    this.props.wsLogin();
  }

  signin = () => {
    this.props.setRequestSignIn(true);
  }

  render() {
    return (
      <div className="textc">
        <h1 className="mneCom-h1">{intl.get('Mnemonic.InputPwd.createAWANWallet')}</h1>
        <div className="mne-input">
          <p className="pwdTitle">{intl.get('Mnemonic.InputPwd.Mobile')}:</p>
          <Input id="loginmobile" onChange={this.inputChanged} />
          <p className="pwdTitle">{intl.get('Mnemonic.InputPwd.confirmPassword')}:</p>
          <Input.Password id="loginpassword" onChange={this.inputChanged} />
        </div>
        <div className="steps-action">
            <Button style={{ marginLeft: 8 }} type="primary" onClick={this.login}>{intl.get('Register.done')}</Button>
            <Button style={{ marginLeft: 8 }} type="primary" onClick={this.signin}>{intl.get('Register.signin')}</Button>
          </div>
      </div>
    );
  }
}

export default LoginMobile;