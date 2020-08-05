import React, { Component } from "react";
import { Input, Modal } from "antd";
import { inject, observer } from "mobx-react";
import intl from "react-intl-universal";
import "./index.less";

const { TextArea } = Input;

@inject((stores) => ({
  selectedethnetwork: stores.network.selectedethnetwork,
  selectedwannetwork: stores.network.selectedwannetwork,
  ethnetworklist: stores.network.ethnetworklist,
  wannetworklist: stores.network.wannetworklist,
  setNetwork: (code, networktype) =>
    stores.network.setNetwork(code, networktype),
  language: stores.languageIntl.language,
}))
@observer
class Network extends Component {
  inputEl1 = null;

  state = {
    ethnetworkcode: "mainnet",
    wannetworkcode: "wan_mainnet",
    ethautoliststyle: "autolisthide",
    wanautoliststyle: "autolisthide",
    ethoriginallist: [],
    wanoriginallist: [],
    ethfilterlist: [],
    wanfilterlist: [],
    modalvisible: false,
    temporaryethnewnetworkcode: "mainnet",
    temporarywannewnetworkcode: "wan_mainnet",
  };

  componentDidMount() {
    this.setState({
      ethoriginallist: this.props.ethnetworklist,
      ethfilterlist: this.props.ethnetworklist,
      wanoriginallist: this.props.wannetworklist,
      wanfilterlist: this.props.wannetworklist,
      ethnetworkcode: this.props.selectedethnetwork.shortcode,
      wannetworkcode: this.props.selectedwannetwork.shortcode,
    });
  }

  onChange = (e) => {
    if (e.currentTarget.getAttribute("data-networktype") == "eth") {
      this.setState({
        ethnetworkcode: this.props.ethnetworklist.find(
          (x) => x.name == e.target.value
        ).shortcode,
      });
    }

    if (e.currentTarget.getAttribute("data-networktype") == "wan") {
      this.setState({
        wannetworkcode: this.props.wannetworklist.find(
          (x) => x.name == e.target.value
        ).shortcode,
      });
    }
  };

  setfilterlist = (e) => {
    var newfilterlist = [];

    if (e.currentTarget.getAttribute("data-networktype") == "eth") {
      this.props.setNetwork(
        this.props.ethnetworklist.find((x) => x.name == e.target.value)
          .shortcode,
        "eth"
      );
      this.state.ethoriginallist.forEach(function (item, index) {
        if (item.name.toLowerCase().includes(e.target.value.toLowerCase())) {
          newfilterlist.push(item);
        }
      });
      this.setState({ ethfilterlist: newfilterlist });
    }

    if (e.currentTarget.getAttribute("data-networktype") == "wan") {
      this.props.setNetwork(
        this.props.wannetworklist.find((x) => x.name == e.target.value)
          .shortcode,
        "wan"
      );
      this.state.wanoriginallist.forEach(function (item, index) {
        if (item.name.toLowerCase().includes(e.target.value.toLowerCase())) {
          newfilterlist.push(item);
        }
      });
      this.setState({ wanfilterlist: newfilterlist });
    }
  };

  selectnetwork = (e) => {
    if (e.currentTarget.getAttribute("data-networktype") == "eth") {
      this.setState({
        modalvisible: true,
        temporaryethnewnetworkcode: e.currentTarget.getAttribute("data-code"),
      });
    }

    if (e.currentTarget.getAttribute("data-networktype") == "wan") {
      this.setState({
        modalvisible: true,
        temporarywannewnetworkcode: e.currentTarget.getAttribute("data-code"),
      });
    }
  };

  showlist = (e) => {
    e.preventDefault();
    e.stopPropagation();

    if (e.currentTarget.getAttribute("data-networktype") == "eth") {
      this.setState({ ethautoliststyle: "autolist" });
    }

    if (e.currentTarget.getAttribute("data-networktype") == "wan") {
      this.setState({ wanautoliststyle: "autolist" });
    }
  };

