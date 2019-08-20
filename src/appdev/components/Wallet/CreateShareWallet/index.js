import React, { Component } from 'react';
import { Input, Radio, Tooltip, Button } from 'antd';
import { observer, inject } from 'mobx-react';
import intl from 'react-intl-universal';

const { TextArea } = Input;

import './index.less';
import { setDefaultWordlist } from 'bip39';
@inject(stores => ({
  CreateEthAddress : () => stores.walletStore.CreateEthAddress(),
  setCurrent: current => stores.walletStore.setCurrent(current),
  setWalletName: walletname => stores.walletStore.setWalletName(walletname),
  setTotalSignatures: totalsignatures => stores.walletStore.setTotalSignatures(totalsignatures),
  setTotalOwners: totalowners => stores.walletStore.setTotalOwners(totalowners),
  seedphase: stores.walletStore.seedphase,
  ethaddress: stores.walletStore.ethaddress,
  language: stores.languageIntl.language,
  WalletEntryNextDirection: stores.walletStore.WalletEntryNextDirection
}))

@observer
class CreateShareWallet extends Component {
  state = {
    totalowners: 0,
    totalsignatures: 0
  }

  componentDidMount(){
  }

  TotalPlayerOnChange = e => {
    var val = e.target.value;
    if(val != "") val = parseInt(val);
    this.setState({totalowners : val});
  }

  TotalSignatureOnChange = e => {
    var val = e.target.value;
    if(val != "") val = parseInt(val);
    this.setState({totalsignatures : val});
  }

  next = () => {
    this.props.setTotalSignatures(this.state.totalsignatures);
    this.props.setTotalOwners(this.state.totalowners);
    this.props.setCurrent('walletcreation');
  }

  back = () => {
    this.props.setCurrent("wallettypeselection");
  }

  render() {
    return (
      <div>
        <div>{intl.get('Wallet.TotalOwners')}</div>
        <div><Input onChange={this.TotalPlayerOnChange} /></div>
        <div>{intl.get('Wallet.TotalSignatures')}</div>
        <div><Input onChange={this.TotalSignatureOnChange} /></div>
        <div className="steps-action">
          <Button type="primary" onClick={this.next} >{intl.get('Register.next')}</Button>
          <Button type="primary" onClick={this.back} >{intl.get('Common.Back')}</Button>
        </div>
      </div>
    );
  }
}

export default CreateShareWallet;