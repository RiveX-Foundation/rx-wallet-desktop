import React, { Component } from "react";
import { Button } from "antd";
import { inject, observer } from "mobx-react";
import intl from "react-intl-universal";
import buttonback from "static/image/icon/back.png";
import buttonartboard3 from "static/image/graphic/security01.jpg";
import "./index.less";

const speakeasy = require("speakeasy");

@inject((stores) => ({
  setCurrent: (current) => stores.walletStore.setCurrent(current),
  setWalletEntryNextDirection: (val) =>
    stores.walletStore.setWalletEntryNextDirection(val),
  language: stores.languageIntl.language,
  setGoogleAuthKeyPending: (googleAuthKey) =>
    stores.walletStore.setGoogleAuthKeyPending(googleAuthKey),
}))
@observer
class TwoFAWarning extends Component {
  state = {
    mobilevalue: "",
    googleAuthKey: "",
  };

  componentDidMount() {
    const googleauthKey = speakeasy.generateSecret({ length: 16 }).base32;
    this.setState(
      {
        googleAuthKey: googleauthKey,
      },
      () => {
        this.props.setGoogleAuthKeyPending(googleauthKey);
      }
    );
  }

  back = () => {
    this.props.setCurrent("settings");
  };

  create = () => {
    this.props.setCurrent("twofacreation");
  };

  render() {
    return (
      <div className="splashcreatebasicwalletpanel fadeInAnim">
        <div className="title">
          <span>
            <img onClick={this.back} width="20px" src={buttonback} />
          </span>
          <span style={{ marginLeft: "20px" }}>
            {"Two factor authentication warning"}
          </span>
        </div>
        <div className="centerpanel">
          <div style={{ marginBottom: "30px" }}>
            <img src={buttonartboard3} width="350px" />
          </div>
          <div className="guidelabel">
            <ul>
              <li>{intl.get("Twofa.Warning1")}</li>
              <li>{intl.get("Twofa.Warning2")}</li>
            </ul>
          </div>
          <div className="buttonpanel">
            <Button className="curvebutton" onClick={this.create}>
              {intl.get("Common.GotIt")}
            </Button>
          </div>
        </div>
      </div>
    );
  }
}

export default TwoFAWarning;
