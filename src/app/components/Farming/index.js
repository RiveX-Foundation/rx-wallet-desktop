import React, { Component } from "react";
import { Modal, Button, Input, Spin, Collapse } from "antd";
import { toJS } from "mobx";
import { inject, observer } from "mobx-react";
import { Row, Col } from 'antd';
import { CaretRightOutlined } from '@ant-design/icons';
import $ from 'jquery';
import intl from "react-intl-universal";
import { WALLETID } from "../../utils/support";
import {
  createNotification,
  getChainId,
  getGasPrice,
  getNonce,
} from "../../utils/helper";
import { BigNumber } from "bignumber.js";
import "./index.less";
import buttonback from "static/image/icon/back.png";
import aavevertical from "static/image/farming.png";
import ERC20ABI from "../../ABIs/ERC20.json";
import YRXFarming from "../../ABIs/YRXFarming.json";
import Web3 from "web3";
import LendingPoolAddressProviderABI from "../../ABIs/AddressProvider.json";
import LendingPoolABI from "../../ABIs/LendingPool.json";
import ATokenABI from "../../ABIs/AToken.json";
import LendingPoolCoreABI from "../../ABIs/LendingPoolCore.json";
import { create } from "lodash";
import Axios from "axios";
const { API_EthGas } = require("../../../../config/common");
var Tx = require("ethereumjs-tx");
const { Panel } = Collapse;

var web3;
var blockchainRefresh;
var ranges = [
  { divider: 1e18, suffix: "E" },
  { divider: 1e15, suffix: "P" },
  { divider: 1e12, suffix: "T" },
  { divider: 1e9, suffix: "G" },
  { divider: 1e6, suffix: "M" },
  { divider: 1e3, suffix: "K" },
];

@inject((stores) => ({
  setCurrent: (current) => stores.walletStore.setCurrent(current),
  setWalletEntryNextDirection: (val) =>
    stores.walletStore.setWalletEntryNextDirection(val),
  language: stores.languageIntl.language,
  addrSelectedList: stores.wanAddress.addrSelectedList,
  addrInfo: stores.wanAddress.addrInfo,
  setAaveDepositToken: (token) => stores.walletStore.setAaveDepositToken(token),
  setAaveDepositTokenAmount: (amount) =>
    stores.walletStore.setAaveDepositTokenAmount(amount),
  selectedwalletlist: stores.walletStore.selectedwalletlist,
  allTokenAsset: stores.walletStore.allTokenAsset,
  infuraprojectid: stores.walletStore.infuraprojectid,
  selectedwalletlist: stores.walletStore.selectedwalletlist,
  selectedethnetwork: stores.network.selectedethnetwork,
}))
@observer
class Farming extends Component {
  state = {
    mobilevalue: "",
    selectedwallet: "",
    preload: null,
    displayed: "none",
    loading: true,
    withdrawmodalvisible: false,
    claimmodalvisible: false,
    exitmodalvisible: false,
    withdrawamount: 0,
    gasprices: {},
    advancedgasprice: 0,
    privatekey: "",
    addrInfo: {
      normal: {},
      ledger: {},
      trezor: {},
      import: {},
      rawKey: {},
    },
    tokenlist: [],
    depositmodalvisible: false,
    selectedtoken: {},
    rRvxBalance: "",
    uniswaprvxusdtBalance: "",
    balanceryrxusdtBalance: "",
    yrxRewardsBalance: "",
    rRvxStakedBalance: "",
    uniswaprvxusdtStakedBalance: "",
    balanceryrxusdtStakedBalance: "",
    yrxRewardsStakedBalance: "",
    rRvxRewardsAvailable: "",
    uniswapRewardsAvailable: "",
    balancerRewardsAvailable: "",
    totalValueUsd: "0",
    stakeamount: 0,
    activepool: "",
    activepoolrewards: "",
    rvxUsdPrice: "0",
    rRvxAddress: "0x0E778A448d49f01BB08A81AE72D104c523685fC4", //change to mainnet
    uniswaprvxusdtaddress: "0x0E778A448d49f01BB08A81AE72D104c523685fC4", //change to mainnet uniswap rvx usdt lp
    balanceryrxusdtaddress: "0x0E778A448d49f01BB08A81AE72D104c523685fC4", //change to mainnet balancer yrx usdt 98/2
    yrxaddress: "0x260aD5e6Eb9119006efd66052120481bC77E3046", //change to mainnet yrx addy
    yrxpooloneaddress: "0xF348a446BA084dC90d63E79753C6E5957463F745", //change to mainnet pool one 
    yrxpooltwoaddress: "0x9bD58943ce4D86Fc6582e017AcF898b8a76B411d",//change to mainnet pool two 
    yrxpoolthreeaddress: "0x134AE1977a2F90CA4073F4E98f4cD7E14b16A4F7"//change to mainnet pool three 
  };

