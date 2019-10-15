import { observable, action, intercept,computed } from 'mobx';
import { inject } from 'mobx-react';
import axios from 'axios';
import sessionstore from './session';
import { getCryptoBalance } from 'utils/cryptohelper';
import { getDatefromTimestamp,getUnixTime, isNullOrEmpty, numberWithCommas } from 'utils/helper';
import { createNotification,convertHexToDecimal } from 'utils/helper';
import Web3 from 'web3';
import intl from 'react-intl-universal';
import { toJS } from "mobx";
const { tokenabi } = require('../../../config/common/tokenabi');

const sampleacc = "0x90aD0aC0E687A2A6C9bc43BA7F373B9e50353084"; //ETH ADDR
const sampleprivatekey = "068CA0B2F09D8D92B49465C3D8D961C7DAE372BD9D1D4E39132A1A2A11616731"; //ETH PRIVATE KEY

const bip39 = require('bip39');
const HDKey = require('hdkey');
const ethUtil = require('ethereumjs-util');
const etherscanAPIKey = "Z92QFIY7SR8XYJQWHEIRVPNG92VZ274YS4";

var tokencontract = "";//this.networkstore.selectednetwork.contractaddr;//"0x221535cbced4c264e53373d81b73c29d010832a5"; //XMOO CONTRACDT
var web3Provider = "";//this.networkstore.selectednetwork.infuraendpoint; // "https://mainnet.infura.io:443";
var web3;
var Tx = require('ethereumjs-tx');
//var fs = require('fs');
var abiArray = tokenabi;//JSON.parse(fs.readFileSync(__dirname + '/containers/Config/tokenabi.json', 'utf-8'));

import languageIntl from '../stores/languageIntl';


class walletStore {
  @observable walletlist = [];
  @observable current = "selectedwallet";
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
  @observable TokenSparkLine = [];
  @observable primaryTokenAsset = [];
  @observable allTokenAsset = [];
  @observable convertrate = 1.34;
  @observable selectedassettokenlist = [];
  @observable totalassetworth = 0;
  @observable selectedTokenAsset = {};
  @observable basicwallettype = "";

  userstore = null;
  networkstore = null;

  constructor(){
  }

  setuserstore(store){
    this.userstore = store;
  }

  getthisstore(){
    return this;
  }

  setnetworkstore(store){
    this.networkstore = store;
    //console.log(this.networkstore.networklist);
    //console.log(this.networkstore.selectednetwork);

    tokencontract = this.networkstore.selectednetwork.contractaddr;//"0x221535cbced4c264e53373d81b73c29d010832a5"; //XMOO CONTRACDT
    web3Provider = this.networkstore.selectednetwork.infuraendpoint; // "https://mainnet.infura.io:443";
    //console.log(tokencontract);
    //console.log(web3Provider);
    web3 = new Web3(web3Provider);
  }

