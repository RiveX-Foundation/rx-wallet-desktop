import React, { Component } from 'react';
import { Input, Button, Icon, Tooltip } from 'antd';
import { observer, inject } from 'mobx-react';
import intl from 'react-intl-universal';
const { countrymobile } = require('../../../../config/common/countrymobile');
import logo from 'static/image/graphic/logo.png';
import buttonnext from 'static/image/icon/buttonnextarrow.png';
import WalletRestoreByseed from '../Wallet/WalletRestorebySeed';

import './index.less';
@inject(stores => ({
  countrycode: stores.userRegistration.countrycode,
  CreateEthAddress : () => stores.walletStore.CreateEthAddress(),
  setCurrent: current => stores.walletStore.setCurrent(current),
  setWalletName: walletname => stores.walletStore.setWalletName(walletname),
  setSeedPhaseInString: val => stores.walletStore.setSeedPhaseInString(val),
  seedphase: stores.walletStore.seedphase,
  setCurrent: current => stores.walletStore.setCurrent(current),
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
          <div className="subtitle">{intl.get('Register.Welcome')}</div>
          <center><WalletRestoreByseed></WalletRestoreByseed></center>
        </div>
      </div>
    );
  }
}

export default LoginMobile;