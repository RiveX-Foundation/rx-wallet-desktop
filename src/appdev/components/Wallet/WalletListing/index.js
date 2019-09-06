import React, { Component } from 'react';
import { Input, Radio, Icon, Tooltip, Button } from 'antd';
import { observer, inject, computed } from 'mobx-react';
import intl from 'react-intl-universal';

import './index.less';


@inject(stores => ({
  wallets : stores.walletStore.walletlist,
  selectedwallettype : stores.walletStore.selectedwallettype,
  loadWallet: () => stores.walletStore.loadWallet(),
  setSelectedWallet : publicaddress => stores.walletStore.setSelectedWallet(publicaddress),
  setCurrent: current => stores.walletStore.setCurrent(current),
  language: stores.languageIntl.language,
  selectedwalletlist: stores.walletStore.selectedwalletlist
}))

@observer
class WalletListing extends Component {
    componentDidMount(){
    this.loadwallet();
  }
  
  inputChanged = e => {
    this.setState({ mobilevalue : e.target.value }, () => {
      this.props.setMobile(this.state.mobilevalue);
    });
  }

  loadwallet = () => {
    this.props.loadWallet();
  }

  createWallet = () => {
    switch(this.props.selectedwallettype){
      case "basicwallet":
        this.props.setCurrent("splashbasicwalletcreation");
        break;
      case "sharedwallet":
        this.props.setCurrent("wallettypeselection");
        break;
    }
  }

  selectWallet = e => {
    var walletpublicaddress = e.currentTarget.getAttribute("data-publicaddress");
    this.props.setSelectedWallet(walletpublicaddress);
    this.props.setCurrent("walletdetail");
  }

  render() {
    return (
      <div className='walllistingpanel fadeInAnim'>
        <div className="plussign" onClick={this.createWallet}><img src="../../static/image/icon/plussign.png" /></div>
        <ul>
        {
          this.props.selectedwalletlist.map((item, i) =>
            {
              return (
                <li key={i} onClick={this.selectWallet} data-publicaddress={item.publicaddress}>
                  <div className='walletname'>{item.walletname}</div>
                  <div className='walletbalance'>{item.rvx_balance} RVX</div>
                </li> 
              )
            }
          )
        }
        </ul>
      </div>
    );
  }
}

export default WalletListing;