  @computed get selectedwalletlist(){
    // console.log("selectedwalletlist", JSON.stringify(this.walletlist));
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
    console.log(action);
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
      if(item.to != ""){
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
      }
    });

    this.multisigtrxlist.map((item, i) =>
    {

      var action = "approve";
      var signers = JSON.parse(JSON.stringify(item.Signers));
      console.log("SIGNERS",signers);
      
      //if(signers.includes(this.userstore.userid)){ //SIGNED 
      if(signers.find(x => x.UserId == this.userstore.userid) != null) { //SIGNED 
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
    // console.log(JSON.stringify(this.selectedwallet))
    // this.LoadTransactionByAddress(this.selectedwallet.publicaddress);
    // this.wsGetMultiSigTrx(this.selectedwallet.publicaddress);
    this.loadTokenAssetList();
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
    // Get ERC20 Token contract instance
    console.log(tokencontract);
    let contract = new web3.eth.Contract(abiArray, tokencontract);

    try{
      this.walletlist.forEach(function(wallet){
        web3.eth.call({
          to: tokencontract,
          data: contract.methods.balanceOf(wallet.publicaddress).encodeABI()
        }).then(balance => {  
          balance = balance / (10**18);
          wallet.rvx_balance = balance;
        })
      });
    }catch(e){}

      /*
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
      */

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
    console.log(val)
    this.current = val;
    // window.location.hash = `/${val}`;
  }

  @action setEmail(val) {
    this.email = val;
  }

  @action setUserAccountExist(val){
    sessionstore.setUserAccountExist(val);
  }

  @action setselectedTokenAsset(tokenasset){
    this.selectedTokenAsset = tokenasset;
  }

  @action async LoadTransactionByAddress(addr){
    axios({
      method: 'get',
      url: this.networkstore.selectednetwork.etherscanendpoint + '?module=account&action=txlist&address=' + addr + '&sort=desc&apikey=' + etherscanAPIKey,
      data: {}
    })
    .then(async function (response) {
      console.log("LoadTransactionByAddress", response.data.result);
      var rawtrxlist = response.data.result;

      rawtrxlist.map(async (item, i) =>
      {
        var tokenvalueinhex = item.input.slice(-32);
        if(self.selectedTokenAsset.TokenType != "eth"){
          item.value = convertHexToDecimal(tokenvalueinhex);
        }

        //var hash = item.hash;
        //var data = await web3.eth.getTransaction(hash);
        //console.log(hash);
        //console.log(tokenvalueinhex);
        //console.log(decoder.decodeData(data.input));
      });

      self.trxlist = rawtrxlist.filter(x => x.value != 0);
      //handle success
      //self.processUserRegistration(response.data);
    })
    .catch(function (response) {
        //handle error
        console.log(response);
    });
  }

  @action changeWalletName(walletpublicaddress,newwalletname){
    let wallet = this.walletlist.find(x => x.publicaddress == walletpublicaddress);
    wallet.walletname = newwalletname;
    localStorage.setItem('wallets',JSON.stringify(this.walletlist));
  }

  @action setWalletList(walletlist){
    localStorage.setItem('wallets',JSON.stringify(walletlist));
    //this.loadWallet();
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

  @action setBasicWalletType(type){
    this.basicwallettype = type;
  }

  // @computed get setTokenSparkLine(sparklinelist){
  //   let newsparkline = [];
  //   if(sparklinelist.length > 0){
  //     sparklinelist.map((item,index)=>{
  //       newsparkline.push(item.value);
  //     })
  //   }
  //   return newsparkline;
  // }

  wsRequestTransferOTP(){
    var bodyFormData = new FormData();
    bodyFormData.set('token', this.userstore.token);
    bodyFormData.set('smsnotification', false);
    
    var that = this;

    axios({
      method: 'post',
      url: 'http://rvxadmin.boxybanana.com/api/auth/RequestTransferTokenOTP',
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

  @action SaveWallet(ownerId,walletname,seedphase,privatekey,derivepath,publicaddress,addresstype,wallettype,totalowners,totalsignatures,holders){
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
      totalsignatures: parseInt(totalsignatures),
      holders: holders,
      ownerid:ownerId,
      isOwner:ownerId == this.userstore.userid,
      tokenassetlist:toJS(this.primaryTokenAsset),
      isCloud:wallettype == "basicwallet" ? this.basicwallettype == "local" ? false : true : true
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
    this.walletlist = localwallets;
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

    console.log(this.basicwallettype);
    if(this.basicwallettype == "cloud"){
      this.CreateBasicWalletOnCloud(()=>{
        // for make sure when call api store wallet is success, in order to save in local storage
        this.SaveWallet(this.userstore.userid,this.walletname,seedval,addrNode._privateKey.toString('hex'),derivepath,address,"eth",this.selectedwallettype,this.totalowners,this.totalsignatures,[{ "UserId": this.userstore.userid, "UserName": this.userstore.name }]);
      })
    }else{
      this.SaveWallet(this.userstore.userid,this.walletname,seedval,addrNode._privateKey.toString('hex'),derivepath,address,"eth",this.selectedwallettype,this.totalowners,this.totalsignatures,[{ "UserId": this.userstore.userid, "UserName": this.userstore.name }]);
    }

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

      this.SaveWallet(this.userstore.userid,this.walletname,seedval,this.restoreprivatekey.toString('hex'),derivepath,address,"eth","basicwallet",0,0,[]);
      this.setCurrent("walletcreated");
    }catch(e){
      console.log(e);
      createNotification('error',intl.get('Error.InvalidPrivateKey'));
    }

  }

  async CreateHWWallet(walletname,publicaddress,derivepath,tokentype,wallettype){
    try{
      this.SaveWallet(this.userstore.userid,walletname,"","",derivepath,publicaddress,tokentype,wallettype,0,0,[{ "UserId": this.userstore.userid, "UserName": this.userstore.name }]);
      createNotification('success',intl.get('Wallet.AddedNewAssetToken').replace("{code",publicaddress));
    }catch(e){
      console.log(e);
      createNotification('error',intl.get('Error.Error'));
    }

  }

  generate12SeedPhase = () => {
    let mnemonic = "";
    let selectedwordlist = bip39.wordlists.english;
    // console.log(languageIntl.language)
    if(languageIntl.language == "zh_CN") selectedwordlist = bip39.wordlists.chinese_simplified;
    if(languageIntl.language == "zh_TW") selectedwordlist = bip39.wordlists.chinese_traditional;
    // console.log("generate12SeedPhase", languageIntl.language)
    mnemonic = bip39.generateMnemonic(null,null,selectedwordlist);
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
    bodyFormData.set('network', this.networkstore.selectednetwork.shortcode);

    axios({
      method: 'post',
      url: 'http://rvxadmin.boxybanana.com/api/multisig/CreateTrx',
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
    // console.log("wsGetMultiSigTrx")
    var bodyFormData = new FormData();
    bodyFormData.set('walletpublicaddress', walletpublicaddress);
    bodyFormData.set('token', this.userstore.token);
    bodyFormData.set('network', this.networkstore.selectednetwork.shortcode);
    
    axios({
      method: 'post',
      url: 'http://rvxadmin.boxybanana.com/api/multisig/GetMultiSigTrxByWalletPublicAddress',
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
      createNotification('info',intl.get('Info.Waiting'));

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
          "chainId": this.networkstore.chainid
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
    bodyFormData.set('network', this.networkstore.selectednetwork.shortcode);
    
    console.log(trxid);
    console.log(this.userstore.token);

    axios({
      method: 'post',
      url: 'http://rvxadmin.boxybanana.com/api/multisig/ApproveTrx',
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
    bodyFormData.set('network', this.networkstore.selectednetwork.shortcode);
    axios({
      method: 'post',
      url: 'http://rvxadmin.boxybanana.com/api/multisig/GetMultiSigTrxLogByTrxID',
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

  CreateBasicWalletOnCloud = (cb) =>{
    // console.log(acctoken,walletinfo)
    var bodyFormData = new FormData();
    bodyFormData.append('token', this.userstore.token);
    bodyFormData.append('walletname', this.walletname);
    bodyFormData.append('seedphase', this.seedphaseinstring);
    bodyFormData.append('privatekey', this.privateaddress);
    bodyFormData.append('derivepath', this.derivepath);
    bodyFormData.append('publicaddress', this.publicaddress);
    bodyFormData.append('addresstype', "eth");
    bodyFormData.append('network', this.networkstore.selectednetwork.shortcode);

    axios({
      method: 'post',
      url: 'http://rvxadmin.boxybanana.com/api/multisig/CreateBasicWallet',
      data: bodyFormData,
      config: { headers: {'Content-Type': 'multipart/form-data' }}
    })
    .then(function (response) {
        //handle success
        console.log("CreateBasicWalletOnCloud",response);
        if(response.data.status == 200){
          cb();
        }
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
    bodyFormData.set('holders', [{ "UserId": this.userstore.userid, "UserName": this.userstore.name }]);
    bodyFormData.set('network', this.networkstore.selectednetwork.shortcode);
    
    axios({
      method: 'post',
      url: 'http://rvxadmin.boxybanana.com/api/multisig/CreateMultiSigWallet',
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
    bodyFormData.set('network', this.networkstore.selectednetwork.shortcode);
    
    axios({
      method: 'post',
      url: 'http://rvxadmin.boxybanana.com/api/multisig/JoinMultiSigWallet',
      data: bodyFormData,
      config: { headers: {'Content-Type': 'multipart/form-data' }}
    })
    .then(function (response) {
        //handle success
        console.log(response);
        if(response.data.status == 200){
          console.log("SUCCESS", response.data);
          var wallet = response.data.wallet;
          self.SaveWallet(wallet.OwnerId,wallet.WalletName,wallet.Seedphase,wallet.PrivateAddress,wallet.DerivePath,wallet.PublicAddress,wallet.AddressType,"sharedwallet",wallet.NumbersOfOwners,wallet.NumbersOfSigners,wallet.Holders);
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

  getTokenSparkLineByAssetCode(crypto){
    var bodyFormData = new FormData();
    bodyFormData.set('crypto', crypto);
    bodyFormData.set('token', this.userstore.token);

    axios({
      method: 'post',
      url: 'http://rvxadmin.boxybanana.com/api/token/GetTokenSparkLine',
      data: bodyFormData,
      config: { headers: {'Content-Type': 'multipart/form-data' }}
    })
    .then(function (response) {
        //handle success //response.sparkline.sparkline
        // console.log(response);
        if(response.data.status == 200){
          // console.log("SUCCESS", response.data);
          let newsparkline = [];
          let sparklinelist = response.data.sparkline.sparkline;
          self.TokenSparkLine = sparklinelist;
          // if(sparklinelist.length > 0){
          //   sparklinelist.map((item,index)=>{
          //     newsparkline.push(item.value);
          //   })
          //   self.TokenSparkLine = newsparkline;
          //   console.log("getTokenSparkLineByAssetCode", self.TokenSparkLine);
          // }

        }else{
          createNotification('error',intl.get('Error.' + response.data.msg));
        }
        // console.log(response);
    })
    .catch(function (response) {
        //handle error
        createNotification('error','Error.' + intl.get(response.data.msg));
        console.log(response);
    });
  }

  GetPrimaryTokenAssetByNetwork(){
    var bodyFormData = new FormData();
    bodyFormData.set('token', this.userstore.token);
    bodyFormData.set('network', this.networkstore.selectednetwork.shortcode);

    axios({
      method: 'post',
      url: 'http://rvxadmin.boxybanana.com/api/token/GetPrimaryTokenAssetByNetwork',
      data: bodyFormData,
      config: { headers: {'Content-Type': 'multipart/form-data' }}
    })
    .then(function (response) {
        if(response.data.status == 200){
          self.primaryTokenAsset = response.data.tokenassetlist;
        }else{
          createNotification('error',intl.get('Error.' + response.data.msg));
        }
        console.log("GetPrimaryTokenAssetByNetwork", response);
    })
    .catch(function (response) {
        //handle error
        createNotification('error','Error.' + intl.get(response.data.msg));
        console.log(response);
    });
  }

  GetAllTokenAssetByNetwork(){
    var bodyFormData = new FormData();
    bodyFormData.set('token', this.userstore.token);
    bodyFormData.set('network', this.networkstore.selectednetwork.shortcode);

    axios({
      method: 'post',
      url: 'http://rvxadmin.boxybanana.com/api/token/GetAllTokenAssetByNetwork',
      data: bodyFormData,
      config: { headers: {'Content-Type': 'multipart/form-data' }}
    })
    .then(function (response) {
        if(response.data.status == 200){
          self.allTokenAsset = response.data.tokenassetlist;
        }else{
          createNotification('error',intl.get('Error.' + response.data.msg));
        }
        console.log("GetPrimaryTokenAssetByNetwork", response);
    })
    .catch(function (response) {
        //handle error
        createNotification('error','Error.' + intl.get(response.data.msg));
        console.log(response);
    });
  }

  loadTokenAssetList = () =>{
    self.selectedassettokenlist = [];
    self.totalassetworth = 0;
    const web3 = new Web3(this.networkstore.selectednetwork.infuraendpoint);
    this.selectedwallet.tokenassetlist.map(async(tokenitem,index) =>{
      // console.log("tokenitem.TokenType" , tokenitem.TokenType)
      if(tokenitem.TokenType == "eth"){
        web3.eth.getBalance(this.selectedwallet.publicaddress).then(balance => { 
          balance = balance / (10**18);
          tokenitem.TokenBalance = balance;
          self.totalassetworth += (this.convertrate * balance);
        })
      }else{
        var TokenInfo = tokenitem.TokenInfoList.find(x => x.Network == this.networkstore.selectednetwork.shortcode);
        TokenInfo = toJS(TokenInfo);
        var tokenAbiArray = JSON.parse(TokenInfo.AbiArray);
        // Get ERC20 Token contract instance
        let contract = new web3.eth.Contract(tokenAbiArray, TokenInfo.ContractAddress);
        web3.eth.call({
          to: !isNullOrEmpty(TokenInfo.ContractAddress) ? TokenInfo.ContractAddress : null,
          data: contract.methods.balanceOf(this.selectedwallet.publicaddress).encodeABI()
        }).then(balance => {  
          balance = balance / (10**18);
          tokenitem.TokenBalance = balance;
          self.totalassetworth += (this.convertrate * balance);
        });
        self.selectedassettokenlist.push(tokenitem);
      }
    });
  }

  InsertTokenAssetToCloudWallet(tokenasset,cb){
    var bodyFormData = new FormData();
    bodyFormData.set('token', this.userstore.token);
    bodyFormData.set('publicaddress', this.selectedwallet.publicaddress);
    bodyFormData.set('shortcode', tokenasset.AssetCode.toUpperCase());
    bodyFormData.set('network', this.networkstore.selectednetwork.shortcode);

    axios({
      method: 'post',
      url: 'http://rvxadmin.boxybanana.com/api/token/InsertTokenAssetToCloudWallet',
      data: bodyFormData,
      config: { headers: {'Content-Type': 'multipart/form-data' }}
    })
    .then(function (response) {
      console.log(response);
        if(response.data.status == 200){
          cb();
        }else{
          createNotification('error',intl.get('Error.' + response.data.msg));
        }
    })
    .catch(function (response) {
        //handle error
        createNotification('error','Error.' + intl.get(response.data.msg));
        console.log(response);
    });
  }

  RemoveTokenAssetInCloudWallet(cb){
    var bodyFormData = new FormData();
    bodyFormData.set('token', this.userstore.token);
    bodyFormData.set('publicaddress', this.selectedwallet.publicaddress);
    bodyFormData.set('shortcode', this.selectedTokenAsset.AssetCode.toUpperCase());
    bodyFormData.set('network', this.networkstore.selectednetwork.shortcode);

    axios({
      method: 'post',
      url: 'http://rvxadmin.boxybanana.com/api/token/RemoveTokenAssetInCloudWallet',
      data: bodyFormData,
      config: { headers: {'Content-Type': 'multipart/form-data' }}
    })
    .then(function (response) {
      console.log(response);
        if(response.data.status == 200){
          cb();
        }else{
          createNotification('error',intl.get('Error.' + response.data.msg));
        }
    })
    .catch(function (response) {
        //handle error
        createNotification('error','Error.' + intl.get(response.data.msg));
        console.log(response);
    });
  }

  @action getTotalWorth(selectedWallet){
    var totalworth = 0;
    if(selectedWallet.tokenassetlist.length > 0){
      selectedWallet.tokenassetlist.map((asset,index)=>{
        totalworth += asset.TokenBalance;
      })
    }
    return `$${numberWithCommas(parseFloat(!isNaN(this.convertrate * totalworth) ? this.convertrate * totalworth : 0),true)}`;
  }

  @action ExitMultiSigWallet(publicaddress,cb){
    var bodyFormData = new FormData();
    bodyFormData.set('token', this.userstore.token);
    bodyFormData.set('walletpublicaddress', publicaddress);
    bodyFormData.set('network', this.networkstore.selectednetwork.shortcode);

    axios({
      method: 'post',
      url: 'http://rvxadmin.boxybanana.com/api/multisig/ExitMultiSigWallet',
      data: bodyFormData,
      config: { headers: {'Content-Type': 'multipart/form-data' }}
    })
    .then(function (response) {
      console.log(response);
        if(response.data.status == 200){
          cb();
        }else{
          createNotification('error',intl.get('Error.' + response.data.msg));
        }
    })
    .catch(function (response) {
        //handle error
        createNotification('error','Error.' + intl.get(response.data.msg));
        console.log(response);
    });
  }

  @action RemoveMultiSigWallet(publicaddress,cb){
    var bodyFormData = new FormData();
    bodyFormData.set('token', this.userstore.token);
    bodyFormData.set('walletpublicaddress', publicaddress);
    bodyFormData.set('network', this.networkstore.selectednetwork.shortcode);

    axios({
      method: 'post',
      url: 'http://rvxadmin.boxybanana.com/api/multisig/RemoveMultiSigWallet',
      data: bodyFormData,
      config: { headers: {'Content-Type': 'multipart/form-data' }}
    })
    .then(function (response) {
      console.log(response);
        if(response.data.status == 200){
          cb();
        }else{
          createNotification('error',intl.get('Error.' + response.data.msg));
        }
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
