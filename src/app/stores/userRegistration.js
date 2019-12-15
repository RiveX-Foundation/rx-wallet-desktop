import { observable, action } from 'mobx';
import { inject } from 'mobx-react';
import axios from 'axios';
import sessionstore from './session';
import { createNotification } from 'utils/helper';
import intl from 'react-intl-universal';
const speakeasy = require("speakeasy");
const { API_Server } = require('../../../config/common/index');
const base32 = require('hi-base32');

class UserRegistration {
  @observable userid = "";//"5d4bfba8c1241f1388a0c4be";
  @observable mobile = "";
  @observable otp = "";
  @observable token = "";//"eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqdGkiOiJmZDM3YWY1My1iODJjLTQwZTYtODQ5ZC1jZDRkNzBmMWY3YzgiLCJhY2NpZCI6IjVkNGJmYmE4YzEyNDFmMTM4OGEwYzRiZSIsIm5hbWUiOiI5OTk5IiwiY3JlYXRlZGRhdGV0aW1lIjoiOC84LzIwMTkgMTA6Mzk6NTMgQU0iLCJleHAiOjE1NjUzNDcxOTN9.AFShy2OOdTOvwPqw5wi5LPsFTuMrwjLAJRyUXIXCS3Y";
  @observable current = 'inputmobile';
  @observable name = "";
  @observable email = "";
  @observable password = "";
  @observable loginid = "";
  @observable confirmpassword = "";
  @observable countrycode = "+60";
  @observable otpupdateprofile = "";
  @observable tokenupdateprofile = "";
  @observable twoFAType = "";
  @observable twoFAPassword = "";
  @observable googleAuthKey = "";

  walletstore = null;

  setwalletstore(store){
    this.walletstore = store;
  }

  @action setUserObject(userid,mobile,name,email,loginid,twoFAType,twoFAPassword,googleAuthKey){
    this.userid = userid;
    this.mobile = mobile;
    this.name = name;
    this.email = email;
    this.loginid = loginid;
    this.twoFAType = twoFAType;
    this.twoFAPassword = twoFAPassword;
    this.googleAuthKey = googleAuthKey;
  }

  @action setTwoFA(info){
    this.twoFAType = info.twoFAType;
    this.twoFAPassword = info.twoFAPassword;
    this.googleAuthKey = info.googleAuthKey;
  }