  async componentDidMount() {
    //  await this.getCurrentGasPrices();
    var selecetedwallet = toJS(this.props.selectedwalletlist);
    let walletlist = selecetedwallet.find(
      (x) => x.publicaddress == localStorage.getItem("selectedwallet")
    );
    walletlist = toJS(walletlist);
    console.log(walletlist);
    this.setState({
      privatekey: walletlist.privatekey,
    });
    web3 = new Web3("https://ropsten.infura.io" + this.props.infuraprojectid);
    this.setState({
      selectedwallet: localStorage.getItem("selectedwallet"),
    });
    await this.getDataFromBlockchain();
    blockchainRefresh = setTimeout(() => this.getDataFromBlockchain(), 15000);

    this.setState({
      loading: false,
    });
  }
  async componentWillUnmount() {
    clearTimeout(blockchainRefresh);
  }

  onChangeAdvancedGasPriceValue = (e) => {
    this.setState({
      advancedgasprice: e.target.value,
    });
  };


  getDataFromBlockchain = async () => {
    //var dollarvalue = await this.lookUpPrices(["rivex"]);
    let selectedwallet = localStorage.getItem("selectedwallet");
    const yrxContract = new web3.eth.Contract(
      ERC20ABI,
      this.state.yrxaddress
    );
    const uniswaprvxusdtContract = new web3.eth.Contract(
      ERC20ABI,
      this.state.uniswaprvxusdtaddress
    );
    const balanceryrxusdtContract = new web3.eth.Contract(
      ERC20ABI,
      this.state.balanceryrxusdtaddress
    );
    const rRvxContract = new web3.eth.Contract(
      ERC20ABI,
      this.state.rRvxAddress
    );
    const FarmingPoolOneContract = new web3.eth.Contract(
      YRXFarming,
      this.state.yrxpooloneaddress
    );
    const FarmingPoolTwoContract = new web3.eth.Contract(
      YRXFarming,
      this.state.yrxpooltwoaddress
    );
    const FarmingPoolThreeContract = new web3.eth.Contract(
      YRXFarming,
      this.state.yrxpoolthreeaddress
    );
    //get erc20 balances
    console.log("GETTING RRVX BALANCE");
    try {
      rRvxContract.methods
        .balanceOf(selectedwallet)
        .call()
        .then(async (bal) => {
          let balance = web3.utils.fromWei(bal.toString(), "ether");
          this.setState({
            rRvxBalance: balance
          });
        });
    } catch (error) {
      console.log("ERROR: " + error);
    }
    console.log("GETTING UNISWAP RVX USDT  BALANCE");
    try {
      uniswaprvxusdtContract.methods
        .balanceOf(selectedwallet)
        .call()
        .then(async (bal) => {
          let balance = web3.utils.fromWei(bal.toString(), "ether");
          this.setState({
            uniswaprvxusdtBalance: balance
          });
        });
    } catch (error) {
      console.log("ERROR: " + error);
    }

    console.log("GETTING BALANCER YRX USDT  BALANCE");
    try {
      balanceryrxusdtContract.methods
        .balanceOf(selectedwallet)
        .call()
        .then(async (bal) => {
          let balance = web3.utils.fromWei(bal.toString(), "ether");
          this.setState({
            balanceryrxusdtBalance: balance
          });
        });
    } catch (error) {
      console.log("ERROR: " + error);
    }

    //end erc balance



    //get staked balance

    console.log("GETTING STAKED BALANCE POOL 1");
    try {
      FarmingPoolOneContract.methods
        .balanceOf(selectedwallet)
        .call({ from: selectedwallet })
        .then(async (bal) => {
          let balance = web3.utils.fromWei(bal.toString(), "ether");
          this.setState({
            yrxRewardsStakedBalance: balance
          });
        });
    } catch (error) {
      console.log("ERROR: " + error);
    }


    console.log("GETTING STAKED BALANCE POOL 2");
    try {
      FarmingPoolTwoContract.methods
        .balanceOf(selectedwallet)
        .call({ from: selectedwallet })
        .then(async (bal) => {
          let balance = web3.utils.fromWei(bal.toString(), "ether");
          this.setState({
            uniswaprvxusdtStakedBalance: balance
          });
        });
    } catch (error) {
      console.log("ERROR: " + error);
    }

    console.log("GETTING STAKED BALANCE POOL 3");
    try {
      FarmingPoolThreeContract.methods
        .balanceOf(selectedwallet)
        .call({ from: selectedwallet })
        .then(async (bal) => {
          let balance = web3.utils.fromWei(bal.toString(), "ether");
          this.setState({
            balanceryrxusdtStakedBalance: balance
          });
        });
    } catch (error) {
      console.log("ERROR: " + error);
    }

    //end staked balance

    //get rewards available

    console.log("GETTING REWARDS AVAILABLE POOL 1");
    try {
      FarmingPoolOneContract.methods
        .earned(selectedwallet)
        .call({ from: selectedwallet })
        .then(async (bal) => {
          let balance = web3.utils.fromWei(bal.toString(), "ether");
          this.setState({
            yrxRewardsBalance: balance
          });
        });
    } catch (error) {
      console.log("ERROR: " + error);
    }


    console.log("GETTING REWARDS AVAILABLE POOL 2");
    try {
      FarmingPoolTwoContract.methods
        .earned(selectedwallet)
        .call({ from: selectedwallet })
        .then(async (bal) => {
          let balance = web3.utils.fromWei(bal.toString(), "ether");
          this.setState({
            uniswapRewardsAvailable: balance
          });
        });
    } catch (error) {
      console.log("ERROR: " + error);
    }


    console.log("GETTING REWARDS AVAILABLE POOL 3");
    try {
      FarmingPoolThreeContract.methods
        .earned(selectedwallet)
        .call({ from: selectedwallet })
        .then(async (bal) => {
          let balance = web3.utils.fromWei(bal.toString(), "ether");
          this.setState({
            balancerRewardsAvailable: balance
          });
        });
    } catch (error) {
      console.log("ERROR: " + error);
    }

    //end reward avaialble

    /* console.log("GETTING TOTAL RVX STAKED");
     let totalRVXstaked;
     try {
       LeagueofStakesContract.methods
         .totalSupply()
         .call({ from: selectedwallet })
         .then(async (bal) => {
           console.log(bal);
           let balance = web3.utils.fromWei(bal.toString(), "ether");
           console.log("total rvx staked:" + balance);
           totalRVXstaked = balance;
           await this.getTVL(dollarvalue, totalRVXstaked);
           this.setState({
             totalRvxStaked: balance
           });
         });
     } catch (error) {
       console.log("ERROR: " + error);
     }*/


  };