  hidelist = (e) => {
    //e.preventDefault();
    //e.stopPropagation();
    this.setState({
      ethautoliststyle: "autolisthide",
      wanautoliststyle: "autolisthide",
    });
  };

  handleCancel = () => {
    this.setState({
      modalvisible: false,
    });
  };

  handleOk = () => {
    this.setState(
      {
        modalvisible: false,
      },
      () => {
        this.setState(
          {
            ethnetworkcode: this.state.temporaryethnewnetworkcode,
            wannetworkcode: this.state.temporarywannewnetworkcode,
          },
          () => {
            this.props.setNetwork(this.state.ethnetworkcode, "eth");
            this.props.setNetwork(this.state.wannetworkcode, "wan");

            wand.request("system_reload", null, (err, val) => {
              if (err) {
                console.log("Refresh Failed ", err);
                return;
              }
              stores.session.setAuth(false);
            });
          }
        );
      }
    );
  };

  render() {
    const {
      ethautoliststyle,
      ethfilterlist,
      ethnetworkcode,
      wanautoliststyle,
      wanfilterlist,
      wannetworkcode,
    } = this.state;
    return (
      <div className="networkpanel fadeInAnim">
        <div className="title">
          <span>{intl.get("Settings.ETHNetwork")}</span>
        </div>
        <div className="centerpanel">
          <div className="inputwrapper">
            <div className="panelwrapper">
              <Input
                data-networktype="eth"
                value={this.props.selectedethnetwork.name}
                placeholder={intl.get("Settings.ETHNetwork")}
                onClick={this.showlist}
                onBlur={this.hidelist}
                onFocus={this.showlist}
                className="inputTransparent"
                onChange={this.setfilterlist}
              />
              <div className={ethautoliststyle}>
                {ethfilterlist.length > 0 && (
                  <ul>
                    {ethfilterlist.map((item, index) => (
                      <li
                        data-networktype="eth"
                        key={index}
                        data-code={item.shortcode}
                        onMouseDown={this.selectnetwork}
                        style={{ color: item.color }}
                      >
                        {item.name}
                      </li>
                    ))}
                  </ul>
                )}

                {ethfilterlist.length == 0 && (
                  <div className="noResult">{intl.get("Common.NoData")}</div>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="title">
          <span>{intl.get("Settings.WANNetwork")}</span>
        </div>
        <div className="centerpanel">
          <div className="inputwrapper">
            <div className="panelwrapper">
              <Input
                data-networktype="wan"
                value={this.props.selectedwannetwork.name}
                placeholder={intl.get("Settings.WANNetwork")}
                onClick={this.showlist}
                onBlur={this.hidelist}
                onFocus={this.showlist}
                className="inputTransparent"
                onChange={this.setfilterlist}
              />
              <div className={wanautoliststyle}>
                {wanfilterlist.length > 0 && (
                  <ul>
                    {wanfilterlist.map((item, index) => (
                      <li
                        data-networktype="wan"
                        key={index}
                        data-code={item.shortcode}
                        onMouseDown={this.selectnetwork}
                        style={{ color: item.color }}
                      >
                        {item.name}
                      </li>
                    ))}
                  </ul>
                )}

                {wanfilterlist.length == 0 && (
                  <div className="noResult">{intl.get("Common.NoData")}</div>
                )}
              </div>
            </div>
          </div>
        </div>

        <Modal
          title=""
          visible={this.state.modalvisible}
          onOk={this.handleOk}
          onCancel={this.handleCancel}
          okText={intl.get("ValidatorRegister.acceptAgency")}
          cancelText={intl.get("ValidatorRegister.notAcceptAgency")}
        >
          <p className="modalcontent">
            {intl.get("Modal.AreYouSureChangeNetwork.Msg1")}
          </p>
          <p className="modalcontent">
            {intl.get("Modal.AreYouSureChangeNetwork.Msg2")}
          </p>
        </Modal>
      </div>
    );
  }
}

export default Network;
