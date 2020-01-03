import React, { Component } from 'react';
import { Input, Button, Icon, Tooltip } from 'antd';
import { observer, inject } from 'mobx-react';
import intl from 'react-intl-universal';
const { countrymobile } = require('../../../../config/common/countrymobile');
import logo from 'static/image/graphic/logo.png';
import buttonnext from 'static/image/icon/buttonnextarrow.png';

import './index.less';
@inject(stores => ({
  countrycode: stores.userRegistration.countrycode,
  setRequestSignIn : val => stores.session.setRequestSignIn(val),
  setRequestForgotPassword : val => stores.session.setRequestForgotPassword(val),
  setMobile: mobile => stores.userRegistration.setMobile(mobile),
  setEmail: email => stores.userRegistration.setEmail(email),
  setPassword: password => stores.userRegistration.setPassword(password),
  setCountryCode: countrycode => stores.userRegistration.setCountryCode(countrycode),
  wsLogin : () => stores.userRegistration.wsLogin(),
  language: stores.languageIntl.language
}))

@observer
class LoginMobile extends Component {
  state = {
    mobilevalue : "",
    autoliststyle : "autolisthide",
    countrycode: "+60",
    originallist : [],
    filterlist : []
  }

  inputChanged = e => {
    switch(e.target.id){
      case "loginemail":
        this.props.setEmail(e.target.value);
        break;
      case "loginmobile":
        this.props.setMobile(e.target.value);
        break;
      case "loginpassword":
        this.props.setPassword(e.target.value);
        break;
    }
  }

  onKeyDown = (e) => {
    if (e.key === 'Enter') {
      this.login();
    }
  }


  componentDidMount(){

    this.props.setCountryCode("+60");
    this.props.setPassword("");
    this.props.setMobile("");

    this.setState({
      countrycode: "+60",
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
  
  setfilterlist = e => {
    var newfilterlist = [];
    this.setState({countrycode:e.target.value});
    this.state.originallist.forEach(function(item, index){
      if(item.name.toLowerCase().includes(e.target.value.toLowerCase()) || item.dial_code.includes(e.target.value)){
        console.log(item.name);
        newfilterlist.push(item);
      }
    });
    this.setState({filterlist: newfilterlist});
  }
  
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

  login = () => {
    this.props.wsLogin();
  }

  signin = () => {
    this.props.setRequestSignIn(true);
  }

  forgotpassword = () => {
    this.props.setRequestForgotPassword(true);
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

  render() {

    const {filterlist,autoliststyle} = this.state;

    return (
      <div className="fadeInAnim loginbg">
        <div className="leftpanel" onClick={this.panelClick}>

          <img width="350px" src={logo} />
          <div className="subtitle">{intl.get('Register.Login')}</div>
          {
            /*
            <div className="inputwrapper">
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

          </div>
            */
          }
          <center>
            <div className="panelwrapper borderradiusfull loginpanel">
              <Input id="loginemail" placeholder={intl.get('Register.LoginId')} className="inputTransparent" onChange={this.inputChanged} />
            </div>

            <div className="panelwrapper borderradiusfull loginpanel">
              <Input id="loginpassword" type="password" placeholder={intl.get('Register.Password')} className="inputTransparent" onChange={this.inputChanged} onKeyDown={this.onKeyDown} />
            </div>
          </center>
          <div className="buttonpanel" style={{marginTop:"0px"}}>
            <div className="loginbutton" onClick={this.signin}>{intl.get('Register.CreateNewAccount')}</div>
            <Button className="nextbutton" onClick={this.login}><img src={buttonnext} /></Button>
          </div>
          <div style={{display:"block"}}></div>
          <div className="buttonpanel">
            <div></div>
            <div className="forgotpassword" onClick={this.forgotpassword}>{intl.get('Register.ForgotPassword')}</div>
          </div>
        </div>
      </div>
    );
  }
}

export default LoginMobile;