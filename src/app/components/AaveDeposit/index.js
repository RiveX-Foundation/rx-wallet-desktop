import React, {Component} from 'react';
import {toJS} from 'mobx';
import {Modal, Button, Input} from 'antd';
import {inject, observer} from 'mobx-react';
import intl from 'react-intl-universal';
import {WALLETID} from '../../utils/support';
import {createNotification, getChainId, getGasPrice, getNoncem,isNullOrEmpty} from '../../utils/helper';
import {BigNumber} from 'bignumber.js';
import './index.less';
import Web3 from 'web3';
const {API_EthGas} = require('../../../../config/common');
import ERC20ABI from '../../ABIs/ERC20.json';
import LendingPoolAddressProviderABI from '../../ABIs/AddressProvider.json';
import LendingPoolABI from '../../ABIs/LendingPool.json';
import buttonback from 'static/image/icon/back.png';
var Tx = require('ethereumjs-tx');
const ethUtil = require('ethereumjs-util');
const pu = require('promisefy-util');
const WAN_PATH = "m/44'/5718350'/0'/0/0";
//const WAN_PATH = "m/44'/60'/0'/0/";
const {confirm} = Modal;
var web3;
// m/44'/5718350'/0'/0/0


@inject(stores => ({
    setCurrent: current => stores.walletStore.setCurrent(current),
    setWalletEntryNextDirection: val => stores.walletStore.setWalletEntryNextDirection(val),
    language: stores.languageIntl.language,
    addrSelectedList: stores.wanAddress.addrSelectedList,
    addrInfo: stores.wanAddress.addrInfo,
    infuraprojectid: stores.walletStore.infuraprojectid,
    aavedeposittoken: stores.walletStore.aavedeposittoken,
    setAaveDepositToken: token => stores.walletStore.setAaveDepositToken(token),
    selectedwalletlist: stores.walletStore.selectedwalletlist,
    selectedethnetwork: stores.network.selectedethnetwork,
    selectedTokenAsset: stores.walletStore.selectedTokenAsset
}))

@observer
class AaveDeposit extends Component {
    state = {
        mobilevalue: "",
        tokenbalance:0,
        depositamount:"",
        tokenInfo:{},
        selectedWallet:"",
        gaspricevalue:0

    }
    onChangeTokenValue = e => {
        this.setState({depositamount: e.target.value});
    }

    async componentDidMount() {
         web3 = new Web3("https://mainnet.infura.io"+ this.props.infuraprojectid);
         this.getTokenBalance();
         this.setState({
             selectedWallet:localStorage.getItem("selectedwallet").toString().toLowerCase()
         });
         let gasPrices = await this.getCurrentGasPrices();
         this.setState({
             gaspricevalue: gasPrices.medium
         });
    }
    getCurrentGasPrices = async () => {
        let response = await Axios.get(API_EthGas);

        let prices = {
            low: parseFloat(response.data.safeLow) /10,
            medium: parseFloat(response.data.average) /10,
            high: parseFloat(response.data.fast) /10
        }
        return prices;
    }

    getLendingPoolAddressProviderContract = () => {
    const lpAddressProviderAddress = "0x24a42fD28C976A61Df5D00D0599C34c4f90748c8"; // mainnet address, for other addresses: https://docs.aave.com/developers/developing-on-aave/deployed-contract-instances
    const lpAddressProviderContract = new web3.eth.Contract(LendingPoolAddressProviderABI, lpAddressProviderAddress);
    return lpAddressProviderContract;
    }

    getLendingPoolCoreAddress = async() => {
        const lpCoreAddress = await getLendingPoolAddressProviderContract()
        .methods.getLendingPoolCore()
        .call()
        .catch((e) => {
          throw Error(`Error getting lendingPool address: ${e.message}`)
        })
  
      console.log("LendingPoolCore address: ", lpCoreAddress)
      return lpCoreAddress
     }
    deposit = async() => {
        console.log(this.state.tokenInfo);
        const depositAmount = web3.utils.toWei(this.state.depositamount.toString(), "ether").toString();
        const tokenContract = this.state.tokenInfo.ContractAddress; 
        const referralCode = "0";

    try {
        const lpCoreAddress = await getLendingPoolCoreAddress()
        //check for approval
        const ERCcontract = new web3.eth.Contract(ERC20ABI, tokenContract)
        web3.eth.call({
            to:tokenContract,
            data: tokenContract.methods.allowance(this.state.selectedWallet,lpCoreAddress).encodeABI()
        }).then(balance => {
            console.log(balance);
            let approval = false;
            let allowance = web3.utils.fromWei(balance.toString(),'ether');
            console.log(allowance);
            if(parseFloat(allowance.toString()) >= parseFloat(this.state.depositamount.toString()) ){
                console.log("allowance is bigger")
            } else {
                console.log("allowance is smaller, need to approve")
                approval = true;
            }
            if(approval) {
                var dataApprove = ERCcontract.methods.approve(lpCoreAddress,depositAmount).encodeABI();
                var count = await web3.eth.getTransactionCount(this.props.selectedTokenAsset.PublicAddress);
                var rawTransaction = {
                    "from": this.state.selecetedwallet,
                    "to": tokenContract,//this.tokencontract,
                    "nonce": count,
                    "value": "0x0",//web3.utils.toHex(web3.utils.toWei(this.state.tokenval, 'ether')),
                    "data": dataApprove//contract.transfer.getData(this.tokencontract, 10, {from: this.props.selectedwallet.publicaddress}),
                };
                ERCcontract.methods.approve(lpCoreAddress,depositAmount).estimateGas({from: this.state.selectedWallet}).then(gasLimit => {
                    var gas = new BigNumber(gaslimit);
                    var gasPrice = web3.utils.toWei(this.state.gaspricevalue.toString(), "gwei");
                    rawTransaction = {
                        "from": this.state.selecetedwallet.toString(),
                        "nonce": count,
                        "gasPrice": web3.utils.toHex(gasPrice),//"0x04e3b29200",
                        // "gasPrice": gasPrices.high * 100000000,//"0x04e3b29200",
                        "gas": gasLimit,//"0x7458",
                        "to": tokenContract,//this.tokencontract,
                        "value": "0x0",//web3.utils.toHex(web3.utils.toWei(this.state.tokenval, 'ether')),
                        "data": dataApprove,//contract.transfer.getData(this.tokencontract, 10, {from: this.props.selectedwallet.publicaddress}),
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
                           // that.props.setsuccessulhash(hash);
                            //that.props.setCurrent("tokentransfersuccessful");
                        } else {
                            createNotification('error', intl.get('Error.TransactionFailed'));
                            console.log(err);
                        }
                    });
                })
            } else {

            }
        })
        // Approve the LendingPoolCore address with the DAI contract
        
      


