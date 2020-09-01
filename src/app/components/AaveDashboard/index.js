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
class AaveDashboard extends Component {
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
    await this.getAtokenAddress();
    var selecetedwallet = toJS(this.props.selectedwalletlist);
    let walletlist = selecetedwallet.find(
      (x) => x.publicaddress == localStorage.getItem("selectedwallet")
    );
    walletlist = toJS(walletlist);
    console.log(walletlist);
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

  getLendingPoolAddressProviderContract = () => {
    const lpAddressProviderAddress =
      "0x24a42fD28C976A61Df5D00D0599C34c4f90748c8"; // mainnet address, for other addresses: https://docs.aave.com/developers/developing-on-aave/deployed-contract-instances
    const lpAddressProviderContract = new web3.eth.Contract(
      LendingPoolAddressProviderABI,
      lpAddressProviderAddress
    );
    return lpAddressProviderContract;
  };

  getLendingPoolCoreAddress = async () => {
    const lpCoreAddress = await this.getLendingPoolAddressProviderContract()
      .methods.getLendingPoolCore()
      .call()
      .catch((e) => {
        throw Error(`Error getting lendingPool address: ${e.message}`);
      });

    console.log("LendingPoolCore address: ", lpCoreAddress);
    return lpCoreAddress;
  };

  formatNumber = (n) => {
    for (var i = 0; i < ranges.length; i++) {
      if (n >= ranges[i].divider) {
        return (n / ranges[i].divider).toString() + ranges[i].suffix;
      }
    }
    return n.toString();
  };

  withdraws = async () => {
    if (this.state.loading) {
      createNotification("info", "Wait for transaction to be mined!");
    }
    let unit = "ether";
    if (
      this.state.selectedtoken.token == "USDT" ||
      this.state.selectedtoken.token == "USDC"
    ) {
      unit = "mwei";
    }
    var that = this;
    //let amount = web3.utils.toWei(this.state.selectedtoken.balance.toString(),unit);
    let amount = web3.utils.toWei(this.state.withdrawamount.toString(), unit);
    const aTokenContract = new web3.eth.Contract(
      ATokenABI,
      this.state.selectedtoken.aContract
    );
    var count = await web3.eth.getTransactionCount(this.state.selectedwallet);
    var dataWithdraw = aTokenContract.methods.redeem(amount).encodeABI();
    var rawTransaction = {
      from: this.state.selectedwallet,
      to: this.state.selectedtoken.aContract, //this.tokencontract,
      nonce: count,
      value: "0x0", //web3.utils.toHex(web3.utils.toWei(this.state.tokenval, 'ether')),
      data: dataWithdraw, //contract.transfer.getData(this.tokencontract, 10, {from: this.props.selectedwallet.publicaddress}),
    };
    console.log(dataWithdraw);
    console.log(amount);
    aTokenContract.methods
      .redeem(amount)
      .estimateGas({
        from: this.state.selectedwallet,
        data: dataWithdraw,
      })
      .then((gasLimit) => {
        var gasPrice = web3.utils.toWei(
          this.state.gaspricevalue.toString(),
          "gwei"
        );
        var limit = Number(gasLimit);
        limit = limit + 50000;
        console.log(limit);
        console.log(this.state.privatekey);
        rawTransaction = {
          from: this.state.selectedwallet,
          nonce: count,
          gasPrice: web3.utils.toHex(gasPrice), //"0x04e3b29200",
          // "gasPrice": gasPrices.high * 100000000,//"0x04e3b29200",
          gas: limit, //"0x7458",
          to: this.state.selectedtoken.aContract, //this.tokencontract,
          value: "0x0", //web3.utils.toHex(web3.utils.toWei(this.state.tokenval, 'ether')),
          data: dataWithdraw, //contract.transfer.getData(this.tokencontract, 10, {from: this.props.selectedwallet.publicaddress}),
          chainId: this.props.selectedethnetwork.chainid,
        };
        console.log(rawTransaction);
        var privKey = new Buffer(this.state.privatekey, "hex");
        var tx =
          this.props.selectedethnetwork.shortcode == "mainnet"
            ? new Tx(rawTransaction)
            : new Tx(rawTransaction, {
                chain: this.props.selectedethnetwork.shortcode,
                hardfork: "istanbul",
              });
        tx.sign(privKey);
        var serializedTx = tx.serialize();
        web3.eth
          .sendSignedTransaction(
            "0x" + serializedTx.toString("hex"),
            (err, hash) => {
              if (!err) {
                //SUCCESS
                console.log(hash);
                // that.props.setsuccessulhash(hash);
                //that.props.setCurrent("tokentransfersuccessful");
              } else {
                createNotification(
                  "error",
                  intl.get("Error.TransactionFailed")
                );
                console.log(err);
                that.setState({
                  loading: false,
                });
              }
            }
          )
          .once("confirmation", (confNumber, receipt, latestBlockHash) => {
            console.log("mined");
            console.log(receipt);
            if (receipt.status) {
              createNotification("success", "Succesfully mined!");
            }
            that.setState({
              loading: false,
            });
            that.getAtokenAddress();
          })
          .on("error", (error) => {
            console.log(error);
            createNotification("error", "Transaction failed.");
            this.setState({
              loading: false,
            });
          });
      })
      .catch((e) => {
        createNotification(
          "error",
          "Always failing transaction. Please check your deposit amount!"
        );
        this.setState({
          loading: false,
        });
      });
  };

