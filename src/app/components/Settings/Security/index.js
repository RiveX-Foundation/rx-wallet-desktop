import React, { Component } from 'react';
import { Input, InputNumber, Tooltip, Button, Radio, Icon } from 'antd';
import { observer, inject } from 'mobx-react';
import intl from 'react-intl-universal';
import { createNotification } from 'utils/helper';
const { currency } = require('../../../../../config/common/currency');
const { TextArea } = Input;

import './index.less';
import { setDefaultWordlist } from 'bip39';
@inject(stores => ({
  mobile : stores.userRegistration.mobile,
  update2FA : info => stores.setting.update2FA(info),
  language: stores.languageIntl.language,
  twoFAType: stores.userRegistration.twoFAType,
  twoFAPassword: stores.userRegistration.twoFAPassword
}))

@observer
class Security extends Component {

  inputEl1 = null;

  state = {
    value : "password",
    password : ""
  }

  componentDidMount(){
    console.log(this.props.twoFAType);
    this.setState({
      value : this.props.twoFAType,
      password : this.props.twoFAPassword
    });
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
    }

    var info = {
      twoFAType : this.state.value,
      password : this.state.password
    }

    this.props.update2FA(info);
  }

  render() {

    var smstext = intl.get('Settings.2FASecurity.SMS');
    var smsdisabled = false;
    if(this.props.mobile == "") { smsdisabled=true; }

    return (
      <div className="currencypanel fadeInAnim">
        <div className="title" ><span>{intl.get('Settings.2FASecurity')}</span></div>
        <div className="centerpanel">
          <div className="inputpanel">
            <Radio.Group onChange={this.onChange} value={this.state.value}>
              <div>
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
                <br/>          
              </div>
              {
                !smsdisabled && 
                <div>
                  <Radio value="sms">{smstext}</Radio>
                  <br/><br/><br/>
                </div>
              }
              <div>
                <Radio value="totp">{intl.get('Settings.2FASecurity.TOTPCode')}</Radio>
                <br/><br/>
              </div>
            </Radio.Group>
            <div><Button className="curvebutton" onClick={this.save} >{intl.get('Common.Save')}</Button></div>
          </div>
        </div>
      </div>
    );
  }
}

export default Security;