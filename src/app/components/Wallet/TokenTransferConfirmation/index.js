import React, { Component } from 'react';
import { Button, Input } from 'antd';
import { inject, observer } from 'mobx-react';
import intl from 'react-intl-universal';
import { createNotification } from 'utils/helper';
import { BigNumber } from 'bignumber.js';
import { toJS } from "mobx";
import iWanUtils from '../../../utils/iwanUtils';
import Slider from 'react-input-slider';
import './index.less';
import Axios from 'axios';
import buttonback from 'static/image/icon/back.png';
import { Console, ConsoleTransportOptions } from 'winston/lib/winston/transports';

const speakeasy = require("speakeasy");
const base32 = require('hi-base32');

var QRCode = require('qrcode.react');
const { tokenabi, API_EthGas } = require('../../../../../config/common');
var Tx = require('ethereumjs-tx');
var wanTx = require('wanchain-util').wanchainTx;
var Web3 = require('web3');

var bcrypt = require('bcryptjs');

//var fs = require('fs');

@inject(stores => ({
    selectedwallet: stores.walletStore.selectedwallet,
    selectedethnetwork: stores.network.selectedethnetwork,
    selectedwannetwork: stores.network.selectedwannetwork,
    twoFAType: stores.userRegistration.twoFAType,
    twoFAPassword: stores.userRegistration.twoFAPassword,
    googleAuthKey: stores.userRegistration.googleAuthKey,
    CreateEthAddress: (dappwallet) => stores.walletStore.CreateEthAddress(dappwallet),
    wsCreateTrx: (fromwalletpublicaddress, towalletpublicaddress, totaltoken) => stores.walletStore.wsCreateTrx(fromwalletpublicaddress, towalletpublicaddress, totaltoken),
    seedphase: stores.walletStore.seedphase,
    otptransfertoken: stores.walletStore.otptransfertoken,
    setotptransfertoken: () => stores.walletStore.setotptransfertoken(),
    setsuccessulhash: (val) => stores.walletStore.setsuccessulhash(val),
    ethaddress: stores.walletStore.ethaddress,
    setCurrent: current => stores.walletStore.setCurrent(current),
    wsRequestTransferOTP: () => stores.walletStore.wsRequestTransferOTP(),
    tokentransferreceiver: stores.walletStore.tokentransferreceiver,
    tokentransfertoken: stores.walletStore.tokentransfertoken,
    language: stores.languageIntl.language,
    selectedTokenAsset: stores.walletStore.selectedTokenAsset,
    setTrxGasPrice: (price) => stores.walletStore.setTrxGasPrice(price),
    allTokenAsset: stores.walletStore.allTokenAsset,
    mfaenabled: stores.walletStore.mfaenabled,
    decrypt: text => stores.walletStore.decrypt(text)
}))

@observer
class TokenTransferConfirmation extends Component {
    tokencontract = "";//this.props.selectednetwork.contractaddr;//"0x221535cbced4c264e53373d81b73c29d010832a5"; //XMOO CONTRACDT
    web3Provider = "";//this.props.selectednetwork.infuraendpoint; // "https://mainnet.infura.io:443";

    state = {
        tokenval: 0,
        receiver: "",
        otp: "notvalid",
        gaspricevalue: 30,
        mingaspricevalue: 1,
        maxgaspricevalue: 150,
        mfa: "",
        googleAuthKey: ""
    }

    componentDidMount() {
        this.tokencontract = this.props.selectedTokenAsset.TokenInfoList[0].ContractAddress;
        if (this.props.selectedTokenAsset.TokenType == "eth" || this.props.selectedTokenAsset.TokenType == "erc20") {
            this.web3Provider = this.props.selectedethnetwork.infuraendpoint + process.env.INFURA_PROJECT_ID;
        }

        this.props.setotptransfertoken("");
        this.get12SeedPhase();
        if (this.props.selectedTokenAsset.TokenType == "wan" || this.props.selectedTokenAsset.TokenType == "wrc20") {
            this.setState({
                gaspricevalue: 1,
                mingaspricevalue: 1,
                maxgaspricevalue: 180
            }, () => {
                this.props.setTrxGasPrice(this.state.gaspricevalue);
            })
        }
    }

