import { observable, action } from 'mobx';
import { inject } from 'mobx-react';
import axios from 'axios';
import { createNotification } from 'utils/helper';
import intl from 'react-intl-universal';

class Setting {
  @observable userid = "";//"5d4bfba8c1241f1388a0c4be";
  @observable mobile = "";
  @observable otp = "";
  @observable token = "";//"eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqdGkiOiJmZDM3YWY1My1iODJjLTQwZTYtODQ5ZC1jZDRkNzBmMWY3YzgiLCJhY2NpZCI6IjVkNGJmYmE4YzEyNDFmMTM4OGEwYzRiZSIsIm5hbWUiOiI5OTk5IiwiY3JlYXRlZGRhdGV0aW1lIjoiOC84LzIwMTkgMTA6Mzk6NTMgQU0iLCJleHAiOjE1NjUzNDcxOTN9.AFShy2OOdTOvwPqw5wi5LPsFTuMrwjLAJRyUXIXCS3Y";
  @observable current = 'managewalletlist';
  @observable selectedwalletaddress = "";
  @observable email = "";
  @observable password = "";
  @observable confirmpassword = "";
  @observable countrycode = "+60";

  @action setUserObject(userid,mobile,name,email){
    this.userid = userid;
    this.mobile = mobile;
    this.name = name;
    this.email = email;
  }

  @action setCountryCode(val){
    this.countrycode = val;
  }

  @action setSelectedWalletAddress(val){
    this.selectedwalletaddress = val;
  }

  @action setCurrent(val) {
    this.current = val;
  }

  @action setMobile(val) {
    this.mobile = val;
  }

  @action setOTP(val) {
    this.otp = val;
  }

  @action setToken(val) {
    this.token = val;
  }

  @action setPassword(val) {
    this.password = val;
  }

  @action setConfirmPassword(val) {
    this.confirmpassword = val;
  }

  @action setName(val) {
    this.name = val;
  }

  @action setEmail(val) {
    this.email = val;
  }

  getthisstore(){
    return this;
  }

  constructor(){
    //if (!userRegistrationinstance) {
    //  userRegistrationinstance = this;
    //}

    //this._type = 'SingletonModuleScopedInstance';
    //this.time = new Date();

    //return userRegistrationinstance;
  }

  wsUserRegistration(){

    if(this.name == "") {
      createNotification('error',intl.get('Error.Nameisempty'));
      return;
    }

    if(this.token == "") {
      createNotification('error',intl.get('Error.InvalidToken'));
      return;
    }

    if(this.email == "") {
      createNotification('error',intl.get('Error.Emailisempty'));
      return;
    }

    if(this.password == "") {
      createNotification('error',intl.get('Error.Passwordisempty'));
      return;
    }

    if(this.password != this.confirmpassword) {
      createNotification('error',intl.get('Error.Passwordnotmatch'));
      return;
    }

    var bodyFormData = new FormData();
    bodyFormData.set('name', this.name);
    bodyFormData.set('token', this.token);
    bodyFormData.set('email', this.email);
    bodyFormData.set('password', this.password);
    
    axios({
      method: 'post',
      url: 'http://rvx.boxybanana.com/api/auth/UpdateCustomerRegistration',
      data: bodyFormData,
      config: { headers: {'Content-Type': 'multipart/form-data' }}
    })
    .then(function (response) {
        //handle success
        console.log(response);
        self.processUserRegistration(response.data);
    })
    .catch(function (response) {
        //handle error
        createNotification('error',response);
        console.log(response);
    });
  }

  wsMobileRegistration(){
    var bodyFormData = new FormData();

    if(this.mobile == "" || this.mobile == null){
      createNotification('error',intl.get('Error.Mobileisempty'));
      return;
    }

    bodyFormData.set('mobile', this.countrycode + this.mobile);
    
    axios({
      method: 'post',
      url: 'http://rvx.boxybanana.com/api/auth/RegisterMobileOTP',
      data: bodyFormData,
      config: { headers: {'Content-Type': 'multipart/form-data' }}
    })
    .then(function (response) {
        //handle success
        self.processMobileRegistration(response.data);
        console.log(response);
    })
    .catch(function (response) {
        //handle error
        createNotification('error',response);
        console.log(response);
    });
  }

  wsLogin(){
    var bodyFormData = new FormData();
    bodyFormData.set('mobile', this.countrycode + this.mobile);
    bodyFormData.set('password', this.password);
    
    axios({
      method: 'post',
      url: 'http://rvx.boxybanana.com/api/auth/Login',
      data: bodyFormData,
      config: { headers: {'Content-Type': 'multipart/form-data' }}
    })
    .then(function (response) {
        //handle success
        self.processMobileLogin(response.data);
        console.log(response);
    })
    .catch(function (response) {
        //handle error
        createNotification('error',response);
        console.log(response);
    });
  }

  wsOTPVerification(type){
    var bodyFormData = new FormData();
    bodyFormData.set('type', type);
    bodyFormData.set('otp', this.otp);
    bodyFormData.set('token', this.token);
    axios({
      method: 'post',
      url: 'http://rvx.boxybanana.com/api/auth/VerifyMobileOTP',
      data: bodyFormData,
      config: { headers: {'Content-Type': 'multipart/form-data' }}
    })
    .then(function (response) {
        //handle success
        self.processOTPVerification(response.data);
        console.log(response);
    })
    .catch(function (response) {
        //handle error
        createNotification('error',response);
        console.log(response);
    });
  }

  processMobileRegistration(response){
    if(response.status == 200){
      self.setToken(response.token);
      self.setCurrent('inputotp');
    }else{
      createNotification('error',intl.get('Error.'+response.msg));
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

  processUserRegistration(response){
    if(response.status == 200){

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

      localStorage.setItem('registeredbefore',"true");
      localStorage.setItem('user',JSON.stringify(simpleUser));

      this.RedirectToLoginScreen();

      //localStorage.setItem

      //self.setCurrent(2);
    }else{
      createNotification('error',intl.get('Error.'+response.msg));
    }
  }

  processOTPVerification(response){
    if(response.status == 200){
      self.setToken(response.token);
      self.setCurrent('inputuserinfo');
      //self.setOTP(response.otp);
    }else{
      createNotification('error',intl.get('Error.'+response.msg));
    }
  }
}

const self = new Setting();
export default self;
