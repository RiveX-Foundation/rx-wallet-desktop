import React, { Component } from "react";
import { Modal, Spin } from "antd";
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

const pu = require("promisefy-util");
const WAN_PATH = "m/44'/5718350'/0'/0/0";
//const WAN_PATH = "m/44'/60'/0'/0/";
const { confirm } = Modal;

// m/44'/5718350'/0'/0/0

@inject((stores) => ({
  setCurrent: (current) => stores.walletStore.setCurrent(current),
  setWalletEntryNextDirection: (val) =>
    stores.walletStore.setWalletEntryNextDirection(val),
  language: stores.languageIntl.language,
  addrSelectedList: stores.wanAddress.addrSelectedList,
  addrInfo: stores.wanAddress.addrInfo,
}))
@observer
class Dex extends Component {
  state = {
    mobilevalue: "",
    selectedwallet: "",
    preload: null,
    displayed: "none",
    loading: true,
    addrInfo: {
      normal: {},
      ledger: {},
      trezor: {},
      import: {},
      rawKey: {},
    },
  };

  async componentDidMount() {
    this.addresses = {};
    this.setState({ loading: true });
    const preload = await this.getPreloadFile();
    this.setState({
      preload: preload,
      selectedwallet: localStorage.getItem("selectedwallet"),
    });
    this.addEventListeners();
  }

  addEventListeners = () => {
    if (this.webview || !this.state.preload) {
      console.log("returning no webview");
      return;
    }

    var webview = document.getElementById("dappView");

    if (!webview) {
      return;
    }

    webview.addEventListener(
      "dom-ready",
      function (e) {
        this.setState({
          loading: false,
          displayed: "flex",
        });
        // webview.openDevTools();
      }.bind(this)
    );

    webview.addEventListener(
      "ipc-message",
      function (event) {
        const { args, channel } = event;
        if (channel === "dapp-message") {
          this.handlerDexMessage(args[0]);
        }
      }.bind(this)
    );

    this.webview = webview;
  };

  handlerDexMessage(args) {
    const msg = {
      method: args[0],
      id: args[1],
    };
    switch (msg.method) {
      case "getAddresses":
        this.getAddresses(msg);
        break;
      case "loadNetworkId":
        this.loadNetworkId(msg);
        break;
      case "signPersonalMessage":
        msg.message = args[2];
        msg.address = args[3];
        this.signPersonalMessage(msg);
        break;
      case "sendTransaction":
        msg.message = args[2];
        this.sendTransaction(msg);
        break;
      default:
        console.log("unknown method.");
        break;
    }
  }

  async showConfirm(type, msg, onOk, onCancel) {
    let title = "";
    if (type === "sign") {
      title = intl.get("dAppConfirm.sign");
    } else {
      title = intl.get("dAppConfirm.send");
    }

    confirm({
      title: title,
      content: intl.get("dAppConfirm.warn"),
      okText: intl.get("ValidatorRegister.acceptAgency"),
      cancelText: intl.get("ValidatorRegister.notAcceptAgency"),
      async onOk() {
        await onOk(msg);
      },
      async onCancel() {
        await onCancel(msg);
      },
    });
  }

  async getAddresses(msg) {
    msg.err = null;
    msg.val = [];
    var dAppwallet = JSON.parse(localStorage.getItem("wallets"));
    if (dAppwallet[0].publicaddress != this.state.selectedwallet) {
      createNotification("error", "Please choose the dApp wallet!");
    } else {
      try {
        var addrs = [];
        this.addresses[this.state.selectedwallet] = {};
        this.addresses[this.state.selectedwallet].walletID = WALLETID.NATIVE;
        addrs.push(this.state.selectedwallet);
        console.log(addrs);

        msg.val = addrs;
      } catch (error) {
        console.log(error);
        msg.err = error;
      }
    }
    this.sendToDApp(msg);
  }

