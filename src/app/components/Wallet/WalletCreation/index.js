import React, { Component } from "react";
import { Button, Input, Modal } from "antd";
import { inject, observer } from "mobx-react";
import intl from "react-intl-universal";
import "./index.less";
import buttonback from "static/image/icon/back.png";
import { createNotification } from "../../../utils/helper";

const bip39 = require("bip39");
var bcrypt = require("bcryptjs");

@inject((stores) => ({
  seedphase: stores.walletStore.seedphase,
  seedphaseinstring: stores.walletStore.seedphaseinstring,
  mnemonicpassword: stores.walletStore.mnemonicpassword,
  mnemonicpasswordconfirm: stores.walletStore.mnemonicpasswordconfirm,
  generate12SeedPhase: () => stores.walletStore.generate12SeedPhase(),
  setSeedPhase: (seedphase) => stores.walletStore.setSeedPhase(seedphase),
  setSeedPhaseInString: (text, pass) =>
    stores.walletStore.setSeedPhaseInString(text, pass),
  setCurrent: (current) => stores.walletStore.setCurrent(current),
  setcurrentReg: (current) => stores.userRegistration.setCurrent(current),
  language: stores.languageIntl.language,
  setPendingPassword: (password) =>
    stores.walletStore.setPendingPassword(password),
  CreateEthAddress: (dappwallet) =>
    stores.walletStore.CreateEthAddress(dappwallet),
  wsLogin: () => stores.userRegistration.wsLogin(),
  setRequestSignIn: (val) => stores.session.setRequestSignIn(val),
}))
@observer
class WalletCreation extends Component {
  state = {
    seedphase: [],
    mnemonic: "",
    seedphaseel: null,
    nextbuttonstyle: { display: "inline-block" },
    mnemonicpassword: "",
    mnemonicpasswordconfirm: "",
    inputcurrentpassword: false,
    backupwarning: false,
  };

  inputEl1 = null;

  onChange = (e) => {};

  componentDidMount() {
    var seed = this.props.generate12SeedPhase();
    this.generateSeedPhaseList(seed);
    var wallets = JSON.parse(localStorage.getItem("wallets"));
    if (wallets == null || wallets == "[]") {
      this.setState({ inputcurrentpassword: false });
    } else {
      this.setState({ inputcurrentpassword: true });
    }
  }

  generateSeedPhaseList = (seed) => {
    let mnemonic = "";
    //if(this.props.seedphaseinstring!=""){
    //  mnemonic = this.props.seedphaseinstring;
    //}else{
    mnemonic = seed;
    //}
    this.setState({ mnemonic: mnemonic });
    this.setState({ seedphase: mnemonic.split(" ") });

    const seedphase = mnemonic.split(" ");
    //this.props.setSeedPhase(mnemonic.split(" "));
    //this.props.setSeedPhaseInString(mnemonic);
    const seedel = seedphase.map((item, i) => {
      // console.log(item)
      return <li key={i}>{item}</li>;
    });
    this.setState({ seedphaseel: seedel });
  };

  backupedwarning = () => {
    this.setState({ backupwarning: true });
  };

  handleCancel = () => {
    this.setState({
      backupwarning: false,
    });
  };

  copy = () => {
    this.inputEl1.select();
    document.execCommand("copy");
    createNotification("info", intl.get("Info.CopyDone"));
    // This is just personal preference.
    // I prefer to not show the the whole text area selected.
    //e.target.focus();
    //setCopySuccess('Copied!');
  };

  next = () => {
    bcrypt.compare(
      this.state.mnemonicpassword,
      localStorage.getItem("password"),
      (err, res) => {
        if (res) {
          var dappwallet = false;
          let mnemonic = this.state.mnemonic;
          this.props.setSeedPhaseInString(
            mnemonic.replace(",", " "),
            this.state.mnemonicpassword
          );
          this.props.CreateEthAddress(dappwallet);
          this.props.setCurrent("walletcreated");
          this.props.wsLogin();
          this.props.setRequestSignIn(false);
          this.props.setcurrentReg("inputmobile");
        } else {
          createNotification("error", "Invalid password");
          this.setState({
            backupwarning: false,
            mnemonicpassword: "",
          });
        }
      }
    );
  };
  inputChanged = (e) => {
    switch (e.target.id) {
      case "password":
        this.setState({ mnemonicpassword: e.target.value });
        // this.props.setPassword(e.target.value);
        break;
    }
  };

