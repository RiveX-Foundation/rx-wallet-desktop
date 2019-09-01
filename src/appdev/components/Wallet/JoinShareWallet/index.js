import React, { Component } from 'react';
import { Input, Radio, Tooltip, Button } from 'antd';
import { observer, inject } from 'mobx-react';
import intl from 'react-intl-universal';
import { createNotification } from 'utils/helper';

const { TextArea } = Input;

import './index.less';
import { setDefaultWordlist } from 'bip39';
import InlineSVG from 'react-inlinesvg';
@inject(stores => ({
  CreateEthAddress : () => stores.walletStore.CreateEthAddress(),
  setCurrent: current => stores.walletStore.setCurrent(current),
  setToken: token => stores.userRegistration.setToken(token),
  setWalletName: walletname => stores.walletStore.setWalletName(walletname),
  wsJoinWallet: walletpublicaddress => stores.walletStore.wsJoinWallet(walletpublicaddress),
  seedphase: stores.walletStore.seedphase,
  ethaddress: stores.walletStore.ethaddress,
  language: stores.languageIntl.language,
  WalletEntryNextDirection: stores.walletStore.WalletEntryNextDirection
}))

@observer
class JoinShareWallet extends Component {
  state = {
    walletpublicaddress:""
  }

  componentDidMount(){
  }

  onChange = e => {
    this.setState({walletpublicaddress:e.target.value});
  }

  next = async () => {

    if(this.state.walletpublicaddress == ""){
      createNotification('error',intl.get('Error.Publicaddressisempty'));
      return;
    }

    await this.props.wsJoinWallet(this.state.walletpublicaddress);
    //this.props.setCurrent("walletcreation");
  }

  back = () => {
    this.props.setCurrent("wallettypeselection");
  }

  render() {
    return (
      <div className="joinwalletpanel">
        <div className="title" ><span><img onClick={this.back} width="20px" src="../../static/image/icon/back.png" /></span><span style={{marginLeft:"20px"}}>{intl.get('Wallet.JOINSHAREDWALLET')}</span></div>
        <div className="centerpanel">
          <center>
            <div className="inputwrapper">
              <div className="subtitle">{intl.get('Wallet.ShareWalletPublicAddress')}</div>
              <div className="panelwrapper borderradiusfull" style={{width:"400px"}}>
                <input className="inputTransparent" onChange={this.onChange} />
              </div>
              <Button className="curvebutton" onClick={this.next} >{intl.get('Wallet.Join')}</Button>
            </div>
          </center>
        </div>
      </div>
    );
  }
}

export default JoinShareWallet;