  getAtokenAddress = async () => {
    var alltokens = toJS(this.props.allTokenAsset);
    const lpCoreAddress = await this.getLendingPoolCoreAddress();
    const lpCoreContract = new web3.eth.Contract(
      LendingPoolCoreABI,
      lpCoreAddress
    );
    console.log(toJS(this.props.allTokenAsset));
    var dashtoken = [];
    var obj = {};
    console.log("GETTING APY RATES");
    alltokens.map((item, index) => {
      if (
        item.AssetCode == "DAI" ||
        item.AssetCode == "USDC" ||
        item.AssetCode == "USDT" ||
        item.AssetCode == "LINK" ||
        item.AssetCode == "KNC" ||
        item.AssetCode == "SNX" ||
        item.AssetCode == "MKR" ||
        item.AssetCode == "BAT" ||
        item.AssetCode == "TUSD" ||
        item.AssetCode == "sUSD" ||
        item.AssetCode == "BUSD" ||
        item.AssetCode == "LEND" ||
        item.AssetCode == "YFI" ||
        item.AssetCode == "REN" ||
        item.AssetCode == "ENJ" ||
        item.AssetCode == "MANA" ||
        item.AssetCode == "REP" ||
        item.AssetCode == "WBTC" ||
        item.AssetCode == "ZRX"
      ) {
        var TokenInfo = item.TokenInfoList.find((x) => x.Network == "mainnet");
        TokenInfo = toJS(TokenInfo);
        try {
          lpCoreContract.methods
            .getReserveATokenAddress(TokenInfo.ContractAddress)
            .call()
            .then(async (result) => {
              var addy = result.toString();
              // console.log(addy);
              //console.log("selected wallet: "+this.state.selectedwallet);
              let ercContract = new web3.eth.Contract(ERC20ABI, addy);
              console.log(ercContract);
              ercContract.methods
                .balanceOf(this.state.selectedwallet.toString().toLowerCase())
                .call()
                .then(async (balance) => {
                  let unit = "ether";
                  if (item.AssetCode == "USDT" || item.AssetCode == "USDC") {
                    unit = "mwei";
                  }
                  var rez = web3.utils.fromWei(balance.toString(), unit);
                  var bal = new BigNumber(rez.toString());
                  console.log(bal.toString());
                  dashtoken.push({
                    token: item.AssetCode,
                    balance: bal,
                    LogoUrl: item.LogoUrl,
                    aContract: addy,
                  });
                  this.setState({
                    tokenlist: this.state.tokenlist.concat(dashtoken),
                  });
                  dashtoken = [];
                });
            });
        } catch (error) {
          console.log("ERROR: " + error);
        }
      }
    });
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

  deposit = () => {
    this.props.setCurrent("aave");
  };

  onChangeTokenValue = (e) => {
    this.setState({ withdrawamount: e.target.value });
  };

  setMax = () => {
    this.setState({ withdrawamount: this.state.tokenbalance });
  };

  withdraw = async () => {
    let tokenbal = new BigNumber(this.state.tokenbalance);
    let withdrawam = new BigNumber(this.state.withdrawamount);
    withdrawam.comparedTo(tokenbal);
    if (
      withdrawam.comparedTo(tokenbal) > 0 ||
      Number(this.state.withdrawamount) <= 0 ||
      withdrawam.comparedTo(tokenbal) == null
    ) {
      createNotification("error", "Wrong withdraw amount!");
    } else {
      console.log(this.state.selectedtoken);
      this.props.setAaveDepositToken(this.state.selectedtoken);
      this.props.setAaveDepositTokenAmount(this.state.withdrawamount);
      this.props.setCurrent("aavewithdraw");
    }
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
            {this.state.loading === true && (
              <React.Fragment>
                <Spin size="large" tip="Loading..."></Spin>
              </React.Fragment>
            )}
            {this.state.tokenlist.map((item, index) => {
              return (
                <div
                  key={index}
                  className="tokenassetitem"
                  onClick={() => this.openModal(item)}
                >
                  <div className="tokenassetitemrow">
                    <img src={item.LogoUrl} className="tokenimg" />
                    <div className="infoctn">
                      <div className="assetcode">{item.token}</div>
                    </div>
                  </div>
                  <div className="tokenassetitemrow">
                    <div className="amountctn">
                      <div className="totalcoin">
                        {" "}
                        {item.balance + " a" + item.token}
                        <span></span>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
          <Button
            className="curvebutton"
            style={{ marginTop: "15px" }}
            onClick={this.deposit}
          >
            Deposit
          </Button>
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

export default AaveDashboard;
