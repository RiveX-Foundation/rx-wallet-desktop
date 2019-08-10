import React, { Component } from 'react';
import { Input, Radio, Icon, Tooltip, Button } from 'antd';
import { observer, inject } from 'mobx-react';
import intl from 'react-intl-universal';

import './index.less';


@inject(stores => ({
  wallets : stores.walletStore.walletlist,
  loadWallet: () => stores.walletStore.loadWallet(),
  setSelectedWallet : index => stores.walletStore.setSelectedWallet(index),
  setCurrent: current => stores.walletStore.setCurrent(current),
  language: stores.languageIntl.language
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
    this.props.setCurrent(1);
  }

  selectWallet = i => {
    this.props.setSelectedWallet(i);
    this.props.setCurrent(4);
  }

  render() {
    const selectWallet = i => this.selectWallet(i);
    return (
      <div>
        {
          this.props.wallets.map((item, i) =>
            {
              return ( <li key={i} onClick={() => selectWallet(i)}>Wallet {i} ({item.rvx_balance})</li> )
            }
          )
        }
    
    
            <Button type="primary" onClick={this.createWallet}>Create Wallet{intl.get('Register.next')}</Button>
      </div>
    );
  }
}

export default WalletListing;