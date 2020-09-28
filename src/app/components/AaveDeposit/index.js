import React, { Component } from "react";
import { toJS } from "mobx";
import { Modal, Button, Input, Spin } from "antd";
import { inject, observer } from "mobx-react";
import aavevertical from "static/image/aavevertical.png";
import intl from "react-intl-universal";
import { WALLETID } from "../../utils/support";
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
class AaveDeposit extends Component {
  state = {
    mobilevalue: "",
    tokenbalance: 0,
    depositamount: "",
    tokenInfo: {},
    deposittoken: {},
    selectedWallet: "",
    gaspricevalue: 0,
    privatekey: "",
    approval: false,
    loading: false,
    buttondisable: false,
    mingaspricevalue: 1,
    maxgaspricevalue: 500,
    gasprices: {},
    advancedoptions: false,
    advancedgasprice: 0,
    advancedgaslimit: 0,
  };
  onChangeTokenValue = (e) => {
    this.setState({
      depositamount: e.target.value,
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
      selectedWallet: localStorage
        .getItem("selectedwallet")
        .toString()
        .toLowerCase(),
      depositamount: this.props.aavedeposittokenamount,
      gaspricevalue: gasPrices.medium,
      deposittoken: this.props.aavedeposittoken,
    });
    await this.getTokenBalance();
    await this.getAllowance();

    console.log(toJS(this.props.aavedeposittoken));
    console.log(this.state.gasprices);
  }

  getEstimateGasLimit = async () => {
    let unit = "ether";
    if (
      this.state.deposittoken.token == "USDT" ||
      this.state.deposittoken.token == "USDC"
    ) {
      unit = "mwei";
    }
    if (this.state.approval) {
      //need to approve
      let amount = web3.utils.toWei(this.state.depositamount.toString(), unit);
      console.log(this.state.tokenInfo);
      const tokenContract = this.state.tokenInfo.ContractAddress;
      const lpCoreAddress = await this.getLendingPoolCoreAddress();
      const ERCcontract = new web3.eth.Contract(ERC20ABI, tokenContract);
      var dataApprove = ERCcontract.methods
        .approve(lpCoreAddress, amount)
        .encodeABI();
      ERCcontract.methods
        .approve(lpCoreAddress, amount)
        .estimateGas({
          from: this.state.selectedWallet,
          data: dataApprove,
        })
        .then((gasLimit) => {
          this.setState({
            advancedgaslimit: gasLimit,
          });
        });
    } else {
      //no need to approve

      const depositAmount = web3.utils.toWei(
        this.state.depositamount.toString(),
        unit
      );
      const referralCode = "87";
      const tokenContract = this.state.tokenInfo.ContractAddress;
      const lpAddress = await this.getLendingPoolAddress();
      const lpContract = new web3.eth.Contract(LendingPoolABI, lpAddress);
      var dataDeposit = lpContract.methods
        .deposit(tokenContract, depositAmount, referralCode)
        .encodeABI();
      lpContract.methods
        .deposit(tokenContract, depositAmount, referralCode)
        .estimateGas({
          from: this.state.selectedWallet,
          data: dataDeposit,
        })
        .then((gasLimit) => {
          this.setState({
            advancedgaslimit: gasLimit,
          });
        });
    }
  }

  

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

  getAllowance = async () => {
    const depositAmount = web3.utils.toWei(
      this.props.aavedeposittokenamount.toString(),
      "ether"
    );
    console.log(depositAmount);
    console.log(this.state.tokenInfo);
    console.log(this.state.selectedWallet);
    //return;
    const tokenContract = this.state.tokenInfo.ContractAddress;
    console.log(tokenContract);
    const lpCoreAddress = await this.getLendingPoolCoreAddress();
    console.log(lpCoreAddress);
    const ERCcontract = new web3.eth.Contract(ERC20ABI, tokenContract);
    console.log(ERCcontract);
    web3.eth
      .call({
        to: tokenContract,
        data: ERCcontract.methods
          .allowance(this.state.selectedWallet, lpCoreAddress)
          .encodeABI(),
      })
      .then(async (balance) => {
        console.log(balance);
        let allowance = web3.utils.hexToNumberString(balance.toString());
        console.log(allowance);
        if (
          parseFloat(allowance.toString()) >=
          parseFloat(this.state.depositamount.toString())
        ) {
          this.setState({
            approval: false,
          });
          await this.getEstimateGasLimit();
          console.log("allowance is bigger, no need to approve");
        } else {
          console.log("allowance is smaller, need to approve");
          this.setState({
            approval: true,
          });
          await this.getEstimateGasLimit();
        }
      });
  };