  loadNetworkId(msg) {
    msg.err = null;
    msg.val = 3;
    wand.request(
      "query_config",
      {
        param: "network",
      },
      function (err, val) {
        if (err) {
          console.log("error printed inside callback: ", err);
          msg.err = err;
        } else {
          if (val.network === "testnet") {
            msg.val = 3;
          } else {
            msg.val = 1;
          }
          this.sendToDApp(msg);
        }
      }.bind(this)
    );
  }

  async getWalletFromAddress(address) {
    try {
      /* if (!this.addresses[address]) {
               return '';
             }*/
      const { addrInfo } = this.state;
      /*
                  let addrType = '';
                  switch (this.addresses[address].walletID) {
                    case WALLETID.NATIVE:
                      addrType = 'normal';
                      break;
                    case WALLETID.LEDGER:
                      addrType = 'ledger';
                      break;
                    case WALLETID.TREZOR:
                      addrType = 'trezor';
                      break;
                  }
                  let index = Object.keys(addrInfo[addrType]).findIndex(val => val.toLowerCase() === address);
                  let addr = '';
                  if (index !== -1) {
                    addr = Object.keys(addrInfo[addrType])[index];
                  }
                  console.log(addrInfo);*/

      /* let path = addrInfo[addrType][addr] && addrInfo[addrType][addr]['path'];
             console.log(path);
             if (path.indexOf('m') === -1) {
               path = WAN_PATH + '/0/' + path;
             }*/
      return {
        id: WALLETID.NATIVE,
        path: WAN_PATH,
        address: address,
      };
    } catch (error) {
      console.log("getWalletFromAddress error", error);
    }
  }

  async signPersonalMessage(msg) {
    // console.log(msg);
    await this.showConfirm(
      "sign",
      msg,
      async (msg) => {
        msg.err = null;
        msg.val = null;

        const wallet = await this.getWalletFromAddress(msg.address);
        if (wallet.id === WALLETID.TREZOR) {
          try {
            let sig = await trezorSignPersonalMessage(wallet.path, msg.message);
            msg.val = sig;
          } catch (error) {
            console.log(error);
            msg.err = error;
          }
          this.sendToDApp(msg);
        } else {
          wand.request(
            "wallet_signPersonalMessage",
            {
              walletID: wallet.id,
              path: wallet.path,
              rawTx: msg.message,
            },
            (err, sig) => {
              if (err) {
                console.log(err.message);
                msg.err = err;
                console.log(`Sign Failed:`, JSON.stringify(err));
              } else {
                msg.val = sig;
              }
              this.sendToDApp(msg);
            }
          );
        }
      },
      async (msg) => {
        msg.err = "The user rejects in the wallet.";
        this.sendToDApp(msg);
      }
    );
  }

  async nativeSendTransaction(msg, wallet) {
    let gasPrice = await getGasPrice("wan");
    let amountInWei = new BigNumber(msg.message.value);
    let trans = {
      walletID: wallet.id,
      chainType: "WAN",
      symbol: "WAN",
      path: wallet.path,
      to: msg.message.to,
      amount: amountInWei.div(1e18),
      gasLimit: msg.message.gasLimit
        ? this.toHexString(msg.message.gasLimit)
        : `0x${(2000000).toString(16)}`,
      gasPrice: msg.message.gasPrice
        ? fromWei(msg.message.gasPrice, "Gwei")
        : gasPrice,
      data: msg.message.data,
    };
    // console.log("wand req");
    // console.log(trans);
    wand.request(
      "transaction_normal",
      trans,
      function (err, val) {
        if (err) {
          console.log("error printed inside callback: ", err);
          msg.err = err;
        } else {
          console.log(val);
          if (val.code === false) {
            msg.err = new Error(val.result);
          } else {
            msg.val = val.result;
          }
        }
        this.sendToDApp(msg);
      }.bind(this)
    );
  }

