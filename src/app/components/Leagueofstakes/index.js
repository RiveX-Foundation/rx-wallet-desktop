import React, { Component } from "react";
import { Modal, Button, Input, Spin, Tooltip } from "antd";
import { toJS } from "mobx";
import { inject, observer } from "mobx-react";
import { Row, Col } from 'antd';
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
import aavevertical from "static/image/staking.png";
import ERC20ABI from "../../ABIs/ERC20.json";
import LOSV2 from "../../ABIs/LOSv2.json";
import Web3 from "web3";
import LendingPoolAddressProviderABI from "../../ABIs/AddressProvider.json";
import LendingPoolABI from "../../ABIs/LendingPool.json";
import ATokenABI from "../../ABIs/AToken.json";
import LendingPoolCoreABI from "../../ABIs/LendingPoolCore.json";
import { create } from "lodash";
import Axios from "axios";
const { API_EthGas } = require("../../../../config/common");
var Tx = require("ethereumjs-tx");

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
class Leagueofstakes extends Component {
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
    rvxBalance: "",
    rRvxBalance: "",
    rvxStakedBalance: "",
    rvxRewardsAvailable: "",
    rvxUsdPrice: "",
    totalValueUsd: "",
    totalRvxStaked: "",
    stakeamount: 0,
    rvxAddress: "0x5d921bD3676Be048A3EF7F6bB535d1993421DCA5",
    rRvxAddress: "0x0E778A448d49f01BB08A81AE72D104c523685fC4",
    losAddress: "0x17584cFDfb113431a2ae5eA7c9C1b3558904faDf"
  };

  async componentDidMount() {
    let gasPrices = await this.getCurrentGasPrices();
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
    var dollarvalue = await this.lookUpPrices(["rivex"]);
    let selectedwallet = localStorage.getItem("selectedwallet");
    const rvxContract = new web3.eth.Contract(
      ERC20ABI,
      this.state.rvxAddress
    );
    const rRvxContract = new web3.eth.Contract(
      ERC20ABI,
      this.state.rRvxAddress
    );
    const LeagueofStakesContract = new web3.eth.Contract(
      LOSV2,
      this.state.losAddress
    );
    console.log("GETTING RVX BALANCE");
    try {
      rvxContract.methods
        .balanceOf(selectedwallet)
        .call()
        .then(async (bal) => {
          let balance = web3.utils.fromWei(bal.toString(), "ether");
          this.setState({
            rvxBalance: balance
          });
        });
    } catch (error) {
      console.log("ERROR: " + error);
    }

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

    console.log("GETTING STAKED BALANCE");
    try {
      LeagueofStakesContract.methods
        .balanceOf(selectedwallet)
        .call({ from: selectedwallet })
        .then(async (bal) => {
          let balance = web3.utils.fromWei(bal.toString(), "ether");
          this.setState({
            rvxStakedBalance: balance
          });
        });
    } catch (error) {
      console.log("ERROR: " + error);
    }

    console.log("GETTING RVX REWARDS AVAILABLE");
    try {
      LeagueofStakesContract.methods
        .earned(selectedwallet)
        .call({ from: selectedwallet })
        .then(async (bal) => {
          let balance = web3.utils.fromWei(bal.toString(), "ether");
          this.setState({
            rvxRewardsAvailable: balance
          });
        });
    } catch (error) {
      console.log("ERROR: " + error);
    }

    console.log("GETTING TOTAL RVX STAKED");
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
    }


  };

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

  setMax = (bal) => {
    //this.setState({ stakeamount: bal });
  };


  handleCancel = () => {
    this.setState({
      depositmodalvisible: false,
      withdrawmodalvisible: false,
      exitmodalvisible: false,
      claimmodalvisible: false
    });
  };

  openModal = (token) => {
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
      this.props.setCurrent("leagueofstakestx");
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
      this.props.setCurrent("leagueofstakestx");
    }
  };

  getCurrentGasPrices = async () => {
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
  };

  claimrewards = async () => {
    let oby = {
      token: "RVX",
      tokenbalance: this.state.rRvxBalance,
      action: "Claim Rewards"
    };
    this.props.setAaveDepositToken(oby);
    this.props.setAaveDepositTokenAmount(this.state.rvxRewardsAvailable);
    this.props.setCurrent("leagueofstakestx");
  };

  exit = async () => {
    let oby = {
      token: "RVX",
      tokenbalance: this.state.rRvxBalance,
      action: "Exit"
    };
    this.props.setAaveDepositToken(oby);
    this.props.setAaveDepositTokenAmount(this.state.rvxRewardsAvailable);
    this.props.setCurrent("leagueofstakestx");
  };

  openModal = () => {
    this.setState({
      depositmodalvisible: true,
    });
  };

  openModalWithdraw = () => {
    this.setState({
      withdrawmodalvisible: true,
    });
  };
  openModalExit = () => {
    this.setState({
      exitmodalvisible: true,
    });
  };

  openModalClaim = () => {
    this.setState({
      claimmodalvisible: true,
    });
  };
  back = () => {
    this.props.setCurrent("selectedwallet");
  };

  onChangeTokenValue = (e) => {
    this.setState({ stakeamount: e.target.value });
  };

  render() {
    return (
      <div id="leagueofstakesctn" className="Leagueofstakes fadeInAnim">
        <div className="title">
          <span>
            <img onClick={this.back} width="20px" src={buttonback} />
          </span>
          <span style={{ marginLeft: "20px" }}>Staking</span>
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
            <div className="tokenassetitemtop">
              <div className="tokenassetitemrow">
                <div className="infoctn">
                  <div className="assetcode"><span style={{ color: "#9364d3" }}>Unstaked Balance:</span> {Number(this.state.rvxBalance).toFixed(4)} RVX</div>
                </div>
              </div>
              <div className="tokenassetitemrow">
                <div className="amountctn">
                  <div className="totalcoin">
                    <span style={{ color: "#9364d3" }}>Currently staking:</span> {Number(this.state.totalRvxStaked).toFixed(4)} RVX
                  </div>
                </div>
              </div>
            </div>
            <div
              className="tokenassetitem"
              style={{ borderTopLeftRadius: "8px", borderTopRightRadius: "8px" }}
            >
              <div className="tokenassetitemrow" >
                <div className="infoctn">
                  <div className="assetcode"><span style={{ color: "#9364d3" }}> rRvx Balance</span> </div>
                </div>
              </div>
              <div className="tokenassetitemrow">
                <div className="amountctn">
                  <div className="totalcoin">
                    <span style={{ color: "#9364d3" }}> Rewards Available</span>
                  </div>
                </div>
              </div>
            </div>
            <div
              className="tokenassetitem"
              style={{ marginTop: "0px", padding: "0px 25px", paddingBottom: "10px", borderBottomRightRadius: "8px", borderBottomLeftRadius: "8px" }}
            >
              <div className="tokenassetitemrow">
                <div className="infoctn">
                  <div className="assetcode"> {Number(this.state.rRvxBalance).toFixed(4)} rRVX </div>
                </div>
              </div>
              <div className="tokenassetitemrow">
                <div className="amountctn">
                  <div className="totalcoin">
                    {Number(this.state.rvxRewardsAvailable).toFixed(4)} RVX
                  </div>
                </div>
              </div>
            </div>
          </div>
          <Button
            className="curvebutton"
            style={{ marginTop: "15px", marginRight: "20px" }}
            onClick={this.openModal}
          >
            Stake
          </Button>
          <Button
            className="curvebutton"
            style={{ marginTop: "15px", marginRight: "20px" }}
            onClick={this.openModalClaim}
          >
            Claim Rewards
          </Button>
          <Button
            className="curvebutton"
            style={{ marginTop: "15px", marginRight:"20px" }}
            onClick={this.openModalWithdraw}
          >
            Withdraw
          </Button>
          <Button
            className="curvebutton"
            style={{ marginTop: "15px", marginRight: "20px" }}
            onClick={this.openModalExit}
          >
            Unstake and Claim
          </Button>

        </div>
        <Modal
          title=""
          visible={this.state.depositmodalvisible}
          onOk={this.stake}
          onCancel={this.handleCancel}
          okText="Stake"
          cancelText="Cancel"
        >
          <div className="pheader">Amount to Stake</div>
          <div className="pmodalcontent">
            <div className="balancetext">
              balance:<a onClick={this.setMax(this.state.rvxBalance)}> {this.state.rvxBalance} </a>
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
          <div className="pheader">Amount to Withdraw</div>
          <div className="pmodalcontent">
            <div className="balancetext">
              balance:<a onClick={this.setMax(this.state.rRvxBalance)}> {this.state.rRvxBalance} </a>
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
          <div className="pheader">Claim rewards</div>
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
          <div className="pheader">Exit - Claim rewards and Withdraw</div>
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

export default Leagueofstakes;
