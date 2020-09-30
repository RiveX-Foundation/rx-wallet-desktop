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
    rvxUsdPrice: "0",
    rRvxAddress: "0x5d921bD3676Be048A3EF7F6bB535d1993421DCA5", //change to mainnet
    uniswaprvxusdtaddress: "0x0E778A448d49f01BB08A81AE72D104c523685fC4", //change to mainnet uniswap rvx usdt lp
    balanceryrxusdtaddress: "0x0E778A448d49f01BB08A81AE72D104c523685fC4", //change to mainnet balancer yrx usdt 98/2
    yrxaddress: "0x260aD5e6Eb9119006efd66052120481bC77E3046", //change to mainnet yrx addy
    yrxpooloneaddress: "0x5de3112cd00BB062aEDc7a6E49fa37454345C4aC", //change to mainnet pool one 
    yrxpooltwoaddress: "0x44b857B097221eB231E64ee24C3082E05f259979",//change to mainnet pool two 
    yrxpoolthreeaddress: "0x9B18D5b4e8B2604F055E5A9df33715FEfc7eFB2d"//change to mainnet pool three 
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

  openModal = (pool) => {
    /* var selecetedwallet = toJS(this.props.selectedwalletlist);
     let walletlist = selecetedwallet.find(
       (x) => x.publicaddress == localStorage.getItem("selectedwallet")
     );
     walletlist = toJS(walletlist);
     let tokenasset = this.state.tokenlist.find((x) => x.token == token.token);
     //  let tokenasset = walletlist.tokenassetlist.find(x => x.AssetCode == token.token);
     if (tokenasset == null || tokenasset == "") {
       createNotification(
         "error",
         "Please add " + token.token + " to your wallet!"
       );
       return;
     }
     this.setState({
       depositmodalvisible: true,
       selectedtoken: token,
       tokenbalance: tokenasset.balance.toString(),
     });*/
  };

  stake = async () => {
    let tokenbal = new BigNumber(this.state.rvxBalance);
    let stakeamount = new BigNumber(this.state.stakeamount.toString());
    stakeamount.comparedTo(tokenbal);
    if (
      stakeamount.comparedTo(tokenbal) > 0 ||
      Number(this.state.depositamount) <= 0 ||
      stakeamount.comparedTo(tokenbal) == null
    ) {
      createNotification("error", "Wrong stake amount!");
    } else {
      let oby = {
        token: "RVX",
        tokenbalance: this.state.rvxBalance,
        action: "Stake"
      };
      this.props.setAaveDepositToken(oby);
      this.props.setAaveDepositTokenAmount(this.state.stakeamount);
      this.props.setCurrent("farmingtx");
    }
  };

  withdraw = async () => {
    let tokenbal = new BigNumber(this.state.rRvxBalance);
    let stakeamount = new BigNumber(this.state.stakeamount.toString());
    stakeamount.comparedTo(tokenbal);
    if (
      stakeamount.comparedTo(tokenbal) > 0 ||
      Number(this.state.depositamount) <= 0 ||
      stakeamount.comparedTo(tokenbal) == null
    ) {
      createNotification("error", "Wrong stake amount!");
    } else {
      let oby = {
        token: "rRVX",
        tokenbalance: this.state.rRvxBalance,
        action: "Withdraw"
      };
      this.props.setAaveDepositToken(oby);
      this.props.setAaveDepositTokenAmount(this.state.stakeamount);
      this.props.setCurrent("farmingtx");
    }
  };

  /* getCurrentGasPrices = async () => {
     let response = await Axios.get(API_EthGas);
     let prices = {
       low: parseFloat(response.data.safeLow) / 10,
       medium: parseFloat(response.data.average) / 10,
       high: parseFloat(response.data.fast) / 10,
     };
     this.setState({
       gasprices: prices,
       advancedgasprice: prices.medium,
     });
     return prices;
   };*/

  claimrewards = async () => {
    let oby = {
      token: "RVX",
      tokenbalance: this.state.rRvxBalance,
      action: "Claim Rewards"
    };
    this.props.setAaveDepositToken(oby);
    this.props.setAaveDepositTokenAmount(this.state.rvxRewardsAvailable);
    this.props.setCurrent("farmingtx");
  };

  exit = async () => {
    let oby = {
      token: "RVX",
      tokenbalance: this.state.rRvxBalance,
      action: "Exit"
    };
    this.props.setAaveDepositToken(oby);
    this.props.setAaveDepositTokenAmount(this.state.rvxRewardsAvailable);
    this.props.setCurrent("farmingtx");
  };

  openModal = (pool) => {

    this.setState({
      depositmodalvisible: true,
      activepool: pool
    });
  };

  openModalWithdraw = (pool) => {
    this.setState({
      withdrawmodalvisible: true,
      activepool: pool
    });
  };
  openModalExit = (pool) => {
    this.setState({
      exitmodalvisible: true,
      activepool: pool
    });
  };

  openModalClaim = (pool) => {
    this.setState({
      claimmodalvisible: true,
      activepool: pool
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
              <span style={{ color: "#9364d3" }}> RVX Price</span>
              <Col>{this.state.rvxUsdPrice} $</Col>
            </Col>
            <Col className="colClass" xs={{ span: 5, offset: 1 }} lg={{ span: 6, offset: 2 }}>
              <span style={{ color: "#9364d3" }}> Total Supply</span>
              <Col>25,000,000 RVX</Col>
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
                      <Col span={12}><div className="balancetext2">Rewards Available</div></Col>
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

                {this.renderButtons("pool1")}
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
                      <Col span={12}><div className="balancetext2">Rewards Available</div></Col>
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
                {this.renderButtons("pool2")}
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
                      <Col span={12}><div className="balancetext2">Rewards Available</div></Col>
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
                {this.renderButtons("pool3")}
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
            <div className="balancetext">
              balance:<a onClick={() => this.setMaxDeposit(this.state.rvxBalance)}> {this.state.rvxBalance} </a>
               RVX
            </div>
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
            <div className="balancetext">
              balance:<a onClick={() => this.setMaxWithdraw(this.state.rRvxBalance)}> {this.state.rRvxBalance} </a>
               rRVX
            </div>
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
              {this.state.rvxRewardsAvailable} RVX available to claim
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
              {this.state.rvxRewardsAvailable} RVX available to claim
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
