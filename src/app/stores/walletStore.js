import {action, computed, observable, toJS} from 'mobx';
import axios from 'axios';
import sessionstore from './session';
import {convertHexToDecimal, createNotification, getUnixTime, isNullOrEmpty, numberWithCommas} from 'utils/helper';
import Web3 from 'web3';
import intl from 'react-intl-universal';
import iWanUtils from '../utils/iwanUtils';
import languageIntl from '../stores/languageIntl';

const {API_Server, API_EthGas, BIP44PATH, etherscanAPIKey, aespassword} = require('../../../config/common/index');
var wanTx = require('wanchain-util').wanchainTx;
var Tx = require('ethereumjs-tx');
const bip39 = require('bip39');
const HDKey = require('hdkey');
const ethUtil = require('ethereumjs-util');
var bcrypt = require('bcryptjs');
var Crypto = require('crypto'),
    algorithm = 'aes-256-ctr';
const addrOffset = 0
const BIP44PATHs = {
    WAN: "m/44'/5718350'/0'/0/"
}
//var iv,key


//import { getCryptoBalance } from 'utils/cryptohelper';
//var fs = require('fs');
//const { tokenabi } = require('../../../config/common/tokenabi');
//var abiArray = tokenabi;//JSON.parse(fs.readFileSync(__dirname + '/containers/Config/tokenabi.json', 'utf-8'));


class walletStore {
    @observable walletlist = [];
    @observable current = "selectedwallet";
    @observable walletname = "";
    @observable seedphase = [];
    @observable seedphaseinstring = "";
    @observable seedphaseinstringtemp = "";
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
    @observable selectedwallettype = "local";
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
    @observable convertrate = 0;
    @observable convertratecny = 0;
    @observable selectedassettokenlist = [];
    @observable totalassetworth = 0;
    @observable selectedTokenAsset = {};
    @observable basicwallettype = "";
    @observable ledgerresult = {};
    @observable HWWalletType = "";
    @observable mnemonicpassword = "";
    @observable mnemonicpasswordconfirm = "";
    @observable currentGasPrice = 100;
    @observable infuraprojectid = "/v3/5bc9db68fd43445fbc2e6a5b5f269687";
    @observable pendingpassword = "";
    @observable googleAuthKeyPending = "";
    @observable googleAuthKey = "";
    @observable mfaenabled;

    userstore = null;
    networkstore = null;
    iv;
    key;

    constructor() {
    }

    @computed get selectedwalletlist() {
        // console.log("selectedwalletlist", JSON.stringify(this.walletlist));
        var walletlist = this.walletlist.filter(x => x.wallettype == this.selectedwallettype);
        console.log(walletlist);
        if (walletlist == null) walletlist = [];
        return walletlist;
    }

    @computed get convertRate() {
        return this.convertrate;
    }

    @computed get convertRateCNY() {
        return this.convertratecny;
    }

    @computed get getmnemonicPassword() {
        return this.mnemonicpassword;
    }

    @computed get gettrxlist() {
        var finallist = [];
        this.trxlist.map((item, i) => {
            if (item.to != "") {
                var trx = {
                    trxid: item.hash,
                    from: item.from,
                    to: item.to,
                    block: item.blockNumber,
                    gasprice: (this.selectedTokenAsset.TokenType == "wrc20" || this.selectedTokenAsset.TokenType == "wan") ? (item.gasPrice / 1000000000) + " gwin" : (item.gasPrice / 1000000000) + " gwei",
                    gasused: (this.selectedTokenAsset.TokenType == "wrc20" || this.selectedTokenAsset.TokenType == "wan") ? (item.gas / 1000000000) + " gwin" : (item.gasUsed / 1000000000) + " gwei",
                    nonce: item.nonce,
                    timestamp: item.timeStamp,
                    value: Web3.utils.fromWei(item.value, 'ether'),
                    confirmation: item.confirmations,
                    status: this.ParseTrxStatus(item.txreceipt_status),
                    isblockchain: true,
                    action: "",
                    signers: []
                }

                finallist.push(trx);
            }
        });

        this.multisigtrxlist.map((item, i) => {

            var action = "approve";
            var signers = JSON.parse(JSON.stringify(item.Signers));
            console.log("SIGNERS", signers);

            //if(signers.includes(this.userstore.userid)){ //SIGNED
            if (signers.find(x => x.UserId == this.userstore.userid) != null) { //SIGNED
                action = "approved"
            }

            if (item.Status == "completed") action = "completed";

            var trx = {
                trxid: item.TrxId,
                from: item.FromWalletPublicAddress,
                to: item.ToWalletPublicAddress,
                block: "",
                gasprice: 0,
                gasused: 0,
                nonce: 0,
                timestamp: getUnixTime(new Date(item.dt)),
                value: item.Total,
                confirmation: 0,
                status: item.Status,
                isblockchain: false,
                action: action,
                signers: signers
            }

            finallist.push(trx);
        });

        return finallist;

    }

    @computed get TotalWorthMYR() {
        console.log("myr rate: ");
        console.log(this.convertrate);
        //return this.convertrate;
        return `$${numberWithCommas(parseFloat(!isNaN(this.totalassetworth * this.convertrate) ? this.totalassetworth * this.convertrate : 0), true)}`;
    }

    @computed get TotalWorthCNY() {
        console.log("cny rate: ");
        console.log(this.convertratecny);
        //return this.convertrate;
        return `$${numberWithCommas(parseFloat(!isNaN(this.totalassetworth * this.convertratecny) ? this.totalassetworth * this.convertratecny : 0), true)}`;
    }

    setuserstore(store) {
        this.userstore = store;
    }

    getthisstore() {
        return this;
    }

    setnetworkstore(store) {
        this.networkstore = store;
    }

    @action setGoogleAuthKeyPending(googleAuthKey) {
        this.googleAuthKeyPending = googleAuthKey;
    }

    @action setMFA(status) {
        this.mfaenabled = status;
    }

    @action setConvertRate(rate) {
        console.log("MYR rate set at: " + rate);
        this.convertrate = rate;
    }

    @action setConvertRateCNY(rate) {
        console.log("CNY rate set at: " + rate);
        this.convertratecny = rate;
    }

    @action setGoogleAuthKey(googleAuthKey, pass) {
        this.googleAuthKey = googleAuthKey;
        localStorage.setItem('twofasecret', this.encrypt(googleAuthKey, pass))
    }

    @action clearGoogleAuthKey() {
        this.googleAuthKey = "";
        this.googleAuthKeyPending = "";
        localStorage.removeItem('twofasecret');
    }

    @action
    async getConvertRate(tokenasset, currency) {
        var asset;
        var that = this;
        if (tokenasset == "eth") {
            asset = "ethereum";
        } else if (tokenasset == "wan") {
            asset = "wanchain";
        } else if (tokenasset == "RVX") {
            asset = "rivex";
        }

        await axios({
            method: 'get',
            url: 'https://api.coingecko.com/api/v3/simple/price',
            params: {
                ids: asset,
                vs_currencies: currency
            },
            config: {headers: {'Content-Type': 'application/json'}}
        })
            .then(function (response) {
                //handle success
                console.log("COINGECKO REATE: ");

                // console.log(response.data.asset.curr);
                var data = response.data;
                console.log("asset: " + asset);
                console.log("currency: " + currency);

                if (currency == "usd" || currency == "USD") {
                    switch (asset) {
                        case "ethereum":
                            console.log("returning eth usd");
                            that.setConvertRate(data.ethereum.usd);
                            break;

                        case "wanchain":
                            console.log("returning wan usd");
                            that.setConvertRate(data.wanchain.usd);
                            break;
                    }

                } else if (currency == "yen") {

                } else if (currency == "myr") {

                }
                console.log(data);

            })
            .catch(function (response) {

                createNotification('error', response);
                console.log(response);
            });
    }

    @action setledgerresult(val) {
        this.ledgerresult = val;
    }

    @action sethideautocomplete(val) {
        this.hideautocomplete = val;
    }

