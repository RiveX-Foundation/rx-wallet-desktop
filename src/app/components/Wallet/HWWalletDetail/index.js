import React, { Component } from 'react';
import { Input, Radio, Icon, Button } from 'antd';
import { observer, inject } from 'mobx-react';
import intl from 'react-intl-universal';
import './index.less';
import { toJS } from "mobx";
import { toFixedNoRounding, numberWithCommas } from 'utils/helper';
import buttonback from 'static/image/icon/back.png';
import nexticon from 'static/image/icon/arrow-point-to-right.png';
import { createNotification } from 'utils/helper';
import HwWallet from 'utils/HwWallet';
import wanUtil from "wanchain-util";

var Web3 = require('web3');
const RVX_PATH = "m/44'/5228350'/0'"; //5718350 
const WALLET_ID = 0x02;
const CHAIN_TYPE = 'RVX';
const LEDGER = 'ledger';


@inject(stores => ({
  selectednetwork: stores.network.selectednetwork,
  wallets : stores.walletStore.walletlist,
  allTokenAsset:stores.walletStore.allTokenAsset,
  setCurrent: current => stores.walletStore.setCurrent(current),
  selectedWallet : stores.walletStore.selectedwallet,
  setSelectedWallet : publicaddress => stores.walletStore.setSelectedWallet(publicaddress),
  loadWallet: () => stores.walletStore.loadWallet(),
  getuserStore: () => stores.userRegistration.getthisstore(),
  setWalletList: (walletlist) => stores.walletStore.setWalletList(walletlist),
  CreateHWWallet: (walletname,publicaddress,derivepath,tokentype,wallettype) => stores.walletStore.CreateHWWallet(walletname,publicaddress,derivepath,tokentype,wallettype),
  InsertTokenAssetToCloudWallet: (tokenasset, cb) => stores.walletStore.InsertTokenAssetToCloudWallet(tokenasset,cb)
}))

@observer
class HWWalletDetail extends Component {

  state = {
    allAddress : []
  }

  constructor(props) {
    super(props);
    this.page = 0;
    this.pageSize = 5;
    this.dPath = RVX_PATH;
    this.connectToLedger();
  }

  connectToLedger = () =>{
    console.log("connect to ledger")
    wand.request('wallet_connectToLedger', {}, (err, val) => {
      if (err) {
        console.log(err);
        //callback(err, val);
      } else {
        console.log(val);
        this.getPublicKey();
      }
    });
  }

  back = () =>{
    this.props.setCurrent("hwwalletselection");
  }

  getPublicKey = () => {
    console.log("GET PUBLIC KEY");
    wand.request('wallet_getPubKeyChainId', {
      walletID: WALLET_ID,
      path: RVX_PATH
    }, (err, val) => {
      this.getPublicKeyDone(err, val);
    });
  }

  getPublicKeyDone = (err, result) => {
    if (err) {
      message.warn(intl.get('HwWallet.Connect.connectFailed'));
    } else {
      console.log(result);
      this.publicKey = result.publicKey;
      this.chainCode = result.chainCode;
      this.deriveAddresses(this.page * this.pageSize, this.pageSize, true);
    }
  }

  deriveAddresses = (start, limit, visible = false) => {
    let wallet = new HwWallet(this.publicKey, this.chainCode, this.dPath);
    let hdKeys = wallet.getHdKeys(start, limit);
    let addresses = [];
    hdKeys.forEach(hdKey => {
      console.log(wanUtil.toChecksumAddress(hdKey.address));
      addresses.push({ key: hdKey.address, address: wanUtil.toChecksumAddress(hdKey.address), balance: 0, path: hdKey.path });
    });

    this.setState({allAddress : addresses});

    /*
    visible ? this.setState({ visible: true, addresses: addresses }) : this.setState({ addresses: addresses });
    getBalance(addresses.map(item => item.address)).then(res => {
      if (res && Object.keys(res).length) {
        let addresses = this.state.addresses;
        addresses.forEach(item => {
          if (Object.keys(res).includes(item.address)) {
            item.balance = res[item.address];
          }
        })
        this.setState({
          addresses
        })
      }
    }).catch(err => {
      console.log('err', err);
    })
    */
  }

  addAddress = (e,item) =>{
    var walletname = "Ledger";
    
    var selectedwalletindex = -1;
    this.props.wallets.map((wallet,index)=>{
      if(wallet.wallettype == "ledger"){
        selectedwalletindex = index;
      }
    });

    if(selectedwalletindex == -1){
      this.props.CreateHWWallet(walletname,item.address,item.path,"eth","ledger");
      selectedwalletindex = this.props.wallets.length-1;
    }

    var tokenitem = {};
    tokenitem.TokenType = "eth";
    tokenitem.TokenBalance = 0;
    tokenitem.AssetCode = "ETH";
    tokenitem.PublicAddress = item.address;

    this.props.wallets[selectedwalletindex].tokenassetlist.push(tokenitem);
    this.props.setWalletList(this.props.wallets);
  }

  addTokenToWallet = (tokenasset) =>{
    if(this.props.selectedWallet.tokenassetlist.some(x => x.AssetCode == tokenasset.AssetCode)){
      console.log("already have")
      createNotification('error',intl.get('Wallet.TokenAssetAlreadyExist'));
    }else{
      if(this.props.selectedWallet.isCloud){
        this.props.InsertTokenAssetToCloudWallet(tokenasset,()=>{
          this._UpdateWalletStorage(tokenasset);
        })
      }else{
        this._UpdateWalletStorage(tokenasset);
      }
    }
  }

  _UpdateWalletStorage = (tokenasset) =>{
    try {
      const value = localStorage.getItem('wallets');
      // console.log(value);
      if(value !== null) {
        let walletlist = JSON.parse(value);
        if(walletlist.length > 0){
          walletlist.map((wallet,index)=>{
            if(wallet.publicaddress == this.props.selectedWallet.publicaddress){
              createNotification('success',intl.get('Wallet.AddedNewAssetToken',{code:tokenasset.AssetCode.toUpperCase()}));
              wallet.tokenassetlist.push(tokenasset);
              localStorage.setItem('wallets',JSON.stringify(walletlist));
              this.props.loadWallet();
              this.props.setSelectedWallet(wallet.publicaddress);
              this.props.setCurrent("selectedwallet");
            }
          })
        }
      }
    }catch(e) {
      // error reading value
    }
  }

  render() {
    return (
      <div  className="tokenassetlistpanel fadeInAnim">
        <div>
          <div className="walletname" onClick={this.back} style={{cursor:"pointer"}}>
            <span><img width="20px" src={buttonback} /></span>
            <span style={{marginLeft:"20px"}}>{intl.get('Wallet.AddNewTokenAsset').toUpperCase()} - <span style={{color:this.props.selectednetwork.color}}>{this.props.selectednetwork.name}</span></span>
          </div>
          <div className="tokenassetwrapper" style={{margin:"20px"}}>
            {
              this.state.allAddress.map((item,index)=>{
                return(
                  <div key={index} className="tokenassetitem">
                    <div className="tokenassetitemrow">
                      <div className="tokenname">{item.address}</div>
                      <div className="tokenname">{item.balance}</div>
                      <Button type="primary" onClick={e => this.addAddress(e,item)} >{intl.get('Wallet.Add')}</Button>
                    </div>
                  </div>
                )
              })
            }
          </div>
        </div>
      </div>
    );
  }
}

export default HWWalletDetail;