  @action setCountryCode(val){
    this.countrycode = val;
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

  @action setotpupdateprofiletoken(otptoken){
    this.otpupdateprofile = otptoken;
  }

  @action settokenupdateprofile(token){
    this.tokenupdateprofile = token;
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

  @action setLoginID(val) {
    this.loginid = val;
  }

  @action setUserAccountExist(val){
    sessionstore.setUserAccountExist(val);
  }

  @action setIsLogin(val){
    sessionstore.setIsLogin(val);
  }

  @action RedirectToLoginScreen(){
    sessionstore.setUserAccountExist(true);
    sessionstore.setIsLogin(false);
    sessionstore.setRequestSignIn(false);
    this.setCurrent('inputmobile');
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

  @action check2FAValid(googleauthkey,otp){
    const secretAscii = base32.decode(googleauthkey);
    const secretHex = this._toHex(secretAscii);
    const authcode = speakeasy.totp({
      secret: secretHex,
      algorithm: 'sha1',
      encoding: 'hex'
    });
    return authcode == otp;
  }


  _toHex = (key) =>{
    return new Buffer(key, 'ascii').toString('hex');
  }
  
  wsUpdateProfile(name,email,mobile,countrycode,password,otp,loginid){

    var that = this;

    console.log(otp);
    console.log(this.googleAuthKey);

    if(this.twoFAType == "sms" && this.otpupdateprofile != otp) {
      createNotification('error',intl.get('Error.InvalidOTP'));
      return;
    }
    
    if(this.twoFAType == "password" && this.twoFAPassword != otp) {
      createNotification('error',intl.get('Error.Invalid2FAPassword'));
      return;
    }

    if(this.twoFAType == "totp" && !this.check2FAValid(this.googleAuthKey,otp)) {
      createNotification('error',intl.get('Error.Invalid2FAPassword'));
      return;
    }

    var bodyFormData = new FormData();
    bodyFormData.set('name', name);
    bodyFormData.set('token', this.token);//USE NORMAL TOKEN INSTEAD //tokenupdateprofile);
    bodyFormData.set('email', email);
    bodyFormData.set('countrycode', countrycode);
    bodyFormData.set('password', password);
    bodyFormData.set('loginid', loginid);
    bodyFormData.set('mobile', mobile);
    
    var that = this;
    axios({
      method: 'post',
      url: API_Server + 'api/auth/UpdateCustomer',
      data: bodyFormData,
      config: { headers: {'Content-Type': 'multipart/form-data' }}
    })
    .then(function (response) {
        //handle success
        that.mobile = mobile;
        that.email = email;
        that.countrycode = countrycode;
        that.name = name;
        createNotification('success',intl.get('Success.ProfileUpdated'));
        var simpleUser = {
          name : name,
          email : email,
          mobile : mobile,
          countrycode:countrycode,
          loginid:loginid,
          userid : that.userid,
          logintoken:that.token
        }
        localStorage.setItem('user',JSON.stringify(simpleUser));
        that.setotpupdateprofiletoken("");
        that.settokenupdateprofile("");
        //self.processUserRegistration(response.data);
    })
    .catch(function (response) {
        //handle error
        createNotification('error',response);
        console.log(response);
    });
  }

  wsUserRegistration(){

    if(this.loginid == "") {
      createNotification('error',intl.get('Error.LoginIDisempty'));
      return;
    }

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
    bodyFormData.set('loginid', this.loginid);
    bodyFormData.set('password', this.password);
    
    axios({
      method: 'post',
      url: API_Server + 'api/auth/UpdateCustomerRegistration',
      data: bodyFormData,
      config: { headers: {'Content-Type': 'multipart/form-data' }}
    })
    .then(function (response) {
        //handle success
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

    bodyFormData.set('mobile', this.mobile);
    bodyFormData.set('countrycode', this.countrycode);
    bodyFormData.set('smsnotification', true);
    
    axios({
      method: 'post',
      url: API_Server + 'api/auth/RegisterMobileOTP',
      data: bodyFormData,
      config: { headers: {'Content-Type': 'multipart/form-data' }}
    })
    .then(function (response) {
        //handle success
        self.processMobileRegistration(response.data);
    })
    .catch(function (response) {
        //handle error
        createNotification('error',response);
        console.log(response);
    });
  }

  wsEmailRegistration(){
    var bodyFormData = new FormData();
    if(this.email == "" || this.email == null){
      createNotification('error',intl.get('Error.Emailisempty'));
      return;
    }

    bodyFormData.set('email', this.email);
    bodyFormData.set('emailnotification', true);
    
    axios({
      method: 'post',
      url: API_Server + 'api/auth/RegisterEmailOTP',
      data: bodyFormData,
      config: { headers: {'Content-Type': 'multipart/form-data' }}
    })
    .then(function (response) {
        //handle success
        self.processEmailRegistration(response.data);
    })
    .catch(function (response) {
        //handle error
        createNotification('error',response);
        console.log(response);
    });
  }

  wsLogin(){
    // console.log("wsLogin");
    var bodyFormData = new FormData();
    //bodyFormData.set('mobile', this.mobile);
    //bodyFormData.set('countrycode', this.countrycode);
    bodyFormData.set('email', this.email);
    bodyFormData.set('password', this.password);
    
    console.log(this.email);
    console.log(this.password);

    axios({
      method: 'post',
      url: API_Server + 'api/auth/Login',
      data: bodyFormData,
      config: { headers: {'Content-Type': 'multipart/form-data' }}
    })
    .then(function (response) {
      console.log(response);
        //handle success
        self.processMobileLogin(response.data);
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
      url: API_Server + 'api/auth/VerifyMobileOTP',
      data: bodyFormData,
      config: { headers: {'Content-Type': 'multipart/form-data' }}
    })
    .then(function (response) {
        //handle success
        self.processOTPVerification(response.data);
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

  processEmailRegistration(response){
    if(response.status == 200){
      console.log(response);
      self.setToken(response.token);
      self.setCurrent('inputotp');
    }else{
      createNotification('error',intl.get('Error.'+response.msg));
    }
  }

  wsRequestUpdateProfileTokenOTP(){
    var bodyFormData = new FormData();
    bodyFormData.set('token', this.token);
    bodyFormData.set('smsnotification', true);
    
    var that = this;

    axios({
      method: 'post',
      url: API_Server + 'api/auth/RequestUpdateProfileTokenOTP',
      data: bodyFormData,
      config: { headers: {'Content-Type': 'multipart/form-data' }}
    })
    .then(function (response) {
        //handle success
        console.log(response.data.otp);
        that.setotpupdateprofiletoken(response.data.otp);
        that.settokenupdateprofile(response.data.token);
        //self.processUserRegistration(response.data);
    })
    .catch(function (response) {
        //handle error
        that.setotpupdateprofiletoken("");
        that.settokenupdateprofile("");
        createNotification('error',response);
        console.log(response);
    });
  }

  processMobileLogin(response){
    if(response.status == 200){
      //if(response.user.GenericAttributes.find(x => x.Key == "FirstName") == null) { name ="" }else{ name = response.user.GenericAttributes.find(x => x.Key == "FirstName").Value };
      var name = response.user.Name;
      var email = response.user.Email;
      var mobile = response.user.Mobile;
      var loginid = response.user.LoginId;
      var userid = response.user.Id;
      var countrycode = response.user.CountryCode;
      var twoFAType = response.user.TwoFAType;
      var twoFAPassword = response.user.TwoFAPassword;
      var googleAuthKey = response.user.GoogleAuthKey;

      var simpleUser = {
        name : name,
        email : email,
        mobile : mobile,
        countrycode:countrycode,
        loginid:loginid,
        userid : userid,
        logintoken:response.token,
        twoFAType:twoFAType,
        twoFAPassword:twoFAPassword,
        googleAuthKey:googleAuthKey
      }
      
      this.setToken(response.token);
      this.setUserObject(userid,mobile,name,email,loginid,twoFAType,twoFAPassword,googleAuthKey);
      this.setIsLogin(true);
      this.setUserAccountExist(true);

      this.walletstore.clearSelectedWallet();
      this.walletstore.setselectedwallettype('basicwallet');
      this.walletstore.setCurrent('selectedwallet');

      localStorage.setItem('user',JSON.stringify(simpleUser));

      //self.setCurrent(1);
    }else{
      console.log(intl.get('Error.'+response.msg));
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
      var loginid = response.user.LoginID;
      var countrycode = response.user.CountryCode;

      var simpleUser = {
        name : name,
        email : email,
        mobile : mobile,
        loginid : loginid,
        countrycode:countrycode,
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

const self = new UserRegistration();
export default self;