    inputChanged = e => {
        this.setState({ mobilevalue: e.target.value }, () => {
            this.props.setMobile(this.state.mobilevalue);
        });
    }

    inputMFAChanged = e => {
        this.setState({ mfa: e.target.value });
    }

    get12SeedPhase = () => {
        const seedel = this.props.seedphase.map((item, i) => {
            return (
                <li key={i}>{item}</li>
            )
        }
        );
    }

    requestotp = () => {
        this.props.wsRequestTransferOTP();
    }

    onChangeTokenValue = e => {
        this.setState({ tokenval: e.target.value });
        //this.props.setMnemonic(e.target.value.replace(/^\s+|\s+$/g, '').replace(/\s+/g, ' '));
    }

    onChangeReceiver = e => {
        this.setState({ receiver: e.target.value });
        //this.props.setMnemonic(e.target.value.replace(/^\s+|\s+$/g, '').replace(/\s+/g, ' '));
    }

    copy = () => {
        console.log("COPY");
    }

    getCurrentGasPrices = async () => {
        let response = await Axios.get(API_EthGas);

        let prices = {
            low: response.data.safeLow,
            medium: response.data.average,
            high: 45
        }
        return prices;
    }

    back = () => {
        this.props.setCurrent("tokentransfer");
    }

    OTPChange = e => {
        this.setState({ otp: e.target.value });
    }

    pastetoken = event => {
        console.log(event.clipboardData);//.items[0].getAsString());
    }

    check2FAValid(googleauthkey, otp) {
        const secretAscii = base32.decode(googleauthkey);
        const secretHex = this._toHex(secretAscii);
        const authcode = speakeasy.totp({
            secret: secretHex,
            algorithm: 'sha1',
            encoding: 'hex'
        });
        return authcode == otp;
    }


    _toHex = (key) => {
        return new Buffer(key, 'ascii').toString('hex');
    }

