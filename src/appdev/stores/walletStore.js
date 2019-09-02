import { observable, action, intercept,computed } from 'mobx';
import { inject } from 'mobx-react';
import axios from 'axios';
import sessionstore from './session';
import { getCryptoBalance } from 'utils/cryptohelper';
import { getDatefromTimestamp,getUnixTime } from 'utils/helper';
import { createNotification } from 'utils/helper';
import Web3 from 'web3';
import intl from 'react-intl-universal';
import { toJS } from "mobx";

const chainid = 0x01; //0x03
const bip39 = require('bip39');
const HDKey = require('hdkey');
const ethUtil = require('ethereumjs-util');
const cryptobalanceurl = "https://api.tokenbalance.com/token/{tokencontract}/{ethaddr}";
const tokencontract = "0x221535cbced4c264e53373d81b73c29d010832a5"; //XMOO CONTRACDT
const sampleacc = "0x90aD0aC0E687A2A6C9bc43BA7F373B9e50353084"; //ETH ADDR
const sampleprivatekey = "068CA0B2F09D8D92B49465C3D8D961C7DAE372BD9D1D4E39132A1A2A11616731"; //ETH PRIVATE KEY
const etherscanAPIKey = "Z92QFIY7SR8XYJQWHEIRVPNG92VZ274YS4";
const web3Provider = "https://mainnet.infura.io:443";

var Tx = require('ethereumjs-tx');
var fs = require('fs');



class walletStore {
  @observable walletlist = [];
  @observable current = "walletdetail";
  @observable walletname = "";
  @observable seedphase = [];
  @observable seedphaseinstring = "";
  @observable ethaddress = [];
  @observable wallettype = "";
  @observable derivepath = "";
  @observable selectedwallet = {};
  @observable totalowners = 0;
  @observable totalsignatures = 0;
  @observable trxlist = [];
  @observable multisigtrxlist = [];
  @observable multisigtrxloglist = [];
  @observable publicaddress = "";
  @observable privateaddress = "";
  @observable WalletEntryNextDirection = "";
  @observable trxdetail = {};
  @observable selectedwallettype = "basicwallet";
  @observable tokentransfertoken = 0;
  @observable tokentransferreceiver = "";
  @observable hideautocomplete = false;
  @observable otptransfertoken = "";
  @observable successulhash = "";
  @observable selectedimporttype = "";
  @observable restoreseedphrase = "";
  @observable restoreprivatekey = "";
  

  userstore = null;

  constructor(){
  }

  setuserstore(store){
    this.userstore = store;
  }

  @computed get selectedwalletlist(){
    var walletlist = this.walletlist.filter(x => x.wallettype == this.selectedwallettype);
    if(walletlist == null) walletlist = [];
    return walletlist;
  }

  @action sethideautocomplete(val){
    this.hideautocomplete = val;
  }

  @action setRestoreSeedPhrase(val){
    this.restoreseedphrase = val;
  }

  @action setRestorePrivateKey(val){
    this.restoreprivatekey = val;
  }

  @action setselectedimporttype(val){
    this.selectedimporttype = val;
  }


  @action settokentransfervalue(token,receiver){
    this.tokentransfertoken = token;
    this.tokentransferreceiver = receiver;
  }

  @action setsuccessulhash(hash){
    this.successulhash = hash;
  }

  @action setotptransfertoken(otptoken){
    this.otptransfertoken = otptoken;
  }

  @action settrxdetail(block,hash,from,to,value,action,gasprice,gasused,timestamp,nonce,confirmation,signers){
    this.trxdetail = {
      block : block,
      hash : hash,
      from : from,
      to : to,
      value : value,
      action : action,
      gasprice : gasprice,
      gasused : gasused,
      timestamp : timestamp,
      nonce : nonce,
      confirmation : confirmation,
      signers : signers
    };
  }

  @action clearSelectedWallet(){
    this.selectedwallet = {};
  }

  @action setselectedwallettype(wallettype){
    this.selectedwallettype = wallettype;
  }

