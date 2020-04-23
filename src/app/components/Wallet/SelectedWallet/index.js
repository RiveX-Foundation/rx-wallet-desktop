import React, {Component} from 'react';
import {inject, observer} from 'mobx-react';
import intl from 'react-intl-universal';
import './index.less';
import {createNotification, numberWithCommas, toFixedNoRounding} from 'utils/helper';
import buttonreceive from 'static/image/icon/receive.png';
import buttonsend from 'static/image/icon/send.png';
import rivelogo500 from 'static/image/graphic/rivexlogo50opa.png';
import plusicon from 'static/image/icon/plus-symbol.png';
import {Area, AreaChart, Curve, ResponsiveContainer} from 'recharts';

var Web3 = require('web3');

const RVX_PATH = "m/44'/5228350'/0'"; //5718350
const WALLET_ID = 0x02;

@inject(stores => ({
    selectedWallet: stores.walletStore.selectedwallet,
    selectedTokenAsset: stores.walletStore.selectedTokenAsset,
    wallets: stores.walletStore.walletlist,
    gettrxlist: stores.walletStore.gettrxlist,
    LoadTransactionByAddress: addr => stores.walletStore.LoadTransactionByAddress(addr),
    wsGetMultiSigTrx: (walletpublicaddress, senderpublicaddress, assetcode) => stores.walletStore.wsGetMultiSigTrx(walletpublicaddress, senderpublicaddress, assetcode),
    loadWallet: () => stores.walletStore.loadWallet(),
    settrxdetail: (block, hash, from, to, value, action, gasprice, gasused, timestamp, nonce, confirmation, signers) => stores.walletStore.settrxdetail(block, hash, from, to, value, action, gasprice, gasused, timestamp, nonce, confirmation, signers),
    setCurrent: current => stores.walletStore.setCurrent(current),
    language: stores.languageIntl.language,
    //getTokenSparkLineByAssetCode: crypto => stores.walletStore.getTokenSparkLineByAssetCode(crypto),
    TokenSparkLine: stores.walletStore.TokenSparkLine,
    convertrate: stores.walletStore.convertrate,
    totalassetworth: stores.walletStore.totalassetworth,
    setselectedTokenAsset: tokenasset => stores.walletStore.setselectedTokenAsset(tokenasset),
    currencycode: stores.setting.currencycode,
    getTotalWorth: wallet => stores.walletStore.getTotalWorth(wallet),
    selectedwallettype: stores.walletStore.selectedwallettype,
    setledgerresult: result => stores.walletStore.setledgerresult(result),
    GetPrimaryTokenAssetByNetwork: () => stores.walletStore.GetPrimaryTokenAssetByNetwork(),
    GetAllTokenAssetByNetwork: () => stores.walletStore.GetAllTokenAssetByNetwork(),
    getTotalWorthMYR: stores.walletStore.TotalWorthMYR,
    convertRate: stores.walletStore.convertRate,
    convertRateCNY: stores.walletStore.convertRateCNY,
    getTotalWorthCNY: stores.walletStore.TotalWorthCNY
}))

@observer
class SelectedWallet extends Component {

    state = {
        trxlist: [],
        modalIsOpen: false,
        myrrate: 0,
        convertRate: 0,
        convertRateCNY: 0
    }

    componentDidMount() {
        this.props.GetPrimaryTokenAssetByNetwork();
        this.props.GetAllTokenAssetByNetwork();
        this.setState({convertRate: this.props.convertRate});
        this.setState({convertRateCNY: this.props.convertRateCNY});
        //this.props.getTokenSparkLineByAssetCode(this.props.selectedTokenAsset.SparklineAssetCode);
    }


    inputChanged = e => {
        this.setState({mobilevalue: e.target.value}, () => {
            this.props.setMobile(this.state.mobilevalue);
        });
    }

    loadTransaction = (tokenitem) => {
        console.log("public addr", tokenitem.PublicAddress);
        this.props.LoadTransactionByAddress(tokenitem.PublicAddress);
    }