    @action setPendingPassword(val) {
        this.pendingpassword = val;
    }

    @action clearPendingPassword() {
        this.pendingpassword = "";
    }

    @action setRestoreSeedPhrase(val) {

        this.restoreseedphrase = val;
    }

    @action setRestorePrivateKey(val) {
        this.restoreprivatekey = val;
    }

    @action setselectedimporttype(val) {
        this.selectedimporttype = val;
    }

    @action settokentransfervalue(token, receiver) {
        this.tokentransfertoken = token;
        this.tokentransferreceiver = receiver;
    }

    @action setsuccessulhash(hash) {
        this.successulhash = hash;
    }

    @action setotptransfertoken(otptoken) {
        this.otptransfertoken = otptoken;
    }

    @action settrxdetail(block, hash, from, to, value, action, gasprice, gasused, timestamp, nonce, confirmation, signers) {
        console.log(action);
        this.trxdetail = {
            block: block,
            hash: hash,
            from: from,
            to: to,
            value: value,
            action: action,
            gasprice: gasprice,
            gasused: gasused,
            timestamp: timestamp,
            nonce: nonce,
            confirmation: confirmation,
            signers: signers
        };
    }

    @action clearSelectedWallet() {
        this.selectedwallet = {};
    }

    @action setselectedwallettype(wallettype) {
        // this.selectedwallettype = wallettype;
    }

    @action setHWWalletType(type) {
        this.HWWalletType = type;
    }

    @action setTrxGasPrice = (price) => {
        // console.log("setTrxGasPrice", price);
        this.currentGasPrice = price;
    }

    @action
    async addTokenAssetToWallet(token) {
        this.selectedwallet.tokenassetlist.push(token);
        this.setWalletList(this.walletlist);
    }

    @action
    async removeTokenAssetFromWallet(token) {
        var itemindex = this.selectedwallet.tokenassetlist.findIndex(x => x.PublicAddress == token.PublicAddress && x.AssetCode == token.AssetCode);
        this.selectedwallet.tokenassetlist.splice(itemindex, 1);
        this.setWalletList(this.walletlist);
    }

    @action setSelectedWallet(publicaddress) {
        this.selectedwallet = this.walletlist.find(x => x.publicaddress == publicaddress);
        console.log("SETTING SELECTED WALLET: " + this.selectedwallet);
        this.loadTokenAssetList();
        //this.current = "walletdetail";
    }

    @action setWalletType(wallettype) {
        this.wallettype = wallettype;
    }

    @action setTotalSignatures(totalsignatures) {
        this.totalsignatures = totalsignatures;
    }

    @action setTotalOwners(totalowners) {
        this.totalowners = totalowners;
    }

    @action setWalletName(walletname) {
        this.walletname = walletname;
    }

    @action setPassword(password) {
        this.mnemonicpassword = password;
        localStorage.setItem('password', password);

    }

    @action setPasswordConfirm(password) {
        this.mnemonicpasswordconfirm = password;
    }