        await daiContract.methods
          .approve(lpCoreAddress, depositAmount)
          .send({ from: this.state.selectedWallet })
          .catch((e) => {
            throw Error(`Error approving DAI allowance: ${e.message}`)
          })
  
        // Make the deposit transaction via LendingPool contract
        const lpAddress = await getLendingPoolAddress()
        const lpContract = new web3.eth.Contract(LendingPoolABI, lpAddress)
        await lpContract.methods
          .deposit(tokenContract, depositAmount, referralCode)
          .send({ from: this.state.selectedWallet })
          .catch((e) => {
            throw Error(`Error depositing to the LendingPool contract: ${e.message}`)
          })
      } catch (e) {
        alert(e.message)
        console.log(e.message)
      }
    }

    getTokenBalance = () => {
       // console.log(this.props.selectedwalletlist);
        var selecetedwallet = toJS(this.props.selectedwalletlist);
        let walletlist = selecetedwallet.find(x => x.publicaddress == localStorage.getItem("selectedwallet"));
       walletlist = toJS(walletlist);
       console.log(walletlist);
        walletlist.tokenassetlist.map(async (tokenitem, index) => {
            console.log(tokenitem);
            var TokenInfo = tokenitem.TokenInfoList.find(x => x.Network == "mainnet");
            if(tokenitem.AssetCode != this.props.aavedeposittoken.toString().toUpperCase()){
                console.log("wallet does not have this asset.");
                createNotification('error','Please add asset:'+this.props.aavedeposittoken+ ' to your wallet!');
                this.props.setCurrent('aave');
                return;
            }
            TokenInfo = toJS(TokenInfo);
            console.log(TokenInfo)
            this.setState({
                tokenInfo:TokenInfo
            });
            try{
                var tokenAbiArray = JSON.parse(TokenInfo.AbiArray);
            }catch(e){}
            if(tokenitem.AssetCode == this.props.aavedeposittoken.toString().toUpperCase()){
                let contract = new web3.eth.Contract(tokenAbiArray,TokenInfo.ContractAddress);
                web3.eth.call({
                    to: !isNullOrEmpty(TokenInfo.ContractAddress) ? TokenInfo.ContractAddress : null,
                    data: contract.methods.balanceOf(tokenitem.PublicAddress).encodeABI()
                }).then(balance => { 
                    if (tokenitem.AssetCode == "USDT") {
                        var tokenbal = new BigNumber(web3.utils.fromWei(balance, 'mwei'));
                        this.setState({
                            tokenbalance:parseFloat(tokenbal.toString())
                        })
                       tokenitem.TokenBalance = parseFloat(tokenbal.toString());
                    } else {
                        var tokenbal = new BigNumber(web3.utils.fromWei(balance, 'ether'));
                        this.setState({
                            tokenbalance:parseFloat(tokenbal.toString())
                        })
                    }
                })
            }
            
        })
    }

    back = () => {
        this.props.setCurrent("aave");
    }

    render() {
        return (
        <div className="splashcreatebasicwalletpanel fadeInAnim">
        <div className="title"><span><img onClick={this.back} width="20px" src={buttonback}/></span><span
       style={{marginLeft: "20px"}}>AAVE DEPOSIT</span></div>
            <div className="centerpanel">
                    <center>
                <div className="subtitle">{this.props.aavedeposittoken.toString().toUpperCase()} (savings)</div>
                    <div className="panelwrapper borderradiusfull spacebetween" style={{marginBottom: "10px"}}>
                            <div className="panellabel">APY: 0.66%</div>
                        </div>
                        <div className="spacebetween"> </div>
                        <div className="panelwrapper borderradiusfull" style={{marginBottom: "10px"}}>
                        <div className="spacebetween">
                        <div className="panellabel">Balance: {this.state.tokenbalance} {this.props.aavedeposittoken.toString().toUpperCase()}</div>
                            </div>
                            <Input
                            className="inputTransparent" placeholder="Deposit amount" value={this.state.depositamount} onChange={this.onChangeTokenValue}/>
                            <Button className="curvebutton" style={{marginTop:"15px"}}
                                     onClick={this.deposit}>Deposit</Button>
                        </div>
                    </center>
            </div> 
        </div>   
        )
    }

    /* render() {
       return ( 
         <div className="splashcreatebasicwalletpanel fadeInAnim">
           <iframe frameBorder="0" width="100%" height="100%" src="http://staging.wrdex.io/" ></iframe>
         </div>
       );
     }*/
}

export default AaveDeposit;