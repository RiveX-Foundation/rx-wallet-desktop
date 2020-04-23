import React, {Component} from 'react';
import {Button} from 'antd';
import {inject, observer} from 'mobx-react';
import intl from 'react-intl-universal';
import './index.less';
import {toJS} from "mobx";
import {createNotification, toFixedNoRounding} from 'utils/helper';
import buttonback from 'static/image/icon/back.png';
import HwWallet from 'utils/HwWallet';

var Web3 = require('web3');
const RVX_PATH = "m/44'/5228350'/0'"; //5718350 
const WALLET_ID = 0x02;
const CHAIN_TYPE = 'RVX';
const LEDGER = 'ledger';


@inject(stores => ({
    selectednetwork: stores.network.selectednetwork,
    wallets: stores.walletStore.walletlist,
    ledgerresult: stores.walletStore.ledgerresult,
    allTokenAsset: stores.walletStore.allTokenAsset,
    setCurrent: current => stores.walletStore.setCurrent(current),
    selectedWallet: stores.walletStore.selectedwallet,
    setSelectedWallet: publicaddress => stores.walletStore.setSelectedWallet(publicaddress),
    loadWallet: () => stores.walletStore.loadWallet(),
    getuserStore: () => stores.userRegistration.getthisstore(),
    setWalletList: (walletlist) => stores.walletStore.setWalletList(walletlist),
    CreateHWWallet: (walletname, publicaddress, derivepath, tokentype, wallettype) => stores.walletStore.CreateHWWallet(walletname, publicaddress, derivepath, tokentype, wallettype),
    InsertTokenAssetToCloudWallet: (tokenasset, publicaddress, cb) => stores.walletStore.InsertTokenAssetToCloudWallet(tokenasset, publicaddress, cb),
    setHWWalletType: type => stores.walletStore.setHWWalletType(type),
}))

@observer
class HWWalletDetail extends Component {

    state = {
        allAddress: [],
        currentaddedaddress: [],
        createhwwalletcb: false,
        newaddedaddress: "",
        calcbalanceaddress: []
    }

    constructor(props) {
        super(props);
        this.page = 0;
        this.pageSize = 50;
        this.dPath = RVX_PATH;
    }

    componentDidMount() {
        this.publicKey = this.props.ledgerresult.publicKey;
        this.chainCode = this.props.ledgerresult.chainCode;
        this.deriveAddresses(this.page * this.pageSize, this.pageSize, true);
    }

    componentWillReceiveProps(newProps) {
        if (this.state.createhwwalletcb) {
            createNotification('success', intl.get('Wallet.AddedNewAssetToken', {code: this.state.newaddedaddress}));
            this.updateTokenAssetList(newProps.wallets, newProps.wallets.length - 1);
        }
    }

    back = () => {
        this.props.setCurrent("hwwalletselection");
    }


