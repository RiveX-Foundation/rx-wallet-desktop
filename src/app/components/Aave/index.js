import React, {Component} from 'react';
import {Modal, Button,Input} from 'antd';
import {toJS} from 'mobx';
import {inject, observer} from 'mobx-react';
import intl from 'react-intl-universal';
import {WALLETID} from '../../utils/support';
import {createNotification, getChainId, getGasPrice, getNonce} from '../../utils/helper';
import {BigNumber} from 'bignumber.js';
import './index.less';
import buttonback from 'static/image/icon/back.png';
import ERC20ABI from '../../ABIs/ERC20.json';
import Web3 from 'web3';
import LendingPoolAddressProviderABI from '../../ABIs/AddressProvider.json';
import LendingPoolABI from '../../ABIs/LendingPool.json';
import LendingPoolCoreABI from '../../ABIs/LendingPoolCore.json';
import Item from 'antd/lib/list/Item';
var web3;
const pu = require('promisefy-util');
const WAN_PATH = "m/44'/5718350'/0'/0/0";
//const WAN_PATH = "m/44'/60'/0'/0/";
const {confirm} = Modal;

// m/44'/5718350'/0'/0/0


@inject(stores => ({
    setCurrent: current => stores.walletStore.setCurrent(current),
    setWalletEntryNextDirection: val => stores.walletStore.setWalletEntryNextDirection(val),
    language: stores.languageIntl.language,
    addrSelectedList: stores.wanAddress.addrSelectedList,
    addrInfo: stores.wanAddress.addrInfo,
    setAaveDepositToken: token => stores.walletStore.setAaveDepositToken(token),
    setAaveDepositTokenAmount: amount => stores.walletStore.setAaveDepositTokenAmount(amount),
    selectedwalletlist: stores.walletStore.selectedwalletlist,
    allTokenAsset: stores.walletStore.allTokenAsset,
    infuraprojectid: stores.walletStore.infuraprojectid
}))

@observer
class Aave extends Component {
    state = {
        mobilevalue: "",
        selectedwallet: "",
        preload: null,
        displayed: "none",
        loading: true,
        depositamount:"",
        addrInfo: {
            normal: {},
            ledger: {},
            trezor: {},
            import: {},
            rawKey: {}
        },
        apy:[]
    }


    async componentDidMount() {
        web3 = new Web3("https://mainnet.infura.io"+ this.props.infuraprojectid);
        await this.getAPYrates();
    }

    getLendingPoolAddressProviderContract = () => {
        const lpAddressProviderAddress = "0x24a42fD28C976A61Df5D00D0599C34c4f90748c8"; // mainnet address, for other addresses: https://docs.aave.com/developers/developing-on-aave/deployed-contract-instances
        const lpAddressProviderContract = new web3.eth.Contract(LendingPoolAddressProviderABI, lpAddressProviderAddress);
        return lpAddressProviderContract;
        }

    getLendingPoolCoreAddress = async() => {
        const lpCoreAddress = await this.getLendingPoolAddressProviderContract()
        .methods.getLendingPoolCore()
        .call()
        .catch((e) => {
          throw Error(`Error getting lendingPool address: ${e.message}`)
        })
  
      console.log("LendingPoolCore address: ", lpCoreAddress)
      return lpCoreAddress
     }

    deposit = async(e) => {
        console.log(e.target.value);
        this.props.setAaveDepositToken(e.target.value);
        this.props.setAaveDepositTokenAmount(this.state.depositamount);
        this.props.setCurrent("aavedeposit");
    }

    getAPYrates =async() => {
        var alltokens = toJS(this.props.allTokenAsset);
        const lpCoreAddress = await this.getLendingPoolCoreAddress();
        const lpCoreContract = new web3.eth.Contract(LendingPoolCoreABI, lpCoreAddress);
        console.log(toJS(this.props.allTokenAsset));
        var apylist =[];
        alltokens.map((item, index) => {
            if(item.AssetCode == "DAI" || item.AssetCode == "USDC" ||item.AssetCode == "USDT" ||item.AssetCode == "LINK" || item.AssetCode == "KNC" ||item.AssetCode == "SNX" ||item.AssetCode == "MKR"){
                var TokenInfo = item.TokenInfoList.find(x => x.Network == "mainnet");
                TokenInfo = toJS(TokenInfo);
                lpCoreContract.methods.getReserveCurrentLiquidityRate(TokenInfo.ContractAddress).call().then(async(result)=> {
                    BigNumber.config({RANGE:27});
                    var test = web3.utils.fromWei(result.toString(),'gether');
                    test = test.toString().slice(0,7);
                    let apy = parseFloat(test).toFixed(4);
                    apy = apy*100;
                    apylist.push({
                        token: item.AssetCode,
                        apy: apy,
                        LogoUrl: item.LogoUrl
                    });
                    console.log(item.AssetCode + " " +apy.toString() +"%");
                })
            }

        });
        this.setState({
            apy:apylist
        });
    }


    back = () => {
        this.props.setCurrent("selectedwallet");
    }

    onChangeTokenValue = e => {
        this.setState({depositamount: e.target.value});
    }

    render() {
        console.log(this.state.apy);
        return (
            <div id="selectwalletmainctn" className="selectedwalletpanel fadeInAnim">
                 <div className="tokenwrapper">
                     {
                         
                         this.state.apy.map(async(item, index) => {
                            return (
                                <div key={index} className="tokenassetitem">
                                       <div className="tokenassetitemrow">
                                            <img src={item.LogoUrl} className="tokenimg"/>
                                            <div className="infoctn">
                                                <div className="assetcode">{item.token}</div>
                                            </div>
                                        </div>
                                        <div className="tokenassetitemrow">
                                            <div className="amountctn">
                                            <div className="totalcoin"> 15M <span>{item.token}</span>
                                                </div>
                                            </div>
                                        </div>
                                </div>   
                            )
                         })
                     }
                 </div>
            </div>  
        );
    }
}

export default Aave;