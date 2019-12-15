import React, { Component } from 'react';
import { Input, Button, Radio, Icon, Tooltip } from 'antd';
import { observer, inject } from 'mobx-react';
import intl from 'react-intl-universal';
import logo from 'static/image/graphic/logo.png';
import buttonnext from 'static/image/icon/buttonnextarrow.png';

import './index.less';
@inject(stores => ({
  email: stores.userRegistration.email,
  name: stores.userRegistration.name,
  loginid: stores.userRegistration.loginid,
  password: stores.userRegistration.password,
  confirmpassword: stores.userRegistration.confirmpassword,
  language: stores.languageIntl.language,
  setOTP: otp => stores.userRegistration.setOTP(otp),
  setCurrent: current => stores.userRegistration.setCurrent(current),
  setName: name => stores.userRegistration.setName(name),
  setLoginID: loginid => stores.userRegistration.setLoginID(loginid),
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
    loginid : "",
    password : "",
    confirmpassword : ""
  }

  inputChanged = e => {
    switch(e.target.id){
      case "name":
        this.props.setName(e.target.value);
        break;
      case "loginid":
        this.props.setLoginID(e.target.value);
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
      <div className="fadeInAnim loginbg">
        <div className="userinfoleftpanel">
          <img width="350px" src={logo} />
          <div className="steppanel">
            <div className="circlewrapper"><div className="innerCircle"></div></div>
            <div className="line"></div>
            <div className="circlewrapper"><div className="innerCircle"></div></div>
            <div className="line"></div>
            <div className="circlewrapper"><div className="outterCircle"><div className="innerCircle"></div></div></div>
          </div>

          <div className="title">{intl.get('Register.CreateAccount')}</div>

          <div className="inputpanel">
            <center>
              <div className="panelwrapper borderradiusfull">
                <Input id="name" placeholder={intl.get('Register.Name')} className="inputTransparent" onChange={this.inputChanged} />
              </div>

              {
                /*
                <div className="panelwrapper borderradiusfull">
                  <Input id="email" placeholder={intl.get('Register.Email')} className="inputTransparent" onChange={this.inputChanged} />
                </div>
                */
              }

              <div className="panelwrapper borderradiusfull">
                <Input id="loginid" placeholder={intl.get('Register.LoginId')} className="inputTransparent" onChange={this.inputChanged} />
              </div>

              <div className="panelwrapper borderradiusfull">
                <Input id="password" style={{marginLeft:"-10px",paddingLeft:"0px"}} type="password" placeholder={intl.get('Register.Password')} className="inputTransparent" onChange={this.inputChanged} />
              </div>

              <div className="panelwrapper borderradiusfull">
                <Input id="confirmpassword" style={{marginLeft:"-10px",paddingLeft:"0px"}} type="password" placeholder={intl.get('Register.ConfirmPassword')} className="inputTransparent" onChange={this.inputChanged} />
              </div>
            </center>
          </div>

          <div className="buttonpanel"><Button className="nextbutton" onClick={this.next}><img src={buttonnext} /></Button></div>
        </div>
      </div>
    );
  }
}

export default InputUserInfo;