  clearInputs = () => {
    console.log("clearing inputs");
    this.setState({
      stakeamount: "",
      withdrawamount: ""
    });
  }

  getTVL = async (dollarvalue, totalRVXstaked) => {
    console.log("GETTING RVX USD PRICE AND TOTAL VALUE LOCKED (USD)");
    try {
      console.log(dollarvalue["rivex"])
      console.log(totalRVXstaked)
      console.log("TVL: " + parseFloat(dollarvalue["rivex"].usd) * parseFloat(totalRVXstaked))
      this.setState({
        rvxUsdPrice: dollarvalue["rivex"].usd,
        totalValueUsd: parseFloat(dollarvalue["rivex"].usd) * parseFloat(totalRVXstaked)
      })
    } catch (error) {
      console.log("ERROR: " + error);
    }

  }


  lookUpPrices = async (id_array) => {
    let ids = id_array.join("%2C");
    return $.ajax({
      url: "https://api.coingecko.com/api/v3/simple/price?ids=" + ids + "&vs_currencies=usd",
      type: 'GET'
    })
  }

  setMaxDeposit = (bal) => {
    this.setState({ stakeamount: bal });
  };

  setMaxWithdraw = (bal) => {
    this.setState({ withdrawamount: bal });
  };

  handleCancel = () => {
    this.setState({
      depositmodalvisible: false,
      withdrawmodalvisible: false,
      exitmodalvisible: false,
      claimmodalvisible: false
    });
  };



