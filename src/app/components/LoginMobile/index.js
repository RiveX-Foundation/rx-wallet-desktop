import React, { Component } from 'react';
import { Input, Button, Icon, Tooltip } from 'antd';
import { observer, inject } from 'mobx-react';
import intl from 'react-intl-universal';
const { countrymobile } = require('../../../../config/common/countrymobile');
import logo from 'static/image/graphic/logo.png';
import buttonnext from 'static/image/icon/buttonnextarrow.png';
import { createNotification } from 'utils/helper';
var bcrypt = require('bcryptjs');

import './index.less';
@inject(stores => ({
  countrycode: stores.userRegistration.countrycode,
  CreateEthAddress : () => stores.walletStore.CreateEthAddress(),
  setCurrent: current => stores.walletStore.setCurrent(current),
  setWalletName: walletname => stores.walletStore.setWalletName(walletname),
  setSeedPhaseInString: val => stores.walletStore.setSeedPhaseInString(val),
  seedphase: stores.walletStore.seedphase,
  setRequestForgotPassword : val => stores.session.setRequestForgotPassword(val),
  setMobile: mobile => stores.userRegistration.setMobile(mobile),
  setEmail: email => stores.userRegistration.setEmail(email),
  setPassword: password => stores.userRegistration.setPassword(password),
  setpasswordWallet: pass => stores.walletStore.setPassword(pass),
  setCountryCode: countrycode => stores.userRegistration.setCountryCode(countrycode),
  wsLogin : () => stores.userRegistration.wsLogin(),
  language: stores.languageIntl.language,
  setRequestSignIn: current => stores.session.setRequestSignIn(current),
  setcurrentReg: current => stores.userRegistration.setCurrent(current),
  mnemonicpassword: stores.walletStore.mnemonicpassword,
  password: stores.userRegistration.password
}))

@observer
class LoginMobile extends Component {
  state = {
    mobilevalue : "",
    autoliststyle : "autolisthide",
    countrycode: "+60",
    originallist : [],
    filterlist : [],
    mnemonicpassword:""
  }

  inputChanged = e => {
        this.setState({ mnemonicpassword: e.target.value });
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
    if(localStorage.getItem('password')!=null){ 
      this.props.setpasswordWallet(localStorage.getItem('password'));
    }
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
     bcrypt.compare(this.state.mnemonicpassword, localStorage.getItem('password'), (err, res) => {
      if(res) {
       // createNotification('success','successfully logged in');
        this.props.wsLogin();
      } else {
        createNotification('error',"Invalid password");
      } 
    });
    /*console.log("checking: "+this.state.mnemonicpassword + " and "+ this.props.mnemonicpassword);
    if(this.props.mnemonicpassword=="" || this.props.mnemonicpassword==null || this.props.mnemonicpassword===""){
      createNotification('error',"Please restore or create an account");
    }else if(this.state.mnemonicpassword==this.props.mnemonicpassword || this.state.mnemonicpassword===this.props.mnemonicpassword){
      this.props.wsLogin();
    } else{
      createNotification('error',"Invalid password");
    }*/
   
  }
  restore = () => {
    console.log("restore click");
   // this.props.setRequestSignIn(true);
    this.props.setcurrentReg('walletrestorebyseed');
  }
  signin = () => {
    this.props.setRequestSignIn(true);
  }

  forgotpassword = () => {
    this.props.setRequestForgotPassword(true);
  }
  create = () => {
    console.log("create");
    //this.props.setRequestSignIn(true);
    this.props.setcurrentReg('walletnameentry');
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
          <center>
          <div className="panelwrapper borderradiusfull loginpanel">
              <Input.Password style={{marginLeft:"-20px"}} id="loginpassword" placeholder={intl.get('Register.Password')} className="inputTransparent" onChange={this.inputChanged} onKeyDown={this.onKeyDown} />
              <div><Button className="nextbutton" onClick={this.login}><img src={buttonnext} /></Button></div>
            </div>
            <div className="buttonpanel" style={{marginTop:"0px"}}>
            <Button className="curvebutton" onClick={this.restore} >{intl.get('Settings.Restore')}</Button>
            <Button className="curvebutton" style={{marginLeft:"30px"}} onClick={this.create} >{intl.get('Settings.Create')}</Button>
            </div>
            
            </center>
        </div>
      </div>
    );
  }
}

export default LoginMobile;