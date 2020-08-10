import React, { Component } from "react";
import { Button, Input } from "antd";
import { inject, observer } from "mobx-react";
import intl from "react-intl-universal";
import { createNotification } from "utils/helper";
import buttonback from "static/image/icon/back.png";
import { WALLETID, WANPATH } from "../../../utils/support";
import { createFirstAddr } from "../../../utils/helper";
import "./index.less";
const bcrypt = require("bcryptjs");
const bip39 = require("bip39");

@inject((stores) => ({
  CreateEthAddress: (dappwallet) =>
    stores.walletStore.CreateEthAddress(dappwallet),
  setCurrent: (current) => stores.walletStore.setCurrent(current),
  setWalletName: (walletname) => stores.walletStore.setWalletName(walletname),
  setSeedPhaseInString: (val, pass) =>
    stores.walletStore.setSeedPhaseInString(val, pass),
  setPassword: (password) => stores.walletStore.setPassword(password),
  seedphase: stores.walletStore.seedphase,
  ethaddress: stores.walletStore.ethaddress,
  language: stores.languageIntl.language,
  wsLogin: () => stores.userRegistration.wsLogin(),
  addWANAddress: (newAddr) => stores.wanAddress.addAddress(newAddr),
}))
@observer
class WalletRestorebySeed extends Component {
  state = {
    seedphase: "",
    walletname: "",
    password: "",
    inputcurrentpassword: false,
  };

  componentDidMount() {
    var wallets = JSON.parse(localStorage.getItem("wallets"));
    if (wallets == null || wallets == "[]") {
      this.setState({ inputcurrentpassword: false });
    } else {
      this.setState({ inputcurrentpassword: true });
    }
  }

  onChange = (e) => {
    this.setState({ seedphase: e.target.value }); // e.target.value.replace(/^\s+|\s+$/g, '').replace(/\s+/g, ' '));
  };

  copy = () => {
    console.log("COPY");
  };

  WalletNameOnChange = (e) => {
    this.setState({ walletname: e.target.value }, () => {
      this.props.setWalletName(this.state.walletname);
    });
  };

  PasswordOnChange = (e) => {
    this.setState({ password: e.target.value }, () => {
      // this.props.setPassword(this.state.password);
    });
  };

  next = () => {
    //console.log(document.execCommand('paste'));
    //return;
    if (!bip39.validateMnemonic(this.state.seedphase)) {
      createNotification("error", intl.get("Error.InvalidMnemonicphrase"));
      return;
    }

    if (this.state.walletname == "") {
      createNotification("error", intl.get("Error.Walletnameisempty"));
      return;
    }

    if (this.state.seedphase == "") {
      createNotification("error", intl.get("Error.Mnemonicphraseisempty"));
      return;
    }

    if (
      this.state.seedphase.split(" ").length == 12 ||
      this.state.seedphase.split(" ").length == 24
    ) {
    } else {
      createNotification("error", intl.get("Error.InvalidMnemonicphrase"));
      return;
    }
    if (this.state.password == "" || this.state.password.length < 6) {
      createNotification("error", intl.get("Error.Passwordlonger"));
    } else {
      var wallets = localStorage.getItem("wallets");
      var dappwallet = false;
      if (wallets == null || wallets == "[]") {
        dappwallet = true;
        wand.request("phrase_has", null, (err, val) => {
          if (!val) {
            const { addWANAddress } = this.props;
            console.log("IMPORTING");
            wand.request(
              "phrase_import",
              { phrase: this.state.seedphase, pwd: this.state.password },
              (err) => {
                if (err) {
                  console.log("failed to import: " + err);
                  return;
                }
                console.log("imported");
                wand.request(
                  "wallet_unlock",
                  { pwd: this.state.password },
                  async (err, val) => {
                    if (err) {
                      console.log("registration failed" + err);
                    } else {
                      try {
                        let [wanAddrInfo] = await Promise.all([
                          createFirstAddr(
                            WALLETID.NATIVE,
                            "WAN",
                            `${WANPATH}0`,
                            "Account1"
                          ),
                        ]);
                        addWANAddress(wanAddrInfo);

                        this.setState({ loading: false });
                      } catch (err) {
                        console.log("createFirstAddr:", err);
                      }
                    }
                  }
                );
              }
            );
          }
        });
      } else {
        bcrypt.compare(
          this.state.password,
          localStorage.getItem("password"),
          (err, res) => {
            if (res) {
              dappwallet = false;
              this.props.setSeedPhaseInString(
                this.state.seedphase,
                this.state.password
              );
              this.props.CreateEthAddress(dappwallet);
              this.props.setCurrent("walletcreated");
              this.props.wsLogin();
              this.setState({
                password: "",
                seedphase: "",
                walletname: "",
              });
            } else {
              createNotification("error", "Invalid password");
              this.setState({
                password: "",
              });
            }
          }
        );
      }
    }
  };

  back = () => {
    this.props.setCurrent("importwallettypeselection");
  };

  render() {
    return (
      <div className="walletkeyinseedpanel fadeInAnim">
        <div className="title">
          <span>
            <img onClick={this.back} width="20px" src={buttonback} />
          </span>
          <span style={{ marginLeft: "20px" }}>
            {intl.get("Wallet.RESTOREMNEMONICPHRASE")}
          </span>
        </div>
        <div className="centerpanel">
          <center>
            <div className="inputwrapper">
              <div className="subtitle">{intl.get("Wallet.walletname")}</div>
              <div
                className="panelwrapper borderradiusfull"
                style={{ width: "150px" }}
              >
                <input
                  className="inputTransparent"
                  onChange={this.WalletNameOnChange}
                />
              </div>

              <div className="subtitle">
                {intl.get("Wallet.Mnemonicphrase")}
              </div>
              <div
                className="panelwrapper borderradiusfull"
                style={{ width: "600px" }}
              >
                <input className="inputTransparent" onChange={this.onChange} />
              </div>

              <div className="subtitle">{intl.get("Wallet.InputPassword")}</div>
              <div
                className="panelwrapper borderradiusfull"
                style={{ width: "150px" }}
              >
                {this.state.inputcurrentpassword == false && (
                  <Input
                    id="password"
                    type="password"
                    placeholder={intl.get("Register.NewPassword")}
                    className="inputTransparent"
                    value={this.state.password}
                    onChange={this.PasswordOnChange}
                  />
                )}
                {this.state.inputcurrentpassword == true && (
                  <Input
                    id="password"
                    type="password"
                    placeholder={intl.get("Register.CurrentPassword")}
                    className="inputTransparent"
                    value={this.state.password}
                    onChange={this.PasswordOnChange}
                  />
                )}
              </div>

              <Button className="curvebutton" onClick={this.next}>
                {intl.get("Settings.Restore")}
              </Button>
            </div>
          </center>
        </div>
      </div>
    );
  }
}

export default WalletRestorebySeed;
