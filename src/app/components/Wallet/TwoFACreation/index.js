import React, { Component } from "react";
import { Button, Input, Modal } from "antd";
import { inject, observer } from "mobx-react";
import intl from "react-intl-universal";
import buttonback from "static/image/icon/back.png";
import { createNotification } from "utils/helper";
import "./index.less";

const speakeasy = require("speakeasy");
var QRCode = require("qrcode.react");
const base32 = require("hi-base32");
var bcrypt = require("bcryptjs");

@inject((stores) => ({
  setCurrent: (current) => stores.walletStore.setCurrent(current),
  setWalletEntryNextDirection: (val) =>
    stores.walletStore.setWalletEntryNextDirection(val),
  language: stores.languageIntl.language,
  googleAuthKeyPending: stores.walletStore.googleAuthKeyPending,
  setGoogleAuthKey: (googleAuthkey, pass) =>
    stores.walletStore.setGoogleAuthKey(googleAuthkey, pass),
}))
@observer
class TwoFACreation extends Component {
  state = {
    mobilevalue: "",
    googleAuthKey: "",
    mfa: "",
    password: "",
    twofawarningvisible: false,
  };

  componentDidMount() {
    console.log("TWOFA CREATION MOUNTED");
    this.setState({
      googleAuthKey: this.props.googleAuthKeyPending,
    });
  }

  inputChanged = (e) => {
    switch (e.target.id) {
      case "mfa":
        this.setState({ mfa: e.target.value });
        break;
      case "password":
        this.setState({ password: e.target.value });
    }
  };
  _toHex = (key) => {
    return new Buffer(key, "ascii").toString("hex");
  };

  back = () => {
    console.log("twofacreation back");
    this.props.setCurrent("twofawarning");
  };

  verify = () => {
    const secretAscii = base32.decode(this.state.googleAuthKey);
    bcrypt.compare(
      this.state.password,
      localStorage.getItem("password"),
      (err, res) => {
        if (res) {
          const secretHex = this._toHex(secretAscii);
          var authcode = speakeasy.totp.verifyDelta({
            secret: secretHex,
            encoding: "hex",
            token: this.state.mfa,
            window: 3,
          });
          if (authcode) {
            createNotification("success", "Successfully activated 2FA");
            this.props.setGoogleAuthKey(
              this.state.googleAuthKey,
              this.state.password
            );
            this.setState({ mfa: "" });
            this.setState({ password: "" });
            this.props.setCurrent("settings");
          } else {
            createNotification("error", intl.get("Error.InvalidOTP"));
            this.setState({ mfa: "" });
          }
        } else {
          createNotification("error", intl.get("Error.Userwrongpassword"));
          this.setState({ password: "" });
        }
      }
    );
  };

  handleCancel = () => {
    this.setState({
      twofawarningvisible: false,
    });
  };
  warning = () => {
    this.setState({ twofawarningvisible: true });
  };

  render() {
    return (
      <div className="splashcreatebasicwalletpanel fadeInAnim">
        <div className="title">
          <span>
            <img onClick={this.back} width="20px" src={buttonback} />
          </span>
          <span style={{ marginLeft: "20px" }}>
            {"Create two factor authentication"}
          </span>
        </div>
        <div className="centerpanel">
          <center>
            <div className="plaintext">
              <b className="secretkey">{intl.get("Twofa.Scanbarcode")}</b>
            </div>
            <br></br>
            <div className="plaintext">{intl.get("Twofa.Useapp")}</div>
            <div className="plaintext" style={{ marginBottom: "15px" }}>
              {intl.get("Twofa.Cantuse")}
            </div>
            <div>
              <QRCode
                fgColor="#FFFFFF"
                bgColor="#000000"
                style={{ marginBottom: "10px" }}
                size={200}
                value={
                  "otpauth://totp/RVXWallet?secret=" +
                  this.props.googleAuthKeyPending
                }
              ></QRCode>
            </div>
            <div className="plaintext">{intl.get("Auth.SecretKeyInText")}</div>
            <div className="secretkey">
              <b className="secretkey">{this.props.googleAuthKeyPending}</b>
            </div>
            <div style={{ marginTop: "30px" }}></div>
            <div
              className="plaintext"
              style={{ marginTop: "20px", marginBottom: "15px" }}
            >
              {intl.get("Twofa.Afterscan")}
            </div>
            <div className="inputpanel">
              <div className="panelwrapper borderradiusfull">
                <Input
                  id="mfa"
                  value={this.state.mfa}
                  placeholder={intl.get("Auth.EnterOTP")}
                  style={{ marginLeft: "-40px" }}
                  className="inputTransparent"
                  onChange={this.inputChanged}
                />
                <Input.Password
                  id="password"
                  style={{
                    marginLeft: "-40px",
                    paddingLeft: "0px",
                    marginTop: "5px",
                  }}
                  placeholder={intl.get("Register.Password")}
                  className="inputTransparent"
                  onChange={this.inputChanged}
                  onKeyDown={this.onKeyDown}
                />
              </div>
              <div
                className="plaintext"
                style={{ marginTop: "15px", marginBottom: "2px" }}
              >
                {intl.get("Twofa.Entercode")}
              </div>
              <div className="buttonpanel">
                <Button className="curvebutton" onClick={this.warning}>
                  {intl.get("Auth.Verify")}
                </Button>
              </div>
            </div>
          </center>
          <Modal
            title=""
            visible={this.state.twofawarningvisible}
            onOk={this.verify}
            onCancel={this.handleCancel}
          >
            <div className="pheader">{intl.get("Info.Warning")}</div>
            <center>
              <div className="pmodalcontent" style={{ textAlign: "center" }}>
                {"Are you sure you saved your secret key?"}
                <div className="secretkey">
                  {this.props.googleAuthKeyPending}
                </div>
              </div>
            </center>
          </Modal>
        </div>
      </div>
    );
  }
}

export default TwoFACreation;