  approve = async () => {
    if (this.state.loading) {
      createNotification("info", "Wait for transaction to be mined!");
      return;
    }
    this.setState({
      loading: true,
    });
    const depositAmount = web3.utils.toWei(
      this.props.aavedeposittokenamount.toString(),
      "gether"
    );
    console.log(depositAmount);
    //return;
    const tokenContract = this.state.tokenInfo.ContractAddress;
    const lpCoreAddress = await this.getLendingPoolCoreAddress();
    const ERCcontract = new web3.eth.Contract(ERC20ABI, tokenContract);
    if (this.state.approval) {
      //approve first
      createNotification("info", "Approving...");
      var dataApprove = ERCcontract.methods
        .approve(lpCoreAddress, depositAmount)
        .encodeABI();
      var count = await web3.eth.getTransactionCount(this.state.selectedWallet);
      var rawTransaction = {
        from: this.state.selectedWallet,
        to: tokenContract, //this.tokencontract,
        nonce: count,
        value: "0x0", //web3.utils.toHex(web3.utils.toWei(this.state.tokenval, 'ether')),
        data: dataApprove, //contract.transfer.getData(this.tokencontract, 10, {from: this.props.selectedwallet.publicaddress}),
      };
      ERCcontract.methods
        .approve(lpCoreAddress, depositAmount)
        .estimateGas({
          from: this.state.selectedWallet,
        })
        .then((gasLimit) => {
          var gas = new BigNumber(gasLimit);
          var gasPrice = web3.utils.toWei(
            this.state.gaspricevalue.toString(),
            "gwei"
          );
          rawTransaction = {
            from: this.state.selectedWallet.toString(),
            nonce: count,
            gasPrice: web3.utils.toHex(web3.utils.toWei(this.state.advancedgasprice.toString(),"gwei")), //"0x04e3b29200",
            // "gasPrice": gasPrices.high * 100000000,//"0x04e3b29200",
            gas: this.state.advancedgaslimit + 10000, //"0x7458",
            to: tokenContract, //this.tokencontract,
            value: "0x0", //web3.utils.toHex(web3.utils.toWei(this.state.tokenval, 'ether')),
            data: dataApprove, //contract.transfer.getData(this.tokencontract, 10, {from: this.props.selectedwallet.publicaddress}),
            chainId: this.props.selectedethnetwork.chainid,
          };
          var privKey = new Buffer(this.state.privatekey, "hex");
          var tx =
            this.props.selectedethnetwork.shortcode == "mainnet"
              ? new Tx(rawTransaction)
              : new Tx(rawTransaction, {
                  chain: this.props.selectedethnetwork.shortcode,
                  hardfork: "petersburg",
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
                  this.setState({
                    loading: false,
                  });
                  console.log(err);
                }
              }
            )
            .once("confirmation", (confNumber, receipt, latestBlockHash) => {
              console.log("mined");
              createNotification("info", "Transaction mined!");
              this.setState({
                loading: false,
              });
              this.getAllowance();
            })
            .on("error", (error) => {
              console.log(error);
              createNotification("error", "Transaction failed.");
              this.setState({
                loading: false,
              });
            });
        });
    } else {
      this.setState({
        loading: false,
      });
    }
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
  deposit = async () => {
    let tokenbal = new BigNumber(this.state.tokenbalance);
    let withdrawam = new BigNumber(this.state.depositamount);
    withdrawam.comparedTo(tokenbal);
    if (
      withdrawam.comparedTo(tokenbal) > 0 ||
      Number(this.state.depositamount) <= 0 ||
      withdrawam.comparedTo(tokenbal) == null
    ) {
      createNotification("error", "Wrong deposit amount!");
      return;
    }
    await this.getEstimateGasLimit();
    if (this.state.loading) {
      createNotification("info", "Wait for transaction to be mined!");
      return;
    }
    this.setState({
      loading: true,
    });
    console.log(this.state.tokenInfo);
    console.log(this.state.deposittoken.token);
    let unit = "ether";
    if (
      this.state.deposittoken.token == "USDT" ||
      this.state.deposittoken.token == "USDC"
    ) {
      unit = "mwei";
    }
    const depositAmount = web3.utils.toWei(
      this.state.depositamount.toString(),
      unit
    );
    console.log(depositAmount);
    const tokenContract = this.state.tokenInfo.ContractAddress;
    const referralCode = "87";

    try {
      //if no approval then deposit
      const lpAddress = await this.getLendingPoolAddress();
      const lpContract = new web3.eth.Contract(LendingPoolABI, lpAddress);
      var dataDeposit = lpContract.methods
        .deposit(tokenContract, depositAmount, referralCode)
        .encodeABI();
      var count = await web3.eth.getTransactionCount(this.state.selectedWallet);
      var rawTransaction = {
        from: this.state.selectedWallet,
        to: lpAddress, //this.tokencontract,
        nonce: count,
        value: "0x0", //web3.utils.toHex(web3.utils.toWei(this.state.tokenval, 'ether')),
        data: dataDeposit, //contract.transfer.getData(this.tokencontract, 10, {from: this.props.selectedwallet.publicaddress}),
      };
      console.log(dataDeposit);
      lpContract.methods
        .deposit(tokenContract, depositAmount, referralCode)
        .estimateGas({
          from: this.state.selectedWallet,
          data: dataDeposit,
        })
        .then((gasLimit) => {
          var gasPrice = web3.utils.toWei(
            this.state.gaspricevalue.toString(),
            "gwei"
          );
          var limit = Number(gasLimit);
          limit = limit + 150000;
          //console.log("GAS LIMIT: "+limit);
          rawTransaction = {
            from: this.state.selectedWallet.toString(),
            nonce: count,
            gasPrice: web3.utils.toHex(web3.utils.toWei(this.state.advancedgasprice.toString(),"gwei")), //"0x04e3b29200",
            // "gasPrice": gasPrices.high * 100000000,//"0x04e3b29200",
            gas: this.state.advancedgaslimit + 10000, //"0x7458",
            to: lpAddress, //this.tokencontract,
            value: "0x0", //web3.utils.toHex(web3.utils.toWei(this.state.tokenval, 'ether')),
            data: dataDeposit, //contract.transfer.getData(this.tokencontract, 10, {from: this.props.selectedwallet.publicaddress}),
            chainId: this.props.selectedethnetwork.chainid,
          };
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
                  createNotification("info", "Transaction submited.");
                  // that.props.setsuccessulhash(hash);
                  //that.props.setCurrent("tokentransfersuccessful");
                } else {
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
              console.log(confNumber);
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
    } catch (e) {
      alert(e.message);
      console.log(e.message);
      this.setState({
        loading: false,
      });
    }
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

  getTokenBalance = () => {
    // console.log(this.props.selectedwalletlist);
    var selecetedwallet = toJS(this.props.selectedwalletlist);
    let walletlist = selecetedwallet.find(
      (x) => x.publicaddress == localStorage.getItem("selectedwallet")
    );
    walletlist = toJS(walletlist);
    console.log(walletlist);
    this.setState({
      privatekey: walletlist.privatekey,
    });
    let tokenitem = walletlist.tokenassetlist.find(
      (x) => x.AssetCode.toString().toUpperCase() == this.props.aavedeposittoken.token.toString().toUpperCase()
    );
    if (tokenitem == null || tokenitem == "") {
      console.log("wallet does not have this asset.");
      createNotification(
        "error",
        "Please add asset:" + this.props.aavedeposittoken + " to your wallet!"
      );
      this.props.setCurrent("aave");
      return;
    } else {
      var TokenInfo = tokenitem.TokenInfoList.find(
        (x) => x.Network == "mainnet"
      );
      TokenInfo = toJS(TokenInfo);
      this.setState({
        tokenInfo: TokenInfo,
      });
      try {
        var tokenAbiArray = JSON.parse(TokenInfo.AbiArray);
      } catch (e) {}
      let contract = new web3.eth.Contract(
        tokenAbiArray,
        TokenInfo.ContractAddress
      );
      web3.eth
        .call({
          to: !isNullOrEmpty(TokenInfo.ContractAddress)
            ? TokenInfo.ContractAddress
            : null,
          data: contract.methods.balanceOf(tokenitem.PublicAddress).encodeABI(),
        })
        .then((balance) => {
          if (tokenitem.AssetCode == "USDT" || tokenitem.AssetCode == "USDC") {
            var tokenbal = web3.utils.fromWei(balance, "mwei");
            this.setState({
              tokenbalance: tokenbal.toString(),
            });
            tokenitem.TokenBalance = tokenbal.toString();
          } else {
            var tokenbal = web3.utils.fromWei(balance, "ether");
            this.setState({
              tokenbalance: tokenbal.toString(),
            });
          }
        });
    }
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
    this.props.setCurrent("aave");
  };

  render() {
    return (
      <div className="tokentransferconfirmationpanel fadeInAnim">
        <div className="title">
          <span>
            <img onClick={this.back} width="20px" src={buttonback} />
          </span>
          <span style={{ marginLeft: "20px" }}>{intl.get("Aave.Deposit")}</span>
        </div>
        <div className="walletname"></div>
        <div className="contentpanel">
          <img src={aavevertical} style={{ height: "20%", width: "20%" }}></img>
        </div>
        <div className="centerpanel2">
          <center>
            {this.state.approval === false && (
              <React.Fragment>
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
                  <div className="spacebetween">
                    <div className="panellabel">{intl.get("Aave.APY")}</div>
                    <div className="panelvalue">
                      {this.props.aavedeposittoken.apy.toFixed(2)}%
                    </div>
                  </div>
                  <div className="spacebetween" style={{ marginTop: "10px" }}>
                    <div className="panellabel">
                      {" "}
                      {intl.get("Aave.Balance")}
                    </div>
                    <div className="panelvalue">
                      {this.state.tokenbalance}{" "}
                      {this.props.aavedeposittoken.token
                        .toString()
                        .toUpperCase()}
                    </div>
                  </div>
                  <div className="spacebetween" style={{ marginTop: "10px" }}>
                    <div className="panellabel">
                      {intl.get("TokenTransferConfirmation.Amount")}
                    </div>
                    <div className="panelvalue">
                      {" "}
                      <Input
                        value={this.state.depositamount}
                        className="inputTransparent inputclass"
                        onChange={this.onChangeTokenValue}
                        placeholder={0}
                      />
                      {this.props.aavedeposittoken.token
                        .toString()
                        .toUpperCase()}
                    </div>
                  </div>
                </div>
                <div
                  className="panelwrapper borderradiusfull"
                  style={{ marginBottom: "10px" }}
                >
                  <div className="spacebetween">
                    <div className="panellabel">
                      {intl.get("Transaction.GasPrice")}{" "}
                      {intl.get("Aave.DisplayingGas")}
                    </div>
                    <div className="panelvalue"></div>
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
                  {" "}
                  <div className="panelvalue"></div>
                  <div className="panelvalue">
                    <a onClick={this.setAdvancedOptions}>Advanced options</a>
                  </div>
                </div>
                {this.state.advancedoptions === true && (
                  <React.Fragment>
                    <div
                      className="panelwrapper borderradiusfull"
                      style={{ marginBottom: "10px" }}
                    >
                      <div
                        className="spacebetween"
                        style={{ marginTop: "10px" }}
                      >
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
                      <div
                        className="spacebetween"
                        style={{ marginTop: "10px" }}
                      >
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
                  <Button className="curvebutton" onClick={this.deposit}>
                    Deposit
                  </Button>
                </div>
              </React.Fragment>
            )}

            {this.state.approval === true && (
              <React.Fragment>
                <div className="subtitle">
                  <img
                    src={this.props.aavedeposittoken.LogoUrl}
                    className="tokenimg"
                  />
                  {this.props.aavedeposittoken.token.toString().toUpperCase()}{" "}
                  (savings)
                </div>
                <div
                  className="panelwrapper borderradiusfull"
                  style={{ marginBottom: "10px" }}
                >
                  <div className="spacebetween">
                    <div className="panellabel">{intl.get("Aave.APY")}</div>
                    <div className="panelvalue">
                      {this.props.aavedeposittoken.apy.toFixed(2)}%
                    </div>
                  </div>
                  <div className="spacebetween" style={{ marginTop: "10px" }}>
                    <div className="panellabel">{intl.get("Aave.Balance")}</div>
                    <div className="panelvalue">
                      {this.state.tokenbalance}{" "}
                      {this.props.aavedeposittoken.token
                        .toString()
                        .toUpperCase()}
                    </div>
                  </div>
                </div>
                <div
                  className="panelwrapper borderradiusfull"
                  style={{ marginBottom: "10px" }}
                >
                  <div className="spacebetween">
                    <div className="panellabel">
                      {intl.get("Transaction.GasPrice")}{" "}
                      {intl.get("Aave.DisplayingAverageGasPriceFromAPI")}
                    </div>
                    <div className="panelvalue"></div>
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
                      <div
                        className="spacebetween"
                        style={{ marginTop: "10px" }}
                      >
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
                      <div
                        className="spacebetween"
                        style={{ marginTop: "10px" }}
                      >
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
                  <Button className="curvebutton" onClick={this.approve}>
                    {intl.get("Aave.Approve")}
                  </Button>
                </div>
              </React.Fragment>
            )}
          </center>
        </div>
      </div>
    );
  }
}

export default AaveDeposit;