  onKeyDown = (e) => {};

  validatepassword = () => {
    console.log("validating password: ");
    console.log(this.state.mnemonicpassword);
    console.log(this.state.mnemonicpasswordconfirm);

    if (this.state.mnemonicpassword == this.state.mnemonicpasswordconfirm) {
      if (
        this.state.mnemonicpassword == "" ||
        this.state.mnemonicpasswordconfirm == ""
      ) {
        this.setState({ nextbuttonstyle: { display: "none" } });
      } else {
        this.setState({ nextbuttonstyle: { display: "inline-block" } });
      }
    }
    if (
      this.state.mnemonicpassword == "" ||
      this.state.mnemonicpasswordconfirm == "" ||
      this.state.mnemonicpassword != this.state.mnemonicpasswordconfirm
    ) {
      this.setState({ nextbuttonstyle: { display: "none" } });
    }
  };
  back = () => {
    this.props.setcurrentReg("createwalletlogin");
    this.props.setCurrent("backupwallettutorial");
  };

  render() {
    const { seedphaseel } = this.state;
    const { nextbuttonstyle } = this.state;

    return (
      <div className="walletcreationpanel fadeInAnim">
        <div className="title">
          <span>
            <img onClick={this.back} width="20px" src={buttonback} />
          </span>
          <span style={{ marginLeft: "20px" }}>
            {intl.get("Wallet.RecoveryPhrase")}
          </span>
        </div>
        <div className="centerpanel">
          <center>
            <div style={{ width: "600px" }}>
              <div className="hint">
                {intl.get("Wallet.WriteDownRecoveryPhrase")}
              </div>
              <ul>{this.state.seedphaseel}</ul>
              <div>
                <Button className="copybutton" onClick={this.copy}>
                  {intl.get("Backup.copyToClipboard")}
                </Button>
              </div>
              <div
                className="hint2"
                style={{
                  marginTop: "40px",
                  marginBottom: "30px",
                }}
              >
                {intl.get("Wallet.NeverShareRecovery")}
              </div>

              <div className="inputpanel">
                <center>
                  {
                    <div className="panelwrapper borderradiusfull">
                      {this.state.inputcurrentpassword == false && (
                        <Input.Password
                          id="password"
                          style={{ marginLeft: "-40px", paddingLeft: "0px" }}
                          placeholder={intl.get("Register.NewPassword")}
                          className="inputTransparent"
                          onChange={this.inputChanged}
                          onKeyDown={this.onKeyDown}
                        />
                      )}
                      {this.state.inputcurrentpassword == true && (
                        <Input.Password
                          id="password"
                          style={{ marginLeft: "-40px", paddingLeft: "0px" }}
                          placeholder={intl.get("Register.CurrentPassword")}
                          className="inputTransparent"
                          onChange={this.inputChanged}
                          onKeyDown={this.onKeyDown}
                        />
                      )}
                    </div>
                  }
                </center>
              </div>
              <div>
                <Button
                  style={nextbuttonstyle}
                  className="curvebutton"
                  onClick={this.next}
                >
                  {intl.get("Wallet.IHaveBackupMySeed")}
                </Button>
              </div>
              <input
                onChange={this.onChange}
                style={{ marginTop: -99999, position: "absolute" }}
                ref={(input) => {
                  this.inputEl1 = input;
                }}
                type="text"
                value={this.state.mnemonic}
                id="hiddenphase"
              />
            </div>
          </center>
        </div>
        <Modal
          title=""
          visible={this.state.backupwarning}
          okText={intl.get("ValidatorRegister.acceptAgency")}
          cancelText={intl.get("ValidatorRegister.notAcceptAgency")}
          onOk={this.next}
          onCancel={this.handleCancel}
        >
          <div className="pheader">{intl.get("Info.Warning")}</div>
          <div>
            <div className="pmodalcontent" style={{ textAlign: "center" }}>
              {intl.get("Wallet.Areyousurebackup")}
            </div>
          </div>
        </Modal>
      </div>
    );
  }
}

export default WalletCreation;
