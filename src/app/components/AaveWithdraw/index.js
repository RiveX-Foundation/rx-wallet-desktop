import React, { Component } from "react";
import { toJS } from "mobx";
import { Modal, Button, Input, Spin } from "antd";
import { inject, observer } from "mobx-react";
import intl from "react-intl-universal";
import { WALLETID } from "../../utils/support";
import aavevertical from "static/image/aavevertical.png";
import {
  createNotification,
  getChainId,
  getGasPrice,
  getNoncem,
  isNullOrEmpty,
} from "../../utils/helper";
import { BigNumber } from "bignumber.js";
import Slider from "react-input-slider";
import "./index.less";
import Web3 from "web3";
const { API_EthGas } = require("../../../../config/common");
import ERC20ABI from "../../ABIs/ERC20.json";
import ATokenABI from "../../ABIs/AToken.json";
import LendingPoolAddressProviderABI from "../../ABIs/AddressProvider.json";
import LendingPoolABI from "../../ABIs/LendingPool.json";
import buttonback from "static/image/icon/back.png";
import Axios from "axios";
import { create } from "lodash";
var Tx = require("ethereumjs-tx");
const ethUtil = require("ethereumjs-util");
const pu = require("promisefy-util");
const WAN_PATH = "m/44'/5718350'/0'/0/0";
//const WAN_PATH = "m/44'/60'/0'/0/";
const { confirm } = Modal;
var web3;
// m/44'/5718350'/0'/0/0

@inject((stores) => ({
  setCurrent: (current) => stores.walletStore.setCurrent(current),
  setWalletEntryNextDirection: (val) =>
    stores.walletStore.setWalletEntryNextDirection(val),
  language: stores.languageIntl.language,
  addrSelectedList: stores.wanAddress.addrSelectedList,
  addrInfo: stores.wanAddress.addrInfo,
  infuraprojectid: stores.walletStore.infuraprojectid,
  aavedeposittoken: stores.walletStore.aavedeposittoken,
  aavedeposittokenamount: stores.walletStore.aavedeposittokenamount,
  setAaveDepositToken: (token) => stores.walletStore.setAaveDepositToken(token),
  selectedwalletlist: stores.walletStore.selectedwalletlist,
  selectedethnetwork: stores.network.selectedethnetwork,
  selectedTokenAsset: stores.walletStore.selectedTokenAsset,
}))
@observer
class AaveWithdraw extends Component {
  state = {
    mobilevalue: "",
    tokenbalance: 0,
    withdrawamount: "",
    tokenInfo: {},
    selectedwallet: "",
    gaspricevalue: 0,
    privatekey: "",
    approval: false,
    loading: false,
    buttondisable: false,
    mingaspricevalue: 1,
    maxgaspricevalue: 150,
    selectedtoken: {},
    gasprices: {},
    advancedoptions: false,
    advancedgasprice: 0,
    advancedgaslimit: 0,
  };
  onChangeTokenValue = async (e) => {
    await this.getEstimateGasLimit(); //dont know yet
    this.setState({
      withdrawamount: e.target.value,
    });
  };

  onChangeAdvancedGasPriceValue = (e) => {
    this.setState({
      advancedgasprice: e.target.value,
    });
  };

  onChangeAdvancedGasLimitValue = (e) => {
    this.setState({
      advancedgaslimit: e.target.value,
    });
  };

  async componentDidMount() {
    let gasPrices = await this.getCurrentGasPrices();
    web3 = new Web3("https://mainnet.infura.io" + this.props.infuraprojectid);
    this.setState({
      selectedwallet: localStorage
        .getItem("selectedwallet")
        .toString()
        .toLowerCase(),
      withdrawamount: this.props.aavedeposittokenamount,
      selectedtoken: this.props.aavedeposittoken,
      gaspricevalue: gasPrices.medium,
    });
    await this.getEstimateGasLimit();

    var selecetedwallet = toJS(this.props.selectedwalletlist);
    let walletlist = selecetedwallet.find(
      (x) => x.publicaddress == localStorage.getItem("selectedwallet")
    );
    walletlist = toJS(walletlist);
    console.log(walletlist);
    this.setState({
      privatekey: walletlist.privatekey,
    });
    console.log(this.props.aavedeposittoken);
  }