    @action loadWallet() {
        this.walletlist = localStorage.getItem("wallets");
        if (this.walletlist != null) {
            this.walletlist = JSON.parse(this.walletlist);
        } else {
            this.walletlist = [];
        }

        this.walletlist = toJS(this.walletlist);
        // this.walletlist = this.walletlist.filter(x=>x.userid === this.userstore.userid);
        //this.wsGetCloudWalletByUserId();

        // Get ERC20 Token contract instance
        /*
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
        */

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

        //getCryptoBalance();
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

    @action setSeedPhaseInString(val, pass) {
        this.seedphaseinstringtemp = val;
        this.seedphaseinstring = this.encrypt(val, pass);
    }

    @action setCurrent(val) {
        this.current = val;
        // window.location.hash = `/${val}`;
    }

    @action setEmail(val) {
        this.email = val;
    }

    @action setUserAccountExist(val) {
        sessionstore.setUserAccountExist(val);
    }

    @action setselectedTokenAsset(tokenasset) {
        this.selectedTokenAsset = tokenasset;
    }

    @action
    async LoadTransactionByAddress(addr) {
        if (this.selectedwallet.wallettype == "sharedwallet") {
            this.wsGetMultiSigTrx(this.selectedwallet.publicaddress, this.selectedTokenAsset.PublicAddress, this.selectedTokenAsset.AssetCode);
            /*
            console.log(this.networkstore.selectedethnetwork.etherscanendpoint + '?module=account&action=txlist&address=' + addr + '&sort=desc&apikey=' + etherscanAPIKey);
            axios({
              method: 'get',
              url: this.networkstore.selectedethnetwork.etherscanendpoint + '?module=account&action=txlist&address=' + addr + '&sort=desc&apikey=' + etherscanAPIKey,
              data: {}
            })
            .then(async function (response) {
              var rawtrxlist = response.data.result;

              rawtrxlist.map(async (item, i) =>
              {
                var tokenvalueinhex = item.input.slice(-32);
                if(self.selectedTokenAsset.TokenType != "eth"){
                  item.value = convertHexToDecimal(tokenvalueinhex);
                }
              });

              self.trxlist = rawtrxlist.filter(x => x.value != 0);
              //handle success
              //self.processUserRegistration(response.data);
            })
            .catch(function (response) {
                //handle error
                console.log(response);
            });
            */
        } else if (this.selectedTokenAsset.TokenType == "erc20" || this.selectedTokenAsset.TokenType == "eth") {
            console.log(this.networkstore.selectedethnetwork.etherscanendpoint + '?module=account&action=txlist&address=' + addr + '&sort=desc&apikey=' + etherscanAPIKey);
            axios({
                method: 'get',
                url: this.networkstore.selectedethnetwork.etherscanendpoint + '?module=account&action=txlist&address=' + addr + '&sort=desc&apikey=' + etherscanAPIKey,
                data: {}
            })
                .then(async function (response) {
                    var rawtrxlist = response.data.result;

                    rawtrxlist.map(async (item, i) => {
                        var tokenvalueinhex = item.input.slice(-32);
                        if (self.selectedTokenAsset.TokenType != "eth") {
                            item.value = convertHexToDecimal(tokenvalueinhex);
                        }
                    });

                    self.trxlist = rawtrxlist.filter(x => x.value != 0);
                    //handle success
                    //self.processUserRegistration(response.data);
                })
                .catch(function (response) {
                    //handle error
                    console.log(response);
                });
        } else if (this.selectedTokenAsset.TokenType == "wrc20" || this.selectedTokenAsset.TokenType == "wan") {
            iWanUtils.getTransByAddress("WAN", addr).then(response => {
                var rawtrxlist = response;

                rawtrxlist.map(async (item, i) => {
                    var tokenvalueinhex = item.input.slice(-32);
                    if (self.selectedTokenAsset.TokenType == "wrc20") {
                        item.value = convertHexToDecimal(tokenvalueinhex);
                    }
                });

                self.trxlist = rawtrxlist.filter(x => x.value != 0);
            })
                .catch(function (response) {
                    //handle error
                    console.log(response);
                });
        }
    }

    @action changeWalletName(walletpublicaddress, newwalletname) {
        let wallet = this.walletlist.find(x => x.publicaddress == walletpublicaddress);
        wallet.walletname = newwalletname;
        localStorage.setItem('wallets', JSON.stringify(this.walletlist));
    }

    @action setWalletList(walletlist) {
        localStorage.setItem('wallets', JSON.stringify(walletlist));
        //this.loadWallet();
    }

    confirmPasswords() {
        if (this.mnemonicpassword != this.mnemonicpasswordconfirm) {
            createNotification('error', intl.get('Error.Passwordnotmatch'));

        }
    }

    ParseTrxStatus(status) {
        if (status == "0") {
            return "Failed";
        } else {
            return "Success";
        }
    }

    removeBackendWallet(password) {
        var wallets = JSON.parse(localStorage.getItem("wallets"));
        // if(wallets[0].publicaddress == this.state.selectedwalletaddress){
        console.log("removing dApp wallet.");
        wand.request('account_delete', {
            walletID: 1,
            path: `${BIP44PATHs.WAN}${addrOffset}`,
            chainType: 'WAN'
        }, function (err, val) {
            if (err) {
                console.log('error printed inside callback: ', err)

            }
        });
        //}
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

    @action removeWallet(publicaddress) {
        console.log(publicaddress);
        const filterwalletlist = this.walletlist.filter(x => x.publicaddress !== publicaddress);
        console.log(filterwalletlist.length);
        if (filterwalletlist.length < 1) {
            localStorage.removeItem("password");
        }
        console.log(toJS(filterwalletlist));
        localStorage.setItem('wallets', JSON.stringify(filterwalletlist));
        this.walletlist = filterwalletlist;
    }

    @action setBasicWalletType(type) {
        this.basicwallettype = type;
    }

    @action wsGetCloudWalletByUserId() {
        var bodyFormData = new FormData();
        bodyFormData.set('token', this.userstore.token);
        bodyFormData.set('network', "");

        var that = this;

        axios({
            method: 'post',
            url: API_Server + 'api/multisig/GetCloudWalletByUserId',
            data: bodyFormData,
            config: {headers: {'Content-Type': 'multipart/form-data'}}
        })
            .then(function (response) {
                //handle success
                response.data.wallet.map((walletmodel, index) => {
                    var walletitem = {
                        walletname: walletmodel.WalletName,
                        userid: that.userstore.userid,
                        seedphase: walletmodel.Seedphase,
                        privatekey: walletmodel.PrivateAddress,
                        derivepath: walletmodel.DerivePath,
                        publicaddress: walletmodel.PublicAddress,
                        addresstype: walletmodel.AddressType,
                        wallettype: walletmodel.WalletType,
                        HWWalletType: "",
                        totalowners: parseInt(walletmodel.NumbersOfOwners),
                        totalsignatures: parseInt(walletmodel.NumbersOfSigners),
                        holders: walletmodel.Holders,
                        ownerid: walletmodel.OwnerId,
                        isOwner: walletmodel.OwnerId == that.userstore.userid,
                        tokenassetlist: walletmodel.TokenAssets,
                        isCloud: true //wallettype == "basicwallet" ? this.basicwallettype == "local" ? false : true : true
                    };

                    if (that.walletlist.find(x => x.publicaddress == walletitem.publicaddress && x.wallettype == walletitem.wallettype) == null) {
                        that.walletlist.push(walletitem);
                    }
                });
                that.setWalletList(that.walletlist);

                //that.setotptransfertoken(response.data.otp);
                //self.processUserRegistration(response.data);
            })
            .catch(function (response) {
                //handle error
                createNotification('error', response);
            });
    }

    /* @action async SaveWallet(ownerId,walletname,seedphase,privatekey,derivepath,publicaddress,addresstype,wallettype,totalowners,totalsignatures,holders){
       var wallet = {
         walletname : walletname,
         userid : this.userstore.userid,
         seedphase : seedphase,
         privatekey : privatekey,
         derivepath : derivepath,
         publicaddress : publicaddress,
         addresstype : addresstype,
         wallettype : wallettype,
         HWWalletType:this.HWWalletType,
         totalowners: parseInt(totalowners),
         totalsignatures: parseInt(totalsignatures),
         holders: holders,
         ownerid:ownerId,
         isOwner:ownerId == this.userstore.userid,
         tokenassetlist:wallettype == "hwwallet" ? [] : await this.insertPrimaryAssetTokenList(seedphase,this.checkisCloud(wallettype),publicaddress,privatekey),
         isCloud:this.checkisCloud(wallettype) //wallettype == "basicwallet" ? this.basicwallettype == "local" ? false : true : true
       };

       /*if(wallet.isCloud){
         this.InsertTokenAssetToCloudWallet(wallet.tokenassetlist,wallet.publicaddress,function(){});
       }

       var localwallets = [];
       localwallets = localStorage.getItem('wallets');
       if(localwallets == null){
         localwallets = [];
       }else{
         localwallets = JSON.parse(localwallets);
       }
       localwallets.push(wallet);
       // console.log("SaveWallet", JSON.stringify(wallet))
       localStorage.setItem('wallets',JSON.stringify(localwallets));
       this.walletlist = localwallets;
       this.loadWallet();
       this.setSelectedWallet(publicaddress);
     }*/

    wsRequestTransferOTP() {
        var bodyFormData = new FormData();
        bodyFormData.set('token', this.userstore.token);
        bodyFormData.set('smsnotification', false);

        var that = this;

        axios({
            method: 'post',
            url: API_Server + 'api/auth/RequestTransferTokenOTP',
            data: bodyFormData,
            config: {headers: {'Content-Type': 'multipart/form-data'}}
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
                createNotification('error', response);
                console.log(response);
            });
    }//   this.SaveWallet(this.walletname,this.seedphaseinstring,this.privateaddress,this.derivepath,this.publicaddress,"eth",this.selectedwallettype)

    //this.userstore.userid,this.walletname,this.seedphaseinstring,this.privateaddress,derivepath,this.publicaddress,"eth",this.selectedwallettype,this.totalowners,this.totalsignatures,[{ "UserId": this.userstore.userid, "UserName": this.userstore.name }])
    @action
    async SaveWallet(walletname, seedphase, privatekey, derivepath, publicaddress, addresstype, wallettype, dappwallet) {
        var wallet = {
            walletname: walletname,
            seedphase: seedphase,
            privatekey: privatekey,
            derivepath: derivepath,
            publicaddress: publicaddress,
            addresstype: addresstype,
            wallettype: wallettype,
            tokenassetlist: await this.insertPrimaryAssetTokenList(this.seedphaseinstringtemp, false, publicaddress, privatekey),
            isCloud: false,
            dappwallet: dappwallet
        };

        /*if(wallet.isCloud){
          this.InsertTokenAssetToCloudWallet(wallet.tokenassetlist,wallet.publicaddress,function(){});
        }*/

        var localwallets = [];
        localwallets = localStorage.getItem('wallets');
        if (localwallets == null) {
            localwallets = [];
        } else {
            localwallets = JSON.parse(localwallets);
        }
        localwallets.push(wallet);
        // console.log("SaveWallet", JSON.stringify(wallet))
        localStorage.setItem('wallets', JSON.stringify(localwallets));
        this.walletlist = localwallets;
        this.loadWallet();
        this.setSelectedWallet(publicaddress);
    }

    insertPrimaryAssetTokenList = async (seedphase, iscloud, defaultpublicaddress, defaultprivatekey) => {
        console.log("instering primary assets");

        if (self.primaryTokenAsset.length > 0) {
            var promises = self.primaryTokenAsset.map(async (tokenitem, index) => {
                var derivepath = BIP44PATH.ETH;
                if (tokenitem.TokenType == "wan" || tokenitem.TokenType == "wrc20") {
                    derivepath = BIP44PATH.WAN;
                }

                if (seedphase != "") {
                    var walletkey = await this.GenerateBIP39Address(derivepath + "0", seedphase);
                    tokenitem.PublicAddress = walletkey.publicaddress;
                    tokenitem.PrivateAddress = walletkey.privateaddress;
                } else {
                    tokenitem.PublicAddress = defaultpublicaddress;
                    tokenitem.PrivateAddress = defaultprivatekey;
                }

                if (tokenitem.TokenType == "wan" || tokenitem.TokenType == "wrc20") { //IF WANCHAIN . CONVERT ALL ADDRESS TO LOWERCASE
                    tokenitem.PublicAddress = tokenitem.PublicAddress.toLowerCase();
                }

                return tokenitem;
            });

            const results = await Promise.all(promises);
            return toJS(results);
        } else {
            console.log("RETURNING");
            return [];
        }


    }

    encrypt(text, pass) {
        console.log("encrypting:" + text);

        if (JSON.parse(localStorage.getItem('key')) == null || JSON.parse(localStorage.getItem('iv') == null)) {
            console.log("doesn't exist yet key iv");
            this.iv = Buffer.from(Array.prototype.map.call(Buffer.alloc(16), () => {
                return Math.floor(Math.random() * 256)
            }));
            this.key = Buffer.concat([Buffer.from(pass)], Buffer.alloc(32).length);
            console.log("ORIGINAL IV AND KEY");
            console.log(this.iv);
            console.log(this.key);
            localStorage.setItem('key', JSON.stringify(this.key));
            localStorage.setItem('iv', JSON.stringify(this.iv));
        } else {
            console.log("KEY and IV already set")
            this.iv = Buffer.from(JSON.parse(localStorage.getItem('iv')));
            this.key = Buffer.from(JSON.parse(localStorage.getItem('key')));
        }
        // this.confirmPasswords();
        if (this.mnemonicpassword = "") {
            createNotification('error', "Please create a password for your account");

        } else {

            var cipher = Crypto.createCipheriv(algorithm, this.key, this.iv);
            var crypted = cipher.update(text, 'utf8', 'hex');
            crypted += cipher.final('hex');
            console.log("encrypted:" + crypted);
            return crypted;
        }

    }

    decrypt(text) {
        if (this.iv == null || this.key == null) {
            console.log("IV KEY ARE NULL DECRYPT");
            this.iv = Buffer.from(JSON.parse(localStorage.getItem('iv')));
            this.key = Buffer.from(JSON.parse(localStorage.getItem('key')));
            console.log(this.iv);
            console.log(this.key);
        }
        console.log("decrypting: " + text);
        if (this.mnemonicpassword = "") {
            createNotification('error', "Please create a password for your account");

        } else {
            var decipher = Crypto.createDecipheriv(algorithm, this.key, this.iv);
            //var decipher = Crypto.createDecipher(algorithm,this.mnemonicpassword);
            var dec = decipher.update(text, 'hex', 'utf8');
            dec += decipher.final('utf8');
            console.log("decrypted: " + dec);
            return dec;
        }

    }

    checkisCloud(wallettype) {
        let isCloud = false;
        if (wallettype == "basicwallet") {
            if (this.basicwallettype == "local") {
                isCloud = false;
            } else {
                isCloud = true;
            }
        }
        if (wallettype == "sharedwallet") isCloud = true;
        if (wallettype == "hwwallet") isCloud = false;
        return isCloud;
    }

    async GenerateBIP39Address(derivepath, seedval) {
        const seed = await bip39.mnemonicToSeed(seedval);
        var hdkey = HDKey.fromMasterSeed(Buffer.from(seed, 'hex'));
        //const masterPrivateKey = hdkey.privateKey.toString('hex');
        const addrNode = hdkey.derive(derivepath);
        const pubKey = ethUtil.privateToPublic(addrNode._privateKey);
        const addr = ethUtil.publicToAddress(pubKey).toString('hex');
        const address = ethUtil.toChecksumAddress(addr);

        this.publicaddress = address;
        this.privateaddress = addrNode._privateKey.toString('hex');

        return {publicaddress: this.publicaddress, privateaddress: this.privateaddress};
    }

    async GenerateAddressByPrivateKey(privatekey) {
        var privateaddress = new Buffer(privatekey, 'hex');


        const pubKey = ethUtil.privateToPublic(privateaddress);
        const addr = ethUtil.publicToAddress(pubKey).toString('hex');

        const address = ethUtil.toChecksumAddress(addr);
        this.publicaddress = address;

        return {publicaddress: this.publicaddress, privateaddress: privateaddress};
    }

    async CreateEthAddress(dappwallet) {
        var derivepath = BIP44PATH.WAN;
        var walletkey = await this.GenerateBIP39Address(derivepath + "0", this.seedphaseinstringtemp);
        this.privateaddress = walletkey.privateaddress;
        this.publicaddress = walletkey.publicaddress;
        await this.SaveWallet(this.walletname, this.seedphaseinstring, this.privateaddress, derivepath, this.publicaddress, "eth", "local", dappwallet);
        console.log("awaited save wallet");
        this.loadTokenAssetList();
        this.seedphaseinstringtemp = "";
        this.setCurrent("walletcreated");

        //this.seedphaseinstring = "scene brain typical travel fire error danger domain athlete initial salad video";
        //var seedval = this.seedphaseinstring;//"allow result spell hip million juice era garden trigger dwarf disease unable";
        //const seed = await bip39.mnemonicToSeed(seedval);
        //console.log(seed);
        //var hdkey = HDKey.fromMasterSeed(new Buffer(seed, 'hex'));
        //const masterPrivateKey = hdkey.privateKey.toString('hex');
        //console.log("Master Private Key",masterPrivateKey);
        //const derivepath = "m/44'/60'/0'/0/0";
        //this.derivepath = derivepath;

        //const addrNode = hdkey.derive(derivepath);

        //console.log("private key addr", addrNode._privateKey.toString('hex'));

        //const pubKey = ethUtil.privateToPublic(addrNode._privateKey);
        //console.log("Pub Key",pubKey);

        //const addr = ethUtil.publicToAddress(pubKey).toString('hex');

        //const address = ethUtil.toChecksumAddress(addr);

        //console.log("address",address);

        //console.log(this.basicwallettype);

        //console.log(hdkey);
        //console.log(hdkey.privateExtendedKey)
        //console.log(hdkey.publicExtendedKey);
    }

    async CreateEthAddressByPrivateKey() {
        try {
            const derivepath = BIP44PATH.WAN;
            var walletkey = await this.GenerateAddressByPrivateKey(this.restoreprivatekey);
            this.privateaddress = this.restoreprivatekey;
            this.publicaddress = walletkey.publicaddress;
            var seedval = "null";
            await this.SaveWallet(this.walletname, seedval, this.privateaddress, derivepath, this.publicaddress, "eth", "local");
            this.loadTokenAssetList();
            this.setCurrent("walletcreated");
        } catch (e) {
            console.log(e);
            createNotification('error', intl.get('Error.InvalidPrivateKey'));
        }

    }

    async CreateHWWallet(walletname, publicaddress, derivepath, tokentype, wallettype) {
        try {
            this.SaveWallet(this.userstore.userid, walletname, "", "", derivepath, publicaddress, tokentype, wallettype, 0, 0, [{
                "UserId": this.userstore.userid,
                "UserName": this.userstore.name
            }]);
            // createNotification('success',intl.get('Wallet.AddedNewAssetToken',{code:publicaddress}));
        } catch (e) {
            console.log(e);
            createNotification('error', intl.get('Error.Error'));
        }

    }

    generate12SeedPhase = () => {
        let mnemonic = "";
        let selectedwordlist = bip39.wordlists.english;
        // console.log(languageIntl.language)
        if (languageIntl.language == "zh_CN") selectedwordlist = bip39.wordlists.chinese_simplified;
        if (languageIntl.language == "zh_TW") selectedwordlist = bip39.wordlists.chinese_traditional;
        // console.log("generate12SeedPhase", languageIntl.language)
        mnemonic = bip39.generateMnemonic(null, null, selectedwordlist);
        return mnemonic;
    }

    processOTPVerification(response) {
        if (response.status == 200) {
            self.setToken(response.token);
            self.setCurrent(2);
            //self.setOTP(response.otp);
        }
    }

    wsCreateTrx(fromwalletpublicaddress, towalletpublicaddress, totaltoken) {
        var network = this.networkstore.selectedethnetwork.shortcode;
        if (this.selectedTokenAsset.TokenType == "wan" || this.selectedTokenAsset.TokenType == "wrc20")
            network = this.networkstore.selectedwannetwork.shortcode;

        var bodyFormData = new FormData();
        bodyFormData.set('fromwalletpublicaddress', fromwalletpublicaddress);
        bodyFormData.set('senderpublicaddress', this.selectedTokenAsset.PublicAddress);
        bodyFormData.set('assetcode', this.selectedTokenAsset.AssetCode);
        bodyFormData.set('token', this.userstore.token);
        bodyFormData.set('towalletpublicaddress', towalletpublicaddress);
        bodyFormData.set('totaltoken', totaltoken);
        bodyFormData.set('network', network);

        axios({
            method: 'post',
            url: API_Server + 'api/multisig/CreateTrx',
            data: bodyFormData,
            config: {headers: {'Content-Type': 'multipart/form-data'}}
        })
            .then(function (response) {
                //handle success
                console.log(response);
                if (response.data.status == 200) {
                    self.wsGetMultiSigTrx(fromwalletpublicaddress, self.selectedTokenAsset.PublicAddress, self.selectedTokenAsset.AssetCode);
                    self.setCurrent("tokentransfersuccessful");
                } else {
                    createNotification('error', intl.get('ERROR.' + response.data.msg))
                }
            })
            .catch(function (response) {
                //handle error
                console.log(response);
                createNotification('error', intl.get('ERROR.' + response.data.msg))
            });
    }

    wsGetMultiSigTrx(walletpublicaddress, senderpublicaddress, assetcode) {
        var network = this.networkstore.selectedethnetwork.shortcode;
        if (this.selectedTokenAsset.TokenType == "wan" || this.selectedTokenAsset.TokenType == "wrc20")
            network = this.networkstore.selectedwannetwork.shortcode;

        // console.log("wsGetMultiSigTrx")
        var bodyFormData = new FormData();
        bodyFormData.set('walletpublicaddress', walletpublicaddress);
        bodyFormData.set('senderpublicaddress', senderpublicaddress);
        bodyFormData.set('token', this.userstore.token);
        bodyFormData.set('assetcode', assetcode);
        bodyFormData.set('network', network);

        console.log("waleltpublic", walletpublicaddress);
        console.log("senderpublicaddress", senderpublicaddress);
        console.log("assetcode", assetcode);
        console.log("network", network);

        axios({
            method: 'post',
            url: API_Server + 'api/multisig/GetMultiSigTrxByWalletPublicAddress',
            data: bodyFormData,
            config: {headers: {'Content-Type': 'multipart/form-data'}}
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
        let response = await axios.get(API_EthGas);

        let prices = {
            low: response.data.safeLow,
            medium: response.data.average,
            high: 45
        }
        return prices;
    }

    async wsApproveMultiSigTrx(trxid, to, total, isexecute) {
        //EXECUTE BLOCKCHAIN TRANSFER

        if (isexecute) {
            createNotification('info', intl.get('Info.Waiting'));

            if (this.selectedTokenAsset.TokenType == "erc20") {
                var web3Provider = this.networkstore.selectedethnetwork.infuraendpoint + this.infuraprojectid;
                var web3 = new Web3(web3Provider);

                var count = await web3.eth.getTransactionCount(this.selectedTokenAsset.PublicAddress);
                var gasPrices = await this.getCurrentGasPrices();
                var TokenInfo = this.selectedTokenAsset.TokenInfoList[0];
                var abiArray = JSON.parse(TokenInfo.AbiArray);
                var contractdata = new web3.eth.Contract(abiArray, TokenInfo.ContractAddress);//, {from: this.props.selectedwallet.publicaddress}); //).at(this.tokencontract);
                var rawTransaction = {};
                try {
                    rawTransaction = {
                        "from": this.selectedTokenAsset.PublicAddress,
                        "nonce": count,
                        "gasPrice": gasPrices.high * 100000000,//"0x04e3b29200",
                        "gas": web3.utils.toHex("519990"),//"0x7458",
                        "gasLimit": web3.utils.toHex("519990"),//"0x7458",
                        "to": TokenInfo.ContractAddress,//this.tokencontract,
                        "value": "0x0",//web3.utils.toHex(web3.utils.toWei(this.state.tokenval, 'ether')),
                        "data": contractdata.methods.transfer(to, web3.utils.toWei(total, 'ether')).encodeABI(),//contract.transfer.getData(this.tokencontract, 10, {from: this.props.selectedwallet.publicaddress}),
                        "chainId": this.networkstore.selectedethnetwork.chainid
                    };

                    //console.log(rawTransaction);

                    var privKey = new Buffer(this.selectedTokenAsset.PrivateAddress, 'hex');

                    var tx = new Tx(rawTransaction);
                    tx.sign(privKey);
                    var serializedTx = tx.serialize();

                    web3.eth.sendSignedTransaction('0x' + serializedTx.toString('hex'), function (err, hash) {
                        if (!err) { //SUCCESS
                            console.log(hash);
                            self.wsUpdateCompletedMultiSignTrx(trxid, false);
                            self.setsuccessulhash(hash);
                            self.setCurrent("tokentransfersuccessful");
                        } else {
                            createNotification('error', intl.get('Error.TransactionFailed'));
                            console.log(err);
                        }
                    });
                } catch (e) {
                    createNotification('error', intl.get('Error.TransactionFailed'));
                    console.log("ERR", e);
                }
            } else if (this.selectedTokenAsset.TokenType == "wan") {
                var web3Provider = this.networkstore.selectedethnetwork.infuraendpoint + this.infuraprojectid;
                var web3 = new Web3(web3Provider);

                var TokenInfo = this.selectedTokenAsset.TokenInfoList[0];
                var abiArray = JSON.parse(TokenInfo.AbiArray);
                var receiver = to;//"0x8859C2BE1a9D6Fbe37E1Ed58c103487eE7B8b90F";

                iWanUtils.getNonce("WAN", this.selectedTokenAsset.PublicAddress).then(async (res) => {
                    if (res && Object.keys(res).length) {
                        var nonce = res;
                        try {
                            iWanUtils.getGasPrice("WAN").then(async (gas) => {
                                var gasprice = gas;
                                var rawTransaction = {
                                    "from": this.selectedTokenAsset.PublicAddress,
                                    "nonce": nonce,
                                    "gasPrice": 180000000000,//gasprice,// * 1000,//"0x737be7600",//gasPrices.high * 100000000,//"0x04e3b29200",
                                    "gas": '0x35B60',//"0x5208",//"0x7458",
                                    "gasLimit": '0x35B60',//web3.utils.toHex("519990"),//"0x7458",
                                    "Txtype": "0x01",
                                    "to": to,
                                    "value": web3.utils.toHex(web3.utils.toWei(total, 'ether')),
                                    "chainId": this.networkstore.selectedwannetwork.chainid
                                };
                                console.log("trx raw", rawTransaction);
                                var privKey = new Buffer(this.selectedTokenAsset.PrivateAddress, 'hex');//"35e0ec8f5d689f370cdc9c35a04d1664c9316aadbd2ac508cfa69f3de7aaa233", 'hex');
                                var tx = new wanTx(rawTransaction);
                                tx.sign(privKey);

                                var serializedTx = tx.serialize();
                                iWanUtils.sendRawTransaction("WAN", '0x' + serializedTx.toString('hex')).then(res => {
                                    self.wsUpdateCompletedMultiSignTrx(trxid, false);
                                    self.setsuccessulhash(res);
                                    self.setCurrent("tokentransfersuccessful");
                                }).catch(err => {
                                    createNotification('error', intl.get('Error.TransactionFailed'));
                                    console.log(err);
                                });
                            }).catch(err => {
                                console.log(err);
                            });
                        } catch (e) {
                        }
                    }
                }).catch(err => {
                    console.log(err);
                });
            } else if (this.selectedTokenAsset.TokenType == "eth") {
                var web3Provider = this.networkstore.selectedethnetwork.infuraendpoint + this.infuraprojectid;
                var web3 = new Web3(web3Provider);

                var from = this.selectedTokenAsset.PublicAddress;
                var targetaddr = to;
                var amountToSend = total;
                let gasPrices = await this.getCurrentGasPrices();
                var nonce = 0;

                web3.eth.getTransactionCount(from).then(txCount => {
                    nonce = txCount++;
                    let details = {
                        "from": from,
                        "to": targetaddr,
                        "value": web3.utils.toHex(web3.utils.toWei(amountToSend, 'ether')),
                        "gas": 21000,
                        "gasPrice": gasPrices.high * 1000000000,
                        "nonce": nonce,
                        "chainId": this.networkstore.selectedethnetwork.chainid
                    }

                    var transaction = this.networkstore.selectedethnetwork.shortcode == "mainnet" ? new Tx(details) : new Tx(details, {
                        chain: this.networkstore.selectedethnetwork.shortcode,
                        hardfork: 'petersburg'
                    });
                    transaction.sign(Buffer.from(this.selectedTokenAsset.PrivateAddress, 'hex'))
                    const serializedTransaction = transaction.serialize()
                    web3.eth.sendSignedTransaction('0x' + serializedTransaction.toString('hex'), (err, hash) => {
                        if (!err) { //SUCCESS
                            console.log(hash);
                            self.wsUpdateCompletedMultiSignTrx(trxid, false);
                            self.setsuccessulhash(hash);
                            self.setCurrent("tokentransfersuccessful");
                        } else {
                            createNotification('error', intl.get('Error.TransactionFailed'));
                            console.log(err);
                        }
                    });
                });
            } else if (this.selectedTokenAsset.TokenType == "wrc20") {
                var web3Provider = this.networkstore.selectedethnetwork.infuraendpoint + this.infuraprojectid;
                var web3 = new Web3(web3Provider);

                var TokenInfo = this.selectedTokenAsset.TokenInfoList[0];
                var abiArray = JSON.parse(TokenInfo.AbiArray);

                var contractdata = new web3.eth.Contract(abiArray, TokenInfo.ContractAddress);
                var receiver = to;//"0x8859C2BE1a9D6Fbe37E1Ed58c103487eE7B8b90F";

                iWanUtils.getNonce("WAN", this.selectedTokenAsset.PublicAddress).then(async (res) => {
                    if (res && Object.keys(res).length) {
                        var nonce = res;
                        try {
                            iWanUtils.getGasPrice("WAN").then(async (gas) => {
                                var gasprice = gas;

                                var data = web3.eth.abi.encodeFunctionCall({
                                    name: 'transfer',
                                    type: 'function',
                                    inputs: [{
                                        name: "recipient",
                                        type: "address"
                                    }, {
                                        name: "amount",
                                        type: "uint256"
                                    }]
                                }, [receiver, web3.utils.toWei(total, 'ether')]);

                                var rawTransaction = {
                                    "from": this.selectedTokenAsset.PublicAddress,
                                    "nonce": nonce,
                                    "gasPrice": 180000000000,//gasprice,// * 1000,//"0x737be7600",//gasPrices.high * 100000000,//"0x04e3b29200",
                                    "gas": '0x35B60',//"0x5208",//"0x7458",
                                    "gasLimit": '0x35B60',//web3.utils.toHex("519990"),//"0x7458",
                                    "Txtype": "0x01",
                                    "to": TokenInfo.ContractAddress,//this.tokencontract,
                                    "value": "0x0",//web3.utils.toHex(web3.utils.toWei(this.state.tokenval, 'ether')),
                                    "data": data, //contractdata.methods.transfer(receiver,10).encodeABI(),//data,
                                    "chainId": this.networkstore.selectedwannetwork.chainid //"0x03" //1 mainnet
                                };
                                console.log("trx raw", rawTransaction);
                                var privKey = new Buffer(this.selectedTokenAsset.PrivateAddress, 'hex');//"35e0ec8f5d689f370cdc9c35a04d1664c9316aadbd2ac508cfa69f3de7aaa233", 'hex');
                                var tx = new wanTx(rawTransaction);
                                tx.sign(privKey);

                                var serializedTx = tx.serialize();
                                iWanUtils.sendRawTransaction("WAN", '0x' + serializedTx.toString('hex')).then(res => {
                                    console.log(res);
                                    self.wsUpdateCompletedMultiSignTrx(trxid, false);
                                    self.setsuccessulhash(res);
                                    self.setCurrent("tokentransfersuccessful");
                                }).catch(err => {
                                    createNotification('error', intl.get('Error.TransactionFailed'));
                                    console.log(err);
                                });
                            }).catch(err => {
                                console.log(err);
                            });
                        } catch (e) {
                        }
                    }
                }).catch(err => {
                    console.log(err);
                });
            }
        } else {
            this.wsUpdateCompletedMultiSignTrx(trxid, true);
        }
    }

    wsUpdateCompletedMultiSignTrx(trxid, isredirect) {
        var network = this.networkstore.selectedethnetwork.shortcode;
        if (this.selectedTokenAsset.TokenType == "wan" || this.selectedTokenAsset.TokenType == "wrc20")
            network = this.networkstore.selectedwannetwork.shortcode;

        var bodyFormData = new FormData();
        bodyFormData.set('trxhash', trxid);
        bodyFormData.set('token', this.userstore.token);
        bodyFormData.set('network', network);

        console.log(trxid);
        console.log(this.userstore.token);

        axios({
            method: 'post',
            url: API_Server + 'api/multisig/ApproveTrx',
            data: bodyFormData,
            config: {headers: {'Content-Type': 'multipart/form-data'}}
        })
            .then(function (response) {
                console.log(response);
                if (response.data.status == 200) {
                    if (isredirect) {
                        console.log(response.data);
                        self.setsuccessulhash(response.data.trx.TrxId);
                        self.setCurrent("tokentransfersuccessful");
                    }
                } else {
                    createNotification('error', intl.get("Error." + response.data.msg));
                }
            })
            .catch(function (response) {
                //handle error
                console.log(response);
                createNotification('error', intl.get("Error." + response.data.msg));
            });
    }

    wsGetMultiSigTrxLog(trxid) {

        var selectednetwork = this.networkstore.selectedethnetwork.shortcode;
        if (this.selectedTokenAsset.TokenType == "wrc20" || this.selectedTokenAsset.TokenType == "wan") {
            selectednetwork = this.networkstore.selectedwannetwork.shortcode;
        }

        var bodyFormData = new FormData();
        bodyFormData.set('trxid', trxid);
        bodyFormData.set('token', this.userstore.token);
        bodyFormData.set('network', selectednetwork);
        axios({
            method: 'post',
            url: API_Server + 'api/multisig/GetMultiSigTrxLogByTrxID',
            data: bodyFormData,
            config: {headers: {'Content-Type': 'multipart/form-data'}}
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

    CreateBasicWalletOnCloud = (cb) => {
        // console.log(acctoken,walletinfo)
        this.derivepath = BIP44PATH.ETH;
        var bodyFormData = new FormData();
        bodyFormData.append('token', this.userstore.token);
        bodyFormData.append('walletname', this.walletname);
        bodyFormData.append('seedphase', this.seedphaseinstring);
        bodyFormData.append('privatekey', this.privateaddress);
        bodyFormData.append('derivepath', this.derivepath);
        bodyFormData.append('publicaddress', this.publicaddress);
        bodyFormData.append('addresstype', "eth");
        bodyFormData.append('network', this.networkstore.selectedethnetwork.shortcode);

        axios({
            method: 'post',
            url: API_Server + 'api/multisig/CreateBasicWallet',
            data: bodyFormData,
            config: {headers: {'Content-Type': 'multipart/form-data'}}
        })
            .then(function (response) {
                //handle success
                //console.log("CreateBasicWalletOnCloud",response);
                if (response.data.status == 200) {
                    cb();
                }
            })
            .catch(function (response) {
                //handle error
                console.log(response);
            });
    }

    async wsCreateSharedWallet() {
        var that = this;
        this.seedphaseinstring = this.generate12SeedPhase();
        var derivepath = BIP44PATH.ETH;
        var walletkey = await this.GenerateBIP39Address(derivepath + "0", this.seedphaseinstring);
        this.privateaddress = walletkey.privateaddress;
        this.publicaddress = walletkey.publicaddress;
        console.log("PRE PUBLIC KEY", this.publicaddress);

        var bodyFormData = new FormData();
        bodyFormData.set('walletname', this.walletname);
        bodyFormData.set('token', this.userstore.token);
        bodyFormData.set('seedphase', this.seedphaseinstring);
        bodyFormData.set('privatekey', this.privateaddress);
        bodyFormData.set('derivepath', derivepath);
        bodyFormData.set('publicaddress', this.publicaddress);
        bodyFormData.set('addresstype', "eth");
        bodyFormData.set('totalowners', this.totalowners);
        bodyFormData.set('totalsignatures', this.totalsignatures);
        bodyFormData.set('holders', [{"UserId": this.userstore.userid, "UserName": this.userstore.name}]);
        bodyFormData.set('network', this.networkstore.selectedethnetwork.shortcode);

        axios({
            method: 'post',
            url: API_Server + 'api/multisig/CreateMultiSigWallet',
            data: bodyFormData,
            config: {headers: {'Content-Type': 'multipart/form-data'}}
        })
            .then(async (response) => {
                console.log(response.data.wallet);
                var wallet = response.data.wallet;

                //handle success
                var tokenassetlist = await that.insertPrimaryAssetTokenList(that.seedphaseinstring, true, wallet.PublicAddress, wallet.PrivateKey);
                console.log(tokenassetlist);
                console.log("PUBLIC KEY", wallet.PublicAddress);
                that.InsertTokenAssetToCloudWallet(tokenassetlist, wallet.PublicAddress, function () {
                });
                //console.log(response);
            })
            .catch(function (response) {
                //handle error
                console.log(response);
            });
    }

    wsJoinWallet(walletpublicaddress) {
        var bodyFormData = new FormData();
        bodyFormData.set('walletpublicaddress', walletpublicaddress);
        bodyFormData.set('token', this.userstore.token);
        bodyFormData.set('network', "");//this.networkstore.selectednetwork.shortcode);

        axios({
            method: 'post',
            url: API_Server + 'api/multisig/JoinMultiSigWallet',
            data: bodyFormData,
            config: {headers: {'Content-Type': 'multipart/form-data'}}
        })
            .then(function (response) {
                //handle success
                console.log(response);
                if (response.data.status == 200) {
                    console.log("SUCCESS", response.data);
                    var wallet = response.data.wallet;
                    self.SaveWallet(wallet.OwnerId, wallet.WalletName, wallet.Seedphase, wallet.PrivateAddress, wallet.DerivePath, wallet.PublicAddress, wallet.AddressType, "sharedwallet", wallet.NumbersOfOwners, wallet.NumbersOfSigners, wallet.Holders);
                    self.setCurrent("walletcreated");
                } else {
                    createNotification('error', intl.get('Error.' + response.data.msg));
                }
                console.log(response);
            })
            .catch(function (response) {
                //handle error
                createNotification('error', 'Error.' + intl.get(response.data.msg));
                console.log(response);
            });
    }

    getTokenSparkLineByAssetCode(crypto) {
        var bodyFormData = new FormData();
        bodyFormData.set('crypto', crypto);
        bodyFormData.set('token', this.userstore.token);

        axios({
            method: 'post',
            url: API_Server + 'api/token/GetTokenSparkLine',
            data: bodyFormData,
            config: {headers: {'Content-Type': 'multipart/form-data'}}
        })
            .then(function (response) {
                //handle success //response.sparkline.sparkline
                // console.log(response);
                if (response.data.status == 200) {
                    // console.log("SUCCESS", response.data);
                    let newsparkline = [];
                    let sparklinelist = response.data.sparkline//.sparkline;
                    self.TokenSparkLine = sparklinelist;

                    // if(sparklinelist.length > 0){
                    //   sparklinelist.map((item,index)=>{
                    //     newsparkline.push(item.value);
                    //   })
                    //   self.TokenSparkLine = newsparkline;
                    //   console.log("getTokenSparkLineByAssetCode", self.TokenSparkLine);
                    // }

                } else {
                    createNotification('error', intl.get('Error.' + response.data.msg));
                }
                // console.log(response);
            })
            .catch(function (response) {
                //handle error
                console.log(response.data);
                createNotification('error', 'Error.' + intl.get(response.data.msg));
                console.log(response);
            });
    }

    GetPrimaryTokenAssetByNetwork() {
        var bodyFormData = new FormData();
        bodyFormData.set('token', this.userstore.token);
        bodyFormData.set('ethnetwork', this.networkstore.selectedethnetwork.shortcode);
        bodyFormData.set('wannetwork', this.networkstore.selectedwannetwork.shortcode);

        axios({
            method: 'post',
            url: API_Server + 'api/token/GetPrimaryTokenAssetByNetwork',
            data: bodyFormData,
            config: {headers: {'Content-Type': 'multipart/form-data'}}
        })
            .then(function (response) {
                if (response.data.status == 200) {
                    self.primaryTokenAsset = response.data.tokenassetlist;
                } else {
                    createNotification('error', intl.get('Error.' + response.data.msg));
                }
            })
            .catch(function (response) {
                //handle error
                createNotification('error', 'Error.' + intl.get(response.data.msg));
            });
    }

    GetAllTokenAssetByNetwork() {
        var bodyFormData = new FormData();
        bodyFormData.set('token', this.userstore.token);
        bodyFormData.set('ethnetwork', this.networkstore.selectedethnetwork.shortcode);
        bodyFormData.set('wannetwork', this.networkstore.selectedwannetwork.shortcode);

        axios({
            method: 'post',
            url: API_Server + 'api/token/GetAllTokenAssetByNetwork',
            data: bodyFormData,
            config: {headers: {'Content-Type': 'multipart/form-data'}}
        })
            .then(function (response) {
                if (response.data.status == 200) {
                    self.allTokenAsset = response.data.tokenassetlist;
                } else {
                    createNotification('error', intl.get('Error.' + response.data.msg));
                }
            })
            .catch(function (response) {
                //handle error
                createNotification('error', 'Error.' + intl.get(response.data.msg));
                console.log("GetAllTokenAssetByNetwork", response);
            });
    }

    getTokenPrice = (assetcode) => {
        var price = 0;
        this.allTokenAsset.map(async (token, index) => {
            if (token.AssetCode == assetcode) {
                price = token.CurrentPrice;
            }
        });
        return price;
    }

    loadTokenAssetList = () => {
        self.selectedassettokenlist = [];
        self.totalassetworth = 0;
        var tokenassetcodelist = "";
        console.log("THIS SELECTED WALLET: " + this.selectedwallet.tokenassetlist);
        this.selectedwallet.tokenassetlist.map(async (tokenitem, index) => {
            tokenassetcodelist += tokenitem.AssetCode + ",";
            console.log("TOKEN ITEM TOKEN TYPE: " + tokenitem.TokenType);
            if (tokenitem.TokenType == "eth") {
                var web3 = new Web3(this.networkstore.selectedethnetwork.infuraendpoint + this.infuraprojectid);
                web3.eth.getBalance(tokenitem.PublicAddress).then(balance => {
                    balance = parseFloat(balance) / (10 ** 18);
                    tokenitem.TokenBalance = balance;
                    tokenitem.TokenPrice = this.getTokenPrice(tokenitem.AssetCode);
                    self.totalassetworth += (this.getTokenPrice(tokenitem.AssetCode) * tokenitem.TokenBalance);
                })
            } else if (tokenitem.TokenType == "erc20") {
                var web3 = new Web3(this.networkstore.selectedethnetwork.infuraendpoint + this.infuraprojectid);
                var TokenInfo = tokenitem.TokenInfoList.find(x => x.Network == this.networkstore.selectedethnetwork.shortcode);
                TokenInfo = toJS(TokenInfo);
                var tokenAbiArray = JSON.parse(TokenInfo.AbiArray);
                // Get ERC20 Token contract instance
                let contract = new web3.eth.Contract(tokenAbiArray, TokenInfo.ContractAddress);
                web3.eth.call({
                    to: !isNullOrEmpty(TokenInfo.ContractAddress) ? TokenInfo.ContractAddress : null,
                    data: contract.methods.balanceOf(tokenitem.PublicAddress).encodeABI()
                }).then(balance => {
                    balance = balance / (10 ** 18);
                    tokenitem.TokenBalance = balance;
                    tokenitem.TokenPrice = this.getTokenPrice(tokenitem.AssetCode);
                    self.totalassetworth += (this.getTokenPrice(tokenitem.AssetCode) * tokenitem.TokenBalance);
                });
                self.selectedassettokenlist.push(tokenitem);
            }/*else if(tokenitem.TokenType == "wrc20"){
         var TokenInfo = tokenitem.TokenInfoList.find(x => x.Network == this.networkstore.selectedwannetwork.shortcode);
         TokenInfo = toJS(TokenInfo);
        var CurrentNetworkAllTokenInfo = toJS(this.allTokenAsset).find(x => x.AssetCode == tokenitem.AssetCode);
        var TokenInfo = CurrentNetworkAllTokenInfo.TokenInfoList[0];
        console.log("toJS(this.allTokenAsset)", toJS(this.allTokenAsset));
        console.log("CurrentNetworkAllTokenInfo", CurrentNetworkAllTokenInfo);
        console.log("TokenInfo", TokenInfo);
        TokenInfo = toJS(TokenInfo);
        iWanUtils.getWrc20Balance("WAN",tokenitem.PublicAddress, TokenInfo.ContractAddress).then(res => {
          if (res && Object.keys(res).length) {
            try{
              var balance = res;
              tokenitem.TokenBalance = parseFloat(balance) / (10**18);
              console.log("tokenitem.TokenBalance", tokenitem.TokenBalance)
              tokenitem.TokenPrice = this.getTokenPrice(tokenitem.AssetCode);
              self.totalassetworth += (this.getTokenPrice(tokenitem.AssetCode) * tokenitem.TokenBalance);
              self.selectedassettokenlist.push(tokenitem);
            }catch(e){}
          }
        }).catch(err => {
          console.log(err);
        });
      }*/ else if (tokenitem.TokenType == "wan") {
                var TokenInfo = tokenitem.TokenInfoList.find(x => x.Network == this.networkstore.selectedwannetwork.shortcode);
                TokenInfo = toJS(TokenInfo);
                iWanUtils.getBalance("WAN", tokenitem.PublicAddress).then(res => {
                    if (res && Object.keys(res).length) {
                        try {
                            var balance = res;
                            tokenitem.TokenBalance = parseFloat(balance) / (10 ** 18);
                            tokenitem.TokenPrice = this.getTokenPrice(tokenitem.AssetCode);
                            self.totalassetworth += (this.getTokenPrice(tokenitem.AssetCode) * tokenitem.TokenBalance);
                            self.selectedassettokenlist.push(tokenitem);
                        } catch (e) {
                        }
                    }
                }).catch(err => {
                    console.log(err);
                });
            }
        });

        //LOAD TOKEN SPARKLINE
        this.getTokenSparkLineByAssetCode(tokenassetcodelist);
        console.log("ASSET CODE", tokenassetcodelist);
    }

    InsertTokenAssetToCloudWallet(tokenassetlist, publicaddress, cb) {
        var bodyFormData = new FormData();
        bodyFormData.set('token', this.userstore.token);
        bodyFormData.set('publicaddress', publicaddress);
        bodyFormData.set('tokenassetlist', JSON.stringify(tokenassetlist));
        //bodyFormData.set('publicaddress', this.selectedTokenAsset.PublicAddress);
        //bodyFormData.set('privateaddress', this.selectedTokenAsset.PrivateAddress);
        //bodyFormData.set('shortcode', tokenasset.AssetCode.toUpperCase());
        //bodyFormData.set('network', this.networkstore.selectednetwork.shortcode);

        axios({
            method: 'post',
            url: API_Server + 'api/token/InsertTokenAssetToCloudWallet',
            data: bodyFormData,
            config: {headers: {'Content-Type': 'multipart/form-data'}}
        })
            .then(function (response) {
                console.log(response);
                if (response.data.status == 200) {
                    cb();
                } else {
                    createNotification('error', intl.get('Error.' + response.data.msg));
                }
            })
            .catch(function (response) {
                //handle error
                createNotification('error', 'Error.' + intl.get(response.data.msg));
                console.log(response);
            });
    }

    RemoveTokenAssetInCloudWallet(cb) {
        var bodyFormData = new FormData();
        bodyFormData.set('token', this.userstore.token);
        bodyFormData.set('publicaddress', this.selectedTokenAsset.PublicAddress);
        bodyFormData.set('shortcode', this.selectedTokenAsset.AssetCode);
        //bodyFormData.set('network', this.networkstore.selectednetwork.shortcode);

        axios({
            method: 'post',
            url: API_Server + 'api/token/RemoveTokenAssetInCloudWallet',
            data: bodyFormData,
            config: {headers: {'Content-Type': 'multipart/form-data'}}
        })
            .then(function (response) {
                console.log(response);
                if (response.data.status == 200) {
                    cb();
                } else {
                    createNotification('error', intl.get('Error.' + response.data.msg));
                }
            })
            .catch(function (response) {
                //handle error
                createNotification('error', 'Error.' + intl.get(response.data.msg));
                console.log(response);
            });
    }

    @action getTotalWorth(selectedWallet) {
        /*
        var totalworth = 0;
        if(selectedWallet.tokenassetlist.length > 0){
          selectedWallet.tokenassetlist.map((asset,index)=>{
            totalworth += asset.TokenBalance;
          })
        }
        */
        return `$${numberWithCommas(parseFloat(!isNaN(this.totalassetworth) ? this.totalassetworth : 0), true)}`;
    }

    toMYR = async () => {
        console.log("GETTING rate...");
        let response = await axios.get("http://api.openrates.io/latest?base=USD&symbols=MYR");
        this.setConvertRate(response.data.rates.MYR);
    }

    toCNY = async () => {
        console.log("GETTING rate CNY...");
        let response = await axios.get("http://api.openrates.io/latest?base=USD&symbols=CNY");
        this.setConvertRateCNY(response.data.rates.CNY);
    }


    @action ExitMultiSigWallet(publicaddress, cb) {

        //var selectednetwork = this.networkstore.selectednetwork.shortcode;

        var bodyFormData = new FormData();
        bodyFormData.set('token', this.userstore.token);
        bodyFormData.set('walletpublicaddress', publicaddress);
        //bodyFormData.set('network', selectednetwork);

        axios({
            method: 'post',
            url: API_Server + 'api/multisig/ExitMultiSigWallet',
            data: bodyFormData,
            config: {headers: {'Content-Type': 'multipart/form-data'}}
        })
            .then(function (response) {
                console.log(response);
                if (response.data.status == 200) {
                    cb();
                } else {
                    createNotification('error', intl.get('Error.' + response.data.msg));
                }
            })
            .catch(function (response) {
                //handle error
                createNotification('error', 'Error.' + intl.get(response.data.msg));
                console.log(response);
            });
    }

    @action RemoveMultiSigWallet(publicaddress, cb) {
        var bodyFormData = new FormData();
        bodyFormData.set('token', '/CA+8)D=@qW_3n=');
        bodyFormData.set('walletpublicaddress', publicaddress);
        bodyFormData.set('network', "");//this.networkstore.selectednetwork.shortcode);

        axios({
            method: 'post',
            url: API_Server + 'api/multisig/RemoveMultiSigWallet',
            data: bodyFormData,
            config: {headers: {'Content-Type': 'multipart/form-data'}}
        })
            .then(function (response) {
                console.log(response);
                if (response.data.status == 200) {
                    cb();
                } else {
                    createNotification('error', intl.get('Error.' + response.data.msg));
                }
            })
            .catch(function (response) {
                //handle error
                createNotification('error', 'Error.' + intl.get(response.data.msg));
                console.log(response);
            });
    }
}

const self = new walletStore();
export default self;