  async trezorSendTransaction(msg, wallet) {
    let chainId = await getChainId();
    try {
      let nonce = await getNonce(msg.message.from, "wan");
      let gasPrice = await getGasPrice("wan");
      let data = msg.message.data;
      let amountWei = msg.message.value;
      let rawTx = {};
      rawTx.from = msg.message.from;
      rawTx.to = msg.message.to;
      rawTx.value = amountWei ? "0x" + Number(amountWei).toString(16) : "0x00";
      rawTx.data = data;
      rawTx.nonce = "0x" + nonce.toString(16);
      rawTx.gasLimit = msg.message.gasLimit
        ? this.toHexString(msg.message.gasLimit)
        : `0x${(2000000).toString(16)}`;
      rawTx.gasPrice = msg.message.gasPrice
        ? msg.message.gasPrice
        : toWei(gasPrice, "gwei");
      rawTx.Txtype = Number(1);
      rawTx.chainId = chainId;
      let raw = await pu.promisefy(trezorSignTransaction, [wallet.path, rawTx]);
      let txHash = await pu.promisefy(wand.request, [
        "transaction_raw",
        { raw, chainType: "WAN" },
      ]);
      msg.val = txHash;
    } catch (error) {
      console.log(error);
      msg.err = error;
    }

    this.sendToDApp(msg);
  }

  async sendTransaction(msg) {
    console.log("send tx");
    await this.showConfirm(
      "send",
      msg,
      async (msg) => {
        msg.err = null;
        msg.val = null;
        if (!msg.message || !msg.message.from) {
          msg.err = "can not find from address.";
          this.sendToDApp(msg);
          return;
        }

        const wallet = await this.getWalletFromAddress(msg.message.from);
        console.log(wallet);
        if (wallet.id === WALLETID.TREZOR) {
          await this.trezorSendTransaction(msg, wallet);
        } else {
          console.log("native send tx");
          console.log(msg);
          await this.nativeSendTransaction(msg, wallet);
        }
      },
      async (msg) => {
        msg.err = "The user rejects in the wallet.";
        this.sendToDApp(msg);
      }
    );
  }

  toHexString(value) {
    if (typeof value === "string") {
      return value.startsWith("0x") ? value : `0x${Number(value).toString(16)}`;
    } else {
      return `0x${value.toString(16)}`;
    }
  }

  back = () => {
    this.props.setCurrent("walletnameentry");
  };

  create = () => {
    this.props.setWalletEntryNextDirection("basicwallet");
    this.props.setCurrent("walletcreation");
  };

  async getPreloadFile() {
    return pu.promisefy(wand.request, ["system_getDAppInjectFile"]);
  }

  sendToDApp(msg) {
    if (!this.webview) {
      this.webview = document.getElementById("dappView");
    }
    this.webview.send("dapp-message", msg);
  }

  renderLoadTip = () => {
    return (
      <div>
        Loading...
        {/* <br />
        <br />
        If you're using it for the first time, it might take a few minutes... */}
      </div>
    );
  };

  render() {
    const preload = this.state.preload;
    if (preload) {
      return (
        <div className="splashcreatebasicwalletpanel fadeInAnim">
          {this.state.loading ? (
            <Spin
              style={{ margin: "60px 0px 0px 60px" }}
              tip={this.renderLoadTip()}
              size="large"
            />
          ) : null}
          <webview
            id="dappView"
            src="https://exchange.wrdex.io/"
            style={{
              width: "100%",
              height: "100%",
              display: this.state.displayed,
            }}
            nodeintegration="on"
            preload={preload}
            allowpopups="on"
          >
            Your electron doesn't support webview, please set webviewTag: true.
          </webview>
        </div>
      );
    } else {
      return null;
    }
  }

  /* render() {
       return (
         <div className="splashcreatebasicwalletpanel fadeInAnim">
           <iframe frameBorder="0" width="100%" height="100%" src="http://staging.wrdex.io/" ></iframe>
         </div>
       );
     }*/
}

export default Dex;
