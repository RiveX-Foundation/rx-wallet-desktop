import React, { Component } from 'react';
import { Input, Radio, Icon, Tooltip, Button, Modal } from 'antd';
import { observer, inject } from 'mobx-react';
import intl from 'react-intl-universal';
import buttonback from 'static/image/icon/back.png';
import buttonedit from 'static/image/icon/edit.png';
import buttonmultisigtick from 'static/image/icon/multisigtick.png';
import buttonnext from 'static/image/icon/next.png';

const bip39 = require('bip39');

import './index.less';
import { setDefaultWordlist } from 'bip39';
@inject(stores => ({
  setCurrent: current => stores.setting.setCurrent(current),
  setSelectedPrivateAddress: privateaddress => stores.setting.setSelectedPrivateAddress(privateaddress),
  selectedwalletaddress: stores.setting.selectedwalletaddress,
  removeWallet: publicaddress => stores.walletStore.removeWallet(publicaddress),
  changeWalletName: (publicaddress,newwalletname) => stores.walletStore.changeWalletName(publicaddress,newwalletname),
  walletlist: stores.walletStore.walletlist,
  language: stores.languageIntl.language,
  getTotalWorth: wallet => stores.walletStore.getTotalWorth(wallet),
  currencycode:stores.setting.currencycode,
}))

@observer
class ManageWalletDetail extends Component {
  state = {
    removemodalvisible: false,
    exportprivatekeymodalvisible: false,
    exportmnemonicmodalvisible: false,
    changewalletnamemodalvisible: false,
    selectedwalletaddress: "",
    selectedwalletname: "",
    newwalletname: "",
    exportedseedphrase: "",
    tokenliststyle: "autolisthide",
    tokenoriginallist: [],
    tokenfilterlist : [],
    temporarytokenname: "",
    temporarytokencode: "/CA+8)D=@qW_3n=",
    temporarypublicaddress: "",
  }

  componentDidMount(){
    var wallet = this.props.walletlist.find(x=>x.publicaddress == this.props.selectedwalletaddress);

    this.setState({
      tokenoriginallist: wallet.tokenassetlist,
      tokenfilterlist : wallet.tokenassetlist,
    })
  }

  inputChanged = e => {
    this.setState({ newwalletname : e.target.value });
  }

  exportprivatekey = e => {
    const walletaddress = e.currentTarget.getAttribute('data-publicaddress');
    this.setState({selectedwalletaddress:walletaddress,exportprivatekeymodalvisible:true});
  }

  exportmnemonic = e => {
    const wallet = this.props.walletlist.find(x => x.publicaddress == this.props.selectedwalletaddress); 
    this.setState({exportedseedphrase:wallet.seedphase});
    const walletaddress = e.currentTarget.getAttribute('data-publicaddress');
    this.setState({selectedwalletaddress:walletaddress,exportmnemonicmodalvisible:true});
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
    this.back();
  }

  handleExportPrivateKeyOk = () => {

    if(this.state.temporarypublicaddress==""){
      return;
    }

    this.setState({
      exportprivatekeymodalvisible: false
    }, () => {
      this.props.setCurrent('exportprivatekey');
    });
  }

