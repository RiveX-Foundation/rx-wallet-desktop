import React, { Component } from 'react';
import { Input, Button, Icon, Tooltip } from 'antd';
import { observer, inject } from 'mobx-react';
import intl from 'react-intl-universal';
import {NotificationContainer, NotificationManager} from 'react-notifications';


import './index.less';
@inject(stores => ({
  setRequestSignIn : val => stores.session.setRequestSignIn(val),
  setMobile: mobile => stores.userRegistration.setMobile(mobile),
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
      case "loginmobile":
        this.props.setMobile(e.target.value);
        break;
      case "loginpassword":
        this.props.setPassword(e.target.value);
        break;
    }
  }

  componentDidMount(){
    this.readTextFile("../../static/countrymobile.json");
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
    this.props.setCountryCode(e.target.value);
    this.state.originallist.forEach(function(item, index){
      if(item.name.toLowerCase().includes(e.target.value.toLowerCase())){
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
      <div style={{backgroundImage: 'url(../../static/image/graphic/loginbg.jpg)'}}>
        <div className="leftpanel" onClick={this.panelClick}>

          <img width="130px" src="../../static/image/graphic/logo.png" />
          <div className="subtitle">{intl.get('Register.Login')}</div>
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

            <div className="panelwrapper borderradiusright phonewrapper">
              <Input id="loginmobile" placeholder={intl.get('Register.PhoneNumber')} className="inputTransparent" onChange={this.inputChanged} />
            </div>
          </div>
          <center>
            <div className="panelwrapper borderradiusfull loginpanel">
              <Input id="loginpassword" type="password" placeholder={intl.get('Register.Password')} className="inputTransparent" onChange={this.inputChanged} />
            </div>
          </center>
          <div className="buttonpanel">
            <div className="loginbutton" onClick={this.signin}>{intl.get('Register.CreateNewAccount')}</div>
            <Button className="nextbutton" onClick={this.login}><img src="../../static/image/icon/buttonnextarrow.png" /></Button>
          </div>
        </div>
      </div>
    );
  }
}

export default LoginMobile;