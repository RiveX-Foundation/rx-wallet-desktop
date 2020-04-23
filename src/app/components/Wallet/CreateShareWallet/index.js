import React, { Component } from 'react';
import { Input, InputNumber, Tooltip, Button } from 'antd';
import { observer, inject } from 'mobx-react';
import intl from 'react-intl-universal';
import { createNotification } from 'utils/helper';
import buttonback from 'static/image/icon/back.png';

const { TextArea } = Input;

import './index.less';
import { setDefaultWordlist } from 'bip39';
@inject(stores => ({
  CreateEthAddress : (dappwallet) => stores.walletStore.CreateEthAddress(dappwallet),
  setCurrent: current => stores.walletStore.setCurrent(current),
  setWalletName: walletname => stores.walletStore.setWalletName(walletname),
  setTotalSignatures: totalsignatures => stores.walletStore.setTotalSignatures(totalsignatures),
  setTotalOwners: totalowners => stores.walletStore.setTotalOwners(totalowners),
  generate12SeedPhase : () => stores.walletStore.generate12SeedPhase(),
  setSeedPhase: seedphase => stores.walletStore.setSeedPhase(seedphase),
  setSeedPhaseInString: seedphase => stores.walletStore.setSeedPhaseInString(seedphase),
  wsCreateSharedWallet: () => stores.walletStore.wsCreateSharedWallet(),
  seedphase: stores.walletStore.seedphase,
  ethaddress: stores.walletStore.ethaddress,
  language: stores.languageIntl.language,
  WalletEntryNextDirection: stores.walletStore.WalletEntryNextDirection
}))

@observer
class CreateShareWallet extends Component {

  state = {
    totalowners: 2,
    totalsignatures: 2,
    walletname: "",
    buttonlabel: ""
  }

  componentDidMount(){
    this.setButtonLabel();
  }

  WalletNameOnChange = e => {
    this.setState({walletname:e.target.value}, () => {
      this.props.setWalletName(this.state.walletname);
    })
    
  }

  TotalPlayerOnChange = val => {
    // var val = e.target.value;
    // if(val != "") val = val.replace(/[^0-9.]/g,'');
    // val = val.replace(/e/g,'').replace("-",'').replace("+",'');
    // e.target.value = val;
    this.setState({totalowners : val}, () => { this.setButtonLabel(); } );
  }

  TotalSignatureOnChange = val => {
    // var val = e.target.value;
    // if(val != "") val = parseInt(val);
    this.setState({totalsignatures : val}, () => { this.setButtonLabel(); });
  }

  setButtonLabel = () => {
    this.setState({buttonlabel: intl.get('Wallet.Create') + " " + this.state.totalsignatures + " / " + this.state.totalowners + " " + intl.get('Wallet.Wallet')});
  }

  next = async () => {

    if(this.state.walletname == ""){
      createNotification('error', intl.get('Error.Walletnameisempty'));
      return;
    }

    if(this.state.totalowners == "" || isNaN(this.state.totalowners)){
      createNotification('error', intl.get('Error.InvalidTotalCoPlayer'));
      return;
    }

    if(this.state.totalsignatures == "" || isNaN(this.state.totalsignatures)){
      createNotification('error', intl.get('Error.InvalidTotalSignature'));
      return;
    }

    if(this.state.totalsignatures > this.state.totalowners){
      createNotification('error', intl.get('Error.Totalsignaturelarger'));
      return;
    }

    var seed = this.props.generate12SeedPhase();
    this.props.setSeedPhase(seed.split(" "));
    this.props.setSeedPhaseInString(seed);
    this.props.setTotalSignatures(this.state.totalsignatures);
    this.props.setTotalOwners(this.state.totalowners);
    //await this.props.CreateEthAddress();
    await this.props.wsCreateSharedWallet();
    this.props.setCurrent("walletcreated");
  }

  back = () => {
    this.props.setCurrent("wallettypeselection");
  }

  render() {
    return (
      <div className="createwalletpanel fadeInAnim">
        <div className="title" ><span><img onClick={this.back} width="20px" src={buttonback} /></span><span style={{marginLeft:"20px"}}>{intl.get('Wallet.CREATESHAREDWALLET')}</span></div>
        <div className="centerpanel">
          <center>
            <div className="inputwrapper">
              <div className="subtitle">{intl.get('Wallet.walletname')}</div>
              <div className="panelwrapper borderradiusfull" style={{width:"400px"}}>
                <input className="inputTransparent" onChange={this.WalletNameOnChange} />
              </div>

              <div className="subtitle">{intl.get('Wallet.TotalCoPlayer')}</div>
              <div className="panelwrapper borderradiusfull" style={{width:"150px",padding:'0px'}}>
                {/* <input type="number" className="inputTransparent" onChange={this.TotalPlayerOnChange} /> */}
                <InputNumber style={{height:"45px"}} min={2} max={6} defaultValue={2} className="inputTransparent" onChange={this.TotalPlayerOnChange} />
              </div>

              <div className="subtitle">{intl.get('Wallet.TotalSignatures')}</div>
              <div className="panelwrapper borderradiusfull" style={{width:"150px",padding:'0px'}}>
                {/* <input type="number" className="inputTransparent" onChange={this.TotalSignatureOnChange} /> */}
                <InputNumber style={{height:"45px"}} min={2} max={6} defaultValue={2} className="inputTransparent" onChange={this.TotalSignatureOnChange} />
              </div>

              <Button className="curvebutton" onClick={this.next} style={{width:'200px'}}>{this.state.buttonlabel}</Button>
            </div>
          </center>
        </div>
      </div>
    );
  }
}

export default CreateShareWallet;