  stake = async () => {
    let tokenbal;
    let token;
    let tokenContract;
    let rewardaddress;
    if(this.state.activepool == "Pool 1 rRVX") {
      tokenbal = new BigNumber(this.state.rRvxBalance);
      token= "rRVX"
      tokenContract = this.state.rRvxAddress;
      rewardaddress = this.state.yrxpooloneaddress;
    } else if(this.state.activepool == "Pool 2 RVX/USDT Uniswap LP") {
      tokenbal = new BigNumber(this.state.uniswaprvxusdtBalance);
      token= "UNI-V2"
      tokenContract = this.state.uniswaprvxusdtaddress;
      rewardaddress = this.state.yrxpooltwoaddress;
    } else if(this.state.activepool == "Pool 3 YRX/USDT Balancer 98/2") {
      tokenbal = new BigNumber(this.state.balanceryrxusdtBalance);
      token= "BPT";
      tokenContract = this.state.balanceryrxusdtaddress;
      rewardaddress = this.state.yrxpoolthreeaddress;
    } else {
      return;
    }
     
    let stakeamount = new BigNumber(this.state.stakeamount.toString());
    stakeamount.comparedTo(tokenbal);
    if (
      stakeamount.comparedTo(tokenbal) > 0 ||
      Number(this.state.depositamount) <= 0 ||
      stakeamount.comparedTo(tokenbal) == null
    ) {
      this.setState({
        withdrawamount:"",
        stakeamount:""
      })
      createNotification("error", "Wrong stake amount!");
    } else {

      let oby = {
        token: token,
        tokenContract:tokenContract,
        tokenbalance: tokenbal.toString(),
        rewardAddress:rewardaddress,
        action: "Stake",
        pool: this.state.activepool
      };
      console.log(oby);
      this.props.setAaveDepositToken(oby);
      this.props.setAaveDepositTokenAmount(this.state.stakeamount);
      this.props.setCurrent("farmingtx");
    }
  };

  withdraw = async () => {
    let tokenbal;
    let token;
    let tokenContract;
    let rewardaddress;
    if(this.state.activepool == "Pool 1 rRVX") {
      tokenbal = new BigNumber(this.state.yrxRewardsStakedBalance);
      token= "rRVX"
      tokenContract = this.state.rRvxAddress;
      rewardaddress = this.state.yrxpooloneaddress;
    } else if(this.state.activepool == "Pool 2 RVX/USDT Uniswap LP") {
      tokenbal = new BigNumber(this.state.uniswaprvxusdtStakedBalance);
      token= "UNI-V2"
      tokenContract = this.state.uniswaprvxusdtaddress;
      rewardaddress = this.state.yrxpooltwoaddress;
    } else if(this.state.activepool == "Pool 3 YRX/USDT Balancer 98/2") {
      tokenbal = new BigNumber(this.state.balanceryrxusdtStakedBalance);
      token= "BPT";
      tokenContract = this.state.balanceryrxusdtaddress;
      rewardaddress = this.state.yrxpoolthreeaddress;
    } else {
      return;
    }
     
    let stakeamount = new BigNumber(this.state.withdrawamount.toString());
    stakeamount.comparedTo(tokenbal);
    if (
      stakeamount.comparedTo(tokenbal) > 0 ||
      Number(this.state.depositamount) <= 0 ||
      stakeamount.comparedTo(tokenbal) == null
    ) {
      createNotification("error", "Wrong withdraw amount!");
      this.setState({
        withdrawamount:"",
        stakeamount:""
      })
    } else {

      let oby = {
        token: token,
        tokenContract:tokenContract,
        tokenbalance: tokenbal.toString(),
        rewardAddress:rewardaddress,
        action: "Withdraw",
        pool: this.state.activepool
      };
      console.log(oby);
      this.props.setAaveDepositToken(oby);
      this.props.setAaveDepositTokenAmount(this.state.withdrawamount);
      this.props.setCurrent("farmingtx");
    }
  };