  @computed get gettrxlist(){
    var finallist = [];
    this.trxlist.map((item, i) =>
    {
      var trx = {
        trxid : item.hash,
        from : item.from,
        to : item.to,
        block : item.blockNumber,
        gasprice : item.gasPrice,
        gasused : item.gasUsed,
        nonce : item.nonce,
        timestamp : item.timeStamp,
        value : Web3.utils.fromWei(item.value, 'ether'),
        confirmation : item.confirmations,
        status : this.ParseTrxStatus(item.txreceipt_status),
        isblockchain : true,
        action : "",
        signers : []
      }

      finallist.push(trx);
    });

    this.multisigtrxlist.map((item, i) =>
    {

      var action = "approve";
      var signers = JSON.parse(JSON.stringify(item.Signers));
      console.log("SIGNERS",signers);
      
      if(signers.includes(this.userstore.userid)){ //SIGNED 
        action = "approved"
      }

      if(item.Status == "completed") action = "completed";

      var trx = {
        trxid : item.TrxId,
        from : item.FromWalletPublicAddress,
        to : item.ToWalletPublicAddress,
        block : "",
        gasprice : 0,
        gasused : 0,
        nonce : 0,
        timestamp : getUnixTime(new Date(item.dt)),
        value : item.Total,
        confirmation : 0,
        status : item.Status,
        isblockchain : false,
        action : action,
        signers : signers
      }

      finallist.push(trx);
    });

    return finallist;

  }

  @action setSelectedWallet(publicaddress){
    this.selectedwallet = this.walletlist.find(x=>x.publicaddress == publicaddress);
    this.LoadTransactionByAddress(this.selectedwallet.publicaddress);
    this.wsGetMultiSigTrx(this.selectedwallet.publicaddress);
    //this.current = "walletdetail";
  }

  @action setWalletType(wallettype){
    this.wallettype = wallettype;
  }

  @action setTotalSignatures(totalsignatures){
    this.totalsignatures = totalsignatures;
  }

  @action setTotalOwners(totalowners){
    this.totalowners = totalowners;
  }

  @action setWalletName(walletname){
    this.walletname = walletname;
  }