  handleExportMnemonicOk = () => {
    this.setState({
      exportmnemonicmodalvisible: false
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

  onKeyDownChangeName = (e) => {
    if (e.key === 'Enter') {
      this.handleChangeWalletNameOk();
    }
  }

  showlist = e => {
    e.preventDefault();
    e.stopPropagation();

    //if(e.currentTarget.getAttribute('data-networktype') == "eth"){
      this.setState({tokenliststyle : "autolist"});
    //}
  }

  hidelist = e => {
    //e.preventDefault();
    //e.stopPropagation();
    this.setState({tokenliststyle : "autolisthide"});
  }

  selectToken = e => {
    this.setState({
      modalvisible: true,
      temporarytokenname: e.currentTarget.getAttribute('data-name'),
      temporarytokencode: e.currentTarget.getAttribute('data-code'),
      temporarypublicaddress: e.currentTarget.getAttribute('data-publicaddress')
    });

    this.props.setSelectedPrivateAddress(e.currentTarget.getAttribute('data-privateaddress'));
  }

  setfilterlist = e => {
    var newfilterlist = [];

    this.state.tokenoriginallist.forEach(function(item, index){
      if(item.Name.toLowerCase().includes(e.target.value.toLowerCase())){
        newfilterlist.push(item);
      }
    });
    this.setState({tokenfilterlist: newfilterlist});
  }
    render() {

    const wallet = this.props.walletlist.find(x=>x.publicaddress == this.props.selectedwalletaddress);

    return (
      <div className="managewalletdetailpanel fadeInAnim">
        <div className="centerpanel">
          <div className="">
            <div className="title"><span><img onClick={this.back} width="20px" src={buttonback} /></span><span style={{marginLeft:"10px"}}>{intl.get('Settings.ManageWallets')}</span></div>

            <div className="panelwrapper borderradiusfull spacebetween" style={{marginBottom:"10px"}}>
              <div className="panellabel">{wallet.walletname}</div>
              <div className="panelvalue"><img onClick={this.editwalletname} style={{cursor:"pointer"}} width="20px" src={buttonedit} /></div>
            </div>

            {
              wallet.holders != null &&
                wallet.wallettype == "sharedwallet" &&
                <div className="spacebetween" style={{width:"600px"}}>

                  <div className="panelwrapper borderradiusfull signerspanel" style={{marginBottom:"10px",padding:"10px"}}>
                    <div className="panellabel coplayertitle">{intl.get('Wallet.CoPlayers')} {wallet.totalsignatures}-{wallet.totalowners}</div>

                    {
                      
                      wallet.wallettype == "sharedwallet" &&  
                      wallet.holders.map(function(item, i){
                        return (
                          <div key={i} className="panellabel logname"><span className="multisigtick"><img src={buttonmultisigtick} /></span>{item.UserName}</div>
                        )
                      })
                    }
                  </div>
                </div>
            }


            {
              wallet.holders != null &&
                wallet.wallettype != "sharedwallet" &&
                <React.Fragment>
                  <div onClick={this.exportprivatekey} className="panelwrapper borderradiusfull spacebetween" style={{marginBottom:"10px"}}>
                    <div className="panellabel">{intl.get('Settings.ExportPrivateKey')}</div>
                    <div className="panelvalue"><img style={{cursor:"pointer"}} width="20px" src={buttonnext} /></div>
                  </div>
                  <div onClick={this.exportmnemonic} className="panelwrapper borderradiusfull spacebetween" style={{marginBottom:"30px"}}>
                    <div className="panellabel">{intl.get('Settings.ExportMnemonic')}</div>
                    <div className="panelvalue"><img style={{cursor:"pointer"}} width="20px" src={buttonnext} /></div>
                  </div>
                </React.Fragment>
            }


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
              <div className="pheader">{intl.get('Info.Warning')}</div>
              <div>
                <div className='pmodalcontent'>{intl.get('Settings.ExportPrivateKey.Msg1')}</div>
                <div className='pmodalcontent'>{intl.get('Settings.ExportPrivateKey.Msg2')}</div>
                <div className='pmodalcontent'>{intl.get('Settings.ExportPrivateKey.Msg3')}</div>

                <div className='pmodalcontent'>{intl.get('Settings.ExportPrivateKey.SelectTokenAsset')}</div>
                <div className="inputwrapper">
                  <div className="panelwrapper">
                    <Input value={this.state.temporarytokenname } placeholder={intl.get('Settings.Token')} onClick={this.showlist} onBlur={this.hidelist} onFocus={this.showlist} className="inputTransparent" onChange={this.setfilterlist} />
                    { 
                      this.state.tokenfilterlist.length > 0 &&
                        <div className={this.state.tokenliststyle}>
                          <ul>
                          {
                            this.state.tokenfilterlist.map((item,index)=>
                              <li key={index} data-code={item.AssetCode} data-name={item.Name} data-privateaddress={item.PrivateAddress} data-publicaddress={item.PublicAddress} onMouseDown={this.selectToken} >{item.Name}</li>
                            )
                          }
                          </ul>
                        </div>
                    }

                    {this.state.tokenfilterlist.length == 0 && 
                      <div className="noResult">{intl.get('Common.NoData')}</div>
                    }
                  </div>
                </div>
              </div>
            </Modal>

            <Modal
              title=""
              visible={this.state.exportmnemonicmodalvisible}
              onOk={this.handleExportMnemonicOk}
              cancelButtonProps={{ style: { display: 'none' } }}
            >
              <div className="pheader">{intl.get('Info.Warning')}</div>
              <div>
                <div className='pmodalcontent'>{intl.get('Settings.ExportMnemonic.Msg1')}</div>
                <div className='pmodalmnemonickey'>{this.state.exportedseedphrase}</div>
              </div>
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
                  <Input className="inputEditWalletName" onChange={this.inputChanged} onKeyDown={this.onKeyDownChangeName} />
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