    transfer = async () => {
        if (this.props.mfaenabled) {
            const secretAscii = base32.decode(this.props.decrypt(localStorage.getItem('twofasecret')));
            const secretHex = this._toHex(secretAscii);
            var authcode = speakeasy.totp.verifyDelta({
                secret: secretHex,
                encoding: 'hex',
                token: this.state.mfa,
                window: 3
            });
            if (authcode) {
                createNotification('success', intl.get('Success.ValidOTP'));
            } else {
                createNotification('error', intl.get('Error.InvalidOTP'));
                return;
            }
        }
        var that = this;

        //if(this.props.otptransfertoken == "" || this.state.otp != this.props.otptransfertoken){
        //  createNotification('error',intl.get('Error.InvalidOTP'));
        //  return;
        //}

        if (this.props.twoFAType == "sms" && this.state.otp != this.props.otptransfertoken) {
            createNotification('error', intl.get('Error.InvalidOTP'));
            return;
        }

        if (this.props.twoFAType == "totp" && !this.check2FAValid(this.props.googleAuthKey, this.state.otp)) {
            createNotification('error', intl.get('Error.Invalid2FAPassword'));
            return;
        }

        if (this.props.twoFAType == "password" && this.props.twoFAPassword != this.state.otp) {
            createNotification('error', intl.get('Error.Invalid2FAPassword'));
            return;
        }

        if (this.props.selectedwallet.wallettype == "sharedwallet") { //PROPOSE TO CLOUD
            this.props.wsCreateTrx(this.props.selectedwallet.publicaddress, this.props.tokentransferreceiver, this.props.tokentransfertoken);
        } else { //DIRECT EXECUTE TRX


            createNotification('info', intl.get('Info.Waiting'));
            if (this.props.selectedTokenAsset.TokenType == "eth") {
                const web3 = new Web3(this.web3Provider);
                var from = this.props.selectedTokenAsset.PublicAddress;
                var totalbalance = new BigNumber(web3.utils.toWei(this.props.selectedTokenAsset.TokenBalance.toString(), 'ether'));
                var targetaddr = this.props.tokentransferreceiver;
                var amountToSend = this.props.tokentransfertoken;
                var sendamount = new BigNumber(web3.utils.toWei(this.props.tokentransfertoken.toString(), 'ether'));
                let gasPrices = await this.getCurrentGasPrices();
                var tosend;
                var nonce = 0;
                var tx = {
                    from: from,
                    to: targetaddr,
                    value: web3.utils.toHex(web3.utils.toWei(amountToSend.toString(), 'ether')),
                    gasPrice: this.state.gaspricevalue * 1000000000
                }

                var transactionFee;
                web3.eth.estimateGas(tx).then(gaslimit => {
                    console.log(gaslimit);
                    var gas = new BigNumber(gaslimit);
                    console.log(gas);
                    console.log(gaslimit);
                    var gasPrice = web3.utils.toWei(this.state.gaspricevalue.toString(), "gwei");
                    console.log(gasPrice);
                    var txcost = gas.multipliedBy(gasPrice);
                    console.log("TXCOST" + txcost);
                    var totalcost = txcost.plus(sendamount);
                    console.log(totalcost + " " + totalbalance);
                    if (totalcost > totalbalance) {
                        console.log("total cost higher");
                        tosend = sendamount.minus(txcost);
                    } else {
                        console.log("total cost lower");
                        tosend = sendamount;
                    }

                    console.log(tosend.toString());



                    //var transactionFee = (this.state.gaspricevalue * 1000000000)* gasLimit; 
                    //console.log("TX FEE: "+transactionFee);
                    web3.eth.getTransactionCount(from).then(txCount => {
                        nonce = txCount++;
                        let details = {
                            "from": from,
                            "to": targetaddr,
                            "value": web3.utils.toHex(tosend.toString()),
                            "gas": gaslimit,
                            "gasPrice": web3.utils.toHex(gasPrice.toString()),
                            // "gasPrice": gasPrices.high * 1000000000,
                            "nonce": nonce,
                            "chainId": this.props.selectedethnetwork.chainid
                        }
                        console.log(details);

                        var transaction = this.props.selectedethnetwork.shortcode == "mainnet" ? new Tx(details) : new Tx(details, {
                            chain: this.props.selectedethnetwork.shortcode,
                            hardfork: 'petersburg'
                        });
                        transaction.sign(Buffer.from(this.props.selectedTokenAsset.PrivateAddress, 'hex'))
                        const serializedTransaction = transaction.serialize()
                        web3.eth.sendSignedTransaction('0x' + serializedTransaction.toString('hex'), (err, hash) => {
                            if (!err) { //SUCCESS
                                console.log(hash);
                                that.props.setsuccessulhash(hash);
                                that.props.setCurrent("tokentransfersuccessful");
                            } else {
                                createNotification('error', intl.get('Error.TransactionFailed'));
                                console.log(err);
                            }
                        });
                    });
                });
            } else if (this.props.selectedTokenAsset.TokenType == "wan") {
                const web3 = new Web3(this.web3Provider);
                var totalbalance = new BigNumber(web3.utils.toWei(this.props.selectedTokenAsset.TokenBalance.toString(), 'ether'));
                var from = this.props.selectedTokenAsset.PublicAddress.toString().toLowerCase();
                var sendamount = new BigNumber(web3.utils.toWei(this.props.tokentransfertoken.toString(), 'ether'));
                var TokenInfo = this.props.selectedTokenAsset.TokenInfoList[0];
                var abiArray = JSON.parse(TokenInfo.AbiArray);
                var receiver = this.props.tokentransferreceiver.toString().toLowerCase();//"0x8859C2BE1a9D6Fbe37E1Ed58c103487eE7B8b90F";
                var tosend;
                var tx = {
                    from: from,
                    to: receiver,
                    value: web3.utils.toHex(sendamount),
                    gasPrice: this.state.gaspricevalue * 1000000000
                }

                iWanUtils.getNonce("WAN", this.props.selectedTokenAsset.PublicAddress).then(async (res) => {
                    if (res && Object.keys(res).length) {
                        var nonce = res;
                        try {
                            iWanUtils.estimateGas("WAN", tx).then(async (gas) => {
                                var gass = new BigNumber(gas);
                                var gasPrice = web3.utils.toWei(this.state.gaspricevalue.toString(), "gwei");
                                var txcost = gass.multipliedBy(gasPrice);
                                var totalcost = txcost.plus(sendamount);
                                console.log(totalcost);
                                console.log(totalbalance);
                                if (totalcost > totalbalance) {
                                    console.log("total cost higher");
                                    tosend = sendamount.minus(txcost);
                                } else {
                                    console.log("total cost lower");
                                    tosend = sendamount;
                                }
                                var rawTransaction = {
                                    "from": this.props.selectedTokenAsset.PublicAddress,
                                    "nonce": nonce,
                                    "gasPrice": web3.utils.toHex(gasPrice.toString()),//gasprice,// * 1000,//"0x737be7600",//gasPrices.high * 100000000,//"0x04e3b29200",
                                    // "gasPrice": 180000000000,//gasprice,// * 1000,//"0x737be7600",//gasPrices.high * 100000000,//"0x04e3b29200",
                                    "gasLimit": web3.utils.toHex(gass.toString()),//web3.utils.toHex("519990"),//"0x7458",'0x35B60'
                                    "Txtype": "0x01",
                                    "to": receiver,
                                    "value": web3.utils.toHex(tosend.toString()),
                                    "chainId": this.props.selectedwannetwork.chainid
                                };
                                console.log("trx raw", rawTransaction);
                                var privKey = new Buffer(this.props.selectedTokenAsset.PrivateAddress, 'hex');//"35e0ec8f5d689f370cdc9c35a04d1664c9316aadbd2ac508cfa69f3de7aaa233", 'hex');
                                var tx = new wanTx(rawTransaction);
                                tx.sign(privKey);

                                var serializedTx = tx.serialize();
                                iWanUtils.sendRawTransaction("WAN", '0x' + serializedTx.toString('hex')).then(res => {
                                    that.props.setsuccessulhash(res);
                                    that.props.setCurrent("tokentransfersuccessful");
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
            } else if (this.props.selectedTokenAsset.TokenType == "wrc20") {
                const web3 = new Web3(this.web3Provider);
                var tokenitem = toJS(this.props.selectedwallet.tokenassetlist).find(x => x.AssetCode == "wan");
                if (tokenitem.TokenBalance < 0.001) {
                    createNotification('error', "WAN balance too low!");
                    this.props.setCurrent("tokentransfer");
                    return;
                }
                var from = this.props.selectedTokenAsset.PublicAddress.toString().toLowerCase();
                var sendamount = new BigNumber(web3.utils.toWei(this.props.tokentransfertoken.toString(), 'ether'));
                // var TokenInfo = this.props.selectedTokenAsset.TokenInfoList[0];
                var CurrentNetworkAllTokenInfo = toJS(this.props.allTokenAsset).find(x => x.AssetCode == this.props.selectedTokenAsset.AssetCode);
                var TokenInfo = CurrentNetworkAllTokenInfo.TokenInfoList[0];
                TokenInfo = toJS(TokenInfo);
                var abiArray = JSON.parse(TokenInfo.AbiArray);

                var contractdata = new web3.eth.Contract(abiArray, TokenInfo.ContractAddress);
                var receiver = this.props.tokentransferreceiver.toString().toLowerCase();//"0x8859C2BE1a9D6Fbe37E1Ed58c103487eE7B8b90F";

                iWanUtils.getNonce("WAN", this.props.selectedTokenAsset.PublicAddress).then(async (res) => {
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
                                }, [receiver, web3.utils.toWei(this.props.tokentransfertoken.toString(), 'ether')]);

                                var rawTransaction = {
                                    "from": this.props.selectedTokenAsset.PublicAddress,
                                    "nonce": nonce,
                                    "gasPrice": this.state.gaspricevalue * 1000000000,//gasprice,// * 1000,//"0x737be7600",//gasPrices.high * 100000000,//"0x04e3b29200",
                                    // "gasPrice": 180000000000,//gasprice,// * 1000,//"0x737be7600",//gasPrices.high * 100000000,//"0x04e3b29200",
                                    "gas": '0x35B60',//"0x5208",//"0x7458",
                                    "gasLimit": '0x35B60',//web3.utils.toHex("519990"),//"0x7458",
                                    "Txtype": "0x01",
                                    "to": TokenInfo.ContractAddress,//this.tokencontract,
                                    "value": "0x0",//web3.utils.toHex(web3.utils.toWei(this.state.tokenval, 'ether')),
                                    "data": data, //contractdata.methods.transfer(receiver,10).encodeABI(),//data,
                                    "chainId": this.props.selectedwannetwork.chainid //"0x03" //1 mainnet
                                };
                                console.log("trx raw", rawTransaction);
                                var privKey = new Buffer(this.props.selectedTokenAsset.PrivateAddress, 'hex');//"35e0ec8f5d689f370cdc9c35a04d1664c9316aadbd2ac508cfa69f3de7aaa233", 'hex');
                                var tx = new wanTx(rawTransaction);
                                tx.sign(privKey);

                                var serializedTx = tx.serialize();
                                iWanUtils.sendRawTransaction("WAN", '0x' + serializedTx.toString('hex')).then(res => {
                                    console.log(res);
                                    that.props.setsuccessulhash(res);
                                    that.props.setCurrent("tokentransfersuccessful");
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
                    createNotification('error', intl.get('Error.TransactionFailed'));
                    this.props.setCurrent("tokentransfer");
                });
            } else if (this.props.selectedTokenAsset.TokenType == "erc20") {
                var tokenitem = toJS(this.props.selectedTokenAsset);
                var unit = "ether";
                if (tokenitem.AssetCode == "USDT" || tokenitem.AssetCode == "fls6") {
                    unit = "mwei"
                }
                const web3 = new Web3(this.web3Provider);
                var count = await web3.eth.getTransactionCount(this.props.selectedTokenAsset.PublicAddress);
                var gasPrices = await this.getCurrentGasPrices();
                var totalbalance = new BigNumber(web3.utils.toWei(this.props.selectedTokenAsset.TokenBalance.toString(), unit));
                var sendamount = new BigNumber(web3.utils.toWei(this.props.tokentransfertoken.toString(), unit));
                var tosend;
                console.log("sending "+sendamount.toString())
                var TokenInfo = this.props.selectedTokenAsset.TokenInfoList[0];
                var abiArray = JSON.parse(TokenInfo.AbiArray);
                var contractdata = new web3.eth.Contract(abiArray, TokenInfo.ContractAddress);//, {from: this.props.selectedwallet.publicaddress}); //).at(this.tokencontract);
                var data = contractdata.methods.transfer(this.props.tokentransferreceiver.toString().toLowerCase(), web3.utils.toWei(this.props.tokentransfertoken.toString(), unit)).encodeABI();
                console.log(data);
                var rawTransaction = {
                    "from": this.props.selectedTokenAsset.PublicAddress,
                    "to": TokenInfo.ContractAddress,//this.tokencontract,
                    "nonce": count,
                    "value": "0x0",//web3.utils.toHex(web3.utils.toWei(this.state.tokenval, 'ether')),
                    "data": data//contract.transfer.getData(this.tokencontract, 10, {from: this.props.selectedwallet.publicaddress}),
                };
                console.log(contractdata);


                try {
                    contractdata.methods.transfer(this.props.tokentransferreceiver, sendamount.toString()).estimateGas({ from: this.props.selectedTokenAsset.PublicAddress }).then(gaslimit => {
                        console.log(gaslimit);
                        var gas = new BigNumber(gaslimit);
                        var gasPrice = web3.utils.toWei(this.state.gaspricevalue.toString(), "gwei");
                        var txcost = gas.multipliedBy(gasPrice);
                        console.log(web3.utils.fromWei(txcost.toString(), "ether"));
                        console.log(tokenitem.TokenBalance);
                        if (parseFloat(web3.utils.fromWei(txcost.toString(), "ether")) > parseFloat(tokenitem.TokenBalance.toString())) {
                            createNotification('error', "ETH balance too low!");
                            this.props.setCurrent("tokentransfer");
                            return;
                        }
                        rawTransaction = {
                            "from": this.props.selectedTokenAsset.PublicAddress.toString(),
                            "nonce": count,
                            "gasPrice": web3.utils.toHex(gasPrice),//"0x04e3b29200",
                            // "gasPrice": gasPrices.high * 100000000,//"0x04e3b29200",
                            "gas": 60000,//"0x7458",
                            "to": TokenInfo.ContractAddress,//this.tokencontract,
                            "value": "0x0",//web3.utils.toHex(web3.utils.toWei(this.state.tokenval, 'ether')),
                            "data": data,//contract.transfer.getData(this.tokencontract, 10, {from: this.props.selectedwallet.publicaddress}),
                            "chainId": this.props.selectedethnetwork.chainid
                        };



                        var privKey = new Buffer(this.props.selectedTokenAsset.PrivateAddress, 'hex');
                        var tx = this.props.selectedethnetwork.shortcode == "mainnet" ? new Tx(rawTransaction) : new Tx(rawTransaction, {
                            chain: this.props.selectedethnetwork.shortcode,
                            hardfork: 'petersburg'
                        });
                        tx.sign(privKey);
                        var serializedTx = tx.serialize();

                        web3.eth.sendSignedTransaction('0x' + serializedTx.toString('hex'), function (err, hash) {
                            if (!err) { //SUCCESS
                                console.log(hash);
                                that.props.setsuccessulhash(hash);
                                that.props.setCurrent("tokentransfersuccessful");
                            } else {
                                createNotification('error', intl.get('Error.TransactionFailed'));
                                console.log(err);
                            }
                        });
                    }).catch(error =>{
                    createNotification('error', intl.get('Error.TransactionFailed'));
                    this.props.setCurrent("tokentransfer");
                    console.log("ERR", error);
                    })
                } catch (e) {
                    createNotification('error', intl.get('Error.TransactionFailed'));
                    this.props.setCurrent("tokentransfer");
                    console.log("ERR", e);
                }

            }
        }
    }

    _setCurrentGasPrice = (price) => {
        // console.log(price);
        this.setState({
            gaspricevalue: price
        }, () => {
            this.props.setTrxGasPrice(price);
        })
    }

    _formatWeiWin = (tokentype) => {
        if (tokentype == "eth" || tokentype == "erc20") {
            return "gwei";
        } else if (tokentype == "wan" || tokentype == "wrc20") {
            return "gwin";
        }
    }

    render() {
        var totpurl = "otpauth://totp/RVXWallet?secret=" + this.props.googleAuthKey;
        return (
            <div className="tokentransferconfirmationpanel fadeInAnim">
                <div className="title"><span><img onClick={this.back} width="20px" src={buttonback}/></span><span
                    style={{marginLeft: "20px"}}>{intl.get('TokenTransfer.Confirmation')}</span></div>
                <div className="centerpanel">
                    <center>
                        <div className="subtitle">{this.props.selectedwallet.walletname}</div>
                        <div className="panelwrapper borderradiusfull spacebetween" style={{marginBottom: "10px"}}>
                            <div className="panellabel">{intl.get('TokenTransferConfirmation.From')}</div>
                            <div className="panelvalue">{this.props.selectedTokenAsset.PublicAddress}</div>
                        </div>
                        <div className="panelwrapper borderradiusfull" style={{marginBottom: "10px"}}>
                            <div className="spacebetween">
                                <div className="panellabel">{intl.get('TokenTransferConfirmation.To')}</div>
                                <div className="panelvalue">{this.props.tokentransferreceiver}</div>
                            </div>
                            <div className="spacebetween" style={{marginTop: "10px"}}>
                                <div className="panellabel">{intl.get('TokenTransferConfirmation.Amount')}</div>
                                <div
                                    className="panelvalue">{this.props.tokentransfertoken} {this.props.selectedTokenAsset.AssetCode.toUpperCase()}</div>
                            </div>
                        </div>
                        <div className="panelwrapper borderradiusfull" style={{marginBottom: "10px"}}>
                            <div className="spacebetween">
                                <div className="panellabel">{intl.get('Transaction.GasPrice')}</div>
                                <div
                                    className="panelvalue">{this.state.gaspricevalue} {this._formatWeiWin(this.props.selectedTokenAsset.TokenType)}</div>
                            </div>
                            <div className="spacebetween"
                                 style={{marginTop: "20px", marginRight: "20px", marginLeft: "20px"}}>
                                <Slider
                                    axis="x"
                                    xstep={1}
                                    xmin={this.state.mingaspricevalue}
                                    xmax={this.state.maxgaspricevalue}
                                    x={this.state.gaspricevalue}
                                    onChange={({x}) => this._setCurrentGasPrice(x)}
                                    styles={{
                                        track: {
                                            backgroundColor: '#000000',
                                            height: 5,
                                            width: "100%",
                                        },
                                        active: {
                                            backgroundColor: '#5f5cdf',
                                            height: 5
                                        },
                                        thumb: {
                                            width: 15,
                                            height: 15,
                                            backgroundColor: '#64F4F4'
                                        },
                                    }}
                                />
                            </div>
                        </div>
                        <div className="width600 spacebetween" style={{marginBottom: "30px"}}>

                            {
                                this.props.twoFAType == "sms" &&
                                <React.Fragment>
                                    <div className="panelwrapper borderradiusfull spacebetween"
                                         style={{width: "440px", paddingTop: "5px", paddingBottom: "5px"}}>
                                        <div className="panellabel" style={{paddingLeft: "0px"}}><Input
                                            className="inputTransparent otpinputclass" onChange={this.OTPChange}
                                            placeholder={intl.get('Auth.EnterOTP')}/></div>
                                    </div>
                                    <div className="panelvalue" style={{paddingRight: "0px"}}><Button
                                        className="radiusbutton"
                                        onClick={this.requestotp}>{intl.get('Auth.RequestOTP')}</Button></div>
                                </React.Fragment>
                            }

                            {
                                this.props.twoFAType == "password" &&
                                <div className="panelwrapper borderradiusfull spacebetween">
                                    <div className="panellabel"
                                         style={{marginTop: "5px"}}>{intl.get('Settings.2FASecurity.SecurityCode')}</div>
                                    <Input id="otp" type="password" className="inputTransparent"
                                           onChange={this.OTPChange}
                                           placeholder={intl.get('Settings.2FASecurity.SecurityCode')}/>
                                </div>
                            }

                            {
                                this.props.twoFAType == "totp" &&
                                <React.Fragment>
                                    <div style={{marginTop: "40px"}} className="qrcodectn">
                                        <div className="inner">
                                            <QRCode fgColor="#4954AE" size={130} value={totpurl}/>
                                        </div>
                                    </div>

                                    <div style={{marginTop: "40px"}}>
                                        <div
                                            style={{width: "400px"}}>{intl.get('Settings.Key') + " : " + this.props.googleAuthKey}</div>
                                        <div style={{marginTop: "20px", paddingLeft: "20px", width: "400px"}}
                                             className="panelwrapper borderradiusfull">
                                            <Input id="otp" type="password" className="inputTransparent"
                                                   onChange={this.OTPChange}
                                                   placeholder={intl.get('Settings.2FASecurity.SecurityCode')}/>
                                        </div>
                                    </div>
                                </React.Fragment>
                            }

                        </div>
                        {
                            this.props.mfaenabled == true &&
                            <React.Fragment>
                                <div className="inputpanel">
                                    <div className="panelwrapper borderradiusfull">
                                        <Input id="mfa" value={this.state.mfa} placeholder={intl.get('Auth.EnterOTP')}
                                               className="inputTransparent" onChange={this.inputMFAChanged}/>
                                    </div>
                                </div>
                            </React.Fragment>
                        }

                        <div><Button className="curvebutton"
                                     onClick={this.transfer}>{intl.get('Wallet.Confirm')}</Button></div>
                    </center>
                </div>
            </div>
        );
    }
}

export default TokenTransferConfirmation;