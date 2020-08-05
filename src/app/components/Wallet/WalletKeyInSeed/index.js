import React, { Component } from "react";
import { Button, Input } from "antd";
import { inject, observer } from "mobx-react";
import { toJS } from "mobx";
import intl from "react-intl-universal";
import buttonback from "static/image/icon/back.png";
import { WALLETID } from "../../../utils/support";
import { createWANAddr } from "../../../utils/helper";
import "./index.less";

var bcrypt = require("bcryptjs");

const { TextArea } = Input;

@inject((stores) => ({
  CreateEthAddress: (dappwallet) =>
    stores.walletStore.CreateEthAddress(dappwallet),
  setCurrent: (current) => stores.walletStore.setCurrent(current),
  setcurrentReg: (current) => stores.userRegistration.setCurrent(current),
  seedphase: stores.walletStore.seedphase,
  ethaddress: stores.walletStore.ethaddress,
  language: stores.languageIntl.language,
  pendingpassword: stores.walletStore.pendingpassword,
  wsLogin: () => stores.userRegistration.wsLogin(),
  setRequestSignIn: (val) => stores.session.setRequestSignIn(val),
  setPassword: (password) => stores.walletStore.setPassword(password),
  clearPendingPassword: () => stores.walletStore.clearPendingPassword(),
  addAddress: (newAddr) => stores.wanAddress.addAddress(newAddr),
}))
@observer
class WalletKeyInSeed extends Component {
  state = {
    seedphaseel: null,
    selectedseedphase: [],
    originalseedphase: [],
    nextbuttonstyle: { display: "none" },
    pendingpassword: "",
  };

  constructor(props) {
    super(props);
  }

  componentDidMount() {
    // console.log("TESTING")
    this.get12SeedPhase();
    this.state.pendingpassword = this.props.pendingpassword;
  }

  inputChanged = (e) => {
    this.setState({ mobilevalue: e.target.value }, () => {
      this.props.setMobile(this.state.mobilevalue);
    });
  };

  get12SeedPhase = () => {
    console.log(this.props.seedphase);
    this.setState({
      originalseedphase: this.shuffle(Array.from(this.props.seedphase)),
    });
  };

  SeedonClick = (e) => {
    var dataval = e.target.getAttribute("data-val");
    console.log(dataval);
    //e.target.style.display = "none";

    var array = this.state.originalseedphase;
    var index = array.indexOf(dataval);
    array.splice(index, 1);
    this.setState({ originalseedphase: array });

    this.setState(
      (state) => {
        const list = state.selectedseedphase.push(dataval);
        return list;
      },
      () => {
        this.validateseedphase();
      }
    );
  };

  RestoreonClick = (e) => {
    var dataval = e.target.getAttribute("data-val");
    //e.target.style.display = "none";

    var array = this.state.selectedseedphase;
    var index = array.indexOf(dataval);
    array.splice(index, 1);
    this.setState({ selectedseedphase: array });

    this.setState(
      (state) => {
        const list = state.originalseedphase.push(dataval);
        return list;
      },
      () => {
        this.validateseedphase();
      }
    );
  };

  selectSeedPhase = () => {};

  copy = () => {
    console.log("COPY");
  };

  next = () => {
    const { addAddress } = this.props;
    console.log("CREATING NEW WALLET");
    try {
      createWANAddr().then((addressInfo) => {
        console.log(addressInfo);
        addAddress(addressInfo);
        wand.request(
          "address_scanMultiOTA",
          { path: [[WALLETID.NATIVE, addressInfo.path]] },
          function (err, res) {
            if (err) {
              console.log("Open OTA scanner failed:", err);
            }
          }
        );
        console.log("new acc created succ");
      });
    } catch (e) {
      console.log("err:", e);
      console.log("failed to create new acc");
    }

    //this.validateseedphase();
    /*bcrypt.hash(this.state.pendingpassword, 10, (err, hash) => {
          this.props.setPassword(hash);
          localStorage.setItem('password',hash);




          });*/
    var wallets = localStorage.getItem("wallets");
    var dappwallet = false;
    if (wallets == null) {
      dappwallet = true;
    }
    this.props.CreateEthAddress(dappwallet);
    this.props.setCurrent("walletcreated");
    this.props.wsLogin();
    this.props.setRequestSignIn(false);
    this.props.setcurrentReg("inputmobile");
    this.props.clearPendingPassword();
  };

  validateseedphase = () => {
    // console.log(toJS(this.props.seedphase));
    // console.log(this.state.selectedseedphase);
    if (
      JSON.stringify(toJS(this.props.seedphase)) ==
      JSON.stringify(this.state.selectedseedphase)
    ) {
      this.setState({ nextbuttonstyle: { display: "inline-block" } });
    } else {
      this.setState({ nextbuttonstyle: { display: "none" } });
    }
  };

  back = () => {
    this.props.setCurrent("walletcreation");
    this.props.setcurrentReg("walletcreation");
  };

  onKeyDown = (e) => {
    if (e.key === "Enter") {
      this.next();
    }
  };

  shuffle = (arr) => {
    var i, j, temp;
    for (i = arr.length - 1; i > 0; i--) {
      j = Math.floor(Math.random() * (i + 1));
      temp = arr[i];
      arr[i] = arr[j];
      arr[j] = temp;
    }

    return arr;
  };

  render() {
    const {
      selectedseedphase,
      originalseedphase,
      nextbuttonstyle,
    } = this.state;
    const _SeedonClick = this.SeedonClick;
    const _RestoreonClick = this.RestoreonClick;
    return (
      <div className="walletkeyinseedpanel fadeInAnim">
        <div className="title">
          <span>
            <img onClick={this.back} width="20px" src={buttonback} />
          </span>
          <span style={{ marginLeft: "20px" }}>
            {intl.get("Wallet.VerifyRecoveryPhrase")}
          </span>
        </div>
        <div className="centerpanel">
          <div className="selectedseedpanel">
            {selectedseedphase.map(function (item, i) {
              return (
                <li key={i} data-val={item} onClick={_RestoreonClick}>
                  {item}
                </li>
              );
            })}
          </div>
          <div className="buttonpanel">
            <Button
              className="curvebutton"
              style={nextbuttonstyle}
              onClick={this.next}
            >
              {intl.get("Wallet.Confirm")}
            </Button>
          </div>

          <div
            className="originalseedpanel"
            style={{
              height: "200px",
              width: "600px",
              display: "inline-block",
              marginTop: "30px",
            }}
          >
            {originalseedphase.map(function (item, i) {
              return (
                <li key={i} data-val={item} onClick={_SeedonClick}>
                  {item}
                </li>
              );
            })}
          </div>
          <ul>{this.state.seedphaseel}</ul>
        </div>
      </div>
    );
  }
}

export default WalletKeyInSeed;