  claimrewards = async () => {
    let tokenbal;
    let token;
    let tokenContract;
    let rewardaddress;
    if(this.state.activepool == "Pool 1 rRVX") {
      tokenbal = new BigNumber(this.state.yrxRewardsBalance);
      token= "rRVX"
      tokenContract = this.state.rRvxAddress;
      rewardaddress = this.state.yrxpooloneaddress;
    } else if(this.state.activepool == "Pool 2 RVX/USDT Uniswap LP") {
      tokenbal = new BigNumber(this.state.uniswapRewardsAvailable);
      token= "UNI-V2"
      tokenContract = this.state.uniswaprvxusdtaddress;
      rewardaddress = this.state.yrxpooltwoaddress;
    } else if(this.state.activepool == "Pool 3 YRX/USDT Balancer 98/2") {
      tokenbal = new BigNumber(this.state.balancerRewardsAvailable);
      token= "BPT";
      tokenContract = this.state.balanceryrxusdtaddress;
      rewardaddress = this.state.yrxpoolthreeaddress;
    } else {
      return;
    }
    if(Number(tokenbal.toString()) == 0){
      createNotification("error", "No rewards to claim!");
      return;
    }
    let oby = {
      token: token,
      tokenContract:tokenContract,
      tokenbalance: tokenbal.toString(),
      rewardAddress:rewardaddress,
      action: "Claim Rewards",
      pool: this.state.activepool
    };
    this.props.setAaveDepositToken(oby);
    this.props.setAaveDepositTokenAmount(this.state.rvxRewardsAvailable);
    this.props.setCurrent("farmingtx");
  };

  exit = async () => {

    let tokenbal;
    let token;
    let tokenContract;
    let rewardaddress;
    let rewardBalance;
    if(this.state.activepool == "Pool 1 rRVX") {
      tokenbal = new BigNumber(this.state.yrxRewardsStakedBalance);
      rewardBalance = new BigNumber(this.state.yrxRewardsStakedBalance)
      token= "rRVX"
      tokenContract = this.state.rRvxAddress;
      rewardaddress = this.state.yrxpooloneaddress;
    } else if(this.state.activepool == "Pool 2 RVX/USDT Uniswap LP") {
      tokenbal = new BigNumber(this.state.uniswaprvxusdtStakedBalance);
      rewardBalance = new BigNumber(this.state.uniswapRewardsAvailable)
      token= "UNI-V2"
      tokenContract = this.state.uniswaprvxusdtaddress;
      rewardaddress = this.state.yrxpooltwoaddress;
    } else if(this.state.activepool == "Pool 3 YRX/USDT Balancer 98/2") {
      tokenbal = new BigNumber(this.state.balanceryrxusdtStakedBalance);
      rewardBalance = new BigNumber(this.state.balancerRewardsAvailable)
      token= "BPT";
      tokenContract = this.state.balanceryrxusdtaddress;
      rewardaddress = this.state.yrxpoolthreeaddress;
    } else {
      return;
    }
    if(Number(rewardBalance.toString()) == 0 && Number(tokenbal.toString() == 0)){
      createNotification("error", "Reward balance or Staked balance is 0!");
      return;
    }
    let oby = {
      token: token,
      tokenContract:tokenContract,
      tokenbalance: tokenbal.toString(),
      rewardAddress:rewardaddress,
      action: "Exit",
      pool: this.state.activepool
    };
    this.props.setAaveDepositToken(oby);
    this.props.setAaveDepositTokenAmount(this.state.rvxRewardsAvailable);
    this.props.setCurrent("farmingtx");
  };

  openModal = (pool) => {
    let activerew;
    if(pool == "Pool 1 rRVX") {
      activerew = this.state.yrxRewardsBalance
    } else if( pool =="Pool 2 RVX/USDT Uniswap LP") {
      activerew = this.state.uniswaprvxusdtBalance
    } else if(pool == "Pool 3 YRX/USDT Balancer 98/2") {
      activerew = this.state.balancerRewardsAvailable
    } else {
      return;
    }
    this.setState({
      depositmodalvisible: true,
      activepool: pool,
      activepoolrewards:activerew,
    });
  };

  openModalWithdraw = (pool) => {
    let activerew;
    if(pool == "Pool 1 rRVX") {
      activerew = this.state.yrxRewardsBalance
    } else if( pool =="Pool 2 RVX/USDT Uniswap LP") {
      activerew = this.state.uniswapRewardsAvailable
    } else if(pool == "Pool 3 YRX/USDT Balancer 98/2") {
      activerew = this.state.balancerRewardsAvailable
    } else {
      return;
    }
    this.setState({
      withdrawmodalvisible: true,
      activepool: pool,
      activepoolrewards:activerew,
    });
  };
  openModalExit = (pool) => {
    let activerew;
    if(pool == "Pool 1 rRVX") {
      activerew = this.state.yrxRewardsBalance
    } else if( pool =="Pool 2 RVX/USDT Uniswap LP") {
      activerew = this.state.uniswapRewardsAvailable
    } else if(pool == "Pool 3 YRX/USDT Balancer 98/2") {
      activerew = this.state.balancerRewardsAvailable
    } else {
      return;
    }
    this.setState({
      exitmodalvisible: true,
      activepool: pool,
      activepoolrewards:activerew,
    });
  };

