import React, { Component } from "react";
import { inject, observer } from "mobx-react";
import intl from "react-intl-universal";
import buttonnext from "static/image/icon/next.png";
import buttonback from "static/image/icon/back.png";
import localicon from "static/image/icon/local.png";
import "./index.less";

const bip39 = require("bip39");

@inject((stores) => ({
  setCurrent: (current) => stores.walletStore.setCurrent(current),
  setselectedimporttype: (val) => stores.walletStore.setselectedimporttype(val),
  language: stores.languageIntl.language,
  setBasicWalletType: (type) => stores.walletStore.setBasicWalletType(type),
  setWalletEntryNextDirection: (val) =>
    stores.walletStore.setWalletEntryNextDirection(val),
}))
@observer
class BasicWalletTypeSelection extends Component {
  state = {
    seedphase: [],
    mnemonic: "",
    seedphaseel: null,
  };

  inputEl1 = null;

  componentDidMount() {}

  back = () => {
    this.props.setCurrent("selectedwallet");
  };

  setBasicWalletType = (type) => {
    this.props.setBasicWalletType(type);
    this.props.setWalletEntryNextDirection("basicwallet");
    this.props.setCurrent("walletnameentry");
  };

  render() {
    return (
      <div className="wallettypeselectionpanel fadeInAnim">
        <div className="title">
          <span>
            <img onClick={this.back} width="20px" src={buttonback} />
          </span>
          <span style={{ marginLeft: "20px" }}>
            {intl.get("Wallet.CreateBasicWallet")}
          </span>
        </div>
        <div className="centerpanel">
          <center>
            <div
              className="panelwrapper borderradiusfull spacebetween"
              onClick={() => this.setBasicWalletType("local")}
              style={{ marginBottom: "10px" }}
            >
              <div className="panelleft">
                <img src={localicon} />
                <span>{intl.get("Wallet.StoreOnLocal")}</span>
              </div>
              <div className="panelright">
                <img src={buttonnext} />
              </div>
            </div>
            {/*
                            <div className="panelwrapper borderradiusfull spacebetween" onClick={() => this.setBasicWalletType('cloud')} style={{marginBottom:"10px"}}>
                              <div className="panelleft"><img src={cloudicon} /><span>{intl.get('Wallet.StoreOnCloud')}</span></div>
                              <div className="panelright"><img src={buttonnext} /></div>
                            </div>
                          */}
          </center>
        </div>
      </div>
    );
  }
}

export default BasicWalletTypeSelection;
