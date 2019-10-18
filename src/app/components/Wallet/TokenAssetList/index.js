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

var Web3 = require('web3');

@inject(stores => ({
  selectednetwork: stores.network.selectednetwork,
  allTokenAsset:stores.walletStore.allTokenAsset,
  setCurrent: current => stores.walletStore.setCurrent(current),
  selectedWallet : stores.walletStore.selectedwallet,
  setSelectedWallet : publicaddress => stores.walletStore.setSelectedWallet(publicaddress),
  loadWallet: () => stores.walletStore.loadWallet(),
  InsertTokenAssetToCloudWallet: (tokenasset, cb) => stores.walletStore.InsertTokenAssetToCloudWallet(tokenasset,cb)
}))

@observer
class TokenAssetList extends Component {

  state = {
  }

  back = () =>{
    this.props.setCurrent("selectedwallet");
  }

  addTokenToWallet = (tokenasset) =>{
    tokenasset.PublicAddress = this.props.selectedWallet.publicaddress;
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
              this.props.allTokenAsset.map((item,index)=>{
                return(
                  <div key={index} className="tokenassetitem" onClick={()=> this.addTokenToWallet(item)}>
                    <div className="tokenassetitemrow">
                      <img src={item.LogoUrl} className="tokenimg"/>
                      <div className="tokenname">{item.Name}</div>
                    </div>
                    <img src={nexticon} width="15px" />
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

export default TokenAssetList;