import React, { Component } from 'react';
import { Input, Button, Radio, Icon, Tooltip } from 'antd';
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
  setCurrent: current => stores.userRegistration.setCurrent(current),
  setName: name => stores.userRegistration.setName(name),
  setPassword: password => stores.userRegistration.setPassword(password),
  setConfirmPassword: password => stores.userRegistration.setConfirmPassword(password),
  wsUserRegistration : () => stores.userRegistration.wsUserRegistration(),
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

  next = () => {
    this.props.wsUserRegistration();
  }

  render() {
    return (
      <div className="userinfoleftpanel">
        <div className="steppanel">
          <div className="circlewrapper"><div className="innerCircle"></div></div>
          <div className="line"></div>
          <div className="circlewrapper"><div className="innerCircle"></div></div>
          <div className="line"></div>
          <div className="circlewrapper"><div className="outterCircle"><div className="innerCircle"></div></div></div>
        </div>

        <img width="130px" src="../../static/image/graphic/logo.png" />
        <div className="title">{intl.get('Register.CreateAccount')}</div>

        <div className="inputpanel">
          <center>
            <div className="panelwrapper borderradiusfull">
              <Input id="name" placeholder={intl.get('Register.Name')} className="inputTransparent" onChange={this.inputChanged} />
            </div>

            <div className="panelwrapper borderradiusfull">
              <Input id="email" placeholder={intl.get('Register.Email')} className="inputTransparent" onChange={this.inputChanged} />
            </div>

            <div className="panelwrapper borderradiusfull">
              <Input id="password" style={{marginLeft:"-10px",paddingLeft:"0px"}} type="password" placeholder={intl.get('Register.Password')} className="inputTransparent" onChange={this.inputChanged} />
            </div>

            <div className="panelwrapper borderradiusfull">
              <Input id="confirmpassword" style={{marginLeft:"-10px",paddingLeft:"0px"}} type="password" placeholder={intl.get('Register.ConfirmPassword')} className="inputTransparent" onChange={this.inputChanged} />
            </div>
          </center>
        </div>

        <div className="buttonpanel"><Button className="nextbutton" onClick={this.next}><img src="../../static/image/icon/buttonnextarrow.png" /></Button></div>
      </div>
    );
  }
}

export default InputUserInfo;