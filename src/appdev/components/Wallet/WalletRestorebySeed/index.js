import React, { Component } from 'react';
import { Input, Radio, Tooltip, Button } from 'antd';
import { observer, inject } from 'mobx-react';
import intl from 'react-intl-universal';
import { createNotification } from 'utils/helper';

const { TextArea } = Input;

import './index.less';
import { setDefaultWordlist } from 'bip39';
@inject(stores => ({
  CreateEthAddress : () => stores.walletStore.CreateEthAddress(),
  setCurrent: current => stores.walletStore.setCurrent(current),
  setWalletName: walletname => stores.walletStore.setWalletName(walletname),
  setSeedPhaseInString: val => stores.walletStore.setSeedPhaseInString(val),
  seedphase: stores.walletStore.seedphase,
  ethaddress: stores.walletStore.ethaddress,
  language: stores.languageIntl.language
}))

@observer
class WalletRestorebySeed extends Component {
  state = {
    seedphase : "",
    walletname : ""
  }

  componentDidMount(){
  }

  onChange = e => {
    this.setState({seedphase:e.target.value});// e.target.value.replace(/^\s+|\s+$/g, '').replace(/\s+/g, ' '));
  }

  copy = () => {
    console.log("COPY");
  }

  WalletNameOnChange = e => {
    this.setState({walletname:e.target.value}, () => {
      this.props.setWalletName(this.state.walletname);
    })
    
  }

  next = () => {

    //console.log(document.execCommand('paste'));
    //return;

    if(this.state.walletname == ""){
      createNotification('error',intl.get('Error.Walletnameisempty'));
      return;
    }

    if(this.state.seedphase == ""){
      createNotification('error',intl.get('Error.Mnemonicphraseisempty'));
      return;
    }

    if(this.state.seedphase.split(' ').length == 12 || this.state.seedphase.split(' ').length == 24){
    }else{
      createNotification('error',intl.get('Error.InvalidMnemonicphrase'));
      return;
    }

    this.props.setSeedPhaseInString(this.state.seedphase);
    this.props.CreateEthAddress();
    this.props.setCurrent("walletcreated");
  }

  back = () => {
    this.props.setCurrent("wallettypeselection");
  }

  render() {
    return (
      <div className="walletkeyinseedpanel fadeInAnim">
        <div className="title" ><span><img onClick={this.back} width="20px" src="../../static/image/icon/back.png" /></span><span style={{marginLeft:"20px"}}>{intl.get('Wallet.RESTOREMNEMONICPHRASE')}</span></div>
        <div className="centerpanel">
          <center>
            <div className="inputwrapper">
              <div className="subtitle">{intl.get('Wallet.walletname')}</div>
              <div className="panelwrapper borderradiusfull" style={{width:"150px"}}>
                <input className="inputTransparent" onChange={this.WalletNameOnChange} />
              </div>

              <div className="subtitle">{intl.get('Wallet.Mnemonicphrase')}</div>
              <div className="panelwrapper borderradiusfull" style={{width:"600px"}}>
                <input className="inputTransparent" onChange={this.onChange} />
              </div>

              <Button className="curvebutton" onClick={this.next} >{intl.get('Settings.Restore')}</Button>
            </div>
          </center>
        </div>
      </div>
    );
  }
}

export default WalletRestorebySeed;