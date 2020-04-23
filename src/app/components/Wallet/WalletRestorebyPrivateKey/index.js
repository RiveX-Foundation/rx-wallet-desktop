import React, {Component} from 'react';
import {Button, Input} from 'antd';
import {inject, observer} from 'mobx-react';
import intl from 'react-intl-universal';
import {createNotification} from 'utils/helper';
import buttonback from 'static/image/icon/back.png';
import './index.less';

const {TextArea} = Input;

@inject(stores => ({
    CreateEthAddressByPrivateKey: () => stores.walletStore.CreateEthAddressByPrivateKey(),
    setCurrent: current => stores.walletStore.setCurrent(current),
    setWalletName: walletname => stores.walletStore.setWalletName(walletname),
    setRestorePrivateKey: val => stores.walletStore.setRestorePrivateKey(val),
    seedphase: stores.walletStore.seedphase,
    ethaddress: stores.walletStore.ethaddress,
    language: stores.languageIntl.language
}))

@observer
class WalletRestorebyPrivateKey extends Component {
    state = {
        privatekey: "",
        walletname: ""
    }

    componentDidMount() {
    }

    onChange = e => {
        this.setState({privatekey: e.target.value});// e.target.value.replace(/^\s+|\s+$/g, '').replace(/\s+/g, ' '));
    }

    copy = () => {
        console.log("COPY");
    }

    WalletNameOnChange = e => {
        this.setState({walletname: e.target.value}, () => {
            this.props.setWalletName(this.state.walletname);
        })

    }

    next = () => {

        //console.log(document.execCommand('paste'));
        //return;

        if (this.state.walletname == "") {
            createNotification('error', intl.get('Error.Walletnameisempty'));
            return;
        }

        if (this.state.privatekey == "") {
            createNotification('error', intl.get('Error.Privatekeyisempty'));
            return;
        }

        this.props.setRestorePrivateKey(this.state.privatekey);
        this.props.CreateEthAddressByPrivateKey();
    }

    back = () => {
        this.props.setCurrent("importwallettypeselection");
    }

    render() {
        return (
            <div className="walletkeyinseedpanel fadeInAnim">
                <div className="title"><span><img onClick={this.back} width="20px" src={buttonback}/></span><span
                    style={{marginLeft: "20px"}}>{intl.get('Wallet.RESTOREPRIVATEKEY')}</span></div>
                <div className="centerpanel">
                    <center>
                        <div className="inputwrapper">
                            <div className="subtitle">{intl.get('Wallet.walletname')}</div>
                            <div className="panelwrapper borderradiusfull" style={{width: "150px"}}>
                                <input className="inputTransparent" onChange={this.WalletNameOnChange}/>
                            </div>

                            <div className="subtitle">{intl.get('Wallet.PrivateKey')}</div>
                            <div className="panelwrapper borderradiusfull" style={{width: "600px"}}>
                                <input className="inputTransparent" onChange={this.onChange}/>
                            </div>

                            <Button className="curvebutton" onClick={this.next}>{intl.get('Settings.Restore')}</Button>
                        </div>
                    </center>
                </div>
            </div>
        );
    }
}

export default WalletRestorebyPrivateKey;