import React, { Component } from "react";
import { Button } from "antd";
import { inject, observer } from "mobx-react";
import intl from "react-intl-universal";
import artboard5 from "static/image/graphic/artboard5.png";

import "./index.less";

@inject((stores) => ({
  selectedWallet: stores.walletStore.selectedwallet,
  successulhash: stores.walletStore.successulhash,
  setCurrent: (current) => stores.walletStore.setCurrent(current),
  language: stores.languageIntl.language,
}))
@observer
class TokenTransferSuccessful extends Component {
  state = {
    mobilevalue: "",
  };

  inputChanged = (e) => {
    this.setState({ mobilevalue: e.target.value }, () => {
      this.props.setMobile(this.state.mobilevalue);
    });
  };

  next = () => {
    this.props.setCurrent("walletdetail");
  };

  render() {
    return (
      <div className="walletcreatedpanel fadeInAnim">
        <div className="centerpanel">
          <div style={{ marginBottom: "30px" }}>
            <img src={artboard5} width="350px" />
          </div>
          <div className="subtitle">
            {intl.get("Transaction.TransactionSuccessful")}
          </div>
          <div className="hint">{this.props.successulhash}</div>
          <Button className="curvebutton" onClick={this.next}>
            {intl.get("Wallet.Confirm")}
          </Button>
        </div>
      </div>
    );
  }
}

export default TokenTransferSuccessful;
