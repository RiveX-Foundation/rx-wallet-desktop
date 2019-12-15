import { observable, action } from 'mobx';
import { inject } from 'mobx-react';
import axios from 'axios';
import { createNotification } from 'utils/helper';
import intl from 'react-intl-universal';
var speakeasy = require("speakeasy");
const { API_Server } = require('../../../config/common/index');

class Setting {
  @observable current = 'managewalletlist';
  @observable selectedwalletaddress = "";
  @observable currencycode = "USD";
  @observable selectedprivateaddress = "";  

  userstore = null;

  setuserstore(store){
    this.userstore = store;
  }

  @action setCurrencyCode(currencycode){
    this.currencycode = currencycode;
    localStorage.setItem('currencycode',currencycode);
  }

  @action setSelectedWalletAddress(val){
    this.selectedwalletaddress = val;
  }

  @action setSelectedPrivateAddress(val){
    this.selectedprivateaddress = val;
  }

  @action setCurrent(val) {
    this.current = val;
  }

  getthisstore(){
    return this;
  }

  constructor(){
    this.loadCurrencyCode();
    //if (!userRegistrationinstance) {
    //  userRegistrationinstance = this;
    //}

    //this._type = 'SingletonModuleScopedInstance';
    //this.time = new Date();

    //return userRegistrationinstance;
  }

  loadCurrencyCode(){
    if(localStorage.getItem('currencycode') == "" || localStorage.getItem('currencycode') == null){
      this.currencycode = "USD";
      localStorage.setItem('currencycode',"USD");
    }else{
      //this.setIsLogin(true);
      this.currencycode = localStorage.getItem('currencycode');
    }
  }

  update2FA(info){

    var that = this;
    var googleauthkey = "";

    var bodyFormData = new FormData();
    bodyFormData.set('token', this.userstore.token);
    bodyFormData.set('googleAuthKey', this.userstore.googleAuthKey);
    bodyFormData.set('twoFAType', info.twoFAType);
    bodyFormData.set('twoFAPassword', info.password);

    if(this.userstore.googleAuthKey == null || this.userstore.googleAuthKey == ""){
      bodyFormData.set('googleAuthKey', speakeasy.generateSecret({length: 20}).base32);
    }

    axios({
      method: 'post',
      url: API_Server + 'api/auth/Update2FA',
      data: bodyFormData,
      config: { headers: {'Content-Type': 'multipart/form-data' }}
    })
    .then(async function (response) {
      if(response.data.status == 200){
        createNotification('success',intl.get('Success.ProfileUpdated'));
        var info = { twoFAType : response.data.user.TwoFAType, twoFAPassword : response.data.user.TwoFAPassword, googleAuthKey : response.data.user.GoogleAuthKey };
        that.userstore.setTwoFA(info);
      }else{
        createNotification('error',response.data.msg);
      }
    })
    .catch(function (response) {
      createNotification('error',response);
        //handle error
      console.log(response);
    });    
  }

}

const self = new Setting();
export default self;