    transferToken = (e, tokenitem) => {
        e.stopPropagation();
        this.props.setselectedTokenAsset(tokenitem);
        this.props.setCurrent("tokentransfer");
    }

    receiveToken = (e, tokenitem) => {
        e.stopPropagation();
        this.props.setselectedTokenAsset(tokenitem);
        this.props.setCurrent("tokenreceive");
    }

    openTokenDetail = (tokenitem) => {
        // console.log(toJS(this.props.selectedWallet))
        this.props.setselectedTokenAsset(tokenitem);
        this.props.setCurrent('walletdetail');
        this.loadTransaction(tokenitem);
    }

    goToAssetTokenList = () => {
        if (this.props.selectedwallettype == "basicwallet" || this.props.selectedwallettype == "sharedwallet" || this.props.selectedwallettype == "local") {
            this.props.setCurrent("tokenassetlist");
        } else if (this.props.selectedwallettype == "hwwallet") {
            if (this.props.selectedWallet.HWWalletType == "Ledger") {
                this.connectToLedger();
            }
        }
    }

    connectToLedger = () => {
        console.log("connect to ledger")
        wand.request('wallet_connectToLedger', {}, (err, val) => {
            if (err) {
                console.log(err);
                createNotification('error', intl.get('Error.ConnectLedgerError'));
                //callback(err, val);
            } else {
                console.log(val);
                this.getPublicKey();
            }
        });
    }
    getTotalWorthMyr = () => {
        return this.props.getTotalWorthMYR;
    }
    getTotalWorthCny = () => {
        console.log("GETTINT TOAL WORTH CNY");
        console.log(this.props.getTotalWorthCNY);
        return this.props.getTotalWorthCNY;
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
            console.log("GET PUBLIC KEY FAILED");
            createNotification('error', intl.get('Error.ConnectLedgerError'));
            //message.warn(intl.get('HwWallet.Connect.connectFailed'));
        } else {
            console.log(result);
            this.props.setledgerresult(result);
            this.props.setCurrent('hwwalletdetail');
        }
    }


    receiveToken = () => {
        this.props.setCurrent("tokenreceive");
    }

    render() {

        var w = this.props.selectedWallet;

        return (
            <div id="selectwalletmainctn" className="selectedwalletpanel fadeInAnim">
                {this.props.selectedWallet.walletname != null &&
                <div>
                    <div className="walletname">{this.props.selectedWallet.walletname}</div>
                    <div className="contentpanel">
                        {
                            this.props.currencycode == "USD" &&
                            <div className="totalworth">
                                {<div className="amount">{this.props.getTotalWorth(this.props.selectedWallet)}</div>}
                                <div className="currency">{this.props.currencycode}</div>
                            </div>
                        }

                        {this.props.currencycode == "MYR" &&
                        <div className="totalworth">
                            {<div className="amount">{this.getTotalWorthMyr()}</div>}
                            <div className="currency">{this.props.currencycode}</div>
                        </div>
                        }
                        {this.props.currencycode == "CNY" &&
                        <div className="totalworth">
                            {<div className="amount">{this.getTotalWorthCny()}</div>}
                            <div className="currency">{this.props.currencycode}</div>
                        </div>
                        }
                    </div>

                    {
                        w.wallettype == "sharedwallet" &&
                        <center>
                            <div onClick={this.receiveToken}
                                 className="sharedwalletpanel">{w.totalsignatures} / {w.totalowners}</div>
                        </center>
                    }

                    <div className="tokenwrapper">
                        {
                            this.props.selectedWallet.tokenassetlist.map((item, index) => {
                                var sparkline = this.props.TokenSparkLine.find(x => x.AssetCode == item.AssetCode);
                                if (sparkline != null) sparkline = sparkline.sparkline;
                                const dataMax = (sparkline != null) ? Math.max(...sparkline.map(i => i.value)) : 0;
                                const dataMin = (sparkline != null) ? Math.min(...sparkline.map(i => i.value)) : 0;
                                return (
                                    <div key={index} className="tokenassetitem"
                                         onClick={() => this.openTokenDetail(item)}>
                                        <div className="tokenassetitemrow">
                                            <img src={item.LogoUrl} className="tokenimg"/>
                                            <div className="infoctn">
                                                <div className="assetcode">{item.AssetCode.toUpperCase()}</div>
                                                {
                                                    this.props.selectedWallet.wallettype != "hwwallet" ?
                                                        <div className="assetcodename">{item.Name}</div>
                                                        :
                                                        <div
                                                            className="assetcodename">{item.Name} - <span>{item.PublicAddress}</span>
                                                        </div>
                                                }
                                            </div>
                                        </div>
                                        <div className="tokenassetitemrow">
                                            <div className="amountctn">
                                                <div
                                                    className="totalcoin">{item.TokenBalance ? `${item.TokenBalance % 1 != 0 ? toFixedNoRounding(item.TokenBalance, 4) : toFixedNoRounding(item.TokenBalance, 2)}` : `0.00`}<span>{item.AssetCode.toUpperCase()}</span>
                                                </div>
                                                {
                                                    this.props.currencycode == "USD" &&
                                                    <div
                                                        className="totalcurrency">${numberWithCommas(parseFloat(!isNaN(item.TokenPrice * item.TokenBalance) ? item.TokenPrice * item.TokenBalance : 0), true)} {this.props.currencycode}</div>
                                                }

                                                {
                                                    this.props.currencycode == "MYR" &&
                                                    <div
                                                        className="totalcurrency">${numberWithCommas(parseFloat(!isNaN((item.TokenPrice * item.TokenBalance) * this.state.convertRate) ? (item.TokenPrice * item.TokenBalance) * this.state.convertRate : 0), true)} {this.props.currencycode}</div>
                                                }
                                                {
                                                    this.props.currencycode == "CNY" &&
                                                    <div
                                                        className="totalcurrency">${numberWithCommas(parseFloat(!isNaN((item.TokenPrice * item.TokenBalance) * this.state.convertRateCNY) ? (item.TokenPrice * item.TokenBalance) * this.state.convertRateCNY : 0), true)} {this.props.currencycode}</div>
                                                }

                                            </div>
                                            <div className="chartctn">
                                                <ResponsiveContainer width={'100%'} height={200}>
                                                    <AreaChart data={sparkline} baseValue={dataMin}>
                                                        <defs>
                                                            <linearGradient id="gradient" x1="0" y1="0" x2="0" y2="1">
                                                                <stop offset="5%" stopColor="rgb(100, 244, 244)"
                                                                      stopOpacity={0.7}/>
                                                                <stop offset="95%" stopColor="rgb(28, 31, 70)"
                                                                      stopOpacity={0}/>
                                                            </linearGradient>
                                                        </defs>
                                                        <Curve type={"natural"}/>
                                                        <Area type="monotone" dataKey="value"
                                                              stroke="rgb(100, 244, 244)" fillOpacity={1}
                                                              fill="url(#gradient)"/>
                                                    </AreaChart>
                                                </ResponsiveContainer>
                                            </div>
                                            <div className="buttonctn">
                                                <div className="btnitem">
                                                    <img src={buttonreceive} onClick={e => this.receiveToken(e, item)}/>
                                                </div>
                                                <div className="btnitem">
                                                    <img src={buttonsend} onClick={e => this.transferToken(e, item)}/>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                )
                            })
                        }

                        {
                            this.props.selectedWallet.seedphase != "" &&
                            <div className="addmorebtn" onClick={this.goToAssetTokenList}>
                                <img src={plusicon}/>
                                <div>{intl.get("Wallet.AddMore").toUpperCase()}</div>
                            </div>
                        }
                    </div>
                </div>


                }

                {this.props.selectedWallet.walletname == null &&
                <div className='nowalletpanel'>
                    <div className='label'>{intl.get('Wallet.SelectWallet')}</div>
                    <img src={rivelogo500}/>
                </div>
                }
            </div>
        );
    }
}

export default SelectedWallet;