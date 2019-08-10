import { observable, action } from 'mobx';
import { inject } from 'mobx-react';
import axios from 'axios';
import sessionstore from './session';
import userstore from './UserRegistration';
import { getCryptoBalance } from 'utils/cryptohelper';


const bip39 = require('bip39');
const HDKey = require('hdkey');
const ethUtil = require('ethereumjs-util');
const cryptobalanceurl = "https://api.tokenbalance.com/token/{tokencontract}/{ethaddr}";
const tokencontract = "0x221535cbced4c264e53373d81b73c29d010832a5"; //XMOO CONTRACDT
const sampleacc = "0x90aD0aC0E687A2A6C9bc43BA7F373B9e50353084"; //ETH ADDR
const sampleprivatekey = "068CA0B2F09D8D92B49465C3D8D961C7DAE372BD9D1D4E39132A1A2A11616731"; //ETH PRIVATE KEY
const etherscanAPIKey = "Z92QFIY7SR8XYJQWHEIRVPNG92VZ274YS4";

class walletStore {
  @observable walletlist = [];
  @observable current = 0;
  @observable seedphase = [];
  @observable seedphaseinstring = "";
  @observable ethaddress = [];
  @observable selectedwallet = {};
  @observable trxlist = [];

  @action setSelectedWallet(walletindex){
    this.current = 4;
    this.selectedwallet = this.walletlist[walletindex];
    this.LoadTransactionByAddress(this.selectedwallet.publicaddress);
  }

  @action loadWallet(){
    this.walletlist = localStorage.getItem("wallets");
    if(this.walletlist != null){
      this.walletlist = JSON.parse(this.walletlist);
    }else{
      this.walletlist = [];
    }

    this.walletlist[0].publicaddress = sampleacc;
    this.walletlist[0].privatekey = sampleprivatekey;

    this.walletlist.forEach(function(wallet){
      console.log(wallet);
      var url = cryptobalanceurl.replace("{tokencontract}", tokencontract).replace("{ethaddr}",wallet.publicaddress);

      axios({
        method: 'get',
        url: url,
        config: { headers: {'Content-Type': 'application/json' }}
      })
      .then(function (response) {
          //handle success
          wallet.rvx_balance = response.data.balance;
          console.log(wallet.rvx_balance);
          //self.processUserRegistration(response.data);
      })
      .catch(function (response) {
          //handle error
          console.log(response);
      });
    });

    //    getCryptoBalance();

    //return walletlist;
  }

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

  @action LoadTransactionByAddress(addr){
    axios({
      method: 'get',
      url: 'http://api.etherscan.io/api?module=account&action=txlist&address=' + addr + '&sort=desc&apikey=' + etherscanAPIKey,
      data: {}
    })
    .then(function (response) {
      console.log(response.data.result);
      self.trxlist = response.data.result;
      //handle success
      //self.processUserRegistration(response.data);
    })
    .catch(function (response) {
        //handle error
        console.log(response);
    });
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

const self = new walletStore();
export default self;
