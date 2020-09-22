import React, { Component } from "react";
import { Modal, Button, Input, Spin } from "antd";
import { toJS } from "mobx";
import { inject, observer } from "mobx-react";
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
import aavevertical from "static/image/aavevertical.png";
import ERC20ABI from "../../ABIs/ERC20.json";
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
    withdrawamount: 0,
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
    tokenbalance: 0,
  };

  async componentDidMount() {
    web3 = new Web3("https://mainnet.infura.io" + this.props.infuraprojectid);
    this.setState({
      selectedwallet: localStorage.getItem("selectedwallet"),
    });
    this.setState({
      privatekey: walletlist.privatekey,
    });
    let gasPrices = await this.getCurrentGasPrices();
    this.setState({
      gaspricevalue: gasPrices.high,
      loading: false,
    });
  }

  getCurrentGasPrices = async () => {
    let response = await Axios.get(API_EthGas);

    let prices = {
      low: parseFloat(response.data.safeLow) / 10,
      medium: parseFloat(response.data.average) / 10,
      high: parseFloat(response.data.fast) / 10,
    };
    return prices;
  };


  handleCancel = () => {
    this.setState({
      depositmodalvisible: false,
    });
  };

  openModal = (token) => {
    var selecetedwallet = toJS(this.props.selectedwalletlist);
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
    });
  };

  back = () => {
    this.props.setCurrent("selectedwallet");
  };

  onChangeTokenValue = (e) => {
    this.setState({ withdrawamount: e.target.value });
  };

  render() {
    return (
      <div id="selectwalletmainctn" className="selectedwalletpanel fadeInAnim">
        <div className="title">
          <span>
            <img onClick={this.back} width="20px" src={buttonback} />
          </span>
          <span style={{ marginLeft: "20px" }}>AAVE Dashboard</span>
        </div>
        <div className="walletname"></div>
        <div className="contentpanel">
          <img src={aavevertical} style={{ height: "20%", width: "20%" }}></img>
        </div>
        <div className="centerpanel">
          <div className="tokenwrapper">
            <div className="tokenassetitemtop">
              <div className="tokenassetitemrow">
                <div className="infoctn">
                  <div className="assetcode">Asset</div>
                </div>
              </div>
              <div className="tokenassetitemrow">
                <div className="amountctn">
                  <div className="totalcoin">
                    <span>Balance</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <Modal
          title=""
          visible={this.state.depositmodalvisible}
          onOk={this.withdraw}
          onCancel={this.handleCancel}
          okText="Withdraw"
          cancelText="Cancel"
        >
          <div className="pheader">Amount to withdraw</div>
          <div className="pmodalcontent">
            <div className="balancetext">
              balance:<a onClick={this.setMax}> {this.state.tokenbalance} </a>
              {this.state.selectedtoken.token}
            </div>
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
      </div>
    );
  }
}

export default Leagueofstakes;