  @action loadWallet(){
    this.walletlist = localStorage.getItem("wallets");
    if(this.walletlist != null){
      this.walletlist = JSON.parse(this.walletlist);
    }else{
      this.walletlist = [];
    }

    this.walletlist = toJS(this.walletlist);

    this.walletlist = this.walletlist.filter(x=>x.userid === this.userstore.userid);

    //if(this.walletlist.length > 0){
    //  this.walletlist[0].publicaddress = sampleacc;
    //  this.walletlist[0].privatekey = sampleprivatekey;
    //}

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

  @action setWalletEntryNextDirection(val) {
    this.WalletEntryNextDirection = val;
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

  ParseTrxStatus(status){
    if(status == "0"){
      return "Failed";
    }else{
      return "Success";
    }
  }

  @action removeWallet(publicaddress){
    const filterwalletlist = this.walletlist.filter(x => x.publicaddress !== publicaddress);
    this.walletlist = filterwalletlist;
    console.log(this.walletlist);
    localStorage.setItem('wallets',JSON.stringify(this.walletlist));

  }

  wsRequestTransferOTP(){
    var bodyFormData = new FormData();
    bodyFormData.set('token', this.userstore.token);
    
    var that = this;

    axios({
      method: 'post',
      url: 'http://rvx.boxybanana.com/api/auth/RequestTransferTokenOTP',
      data: bodyFormData,
      config: { headers: {'Content-Type': 'multipart/form-data' }}
    })
    .then(function (response) {
        //handle success
        console.log(response.data.otp);
        that.setotptransfertoken(response.data.otp);
        //self.processUserRegistration(response.data);
    })
    .catch(function (response) {
        //handle error
        that.setotptransfertoken("");
        createNotification('error',response);
        console.log(response);
    });
  }

  SaveWallet(walletname,seedphase,privatekey,derivepath,publicaddress,addresstype,wallettype,totalowners,totalsignatures){
    var wallet = {
      walletname : walletname,
      userid : this.userstore.userid,
      seedphase : seedphase,
      privatekey : privatekey,
      derivepath : derivepath,
      publicaddress : publicaddress,
      addresstype : addresstype,
      wallettype : wallettype,
      totalowners: parseInt(totalowners),
      totalsignatures: parseInt(totalsignatures)
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
    this.loadWallet();
    this.setSelectedWallet(publicaddress);
  }

  async CreateEthAddress(){
    //this.seedphaseinstring = "scene brain typical travel fire error danger domain athlete initial salad video";
    var seedval = this.seedphaseinstring;//"allow result spell hip million juice era garden trigger dwarf disease unable";
    const seed = await bip39.mnemonicToSeed(seedval);
    //console.log(seed);
    var hdkey = HDKey.fromMasterSeed(new Buffer(seed, 'hex'));
    const masterPrivateKey = hdkey.privateKey.toString('hex');
    //console.log("Master Private Key",masterPrivateKey);
    const derivepath = "m/44'/60'/0'/0/0";
    this.derivepath = derivepath;

    const addrNode = hdkey.derive(derivepath);
    this.privateaddress = addrNode._privateKey.toString('hex');

    //console.log("private key addr", addrNode._privateKey.toString('hex'));

    const pubKey = ethUtil.privateToPublic(addrNode._privateKey);
    //console.log("Pub Key",pubKey);

    const addr = ethUtil.publicToAddress(pubKey).toString('hex');
    console.log("addr",addr);

    const address = ethUtil.toChecksumAddress(addr);
    this.publicaddress = address;

    //console.log("address",address);

    this.SaveWallet(this.walletname,seedval,addrNode._privateKey.toString('hex'),derivepath,address,"eth",this.selectedwallettype,this.totalowners,this.totalsignatures);

    //console.log(hdkey);
    //console.log(hdkey.privateExtendedKey)
    //console.log(hdkey.publicExtendedKey);
  }

  async CreateEthAddressByPrivateKey(){
    //this.seedphaseinstring = "scene brain typical travel fire error danger domain athlete initial salad video";
    try{
      var seedval = "";//this.seedphaseinstring;//"allow result spell hip million juice era garden trigger dwarf disease unable";
      const seed = "";//await bip39.mnemonicToSeed(seedval);
      //console.log(seed);
      //var hdkey = HDKey.fromMasterSeed(new Buffer(seed, 'hex'));
      //const masterPrivateKey = this.restoreprivatekey.toString('hex');
      //console.log("Master Private Key",masterPrivateKey);
      const derivepath = "m/44'/60'/0'/0/0";
      //this.derivepath = derivepath;

     // const addrNode = hdkey.derive(derivepath);
     var privateaddress = new Buffer(this.restoreprivatekey, 'hex');

      //console.log("private key addr", addrNode._privateKey.toString('hex'));
      //console.log("Test0", this.restoreprivatekey);
      //console.log("TEST",privateaddress);
      const pubKey = ethUtil.privateToPublic(privateaddress);
      //console.log("Pub Key",pubKey);

      const addr = ethUtil.publicToAddress(pubKey).toString('hex');
      //console.log("addr",addr);

      const address = ethUtil.toChecksumAddress(addr);
      this.publicaddress = address;

      //console.log("address",address);

      this.SaveWallet(this.walletname,seedval,this.restoreprivatekey.toString('hex'),derivepath,address,"eth",this.selectedwallettype,0,0);
      this.setCurrent("walletcreated");
    }catch(e){
      console.log(e);
      createNotification('error',intl.get('Error.InvalidPrivateKey'));
    }

  }

  generate12SeedPhase = () => {
    let mnemonic = "";
    mnemonic = bip39.generateMnemonic();
    return mnemonic;
  }

  processOTPVerification(response){
    if(response.status == 200){
      self.setToken(response.token);
      self.setCurrent(2);
      //self.setOTP(response.otp);
    }
  }

  wsCreateTrx(fromwalletpublicaddress,towalletpublicaddress,totaltoken){
    var bodyFormData = new FormData();
    bodyFormData.set('fromwalletpublicaddress', fromwalletpublicaddress);
    bodyFormData.set('token', this.userstore.token);
    bodyFormData.set('towalletpublicaddress', towalletpublicaddress);
    bodyFormData.set('totaltoken', totaltoken);

    axios({
      method: 'post',
      url: 'http://rvx.boxybanana.com/api/multisig/CreateTrx',
      data: bodyFormData,
      config: { headers: {'Content-Type': 'multipart/form-data' }}
    })
    .then(function (response) {
        //handle success
        console.log(response);
        if(response.data.status == 200){
          self.wsGetMultiSigTrx(self.selectedwallet.publicaddress);
          self.setCurrent("tokentransfersuccessful");
        }else{
          createNotification('error',intl.get('ERROR.' + response.data.msg))
        }
    })
    .catch(function (response) {
        //handle error
        console.log(response);
        createNotification('error',intl.get('ERROR.' + response.data.msg))
    });
  }

  wsGetMultiSigTrx(walletpublicaddress){
    var bodyFormData = new FormData();
    bodyFormData.set('walletpublicaddress', walletpublicaddress);
    bodyFormData.set('token', this.userstore.token);
    
    axios({
      method: 'post',
      url: 'http://rvx.boxybanana.com/api/multisig/GetMultiSigTrxByWalletPublicAddress',
      data: bodyFormData,
      config: { headers: {'Content-Type': 'multipart/form-data' }}
    })
    .then(function (response) {
        //handle success
        self.multisigtrxlist = response.data.trx;
        console.log(self.multisigtrxlist);
    })
    .catch(function (response) {
        //handle error
        console.log(response);
    });
  }

  getCurrentGasPrices = async () => {
    let response = await axios.get("https://ethgasstation.info/json/ethgasAPI.json");

    let prices = {
      low : response.data.safeLow,
      medium : response.data.average,
      high : 45
    }
    return prices;
  }

  async wsApproveMultiSigTrx(trxid,to,total,isexecute){
    //EXECUTE BLOCKCHAIN TRANSFER
    
    if(isexecute){
      const web3 = new Web3(web3Provider);
      createNotification('info',intl.get('Info.Waiting'));

      var abiArray = JSON.parse(fs.readFileSync(__dirname + '/containers/Config/tokenabi.json', 'utf-8'));
      var count = await web3.eth.getTransactionCount(this.selectedwallet.publicaddress);
      var gasPrices = await this.getCurrentGasPrices();
      console.log(gasPrices);
      //var contractdata = new web3.eth.Contract(abiArray, tokencontract, {from: this.selectedwallet.publicaddress}); //).at(this.tokencontract);
      var contractdata = new web3.eth.Contract(abiArray, tokencontract);//, {from: this.selectedwallet.publicaddress}); //).at(this.tokencontract);
      var rawTransaction = {};
      try{
        rawTransaction = {
          "from": this.selectedwallet.publicaddress,
          "nonce": count,
          "gasPrice": gasPrices.high * 100000000,//"0x04e3b29200",
          "gas": web3.utils.toHex("519990"),//"0x7458",
          "gasLimit": web3.utils.toHex("519990"),//"0x7458",
          "to": tokencontract,
          "value": "0x0",//web3.utils.toHex(web3.utils.toWei(this.state.tokenval, 'ether')),
          "data": contractdata.methods.transfer(to,web3.utils.toWei(total, 'ether')).encodeABI(),//contract.transfer.getData(this.tokencontract, 10, {from: this.props.selectedwallet.publicaddress}),
          "chainId": chainid
        };

        var privKey = new Buffer(this.selectedwallet.privatekey, 'hex');

        var tx = new Tx(rawTransaction);
        tx.sign(privKey);
        var serializedTx = tx.serialize();
  
        web3.eth.sendSignedTransaction('0x' + serializedTx.toString('hex'), function(err, hash) {
          if (!err) { //SUCCESS
            console.log(hash);
            self.wsUpdateCompletedMultiSignTrx(trxid,false);
            self.setsuccessulhash(hash);
            self.setCurrent("tokentransfersuccessful");
          }else{
            //createNotification('error',e);
            createNotification('error',intl.get('Error.TransactionFailed'));
            console.log(err);
          }
        });    
      }catch(e){
        createNotification('error',intl.get('Error.TransactionFailed'));
        console.log("ERR",e);
      }
    }else{
      this.wsUpdateCompletedMultiSignTrx(trxid,true);
    }
  }

  wsUpdateCompletedMultiSignTrx(trxid,isredirect){
    var bodyFormData = new FormData();
    bodyFormData.set('trxhash', trxid);
    bodyFormData.set('token', this.userstore.token);
    
    console.log(trxid);
    console.log(this.userstore.token);

    axios({
      method: 'post',
      url: 'http://rvx.boxybanana.com/api/multisig/ApproveTrx',
      data: bodyFormData,
      config: { headers: {'Content-Type': 'multipart/form-data' }}
    })
    .then(function (response) {
      console.log(response);
      if(response.data.status == 200){
        if(isredirect){
          console.log(response.data);
          self.setsuccessulhash(response.data.trx.TrxId);
          self.setCurrent("tokentransfersuccessful");
        }
      }else{
        createNotification('error',intl.get("Error." + response.data.msg));
      }
    })
    .catch(function (response) {
        //handle error
        console.log(response);
        createNotification('error',intl.get("Error." + response.data.msg));
    });
  }

  wsGetMultiSigTrxLog(trxid){
    var bodyFormData = new FormData();
    bodyFormData.set('trxid', trxid);
    bodyFormData.set('token', this.userstore.token);
    axios({
      method: 'post',
      url: 'http://rvx.boxybanana.com/api/multisig/GetMultiSigTrxLogByTrxID',
      data: bodyFormData,
      config: { headers: {'Content-Type': 'multipart/form-data' }}
    })
    .then(function (response) {
        //handle success
        console.log(response.data);
        self.multisigtrxloglist = response.data.log;
    })
    .catch(function (response) {
        //handle error
        console.log(response);
    });
  }

  wsCreateWallet(){
    var bodyFormData = new FormData();
    bodyFormData.set('walletname', this.walletname);
    bodyFormData.set('token', this.userstore.token);
    bodyFormData.set('seedphase', this.seedphaseinstring);
    bodyFormData.set('privatekey', this.privateaddress);
    bodyFormData.set('derivepath', this.derivepath);
    bodyFormData.set('publicaddress', this.publicaddress);
    bodyFormData.set('addresstype', "eth");
    bodyFormData.set('totalowners', this.totalowners);
    bodyFormData.set('totalsignatures', this.totalsignatures);
    
    axios({
      method: 'post',
      url: 'http://rvx.boxybanana.com/api/multisig/CreateMultiSigWallet',
      data: bodyFormData,
      config: { headers: {'Content-Type': 'multipart/form-data' }}
    })
    .then(function (response) {
        //handle success
        console.log(response);
    })
    .catch(function (response) {
        //handle error
        console.log(response);
    });
  }

  wsJoinWallet(walletpublicaddress){
    var bodyFormData = new FormData();
    bodyFormData.set('walletpublicaddress', walletpublicaddress);
    bodyFormData.set('token', this.userstore.token);
    
    axios({
      method: 'post',
      url: 'http://rvx.boxybanana.com/api/multisig/JoinMultiSigWallet',
      data: bodyFormData,
      config: { headers: {'Content-Type': 'multipart/form-data' }}
    })
    .then(function (response) {
        //handle success
        console.log(response);
        if(response.data.status == 200){
          console.log("SUCCESS", response.data);
          var wallet = response.data.wallet;
          self.SaveWallet(wallet.WalletName,wallet.Seedphase,wallet.PrivateAddress,wallet.DerivePath,wallet.PublicAddress,wallet.AddressType,"sharedwallet",wallet.NumbersOfOwners,wallet.NumbersOfSigners);
          self.setCurrent("walletcreated");
        }else{
          createNotification('error',intl.get('Error.' + response.data.msg));
        }
        console.log(response);
    })
    .catch(function (response) {
        //handle error
        createNotification('error','Error.' + intl.get(response.data.msg));
        console.log(response);
    });
  }

}

const self = new walletStore();
export default self;
