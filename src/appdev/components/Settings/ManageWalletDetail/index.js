import React, { Component } from 'react';
import { Input, Radio, Icon, Tooltip, Button, Modal } from 'antd';
import { observer, inject } from 'mobx-react';
import intl from 'react-intl-universal';

const bip39 = require('bip39');

import './index.less';
import { setDefaultWordlist } from 'bip39';
@inject(stores => ({
  setCurrent: current => stores.walletStore.setCurrent(current),
  selectedwalletaddress: stores.setting.selectedwalletaddress,
  removeWallet: publicaddress => stores.walletStore.removeWallet(publicaddress),
  walletlist: stores.walletStore.walletlist,
  language: stores.languageIntl.language
}))

@observer
class ManageWalletDetail extends Component {
  state = {
    removemodalvisible: false,
    selectedwalletaddress: "",
    selectedwalletname: ""
  }

  inputEl1 = null;
  
  componentDidMount(){
  }

  inputChanged = e => {
    this.setState({ mobilevalue : e.target.value }, () => {
      this.props.setMobile(this.state.mobilevalue);
    });
  }

  basicwallet = () => {
    //this.props.setTotalSignatures(0);
    //this.props.setTotalOwners(0);
    //this.props.setWalletEntryNextDirection("basicwallet");
    //this.props.setCurrent("walletnameentry");
    //this.props.setWalletType("basicwallet");
  }

  sharedwallet = () => {
    this.props.setWalletEntryNextDirection("sharedwallet");
    this.props.setCurrent("createsharewallet");
    //this.props.setCurrent("walletnameentry");
    //this.props.setWalletType("sharedwallet");
  }

  joinwallet = () => {
    this.props.setWalletEntryNextDirection("joinwallet");
    this.props.setCurrent("joinsharewallet");
    //this.props.setWalletType("sharedwallet");
  }

  importwallet = () => {
    //this.props.setTotalSignatures(0);
    //this.props.setTotalOwners(0);
    //this.props.setWalletEntryNextDirection("importwallet");
    //this.props.setCurrent("walletnameentry");
    //this.props.setWalletType("basicwallet");
  }

  selectseedphrase = () => {
    this.props.setCurrent("walletrestorebyseed");
  }

  removewallet = e => {
    const walletaddress = e.currentTarget.getAttribute('data-publicaddress');
    const walletname = e.currentTarget.getAttribute('data-walletname');
    this.setState({selectedwalletaddress:walletaddress,selectedwalletname:walletname,removemodalvisible:true});
  }

  handleRemoveWalletOk = () => {
    this.setState({
      removemodalvisible: false
    });
    this.props.removeWallet(this.state.selectedwalletaddress);
  }

  handleCancel = () => {
    this.setState({
      removemodalvisible: false
    });
  }

  selectprivatekey = () => {
    this.props.setCurrent("walletrestorebyprivatekey");
  }

  back = () => {
    this.props.setCurrent("walletdetail");
  }

  render() {

    const wallet = this.props.walletlist.find(x=>x.publicaddress == this.props.selectedwalletaddress);

    return (
      <div className="managewalletpanel">
        <div className="centerpanel">
          <div className="content">
            <div className="title" ><span style={{marginLeft:"10px"}}>{intl.get('Settings.ManageWallets')}</span></div>

            <div className="panelwrapper borderradiusfull spacebetween" style={{marginBottom:"10px"}}>
              <div className="panellabel">{wallet.walletname}</div>
              <div className="panelvalue"></div>
            </div>

            <Modal
              title=""
              visible={this.state.removemodalvisible}
              onOk={this.handleRemoveWalletOk}
              onCancel={this.handleCancel}
            >
              <p className='modalcontent'>{intl.get('Modal.AreYouSureRemoveWallet').replace('{walletname}',this.state.selectedwalletname)}</p>
            </Modal>

          </div>
        </div>

        {
          /*
          <div>
          <Button type="primary" onClick={this.basicwallet} >{intl.get('Wallet.BasicWallet')}</Button>     
          <Button type="primary" onClick={this.sharedwallet} >{intl.get('Wallet.SharedWallet')}</Button>     
          <Button type="primary" onClick={this.joinwallet} >{intl.get('Wallet.JoinWallet')}</Button>     
          <Button type="primary" onClick={this.importwallet} >{intl.get('Wallet.ImportWallet')}</Button>     
          <Button type="primary" onClick={this.trezor} >{intl.get('Wallet.Trezor')}</Button>
          <Button type="primary" onClick={this.ledger} >{intl.get('Wallet.Ledger')}</Button>

          <div className="steps-action">
            <Button type="primary" onClick={this.back} >{intl.get('Common.Back')}</Button>
          </div>
        </div>
        */
        }
      </div>
    );
  }
}

export default ManageWalletDetail;