  openModalClaim = (pool) => {
    let activerew;
    if(pool == "Pool 1 rRVX") {
      activerew = this.state.yrxRewardsBalance
    } else if( pool =="Pool 2 RVX/USDT Uniswap LP") {
      activerew = this.state.uniswapRewardsAvailable
    } else if(pool == "Pool 3 YRX/USDT Balancer 98/2") {
      activerew = this.state.balancerRewardsAvailable
    } else {
      return;
    }
    this.setState({
      claimmodalvisible: true,
      activepool: pool,
      activepoolrewards:activerew,
    });
  };
  back = () => {
    this.props.setCurrent("selectedwallet");
  };

  onChangeTokenValue = (e) => {
    this.setState({ stakeamount: e.target.value });
  };
  onChangeTokenValueWithdraw = (e) => {
    this.setState({ withdrawamount: e.target.value });
  };

  renderButtons(pool) {
    let pools = pool;
    return (
      <div>
        <Button
          className="curvebutton"
          style={{ marginTop: "15px", marginRight: "20px" }}
          onClick={() => this.openModal(pools)}
        >
          Stake
    </Button>
        <Button
          className="curvebutton"
          style={{ marginTop: "15px", marginRight: "20px" }}
          onClick={() => this.openModalClaim(pools)}
        >
          Claim Rewards
    </Button>
        <Button
          className="curvebutton"
          style={{ marginTop: "15px", marginRight: "20px" }}
          onClick={() => this.openModalWithdraw(pools)}
        >
          Withdraw
    </Button>
        <Button
          className="curvebutton"
          style={{ marginTop: "15px", marginRight: "20px" }}
          onClick={() => this.openModalExit(pools)}
        >
          Unstake and Claim
    </Button>
      </div>
    );
  }