  getEstimateGasLimit = async () => {
    let unit = "ether";
    if (
      this.state.selectedtoken.token == "USDT" ||
      this.state.selectedtoken.token == "USDC"
    ) {
      unit = "mwei";
    }
    //let amount = web3.utils.toWei(this.state.selectedtoken.balance.toString(),unit);
    let amount = web3.utils.toWei(this.state.withdrawamount.toString(), unit);
    const aTokenContract = new web3.eth.Contract(
      ATokenABI,
      this.state.selectedtoken.aContract
    );
    var dataWithdraw = aTokenContract.methods.redeem(amount).encodeABI();
    console.log(dataWithdraw);
    console.log(amount);
    aTokenContract.methods
      .redeem(amount)
      .estimateGas({
        from: this.state.selectedwallet,
        data: dataWithdraw,
      })
      .then((gasLimit) => {
        this.setState({
          advancedgaslimit: gasLimit + 50000,
        });
      });
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
  withdraw = async () => {
    let tokenbal = new BigNumber(this.state.selectedtoken.balance);
    let withdrawam = new BigNumber(this.state.withdrawamount);
    withdrawam.comparedTo(tokenbal);
    if (
      withdrawam.comparedTo(tokenbal) > 0 ||
      Number(this.state.withdrawamount) <= 0 ||
      withdrawam.comparedTo(tokenbal) == null
    ) {
      createNotification("error", "Wrong withdraw amount!");
    }
   // await this.getEstimateGasLimit();
    if (this.state.loading) {
      createNotification("info", "Wait for transaction to be mined!");
      return;
    }
    this.setState({
      loading: true,
    });
    let unit = "ether";
    if (
      this.state.selectedtoken.token == "USDT" ||
      this.state.selectedtoken.token == "USDC"
    ) {
      unit = "mwei";
    }
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
          gasPrice: web3.utils.toHex(web3.utils.toWei(this.state.advancedgasprice.toString(),"gwei")), //"0x04e3b29200",
          // "gasPrice": gasPrices.high * 100000000,//"0x04e3b29200",
          gas: Number(this.state.advancedgaslimit) +20000, //"0x7458",
          to: this.state.selectedtoken.aContract, //this.tokencontract,
          value: "0x0", //web3.utils.toHex(web3.utils.toWei(this.state.tokenval, 'ether')),
          data: dataWithdraw, //contract.transfer.getData(this.tokencontract, 10, {from: this.props.selectedwallet.publicaddress}),
          chainId: this.props.selectedethnetwork.chainid,
        };
        console.log(rawTransaction);
        var privKey = Buffer.from(this.state.privatekey, "hex");
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
                createNotification("info", "Transaction submited.");
              } else {
                createNotification(
                  "error",
                  intl.get("Error.TransactionFailed")
                );
                console.log(err);
                this.setState({
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
            this.setState({
              loading: false,
            });
            this.props.setCurrent("aavedashboard");
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

  getLendingPoolAddress = async () => {
    const lpAddress = await this.getLendingPoolAddressProviderContract()
      .methods.getLendingPool()
      .call()
      .catch((e) => {
        throw Error(`Error getting lendingPool address: ${e.message}`);
      });
    console.log("LendingPool address: ", lpAddress);
    return lpAddress;
  };

  _setCurrentGasPrice = (price) => {
    // console.log(price);
    this.setState({
      gaspricevalue: price,
    });
  };

  _formatWeiWin = (tokentype) => {
    if (tokentype == "eth" || tokentype == "erc20") {
      return "gwei";
    } else if (tokentype == "wan" || tokentype == "wrc20") {
      return "gwin";
    }
  };

  back = () => {
    this.props.setCurrent("aavedashboard");
  };

  setAdvancedOptions = () => {
    this.setState({
      advancedoptions: true,
    });
  };

  setAdvancedGasPrice = (value) => {
    this.setState({
      advancedgasprice: value,
    });
  };

  render() {
    return (
      <div className="tokentransferconfirmationpanel fadeInAnim">
        <div className="title">
          <span>
            <img onClick={this.back} width="20px" src={buttonback} />
          </span>
          <span style={{ marginLeft: "20px" }}>
            {intl.get("Aave.Withdrawal")}
          </span>
        </div>
        <div className="walletname"></div>
        <div className="contentpanel">
          <img src={aavevertical} style={{ height: "20%", width: "20%" }}></img>
        </div>
        <div className="centerpanel2">
          <center>
            <div className="subtitle">
              <img
                src={this.props.aavedeposittoken.LogoUrl}
                className="tokenimg"
              />
              {this.props.aavedeposittoken.token.toString().toUpperCase()} (
              {intl.get("Aave.Savings")})
            </div>
            <div
              className="panelwrapper borderradiusfull"
              style={{ marginBottom: "10px" }}
            >
              <div className="spacebetween" style={{ marginTop: "10px" }}>
                <div className="panellabel">{intl.get("Aave.Balance")}</div>
                <div className="panelvalue">
                  {this.props.aavedeposittoken.balance.toString()} a
                  {this.props.aavedeposittoken.token.toString().toUpperCase()}
                </div>
              </div>
              <div className="spacebetween" style={{ marginTop: "10px" }}>
                <div className="panellabel">
                  {intl.get("TokenTransferConfirmation.Amount")}
                </div>
                <div className="panelvalue">
                  {" "}
                  <Input
                    value={this.state.withdrawamount}
                    className="inputTransparent inputclass"
                    onChange={this.onChangeTokenValue}
                    placeholder={0}
                  />
                  a{this.props.aavedeposittoken.token.toString().toUpperCase()}
                </div>
              </div>
            </div>
            <div
              className="panelwrapper borderradiusfull"
              style={{ marginBottom: "10px" }}
            >
              <div className="spacebetween">
                <div className="panellabel">
                  {intl.get("Transaction.GasPrice")}
                </div>
              </div>
              <div
                className="spacebetween2"
                style={{
                  marginTop: "20px",
                  marginRight: "20px",
                  marginLeft: "20px",
                }}
              >
                <Button
                  onClick={this.onChangeAdvancedGasPriceValue}
                  value={this.state.gasprices.low}
                  type="primary"
                  ghost
                  style={{ borderRight: "none" }}
                >
                  {" "}
                  Safe Low
                  <br />
                  {this.state.gasprices.low}
                </Button>
                <Button
                  onClick={this.onChangeAdvancedGasPriceValue}
                  value={this.state.gasprices.medium}
                  type="primary"
                  ghost
                  style={{ borderRight: "none", borderLeft: "none" }}
                >
                  {" "}
                  Standard
                  <br />
                  {this.state.gasprices.medium}
                </Button>
                <Button
                  onClick={this.onChangeAdvancedGasPriceValue}
                  value={this.state.gasprices.high}
                  type="primary"
                  ghost
                  style={{ borderLeft: "none" }}
                >
                  {" "}
                  Fast
                  <br />
                  {this.state.gasprices.high}
                </Button>
              </div>
            </div>
            <div
              className="width600 spacebetween"
              style={{ marginBottom: "30px" }}
            >
              <div className="panelvalue"></div>
              <div className="panelvalue">
                <a onClick={this.setAdvancedOptions}>
                  {intl.get("Aave.AdvancedOptions")}
                </a>
              </div>
            </div>
            {this.state.advancedoptions === true && (
              <React.Fragment>
                <div
                  className="panelwrapper borderradiusfull"
                  style={{ marginBottom: "10px" }}
                >
                  <div className="spacebetween" style={{ marginTop: "10px" }}>
                    <div className="panellabel">
                      {intl.get("Aave.GasPrice(Gwei)")}
                    </div>
                    <div className="panelvalue">
                      <Input
                        value={this.state.advancedgasprice}
                        className="inputTransparent inputclass"
                        onChange={this.onChangeAdvancedGasPriceValue}
                        placeholder={this.state.advancedgasprice}
                      />
                    </div>
                  </div>
                  <div className="spacebetween" style={{ marginTop: "10px" }}>
                    <div className="panellabel">
                      {intl.get("Aave.GasLimit(AdvancedUsersOnly)")}
                    </div>
                    <div className="panelvalue">
                      {" "}
                      <Input
                        value={this.state.advancedgaslimit}
                        className="inputTransparent inputclass"
                        onChange={this.onChangeAdvancedGasLimitValue}
                        placeholder={this.state.advancedgaslimit}
                      />
                    </div>
                  </div>
                </div>
              </React.Fragment>
            )}
            {this.state.loading === true && (
              <React.Fragment>
                <div>
                  <Spin tip="Transaction pending..."></Spin>
                </div>
              </React.Fragment>
            )}

            <div>
              <Button className="curvebutton" onClick={this.withdraw}>
                {intl.get("Wallet.Confirm")}
              </Button>
            </div>
          </center>
        </div>
      </div>
    );
  }
}

export default AaveWithdraw;
