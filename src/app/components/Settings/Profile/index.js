import React, { Component } from 'react';
import { Input, InputNumber, Tooltip, Button } from 'antd';
import { observer, inject } from 'mobx-react';
import intl from 'react-intl-universal';
import { createNotification } from 'utils/helper';
var QRCode = require('qrcode.react');
const { countrymobile } = require('../../../../../config/common/countrymobile');

const { TextArea } = Input;

import './index.less';
@inject(stores => ({
  email: stores.userRegistration.email,
  name: stores.userRegistration.name,
  mobile: stores.userRegistration.mobile,
  loginid: stores.userRegistration.loginid,
  countrycode: stores.userRegistration.countrycode,
  twoFAType: stores.userRegistration.twoFAType,
  twoFAPassword: stores.userRegistration.twoFAPassword,
  googleAuthKey: stores.userRegistration.googleAuthKey,
  wsRequestUpdateProfileTokenOTP : () => stores.userRegistration.wsRequestUpdateProfileTokenOTP(),
  wsUpdateProfile : (name,email,mobile,countrycode,password,otp,loginid) => stores.userRegistration.wsUpdateProfile(name,email,mobile,countrycode,password,otp,loginid),
  language: stores.languageIntl.language,
}))

@observer
class Profile extends Component {

  inputEl1 = null;

  state = {
    name : "",
    email : "",
    password : "",
    confirmpassword : "",
    login : "",
    mobile : "",
    otp : "",
    autoliststyle : "autolisthide",
    countrycode : "+60",
    originallist : [],
    filterlist : []
  }

  componentDidMount(){
    console.log(this.props.email);
    this.setState({
      name : this.props.name,
      email : this.props.email,
      mobile : this.props.mobile,
      loginid : this.props.loginid,
      countrycode : this.props.countrycode,
      otp : "",
      password : "",
      confirmpassword : "",
    }) ;

    this.setState({
      originallist: countrymobile,
      filterlist: countrymobile
    });


    //this.readTextFile("../../static/countrymobile.json");
  }

  componentWillReceiveProps(newProps){
    console.log(newProps.name);
  }

  readTextFile = file => {
    var rawFile = new XMLHttpRequest();
    rawFile.open("GET", file, false);
    rawFile.onreadystatechange = () => {
        if (rawFile.readyState === 4) {
            if (rawFile.status === 200 || rawFile.status == 0) {
                var allText = rawFile.responseText;
                this.setState({
                  originallist: JSON.parse(allText),
                  filterlist: JSON.parse(allText)
                });
            }
        }
    };
    rawFile.send(null);
  };

  selectcountry = e => {
    this.setState({countrycode:e.currentTarget.getAttribute('data-code')}, () => {
      //this.props.setCountryCode(this.state.countrycode);
    });
    //console.log("IN");
    //console.log(e.currentTarget.getAttribute('data-code'));
    //this.setState({ mobilevalue : e.target.value }, () => {
    //  this.props.setMobile(this.state.mobilevalue);
    //});
  }

  setfilterlist = e => {
    var newfilterlist = [];
    this.setState({countrycode:e.target.value});
    //this.props.setCountryCode(e.target.value);
    this.state.originallist.forEach(function(item, index){
      if(item.name.toLowerCase().includes(e.target.value.toLowerCase()) || item.dial_code.includes(e.target.value)){
        console.log(item.name);
        newfilterlist.push(item);
      }
    });
    this.setState({filterlist: newfilterlist});
  }

  requestotp = () => {
    this.props.wsRequestUpdateProfileTokenOTP();
  }

  inputChanged = e => {
    switch(e.target.id){
      case "name":
        this.setState({name:e.target.value});
        break;
      case "loginid":
        this.setState({loginid:e.target.value});
        break;
      case "email":
        this.setState({email:e.target.value});
        break;
      case "mobile":
        this.setState({mobile:e.target.value});
        break;
      case "password":
        this.setState({password:e.target.value});
        break;
      case "confirmpassword":
        this.setState({confirmpassword:e.target.value});
        break;
      case "otp":
        this.setState({otp:e.target.value});
        break;
    }
  }

  showlist = e => {
    e.preventDefault();
    e.stopPropagation();
    this.setState({autoliststyle : "autolist"});
  }

  hidelist = e => {
    //e.preventDefault();
    //e.stopPropagation();
    this.setState({autoliststyle : "autolisthide"});
  }

  save = () => {
    if(this.state.name == "") {
      createNotification('error',intl.get('Error.Nameisempty'));
      return;
    }

    if(this.state.loginid == "") {
      createNotification('error',intl.get('Error.LoginIDisempty'));
      return;
    }

    if(this.state.email == "") {
      createNotification('error',intl.get('Error.Emailisempty'));
      return;
    }

    /*
    if(this.state.mobile == "") {
      createNotification('error',intl.get('Error.Mobileisempty'));
      return;
    }
    */

    if(this.props.twoFAType == "sms" && this.state.otp == "") {
      createNotification('error',intl.get('Error.InvalidOTP'));
      return;
    }

    if(this.props.twoFAType == "totp" && this.state.otp == "") {
      createNotification('error',intl.get('Error.Invalid2FAPassword'));
      return;
    }

    if(this.props.twoFAType == "password" && this.state.otp == "") {
      createNotification('error',intl.get('Error.Passwordisempty'));
      return;
    }

    if(this.state.password != this.state.confirmpassword) {
      createNotification('error',intl.get('Error.Passwordnotmatch'));
      return;
    }

    this.props.wsUpdateProfile(this.state.name,this.state.email,this.state.mobile,this.state.countrycode,this.state.password,this.state.otp,this.state.loginid);
    this.setState({otp:""});
  }

