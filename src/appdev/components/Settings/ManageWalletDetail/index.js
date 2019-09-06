import React, { Component } from 'react';
import { Input, Radio, Icon, Tooltip, Button, Modal } from 'antd';
import { observer, inject } from 'mobx-react';
import intl from 'react-intl-universal';

const bip39 = require('bip39');

import './index.less';
import { setDefaultWordlist } from 'bip39';
@inject(stores => ({
  setCurrent: current => stores.setting.setCurrent(current),
  selectedwalletaddress: stores.setting.selectedwalletaddress,
  removeWallet: publicaddress => stores.walletStore.removeWallet(publicaddress),
  changeWalletName: (publicaddress,newwalletname) => stores.walletStore.changeWalletName(publicaddress,newwalletname),
  walletlist: stores.walletStore.walletlist,
  language: stores.languageIntl.language
}))

@observer
class ManageWalletDetail extends Component {
  state = {
    removemodalvisible: false,
    exportprivatekeymodalvisible: false,
    changewalletnamemodalvisible: false,
    selectedwalletaddress: "",
    selectedwalletname: "",
    newwalletname: ""
  }

  componentDidMount(){
  }

  inputChanged = e => {
    this.setState({ newwalletname : e.target.value });
  }

  exportprivatekey = e => {
    const walletaddress = e.currentTarget.getAttribute('data-publicaddress');
    this.setState({selectedwalletaddress:walletaddress,exportprivatekeymodalvisible:true});
  }

  removewallet = e => {
    const walletaddress = e.currentTarget.getAttribute('data-publicaddress');
    const walletname = e.currentTarget.getAttribute('data-walletname');
    this.setState({selectedwalletaddress:walletaddress,selectedwalletname:walletname,removemodalvisible:true});
  }

  editwalletname = e => {
    this.setState({changewalletnamemodalvisible:true});
  }

  handleRemoveWalletOk = () => {
    this.setState({
      removemodalvisible: false
    });
    this.props.removeWallet(this.state.selectedwalletaddress);
  }

  handleExportPrivateKeyOk = () => {
    this.setState({
      exportprivatekeymodalvisible: false
    }, () => {
      this.props.setCurrent('exportprivatekey');
    });
  }

  handleCancel = () => {
    this.setState({
      removemodalvisible: false,
      exportprivatekeymodalvisible: false,
      changewalletnamemodalvisible: false
    });
  }

  handleChangeWalletNameOk = () => {
    this.setState({
      changewalletnamemodalvisible: false
    },() => {
      this.props.changeWalletName(this.props.selectedwalletaddress,this.state.newwalletname);
    });
  }

  handleFocus = e => {
    e.target.select();
  }

  back = () => {
    this.props.setCurrent("managewalletlist");
  }

  render() {

    const wallet = this.props.walletlist.find(x=>x.publicaddress == this.props.selectedwalletaddress);

    return (
      <div className="managewalletdetailpanel fadeInAnim">
        <div className="centerpanel">
          <div className="content">
            <div className="title"><span><img onClick={this.back} width="20px" src="../../static/image/icon/back.png" /></span><span style={{marginLeft:"10px"}}>{intl.get('Settings.ManageWallets')}</span></div>

            <div className="panelwrapper borderradiusfull spacebetween" style={{marginBottom:"10px"}}>
              <div className="panellabel">{wallet.walletname}</div>
              <div className="panelvalue"><img onClick={this.editwalletname} style={{cursor:"pointer"}} width="20px" src="../../static/image/icon/edit.png" /></div>
            </div>
            <div className="panelwrapper borderradiusfull spacebetween" style={{marginBottom:"10px"}}>
              <div className="panellabel">{wallet.rvx_balance} RVX</div>
              <div className="panelvalue"></div>
            </div>
            <div onClick={this.exportprivatekey} className="panelwrapper borderradiusfull spacebetween" style={{marginBottom:"30px"}}>
              <div className="panellabel">{intl.get('Settings.ExportPrivateKey')}</div>
              <div className="panelvalue"><img style={{cursor:"pointer"}} width="20px" src="../../static/image/icon/next.png" /></div>
            </div>
            <div onClick={this.removewallet} data-walletname={wallet.walletname} data-publicaddress={wallet.publicaddress} className="panelwrapper borderradiusfull spacebetween removepanelcolor" style={{marginBottom:"10px"}}>
              <div className="panellabel">{intl.get('Modal.RemoveWallet')}</div>
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

            <Modal
              title=""
              visible={this.state.exportprivatekeymodalvisible}
              onOk={this.handleExportPrivateKeyOk}
              onCancel={this.handleCancel}
            >
              <p className='modalcontent'>{intl.get('Settings.ExportPrivateKeyDesc')}</p>
            </Modal>

            <Modal
              title={intl.get('Settings.EditWalletName')}
              visible={this.state.changewalletnamemodalvisible}
              onOk={this.handleChangeWalletNameOk}
              onCancel={this.handleCancel}
            >
              <p className='modalcontent'>
                <div></div>
                <div className="panelwrapper borderradiusfull">
                  <Input className="inputEditWalletName" onChange={this.inputChanged} />
                </div>
              </p>
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