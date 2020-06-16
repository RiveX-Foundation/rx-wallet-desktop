import React, {Component} from 'react';
import {inject, observer} from 'mobx-react';
import intl from 'react-intl-universal';
import './index.less';
import {createNotification} from 'utils/helper';
import buttonback from 'static/image/icon/back.png';
import buttoncopy from 'static/image/icon/copy.png';

var Web3 = require('web3');
var QRCode = require('qrcode.react');

@inject(stores => ({
    selectedwalletaddress: stores.setting.selectedwalletaddress,
    selectedprivateaddress: stores.setting.selectedprivateaddress,
    wallets: stores.walletStore.walletlist,
    selectedTokenAsset: stores.walletStore.selectedTokenAsset,
    LoadTransactionByAddress: addr => stores.walletStore.LoadTransactionByAddress(addr),
    setCurrent: current => stores.setting.setCurrent(current),
    language: stores.languageIntl.language
}))

@observer
class ExportPrivateKey extends Component {

    state = {}

    inputEl1 = null;

    componentDidMount() {
    }

    inputChanged = e => {
        this.setState({mobilevalue: e.target.value}, () => {
            this.props.setMobile(this.state.mobilevalue);
        });
    }

    loadTransaction = () => {
        this.props.LoadTransactionByAddress(this.props.selectedTokenAsset.PublicAddress);
    }

    back = () => {
        this.props.setCurrent('managewalletdetail');
    }

    copy = () => {
        this.inputEl1.select();
        document.execCommand('copy');
        createNotification('info', intl.get('Info.CopyDone'));
        console.log("COPY DONE");
    }

    render() {

        const wallet = this.props.wallets.find(x => x.publicaddress == this.props.selectedwalletaddress);

        return (
            <div className="exportprivatekeypanel fadeInAnim">
                <div className="title"><span><img onClick={this.back} width="20px" src={buttonback}/></span><span
                    style={{marginLeft: "20px"}}>{intl.get('Settings.ExportPrivateKey')}</span></div>
                <div className="centerpanel">
                    <center>
                        <div className="inputwrapper">
                            <div style={{marginBottom: "10px"}} className="subtitle">{wallet.walletname}</div>
                            <center>
                                <div className="qrcodectn">
                                    <div className="inner">
                                        <QRCode fgColor="#4954AE" size={180} value={this.props.selectedprivateaddress}/>
                                    </div>
                                </div>
                            </center>
                            <div className="panelwrapper borderradiusfull" style={{width: "650px"}}>
                                {this.props.selectedprivateaddress}
                                <div className="copyicon"><img src={buttoncopy} onClick={this.copy}/></div>
                            </div>

                            <input style={{marginTop: -99999, position: "absolute"}} ref={(input) => {
                                this.inputEl1 = input;
                            }} type="text" value={this.props.selectedprivateaddress} id="hiddenphase"/>
                        </div>
                    </center>
                </div>
            </div>
        );
    }
}

export default ExportPrivateKey;