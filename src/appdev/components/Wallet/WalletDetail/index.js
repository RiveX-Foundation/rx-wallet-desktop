import React, { Component } from 'react';
import { Input, Radio, Icon, Tooltip, Button } from 'antd';
import { observer, inject } from 'mobx-react';
import intl from 'react-intl-universal';
import './index.less';

var Web3 = require('web3');

@inject(stores => ({
  selectedWallet : stores.walletStore.selectedwallet,
  wallets : stores.walletStore.walletlist,
  trxlist : stores.walletStore.trxlist,
  LoadTransactionByAddress : addr => stores.walletStore.LoadTransactionByAddress(addr),
  loadWallet: () => stores.walletStore.loadWallet(),
  setCurrent: current => stores.walletStore.setCurrent(current),
  language: stores.languageIntl.language
}))

@observer
class WalletDetail extends Component {

  state = {
    trxlist : []
  }

  componentDidMount(){
    this.loadwallet();
  }
  
  inputChanged = e => {
    this.setState({ mobilevalue : e.target.value }, () => {
      this.props.setMobile(this.state.mobilevalue);
    });
  }

  loadTransaction = () => {
    this.props.LoadTransactionByAddress(this.props.selectedWallet.publicaddress);
  }

  loadwallet = () => {
    this.props.loadWallet();
  }

  transferToken = () => {
    this.props.setCurrent(5);
  }

  /*
blockHash: "0x40c6b67b07186e594338350edaf3242211f95320e726309bc011808ea1ff5aa7"
blockNumber: "6834898"
confirmations: "1482732"
contractAddress: ""
cumulativeGasUsed: "6880917"
from: "0x2f173ae67c9ac5a54bdd9cf787d8e57ac985468b"
gas: "519990"
gasPrice: "4500000000"
gasUsed: "21000"
hash: "0xe257dd8908005f94a1d25712d285ae29254b29627742e947bcfd4b4088b3cf00"
input: "0x"
isError: "0"
nonce: "1391"
timeStamp: "1544075250"
to: "0x90ad0ac0e687a2a6c9bc43ba7f373b9e50353084"
transactionIndex: "46"
txreceipt_status: "1"
value: "100000000000000"
*/


  render() {
    return (
      <div>
        <div>{this.props.selectedWallet.publicaddress}</div>
        {
          this.props.trxlist.map((item, i) =>
            {
              return ( 
              <div key={i}>
                <div>{item.hash}</div>
                <div>{Web3.utils.fromWei(item.value, 'ether')}</div>
              </div> 
              )
            }
          )
        }
        <Button type="primary" onClick={this.transferToken}>TransferToken{intl.get('Register.next')}</Button>
      </div>
    );
  }
}

export default WalletDetail;