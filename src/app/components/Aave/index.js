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
import aavevertical from 'static/image/aavevertical.png';
import ERC20ABI from '../../ABIs/ERC20.json';
import Web3 from 'web3';
import LendingPoolAddressProviderABI from '../../ABIs/AddressProvider.json';
import LendingPoolABI from '../../ABIs/LendingPool.json';
import LendingPoolCoreABI from '../../ABIs/LendingPoolCore.json';
import { create } from 'lodash';

var web3;
var ranges = [
    { divider: 1e18 , suffix: 'E' },
    { divider: 1e15 , suffix: 'P' },
    { divider: 1e12 , suffix: 'T' },
    { divider: 1e9 , suffix: 'G' },
    { divider: 1e6 , suffix: 'M' },
    { divider: 1e3 , suffix: 'K' }
  ];



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
    infuraprojectid: stores.walletStore.infuraprojectid,
    selectedwalletlist: stores.walletStore.selectedwalletlist
}))

@observer
class Aave extends Component {
    state = {
        mobilevalue: "",
        selectedwallet: "",
        preload: null,
        displayed: "none",
        loading: true,
        depositamount:0,
        addrInfo: {
            normal: {},
            ledger: {},
            trezor: {},
            import: {},
            rawKey: {}
        },
        apy:[],
        depositmodalvisible:false,
        selectedtoken:{},
        tokenbalance:0
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

     formatNumber = (n) => {
        for (var i = 0; i < ranges.length; i++) {
            if (n >= ranges[i].divider) {
              return (n / ranges[i].divider).toString() + ranges[i].suffix;
            }
          }
          return n.toString();
     }

    deposit = async() => {
        this.props.setAaveDepositToken(this.state.selectedtoken);
        this.props.setAaveDepositTokenAmount(this.state.depositamount);
        this.props.setCurrent("aavedeposit");
    }

    getAPYrates =async() => {
        var alltokens = toJS(this.props.allTokenAsset);
        const lpCoreAddress = await this.getLendingPoolCoreAddress();
        const lpCoreContract = new web3.eth.Contract(LendingPoolCoreABI, lpCoreAddress);
        console.log(toJS(this.props.allTokenAsset));
        var apylist =[];
        var obj = {};
        console.log("GETTING APY RATES");
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
                    lpCoreContract.methods.getReserveTotalLiquidity(TokenInfo.ContractAddress).call().then(async(market)=> { 
                        let unit = "ether";
                        if(item.AssetCode == "USDT" || item.AssetCode == "USDC"){
                            unit = "mwei";
                        }
                        var rez = web3.utils.fromWei(market.toString(),unit);
                        rez = rez.toString().slice(0,12);
                        rez = Number(rez).toFixed(2);
                        console.log(rez);
                        var s = this.formatNumber(rez);
                        console.log(s);
                        let lastchar = s.slice(-1);
                        var x = s.indexOf('.');
                        
                        console.log(x);
                        s = s.slice(0,x+2);
                        s=s+lastchar;
                        //console.log(item.AssetCode + " " +s);
                        apylist.push({
                            token: item.AssetCode,
                            apy: apy,
                            LogoUrl: item.LogoUrl,
                            market:s
                        });
                    })
                 
                    
                   
                })
            }

        });
        setTimeout(() => {
            this.setState({
                apy:apylist
            });
          }, 1000);
       
    }

    
    handleCancel = () => {
        this.setState({
            depositmodalvisible: false
        });
    }

    openModal = (token) => {
        var selecetedwallet = toJS(this.props.selectedwalletlist);
        let walletlist = selecetedwallet.find(x => x.publicaddress == localStorage.getItem("selectedwallet"));
        walletlist = toJS(walletlist);
        let tokenasset = walletlist.tokenassetlist.find(x => x.AssetCode == token.token);
        if(tokenasset == null ||tokenasset == ""){
            createNotification('error','Please add '+token.token +' to your wallet!');;
            return;
        }
        console.log(tokenasset.TokenBalance);
        this.setState({
            depositmodalvisible: true,
            selectedtoken:token,
            tokenbalance: tokenasset.TokenBalance
        });
    }


    back = () => {
        this.props.setCurrent("selectedwallet");
    }

    onChangeTokenValue = e => {
        this.setState({depositamount: e.target.value});
    }


    render() {
        return (
            <div id="selectwalletmainctn" className="selectedwalletpanel fadeInAnim">
                <div className="title"><span><img onClick={this.back} width="20px" src={buttonback}/></span><span
            style={{marginLeft: "20px"}} >AAVE</span></div>
            <div className="walletname"></div>
                    <div className="contentpanel">
                    <img src={aavevertical} style={{height:"20%",width:"20%"}} ></img>
                    </div>
                    <div className="centerpanel">
                        <div className="tokenwrapper">
                        <div className="tokenassetitemtop">
                                       <div className="tokenassetitemrow">
                                            <div className="infoctn">
                                                <div className="assetcode">Asset</div>
                                            </div>
                                        </div>
                                        <div className="tokenassetitemrowmid">
                                            <div className="infoctn">
                                                <div className="assetcode">Deposit APY</div>
                                            </div>
                                        </div>
                                        <div className="tokenassetitemrow">
                                            <div className="amountctn">
                                            <div className="totalcoin"><span>Market size</span>
                                                </div>
                                            </div>
                                        </div>
                                </div>
                     {
                         
                         this.state.apy.map((item, index) => {
                            return (
                                <div key={index} className="tokenassetitem" onClick={() => this.openModal(item)} >
                                       <div className="tokenassetitemrow">
                                            <img src={item.LogoUrl} className="tokenimg"/>
                                            <div className="infoctn">
                                                <div className="assetcode">{item.token}</div>
                                            </div>
                                        </div>
                                        <div className="tokenassetitemrowmid">
                                            <div className="infoctn">
                                                <div className="assetcode">{Number(item.apy).toFixed(2)}%</div>
                                            </div>
                                        </div>
                                        <div className="tokenassetitemrow">
                                            <div className="amountctn">
                                            <div className="totalcoin"> {item.market}<span></span>
                                                </div>
                                            </div>
                                        </div>
                                </div>   
                            )
                         })
                     }
                        </div>
                        <Button className="curvebutton" style={{marginTop:"15px"}}
                                     onClick={this.dashboard}>Dasboard</Button>
                    </div>
                    <Modal
                            title=""
                            visible={this.state.depositmodalvisible}
                            onOk={this.deposit}
                            onCancel={this.handleCancel}
                            okText = "Deposit"
                            cancelText= "Cancel"
                        >
                             <div className="pheader">Amount to deposit</div>
                            <div className='pmodalcontent'><div className="balancetext">balance: {this.state.tokenbalance} {this.state.selectedtoken.token}</div>
                                <div className="panelwrapper borderradiusfull" style={{width:"500px"}}>
                                    <Input className="inputTransparent" value={this.state.depositamount} onChange={this.onChangeTokenValue}/>
                                </div>
                            </div>
                        </Modal>
            </div>  
        );
    }
}

export default Aave;