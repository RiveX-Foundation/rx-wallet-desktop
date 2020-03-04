import React, { Component } from 'react';
import { Input, Radio, Icon, Tooltip, Button } from 'antd';
import { observer, inject } from 'mobx-react';
import { observable, action, intercept,computed } from 'mobx';
import intl from 'react-intl-universal';
import {NotificationContainer, NotificationManager} from 'react-notifications';
const { countrymobile } = require('../../../../../config/common/countrymobile');
import logo from 'static/image/graphic/logo.png';
import buttonnext from 'static/image/icon/buttonnextarrow.png';
import WalletRestoreByseedLogin from '../../Wallet/WalletRestorebySeedLogin';

import './index.less';
@inject(stores => ({
  setMobile: mobile => stores.userRegistration.setMobile(mobile),
  setEmail: email => stores.userRegistration.setEmail(email),
  setCountryCode: val => stores.userRegistration.setCountryCode(val),
  UserAccountExist : stores.session.UserAccountExist,
  email : stores.userRegistration.email,
  setRequestSignIn : val => stores.session.setRequestSignIn(val),
  setRequestForgotPassword : val => stores.session.setRequestForgotPassword(val),
  wsOTPVerification : type => stores.userRegistration.wsOTPVerification(type),
  wsMobileRegistration : () => stores.userRegistration.wsMobileRegistration(),
  wsEmailRegistration : () => stores.userRegistration.wsEmailRegistration(),
  language: stores.languageIntl.language
}))

@observer
class InputMobile extends Component {
  state = {
    mobilevalue : "",
    emailvalue : "",
    autoliststyle : "autolisthide",
    countrycode : "+60",
    originallist : [],
    filterlist : []
  }

  onKeyDown = (e) => {
    if (e.key === 'Enter') {
      this.next();
    }
  }

  componentDidMount(){
    this.setState({
      originallist: countrymobile,
      filterlist: countrymobile
    });
    //this.readTextFile("../../static/countrymobile.json");
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
      this.props.setCountryCode(this.state.countrycode);
    });
    //console.log("IN");
    //console.log(e.currentTarget.getAttribute('data-code'));
    //this.setState({ mobilevalue : e.target.value }, () => {
    //  this.props.setMobile(this.state.mobilevalue);
    //});
  }
  
  setfilterlist = e => {
    var newfilterlist = [];
    this.props.setCountryCode(e.target.value);
    this.state.originallist.forEach(function(item, index){
      if(item.name.toLowerCase().includes(e.target.value.toLowerCase())){
        console.log(item.name);
        newfilterlist.push(item);
      }
    });
    this.setState({filterlist: newfilterlist});
  }

  inputChanged = e => {
    this.setState({ emailvalue : e.target.value }, () => {
      //this.props.setMobile(this.state.mobilevalue);
      this.props.setEmail(this.state.emailvalue);
    });
  }

  panelClick = e => {
    //e.preventDefault();
    //e.stopPropagation();
    //this.setState({autoliststyle : "autolisthide"});
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

  next = () => {
    //this.props.wsMobileRegistration();
    this.props.wsEmailRegistration();
    //this.props.wsOTPVerification('registration');
  }

  login = () => {
    this.props.setRequestSignIn(false);
    this.props.setRequestForgotPassword(false);
  }

  render() {

    const {filterlist,autoliststyle} = this.state;

    return (
      <div className="fadeInAnim loginbg">
        <div className="leftpanel" onClick={this.panelClick}>
          <WalletRestoreByseedLogin></WalletRestoreByseedLogin>
          <div className="buttonpanel" style={{marginTop:"0px"}}>
            <div className="loginbutton" onClick={this.login}>{intl.get('Register.BackToLogin')}</div>
          </div>
          <img width="350px" src={logo} />
          <div className="steppanel">
            <div className="circlewrapper"><div className="outterCircle"><div className="innerCircle"></div></div></div>
            <div className="line"></div>
            <div className="circlewrapper"><div className="innerCircle"></div></div>
            <div className="line"></div>
            <div className="circlewrapper"><div className="innerCircle"></div></div>
          </div>

          <div className="subtitle">{intl.get('Register.CreateAccount')}</div>
          <div className="inputwrapper">
            {
                /*
            <div className="panelwrapper borderradiusleft countrycodewrapper">
              <Input id="countrycode" value={this.state.countrycode} placeholder={intl.get('Register.CountryCode')} onClick={this.showlist} onBlur={this.hidelist} onFocus={this.showlist} className="inputTransparent" onChange={this.setfilterlist} />
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
              <Input id="mobile" placeholder={intl.get('Register.PhoneNumber')} className="inputTransparent" onChange={this.inputChanged} />
            </div>
                */
              }
            <center>
              <div className="panelwrapper borderradiusfull loginpanel">
                <Input value={this.props.email} id="email" placeholder={intl.get('Register.Email')} className="inputTransparent" onChange={this.inputChanged} onKeyDown={this.onKeyDown} />
              </div>
            </center>
          </div>
          <div className="buttonpanel" style={{marginTop:"0px"}}>
            <div className="loginbutton" onClick={this.login}>{intl.get('Register.BackToLogin')}</div>
            <Button className="nextbutton" onClick={this.next}><img src={buttonnext} /></Button>
          </div>
        </div>
      </div>
    );
  }
}

export default InputMobile;