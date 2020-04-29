import React, {Component} from 'react';
import {Button} from 'antd';
import {inject, observer} from 'mobx-react';
import intl from 'react-intl-universal';
import buttonback from 'static/image/icon/back.png';
import splashcreatbasicwallet from 'static/image/graphic/splashcreatbasicwallet.png';

import './index.less';

@inject(stores => ({
    setCurrent: current => stores.walletStore.setCurrent(current),
    setWalletEntryNextDirection: val => stores.walletStore.setWalletEntryNextDirection(val),
    language: stores.languageIntl.language
}))

@observer
class SplashBasicWalletCreation extends Component {
    state = {
        mobilevalue: ""
    }

    back = () => {
        this.props.setCurrent("selectedwallet");
    }

    create = () => {
        this.props.setWalletEntryNextDirection("basicwallet");
        this.props.setCurrent("walletnameentry");
    }

    render() {
        return (
            <div className="splashcreatebasicwalletpanel fadeInAnim">
                <div className="title"><span><img onClick={this.back} width="20px" src={buttonback}/></span><span
                    style={{marginLeft: "20px"}}>{intl.get('Wallet.CreateBasicWallet')}</span></div>
                <div className="centerpanel">
                    <div style={{marginBottom: "30px"}}><img src={splashcreatbasicwallet} width="350px"/></div>
                    <Button className="curvebutton" onClick={this.create}>{intl.get('Wallet.CREATE')}</Button>
                    <div className="hint">{intl.get('Wallet.newbasicwallet')}</div>
                </div>
            </div>
        );
    }
}

export default SplashBasicWalletCreation;