  render() {
    return (
      <div id="farmingctn" className="Farming fadeInAnim">
        <div className="title">
          <span>
            <img onClick={this.back} width="20px" src={buttonback} />
          </span>
          <span style={{ marginLeft: "20px" }}>Farming</span>
        </div>
        <div className="walletname"></div>
        <div className="contentpanel">
          <img src={aavevertical} style={{ height: "20%", width: "20%" }}></img>
        </div>
        <div className="centerpanel">
          <Row type="flex" justify="center">
            <Col className="colClass" xs={{ span: 5, offset: 1 }} lg={{ span: 6, offset: 2 }} style={{ marginLeft: "57.578px!important" }}>
              <span style={{ color: "#9364d3" }}>Total Value Locked (USD)</span>
              <Col>{this.state.totalValueUsd} $</Col>
            </Col>
            <Col className="colClass" xs={{ span: 11, offset: 1 }} lg={{ span: 6, offset: 2 }}>
              <span style={{ color: "#9364d3" }}> YRX Price</span>
              <Col>{this.state.rvxUsdPrice} $</Col>
            </Col>
            <Col className="colClass" xs={{ span: 5, offset: 1 }} lg={{ span: 6, offset: 2 }}>
              <span style={{ color: "#9364d3" }}> Total Supply</span>
              <Col>15,000 YRX</Col>
            </Col>
          </Row>
          <div className="tokenwrapper">
            <Collapse accordion
              className="accordionpool"
              expandIcon={({ isActive }) => <CaretRightOutlined rotate={isActive ? 90 : 0} />}
              onChange={() => this.clearInputs()}
            >
              <Panel header="Pool 1 rRVX" key="1">
                <p>Staked Amount:<a onClick={() => this.setMaxWithdraw(this.state.yrxRewardsStakedBalance)}>{this.state.yrxRewardsStakedBalance}</a>  rRVX</p>
                <Row style={{ marginBottom: "30px" }}>
                  <Col span={12}>
                    <Row>
                      <Col span={12}><div className="balancetext2">Unstaked Amount</div></Col>
                      <Col span={12}><div className="balancetext" style={{ marginRight: "15px" }}>
                        <a onClick={() => this.setMaxDeposit(this.state.rRvxBalance)}> {Number(this.state.rRvxBalance).toFixed(6)} </a>
                      rRVX
                    </div>
                      </Col>
                    </Row>

                    <div
                      className="borderradiusfull"
                      style={{ marginRight: "15px" }}
                    >
                      <Input
                        className="inputTransparent3"
                        value={this.state.stakeamount}
                        onChange={this.onChangeTokenValue}
                        style={{ backgroundColor: "#242863" }}
                      />
                    </div>
                  </Col>
                  <Col span={12}>
                    <Row>
                      <Col span={12}><div className="balancetext2">Rewards Available </div></Col>
                      <Col span={12}><div className="balancetext" style={{ marginRight: "15px" }}>
                        {this.state.yrxRewardsBalance}
                      YRX
                    </div>
                      </Col>
                    </Row>
                    <div
                      className="borderradiusfull"
                    >
                      <Input
                        className="inputTransparent3"
                        value={this.state.withdrawamount}
                        onChange={this.onChangeTokenValueWithdraw}
                        style={{ backgroundColor: "#242863" }}
                      />
                    </div>
                  </Col>
                </Row>

                {this.renderButtons("Pool 1 rRVX")}
              </Panel>
            </Collapse>
            <Collapse accordion className="accordionpool"
              expandIcon={({ isActive }) => <CaretRightOutlined rotate={isActive ? 90 : 0} />}
              onChange={() => this.clearInputs()}>
              <Panel header="Pool 2 RVX/USDT Uniswap LP" key="2">
                <p>Staked Amount: <a onClick={() => this.setMaxWithdraw(this.state.uniswaprvxusdtStakedBalance)}>{this.state.uniswaprvxusdtStakedBalance}</a> UNI-V2</p>
                <Row style={{ marginBottom: "30px" }}>
                  <Col span={12}>
                    <Row>
                      <Col span={12}><div className="balancetext2">Unstaked Amount</div></Col>
                      <Col span={12}><div className="balancetext" style={{ marginRight: "15px" }}>
                        <a onClick={() => this.setMaxDeposit(this.state.uniswaprvxusdtBalance)}> {Number(this.state.uniswaprvxusdtBalance).toFixed(6)} </a>
                      UNI-V2
                    </div>
                      </Col>
                    </Row>
                    <div
                      className="borderradiusfull"
                      style={{ marginRight: "15px" }}
                    >
                      <Input
                        className="inputTransparent3"
                        value={this.state.stakeamount}
                        onChange={this.onChangeTokenValue}
                        style={{ backgroundColor: "#242863" }}
                      />
                    </div>
                  </Col>
                  <Col span={12}>
                    <Row>
                      <Col span={12}><div className="balancetext2">Rewards Available </div></Col>
                      <Col span={12}><div className="balancetext" style={{ marginRight: "15px" }}>
                        {this.state.uniswapRewardsAvailable}
                      YRX
                    </div>
                      </Col>
                    </Row>
                    <div
                      className="borderradiusfull"
                    >
                      <Input
                        className="inputTransparent3"
                        value={this.state.withdrawamount}
                        onChange={this.onChangeTokenValueWithdraw}
                        style={{ backgroundColor: "#242863" }}
                      />
                    </div>
                  </Col>
                </Row>
                {this.renderButtons("Pool 2 RVX/USDT Uniswap LP")}
              </Panel>
            </Collapse>
            <Collapse accordion className="accordionpool"
              expandIcon={({ isActive }) => <CaretRightOutlined rotate={isActive ? 90 : 0} />}
              onChange={() => this.clearInputs()}>
              <Panel header="Pool 3 YRX/USDT Balancer 98/2" key="3">
                <p>Staked Amount: <a onClick={() => this.setMaxWithdraw(this.state.balanceryrxusdtStakedBalance)}> {this.state.balanceryrxusdtStakedBalance}</a> BPT</p>
                <Row style={{ marginBottom: "30px" }}>
                  <Col span={12}>
                    <Row>
                      <Col span={12}><div className="balancetext2">Unstaked Amount</div></Col>
                      <Col span={12}><div className="balancetext" style={{ marginRight: "15px" }}>
                        <a onClick={() => this.setMaxDeposit(this.state.balanceryrxusdtBalance)}> {Number(this.state.balanceryrxusdtBalance).toFixed(6)} </a>
                      BPT
                    </div>
                      </Col>
                    </Row>
                    <div
                      className="borderradiusfull"
                      style={{ marginRight: "15px" }}
                    >
                      <Input
                        className="inputTransparent3"
                        value={this.state.stakeamount}
                        onChange={this.onChangeTokenValue}
                        style={{ backgroundColor: "#242863" }}
                      />
                    </div>
                  </Col>
                  <Col span={12}>
                    <Row>
                      <Col span={12}><div className="balancetext2">Rewards Available </div></Col>
                      <Col span={12}><div className="balancetext" style={{ marginRight: "15px" }}>
                        {this.state.balancerRewardsAvailable}
                      YRX
                    </div>
                      </Col>
                    </Row>
                    <div
                      className="borderradiusfull"
                    >
                      <Input
                        className="inputTransparent3"
                        value={this.state.withdrawamount}
                        onChange={this.onChangeTokenValueWithdraw}
                        style={{ backgroundColor: "#242863" }}
                      />
                    </div>
                  </Col>
                </Row>
                {this.renderButtons("Pool 3 YRX/USDT Balancer 98/2")}
              </Panel>
            </Collapse>
          </div>
        </div>
        <Modal
          title=""
          visible={this.state.depositmodalvisible}
          onOk={this.stake}
          onCancel={this.handleCancel}
          okText="Stake"
          cancelText="Cancel"
        >
          <div className="pheader">Amount to Stake to {this.state.activepool}</div>
          <div className="pmodalcontent">
            <div
              className="panelwrapper borderradiusfull"
              style={{ width: "500px" }}
            >
              <Input
                className="inputTransparent"
                value={this.state.stakeamount}
                onChange={this.onChangeTokenValue}
              />
            </div>
          </div>
          {this.state.loading === true && (
            <React.Fragment>
              <div>
                <center>
                  <Spin tip="Transaction pending..."></Spin>
                </center>
              </div>
            </React.Fragment>
          )}
        </Modal>

        <Modal
          title=""
          visible={this.state.withdrawmodalvisible}
          onOk={this.withdraw}
          onCancel={this.handleCancel}
          okText="Withdraw"
          cancelText="Cancel"
        >
          <div className="pheader">Amount to Withdraw from {this.state.activepool}</div>
          <div className="pmodalcontent">
            <div
              className="panelwrapper borderradiusfull"
              style={{ width: "500px" }}
            >
              <Input
                className="inputTransparent"
                value={this.state.withdrawamount}
                onChange={this.onChangeTokenValue}
              />
            </div>
          </div>
          {this.state.loading === true && (
            <React.Fragment>
              <div>
                <center>
                  <Spin tip="Transaction pending..."></Spin>
                </center>
              </div>
            </React.Fragment>
          )}
        </Modal>

        <Modal
          title=""
          visible={this.state.claimmodalvisible}
          onOk={this.claimrewards}
          onCancel={this.handleCancel}
          okText="Claim"
          cancelText="Cancel"
        >
          <div className="pheader">Claim rewards from {this.state.activepool}</div>
          <div className="pmodalcontent">
            <div
              className="panelwrapper borderradiusfull"
              style={{ width: "500px" }}
            >
              {this.state.activepoolrewards} YRX available to claim
            </div>
          </div>
          {this.state.loading === true && (
            <React.Fragment>
              <div>
                <center>
                  <Spin tip="Transaction pending..."></Spin>
                </center>
              </div>
            </React.Fragment>
          )}
        </Modal>

        <Modal
          title=""
          visible={this.state.exitmodalvisible}
          onOk={this.exit}
          onCancel={this.handleCancel}
          okText="Claim"
          cancelText="Cancel"
        >
          <div className="pheader">Exit - Claim rewards and Withdraw from {this.state.activepool}</div>
          <div className="pmodalcontent">
            <div
              className="panelwrapper borderradiusfull"
              style={{ width: "500px" }}
            >
              {this.state.activepoolrewards} YRX available to claim
            </div>
          </div>
          {this.state.loading === true && (
            <React.Fragment>
              <div>
                <center>
                  <Spin tip="Transaction pending..."></Spin>
                </center>
              </div>
            </React.Fragment>
          )}
        </Modal>
      </div>
    );
  }
}

export default Farming;
