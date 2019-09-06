import { observable, action } from 'mobx';
import { inject } from 'mobx-react';
import axios from 'axios';
import { createNotification } from 'utils/helper';
import intl from 'react-intl-universal';

class Setting {
  @observable current = 'managewalletlist';
  @observable selectedwalletaddress = "";
  @observable currencycode = "USD";

  @action setCurrencyCode(currencycode){
    this.currencycode = currencycode;
    localStorage.setItem('currencycode',currencycode);
  }

  @action setSelectedWalletAddress(val){
    this.selectedwalletaddress = val;
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

  processMobileLogin(response){
    if(response.status == 200){
      console.log(response);

      var name = response.user.Name;
      var email = response.user.Email;
      var mobile = response.user.Mobile;
      var userid = response.user.Id;

      var simpleUser = {
        name : name,
        email : email,
        mobile : mobile,
        userid : userid
      }

      this.setUserObject(userid,mobile,name,email);

      localStorage.setItem('user',JSON.stringify(simpleUser));
      this.setIsLogin(true);
      this.setUserAccountExist(true);
      this.setToken(response.token);
      //self.setCurrent(1);
    }else{
      createNotification('error',intl.get('Error.'+response.msg));
      //createNotification
    }
  }

}

const self = new Setting();
export default self;
