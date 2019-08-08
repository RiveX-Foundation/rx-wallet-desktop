import { observable, action } from 'mobx';
import { inject } from 'mobx-react';
import axios from 'axios';
import sessionstore from './session';

class UserRegistration {
  @observable userid = "123";
  @observable mobile = "";
  @observable otp = "";
  @observable token = "";
  @observable current = 0;
  @observable name = "";
  @observable email = "";
  @observable password = "";
  @observable confirmpassword = "";

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

  @action setUserAccountExist(val){
    sessionstore.setUserAccountExist(val);
  }

  @action setIsLogin(val){
    sessionstore.setIsLogin(val);
  }

  wsUserRegistration(){
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
        console.log(response);
    });
  }

  wsMobileRegistration(){
    var bodyFormData = new FormData();
    console.log(this.mobile);
    bodyFormData.set('mobile', this.mobile);
    
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
        console.log(response);
    });
  }

  wsLogin(){
    var bodyFormData = new FormData();
    console.log(this.mobile);
    bodyFormData.set('mobile', this.mobile);
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
        console.log(response);
    });
  }

  processMobileRegistration(response){
    if(response.status == 200){
      self.setToken(response.token);
      self.setCurrent(1);
    }
  }

  processMobileLogin(response){
    if(response.status == 200){
      console.log(response);
      this.setIsLogin(true);
      this.setUserAccountExist(true);
      //self.setToken(response.token);
      //self.setCurrent(1);
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

      localStorage.setItem('user',JSON.stringify(simpleUser));

      this.setUserAccountExist(true);

      this.setIsLogin(true);

      //localStorage.setItem

      //self.setToken(response.token);
      //self.setCurrent(2);
    }
  }

  processOTPVerification(response){
    if(response.status == 200){
      self.setToken(response.token);
      self.setCurrent(2);
      //self.setOTP(response.otp);
    }
  }

}

const self = new UserRegistration();
export default self;
