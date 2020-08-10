import React, { Component } from "react";
import { Button } from "antd";
import { inject, observer } from "mobx-react";
import intl from "react-intl-universal";
import artboard4 from "static/image/graphic/artboard4.png";

import "./index.less";

@inject((stores) => ({
  selectedWallet: stores.walletStore.selectedwallet,
  setCurrent: (current) => stores.walletStore.setCurrent(current),
  language: stores.languageIntl.language,
}))
@observer
class WalletCreated extends Component {
  state = {
    mobilevalue: "",
  };

  inputChanged = (e) => {
    this.setState({ mobilevalue: e.target.value }, () => {
      this.props.setMobile(this.state.mobilevalue);
    });
  };

  next = () => {
    this.props.setCurrent("selectedwallet");
  };

  render() {
    return (
      <div className="walletcreatedpanel fadeInAnim">
        <div className="centerpanel">
          <div style={{ marginBottom: "30px" }}>
            <img src={artboard4} width="350px" />
          </div>
          <div
            className="subtitle"
            style={{ marginBottom: "0px", fontSize: "30px" }}
          >
            {intl.get("Wallet.WalletCreated")}
          </div>
          <div className="subtitle" style={{ color: "#fff" }}>
            {this.props.selectedWallet.walletname}
          </div>
          <div className="hint">{this.props.selectedWallet.publicaddress}</div>
          <Button className="curvebutton" onClick={this.next}>
            {intl.get("Wallet.Confirm")}
          </Button>
        </div>
      </div>
    );
  }
}

export default WalletCreated;