  render() {
    const {filterlist,autoliststyle} = this.state;
    var totpurl = "otpauth://totp/RVXWallet?secret=" + this.props.googleAuthKey;
    return (
      <div className="profilepanel fadeInAnim">
        <div className="title" ><span>{intl.get('Settings.Profile')}</span></div>
        <div className="centerpanel">

          <div className="inputpanel">
            <div className="panelwrapper borderradiusfull">
              {/* <Input id="name" value={this.state.name} placeholder={intl.get('Register.Name')} className="inputTransparent" onChange={this.inputChanged} /> */}
              <Input id="name" value={this.state.name} placeholder={this.state.name} className="inputTransparent" onChange={this.inputChanged} />
            </div>

            <div className="panelwrapper borderradiusfull">
              {/* <Input id="email" value={this.state.email} placeholder={intl.get('Register.Email')} className="inputTransparent" onChange={this.inputChanged} /> */}
              <Input id="email" value={this.state.email} placeholder={this.state.email} className="inputTransparent" onChange={this.inputChanged} />
            </div>

            <div className="panelwrapper borderradiusfull">
              {/* <Input id="loginid" value={this.state.loginid} placeholder={intl.get('Register.LoginId')} className="inputTransparent" onChange={this.inputChanged} /> */}
              <Input id="loginid" value={this.state.loginid} placeholder={this.state.loginid} className="inputTransparent" onChange={this.inputChanged} />
            </div>

            <div className="panelwrapper borderradiusleft countrycodewrapper">
              {/* <Input id="countrycode" value={this.state.countrycode} placeholder={intl.get('Register.CountryCode')} onClick={this.showlist} onBlur={this.hidelist} onFocus={this.showlist} className="inputTransparent" onChange={this.setfilterlist} /> */}
              <Input id="countrycode" value={this.state.countrycode} placeholder={this.state.countrycode} onClick={this.showlist} onBlur={this.hidelist} onFocus={this.showlist} className="inputTransparent" onChange={this.setfilterlist} />
              <div className={autoliststyle}>
                {filterlist.length > 0 && 
                  <ul>
                    {filterlist.map((item, index) => <li key={index} data-code={item.dial_code} onMouseDown={this.selectcountry}>{item.dial_code} {item.name}</li>)}
                  </ul>
                }

                {filterlist.length == 0 && 
                  <div className="noResult">{intl.get('Common.NoData')}</div>
                }
              </div>
            </div>
            <div className="panelwrapper borderradiusright phonewrapper">
              {/* <Input id="mobile" value={this.state.mobile} placeholder={intl.get('Register.PhoneNumber')} className="inputTransparent" onChange={this.inputChanged} /> */}
              <Input id="mobile" value={this.state.mobile} placeholder={this.state.mobile} className="inputTransparent" onChange={this.inputChanged} />
            </div>

            <div className="panelwrapper borderradiusfull">
              <Input id="password" type="password" placeholder={intl.get('Register.Password')} className="inputTransparent" onChange={this.inputChanged} />
            </div>

            <div className="panelwrapper borderradiusfull">
              <Input id="confirmpassword" type="password" placeholder={intl.get('Register.ConfirmPassword')} className="inputTransparent" onChange={this.inputChanged} />
            </div>

            {
              this.props.twoFAType == "sms" &&
              <div className="panelwrapper borderradiusfull spacebetween">
                <div className="panellabel" style={{paddingLeft:"0px",marginTop:"5px"}}><Input id="otp" className="inputTransparent otpinputclass" value={this.state.otp} onChange={this.inputChanged} placeholder={intl.get('Auth.EnterOTP')} /></div>
                <div className="panelvalue" style={{paddingRight:"0px"}}><Button className="radiusbutton" onClick={this.requestotp} >{intl.get('Auth.RequestOTP')}</Button></div>
              </div>
            }

            {
              this.props.twoFAType == "password" &&
              <div className="panelwrapper borderradiusfull">
                <Input id="otp" type="password" className="inputTransparent" value={this.state.otp} onChange={this.inputChanged} placeholder={intl.get('Settings.2FASecurity.SecurityCode')} />
              </div>
            }

            {
              this.props.twoFAType == "totp" &&
              <React.Fragment>
                <div style={{marginTop:"50px"}} className="qrcodectn">
                  <div className="inner">
                    <QRCode fgColor="#4954AE" size={130} value={totpurl} />
                  </div>
                </div>

                <div style={{width:"160px"}} className="panelwrapper borderradiusfull">
                  <Input id="otp" type="password" className="inputTransparent" value={this.state.otp} onChange={this.inputChanged} placeholder={intl.get('Settings.2FASecurity.SecurityCode')} />
                </div>
              </React.Fragment>                
            }

            <div><Button className="curvebutton" onClick={this.save} >{intl.get('Common.Save')}</Button></div>

          </div>


        </div>
      </div>
    );
  }
}

export default Profile;