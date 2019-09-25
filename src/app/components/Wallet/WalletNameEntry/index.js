import React, { Component } from 'react';
import { Input, Radio, Tooltip, Button } from 'antd';
import { observer, inject } from 'mobx-react';
import intl from 'react-intl-universal';
import { createNotification } from 'utils/helper';
import buttonnext from 'static/image/icon/buttonnextarrow.png';
import buttonback from 'static/image/icon/back.png';
import buttonartboard2 from 'static/image/graphic/artboard2.png';
const { TextArea } = Input;

import './index.less';
import { setDefaultWordlist } from 'bip39';
@inject(stores => ({
  CreateEthAddress : () => stores.walletStore.CreateEthAddress(),
  setCurrent: current => stores.walletStore.setCurrent(current),
  setWalletName: walletname => stores.walletStore.setWalletName(walletname),
  seedphase: stores.walletStore.seedphase,
  ethaddress: stores.walletStore.ethaddress,
  language: stores.languageIntl.language,
  WalletEntryNextDirection: stores.walletStore.WalletEntryNextDirection
}))

@observer
class WalletNameEntry extends Component {
  state = {
    walletname : ""
  }

  componentDidMount(){
  }

  onChange = e => {
    this.setState({walletname:e.target.value}, () =>{
      this.props.setWalletName(this.state.walletname);
    })
  }

  next = () => {

    console.log(this.state.walletname);
    if(this.state.walletname == ""){
      createNotification('error',intl.get('Error.Walletnameisempty'));
      return;
    }

    this.props.setCurrent("backupwallettutorial");

    /*
    switch(this.props.WalletEntryNextDirection){
      case "basicwallet":
          this.props.setCurrent("walletcreation");
          break;
      case "sharedwallet":
          this.props.setCurrent("createsharewallet");
          break;
      case "importwallet":
          this.props.setCurrent("walletrestorebyseed");
          break;
    }
    */
  }

  back = () => {
    this.props.setCurrent("splashbasicwalletcreation");
  }

  render() {
    const { seedphaseel } = this.state;
    console.log(this.state.seedphaseel);
    return (
      <div className="walletnameentrypanel fadeInAnim">
        <div className="title" ><span><img onClick={this.back} width="20px" src={buttonback} /></span><span style={{marginLeft:"20px"}}>{intl.get('Wallet.KeyInWalletName')}</span></div>
        <div className="centerpanel">
          <div style={{marginBottom:"30px"}}><img src={buttonartboard2} /></div>
          <div className="subtitle">{intl.get('Wallet.walletname')}</div>
          <div className="panelwrapper borderradiusfull">
            <Input className="inputTransparent" onChange={this.onChange} />
            <Button className="nextbutton" onClick={this.next}><img src={buttonnext} /></Button>
          </div>
        </div>
      </div>
    );
  }
}

export default WalletNameEntry;