    deriveAddresses = (start, limit, visible = false) => {
        const web3 = new Web3(this.props.selectednetwork.infuraendpoint);
        let wallet = new HwWallet(this.publicKey, this.chainCode, this.dPath);
        let hdKeys = wallet.getHdKeys(start, limit);
        let addresses = [];
        hdKeys.forEach(hdKey => {
            // addresses.push({ key: hdKey.address, address: wanUtil.toChecksumAddress(hdKey.address), balance: 0, path: hdKey.path,used:false });
            let checkedAddress = web3.utils.toChecksumAddress(hdKey.address);
            let isUsed = JSON.stringify(this.props.wallets).indexOf(checkedAddress) > -1;
            addresses.push({key: hdKey.address, address: checkedAddress, balance: 0, path: hdKey.path, used: isUsed});
            if (isUsed) {
                web3.eth.getBalance(checkedAddress).then(balance => {
                    balance = balance / (10 ** 18);
                    var balance = balance ? `${balance % 1 != 0 ? toFixedNoRounding(balance, 4) : toFixedNoRounding(balance, 2)}` : `0.00`;
                    let calcaddress = {address: checkedAddress, balance: balance};
                    this.setState({
                        calcbalanceaddress: [...this.state.calcbalanceaddress, calcaddress]
                    })
                });
            }
        });

        // this.props.wallets.forEach(wallet =>{
        //   wallet.tokenassetlist.forEach(token => {
        //     if(addresses.find(x => x.address === token.PublicAddress) != null) {
        //       addresses.find(x => x.address === token.PublicAddress).used = true;
        //     }
        //   });
        // });

        this.setState({allAddress: addresses});

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

    addAddress = (e, item) => {
        this.setState({
            currentaddedaddress: this.state.currentaddedaddress.concat(item.address),
            newaddedaddress: item.address
        }, () => {
            var walletname = "Ledger";

            var selectedwalletindex = -1;
            this.props.wallets.map((wallet, index) => {
                if (wallet.HWWalletType == "Ledger") {
                    selectedwalletindex = index;
                }
            });

            //why do this because CreateHWWallet, but save newtokenasset to old wallet list,
            //that why always push to old last wallet tokenassetlist (not the Ledger)
            //in componentwillreceiveprop to check the updated props from walletStore
            //when createhwwalletcb = true only updateTokenAssetList
            this.setState({
                createhwwalletcb: true
            }, () => {
                if (selectedwalletindex == -1) {
                    this.props.setHWWalletType("Ledger");
                    this.props.CreateHWWallet(walletname, item.address, item.path, "eth", "hwwallet");
                    // selectedwalletindex = this.props.wallets.length-1;
                } else {
                    this.updateTokenAssetList(this.props.wallets, selectedwalletindex);
                    createNotification('success', intl.get('Wallet.AddedNewAssetToken', {code: this.state.newaddedaddress}));
                }
            })
        })
    }

    updateTokenAssetList = (walletlist, selectedwalletindex) => {
        this.setState({
            createhwwalletcb: false
        }, () => {
            var tokenitem = toJS(this.props.allTokenAsset).find(x => x.AssetCode == "eth");
            // var tokenitem = {};
            // tokenitem.TokenType = "eth";
            // tokenitem.TokenBalance = 0;
            // tokenitem.AssetCode = "ETH";
            tokenitem.PublicAddress = this.state.newaddedaddress;
            console.log(tokenitem)
            walletlist[selectedwalletindex].tokenassetlist.push(tokenitem);
            this.props.setWalletList(walletlist);
        })
    }

    addTokenToWallet = (tokenasset) => {
        if (this.props.selectedWallet.tokenassetlist.some(x => x.AssetCode == tokenasset.AssetCode)) {
            console.log("already have")
            createNotification('error', intl.get('Wallet.TokenAssetAlreadyExist'));
        } else {
            if (this.props.selectedWallet.isCloud) {
                this.props.InsertTokenAssetToCloudWallet([tokenasset], this.props.selectedWallet.publicaddress, () => {
                    this._UpdateWalletStorage(tokenasset);
                })
            } else {
                this._UpdateWalletStorage(tokenasset);
            }
        }
    }

    _UpdateWalletStorage = (tokenasset) => {
        try {
            const value = localStorage.getItem('wallets');
            // console.log(value);
            if (value !== null) {
                let walletlist = JSON.parse(value);
                if (walletlist.length > 0) {
                    walletlist.map((wallet, index) => {
                        if (wallet.publicaddress == this.props.selectedWallet.publicaddress) {
                            createNotification('success', intl.get('Wallet.AddedNewAssetToken', {code: tokenasset.AssetCode.toUpperCase()}));
                            wallet.tokenassetlist.push(tokenasset);
                            localStorage.setItem('wallets', JSON.stringify(walletlist));
                            this.props.loadWallet();
                            this.props.setSelectedWallet(wallet.publicaddress);
                            localStorage.setItem("selectedwallet", wallet.publicaddress);
                            this.props.setCurrent("selectedwallet");
                        }
                    })
                }
            }
        } catch (e) {
            // error reading value
        }
    }

    render() {
        return (
            <div className="tokenassetlistpanel fadeInAnim">
                <div>
                    <div className="walletname" onClick={this.back} style={{cursor: "pointer"}}>
                        <span><img width="20px" src={buttonback}/></span>
                        <span style={{marginLeft: "20px"}}>{intl.get('Wallet.AddNewTokenAsset').toUpperCase()} - <span
                            style={{color: this.props.selectednetwork.color}}>{this.props.selectednetwork.name}</span></span>
                    </div>
                    <div className="tokenassetwrapper" style={{margin: "20px"}}>
                        {
                            this.state.allAddress.map((item, index) => {
                                let balanceinfo = '...';
                                if (item.used && this.state.calcbalanceaddress.find(x => x.address == item.address)) {
                                    balanceinfo = `${this.state.calcbalanceaddress.find(x => x.address == item.address).balance} ETH`;
                                }
                                return (
                                    <div key={index} className="tokenassetitem">
                                        <div className="tokenassetitemrow_hw">
                                            <div className="tokenname">{item.address}</div>
                                            {!item.used && JSON.stringify(this.state.currentaddedaddress).indexOf(item.address) == -1 ?
                                                <Button type="primary"
                                                        onClick={e => this.addAddress(e, item)}>{intl.get('Wallet.Add')}</Button>
                                                :
                                                <div className="tokenname">{balanceinfo}</div>
                                            }
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