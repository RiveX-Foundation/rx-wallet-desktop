import React, {Component} from 'react';
import {Modal, Button} from 'antd';
import {inject, observer} from 'mobx-react';
import intl from 'react-intl-universal';
import {WALLETID} from '../../utils/support';
import {createNotification, getChainId, getGasPrice, getNonce} from '../../utils/helper';
import {BigNumber} from 'bignumber.js';
import './index.less';
import buttonback from 'static/image/icon/back.png';

const pu = require('promisefy-util');
const WAN_PATH = "m/44'/5718350'/0'/0/0";
//const WAN_PATH = "m/44'/60'/0'/0/";
const {confirm} = Modal;

// m/44'/5718350'/0'/0/0


@inject(stores => ({
    setCurrent: current => stores.walletStore.setCurrent(current),
    setWalletEntryNextDirection: val => stores.walletStore.setWalletEntryNextDirection(val),
    language: stores.languageIntl.language,
    addrSelectedList: stores.wanAddress.addrSelectedList,
    addrInfo: stores.wanAddress.addrInfo,
    setAaveDepositToken: token => stores.walletStore.setAaveDepositToken(token)
}))

@observer
class Aave extends Component {
    state = {
        mobilevalue: "",
        selectedwallet: "",
        preload: null,
        displayed: "none",
        loading: true,
        addrInfo: {
            normal: {},
            ledger: {},
            trezor: {},
            import: {},
            rawKey: {}
        }
    }


    async componentDidMount() {
       
    }

    deposit = (token) => {
      //  this.props.setAaveDepositToken(token);
       // this.props.setCurrent("depositaave");
    }


    back = () => {
        this.props.setCurrent("selectedwallet");
    }

    render() {
        return (
        <div className="splashcreatebasicwalletpanel fadeInAnim">
        <div className="title"><span><img onClick={this.back} width="20px" src={buttonback}/></span><span
       style={{marginLeft: "20px"}}>AAVE</span></div>
            <div className="centerpanel">
                    <center>
                    <div className="subtitle">USDT (savings)</div>
                    <div className="panelwrapper borderradiusfull spacebetween" style={{marginBottom: "10px"}}>
                            <div className="panellabel">APY</div>
                            <div className="panelvalue">0.66%</div>
                            <Button className="curvebutton"
                                     onClick={this.deposit("xd")}>Deposit</Button>
                        </div>
                        <div className="spacebetween"> </div>
                        <div className="subtitle">DAI (savings)</div>
                    <div className="panelwrapper borderradiusfull spacebetween" style={{marginBottom: "10px"}}>
                            <div className="panellabel">APY</div>
                            <div className="panelvalue">2.14%</div>
                            <Button className="curvebutton"
                                     onClick={this.next}>Deposit</Button>
                        </div>
                    </center>
            </div> 
        </div>   
        )
    }

    /* render() {
       return (
         <div className="splashcreatebasicwalletpanel fadeInAnim">
           <iframe frameBorder="0" width="100%" height="100%" src="http://staging.wrdex.io/" ></iframe>
         </div>
       );
     }*/
}

export default Aave;