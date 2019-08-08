import { observable, action } from 'mobx';
import { inject } from 'mobx-react';
import axios from 'axios';
import sessionstore from './session';
import userstore from './UserRegistration';

const bip39 = require('bip39');
const HDKey = require('hdkey');
const ethUtil = require('ethereumjs-util');

class WalletCreation {
  @observable walletlist = [];
  @observable current = 0;
  @observable seedphase = [];
  @observable seedphaseinstring = "";
  @observable ethaddress = [];

  @action setEthAddress(val) {
    this.ethaddress.push(val);
  }

  @action setSeedPhase(val) {
    this.seedphase = val;
  }

  @action setSeedPhaseInString(val) {
    this.seedphaseinstring = val;
  }

  @action setCurrent(val) {
    this.current = val;
  }

  @action setEmail(val) {
    this.email = val;
  }

  @action setUserAccountExist(val){
    sessionstore.setUserAccountExist(val);
  }

  SaveWallet(seedphase,privatekey,derivepath,publicaddress,addresstype){
    var wallet = {
      userid : userstore.userid,
      seedphase : seedphase,
      privatekey : privatekey,
      derivepath : derivepath,
      publicaddress : publicaddress,
      addresstype : addresstype
    };

    var localwallets = [];
    localwallets = localStorage.getItem('wallets');
    if(localwallets == null){
      localwallets = [];
    }else{
      localwallets = JSON.parse(localwallets);
    }
    localwallets.push(wallet);

    localStorage.setItem('wallets',JSON.stringify(localwallets));
  }

  async CreateEthAddress(){
    var seedval = this.seedphaseinstring;//"allow result spell hip million juice era garden trigger dwarf disease unable";
    const seed = await bip39.mnemonicToSeed(seedval);
    //console.log(seed);
    var hdkey = HDKey.fromMasterSeed(new Buffer(seed, 'hex'));
    const masterPrivateKey = hdkey.privateKey.toString('hex');
    //console.log("Master Private Key",masterPrivateKey);
    const derivepath = "m/44'/60'/0'/0/0";
    const addrNode = hdkey.derive(derivepath);

    //console.log("private key addr", addrNode._privateKey.toString('hex'));

    const pubKey = ethUtil.privateToPublic(addrNode._privateKey);
    //console.log("Pub Key",pubKey);

    const addr = ethUtil.publicToAddress(pubKey).toString('hex');
    //console.log("addr",addr);

    const address = ethUtil.toChecksumAddress(addr);
    //console.log("address",address);

    this.SaveWallet(seedval,addrNode._privateKey.toString('hex'),derivepath,address,"eth");

    //console.log(hdkey);
    //console.log(hdkey.privateExtendedKey)
    //console.log(hdkey.publicExtendedKey);
  }

  CreateSeedPhase(){
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

  processOTPVerification(response){
    if(response.status == 200){
      self.setToken(response.token);
      self.setCurrent(2);
      //self.setOTP(response.otp);
    }
  }

}

const self = new WalletCreation();
export default self;
