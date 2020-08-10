import React, { Component } from "react";
import { inject, observer } from "mobx-react";
import intl from "react-intl-universal";
import "./index.less";
import { createNotification } from "utils/helper";
import buttonback from "static/image/icon/back.png";
import buttoncopy from "static/image/icon/copy.png";

var Web3 = require("web3");
var QRCode = require("qrcode.react");

@inject((stores) => ({
  selectedWallet: stores.walletStore.selectedwallet,
  selectedTokenAsset: stores.walletStore.selectedTokenAsset,
  wallets: stores.walletStore.walletlist,
  LoadTransactionByAddress: (addr) =>
    stores.walletStore.LoadTransactionByAddress(addr),
  loadWallet: () => stores.walletStore.loadWallet(),
  setCurrent: (current) => stores.walletStore.setCurrent(current),
  language: stores.languageIntl.language,
}))
@observer
class TokenReceive extends Component {
  state = {};

  inputEl1 = null;

  onChange = () => {};

  componentDidMount() {
    // this.loadwallet();
  }

  loadwallet = () => {
    this.props.loadWallet();
  };

  back = () => {
    var backval =
      this.props.selectedTokenAsset.PublicAddress != null
        ? "walletdetail"
        : "selectedwallet";
    this.props.setCurrent(backval);
  };

  copy = () => {
    this.inputEl1.select();
    document.execCommand("copy");
    createNotification("info", intl.get("Info.CopyDone"));
    console.log("COPY DONE");
  };

  render() {
    var publicaddr =
      this.props.selectedTokenAsset.PublicAddress != null
        ? this.props.selectedTokenAsset.PublicAddress
        : this.props.selectedWallet.publicaddress;
    console.log(publicaddr);

    return (
      <div className="tokenreceivepanel fadeInAnim">
        <div className="title">
          <span>
            <img onClick={this.back} width="20px" src={buttonback} />
          </span>
          <span style={{ marginLeft: "20px" }}>
            {intl.get("Token.ReceiveToken")}
          </span>
        </div>
        <div className="centerpanel">
          <center>
            <div className="inputwrapper">
              <div style={{ marginBottom: "10px" }} className="subtitle">
                {this.props.selectedWallet.walletname}
              </div>
              <center>
                <div className="qrcodectn">
                  <div className="inner">
                    <QRCode fgColor="#4954AE" size={180} value={publicaddr} />
                  </div>
                </div>
              </center>
              <div className="panelwrapper borderradiusfull">
                <div>{publicaddr}</div>
                <img
                  src={buttoncopy}
                  onClick={this.copy}
                  className="copyicon"
                />
              </div>

              <input
                onChange={this.onChange}
                style={{ marginTop: -99999, position: "absolute" }}
                ref={(input) => {
                  this.inputEl1 = input;
                }}
                type="text"
                value={publicaddr}
                id="hiddenphase"
              />
            </div>
          </center>
        </div>
      </div>
    );
  }
}

export default TokenReceive;
