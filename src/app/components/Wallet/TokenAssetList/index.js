import React, {Component} from 'react';
import {inject, observer} from 'mobx-react';
import intl from 'react-intl-universal';
import './index.less';
import {createNotification} from 'utils/helper';
import buttonback from 'static/image/icon/back.png';
import nexticon from 'static/image/icon/arrow-point-to-right.png';

var Web3 = require('web3');

@inject(stores => ({
    selectedethnetwork: stores.network.selectedethnetwork,
    selectedwannetwork: stores.network.selectedwannetwork,
    selectedTokenAsset: stores.walletStore.selectedTokenAsset,
    allTokenAsset: stores.walletStore.allTokenAsset,
    setCurrent: current => stores.walletStore.setCurrent(current),
    addTokenAssetToWallet: token => stores.walletStore.addTokenAssetToWallet(token),
    GenerateBIP39Address: async (derivepath, seed) => stores.walletStore.GenerateBIP39Address(derivepath, seed),
    selectedWallet: stores.walletStore.selectedwallet,
    setSelectedWallet: publicaddress => stores.walletStore.setSelectedWallet(publicaddress),
    loadWallet: () => stores.walletStore.loadWallet(),
    InsertTokenAssetToCloudWallet: (tokenasset, publicaddress, cb) => stores.walletStore.InsertTokenAssetToCloudWallet(tokenasset, publicaddress, cb),
    decrypt: text => stores.walletStore.decrypt(text)
}))

@observer
class TokenAssetList extends Component {

    state = {
        color: (this.props.selectedTokenAsset.TokenType == "wrc20" || this.props.selectedTokenAsset.TokenType == "wan") ? this.props.selectedwannetwork.color : this.props.selectedethnetwork.color,
        name: (this.props.selectedTokenAsset.TokenType == "wrc20" || this.props.selectedTokenAsset.TokenType == "wan") ? this.props.selectedwannetwork.name : this.props.selectedethnetwork.name
    }

    back = () => {
        this.props.setCurrent("selectedwallet");
    }

    addTokenToWallet = async (tokenasset) => {
        //tokenasset.PublicAddress = this.props.selectedWallet.publicaddress;
        //tokenasset.PrivateAddress = this.props.selectedWallet.privateaddress;
        if (this.props.selectedWallet.tokenassetlist.some(x => x.AssetCode == tokenasset.AssetCode)) {
            createNotification('error', intl.get('Wallet.TokenAssetAlreadyExist'));
        } else {
            var derivepath = this.props.selectedWallet.derivepath;
            // var seed = this.props.selectedWallet.seedphase;
            var seed = this.props.decrypt(this.props.selectedWallet.seedphase)
            var walletkey = await this.props.GenerateBIP39Address(derivepath + "0", seed);
            tokenasset.PrivateAddress = walletkey.privateaddress;
            tokenasset.PublicAddress = walletkey.publicaddress;

            if (tokenasset.TokenType == "wan" || tokenasset.TokenType == "wrc20") { //IF WANCHAIN . CONVERT ALL ADDRESS TO LOWERCASE
                tokenasset.PublicAddress = tokenasset.PublicAddress.toLowerCase();
            }

            if (this.props.selectedWallet.isCloud) {
                this.props.InsertTokenAssetToCloudWallet([tokenasset], this.props.selectedWallet.publicaddress, () => {
                    this.props.addTokenAssetToWallet(tokenasset);
                })
            } else {
                this.props.addTokenAssetToWallet(tokenasset);
            }
            this.props.setCurrent("selectedwallet");
        }
    }

    /*
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
    */

    render() {
        return (
            <div className="tokenassetlistpanel fadeInAnim">
                <div>
                    <div className="walletname" onClick={this.back} style={{cursor: "pointer"}}>
                        <span><img width="20px" src={buttonback}/></span>
                        <span style={{marginLeft: "20px"}}>{intl.get('Wallet.AddNewTokenAsset').toUpperCase()}</span>
                    </div>
                    <div className="tokenassetwrapper" style={{margin: "20px"}}>
                        {
                            this.props.allTokenAsset.map((item, index) => {
                                return (
                                    <div key={index} className="tokenassetitem"
                                         onClick={() => this.addTokenToWallet(item)}>
                                        <div className="tokenassetitemrow">
                                            <img src={item.LogoUrl} className="tokenimg"/>
                                            <div className="tokenname">{item.Name}</div>
                                        </div>
                                        <img src={nexticon} width="15px"/>
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