import React, { Component } from 'react';
import { Input, Radio, Icon, Tooltip, Button } from 'antd';
import { observer, inject } from 'mobx-react';
import intl from 'react-intl-universal';
import './index.less';
import { toJS } from "mobx";
import { getDatefromTimestamp } from 'utils/helper';

var Web3 = require('web3');

@inject(stores => ({
  selectedWallet : stores.walletStore.selectedwallet,
  wallets : stores.walletStore.walletlist,
  gettrxlist : stores.walletStore.gettrxlist,
  LoadTransactionByAddress : addr => stores.walletStore.LoadTransactionByAddress(addr),
  wsGetMultiSigTrx : walletpublicaddress => stores.walletStore.wsGetMultiSigTrx(walletpublicaddress),
  loadWallet: () => stores.walletStore.loadWallet(),
  settrxdetail: (block,hash,from,to,value,action,gasprice,gasused,timestamp,nonce,confirmation,signers) =>stores.walletStore.settrxdetail(block,hash,from,to,value,action,gasprice,gasused,timestamp,nonce,confirmation,signers),
  setCurrent: current => stores.walletStore.setCurrent(current),
  language: stores.languageIntl.language
}))

@observer
class WalletDetail extends Component {

  state = {
    trxlist : []
  }

  componentDidMount(){
  }
  
  inputChanged = e => {
    this.setState({ mobilevalue : e.target.value }, () => {
      this.props.setMobile(this.state.mobilevalue);
    });
  }

  loadTransaction = () => {
    this.props.LoadTransactionByAddress(this.props.selectedWallet.publicaddress);
  }

  transferToken = () => {
    this.props.setCurrent("tokentransfer");
  }

  receiveToken = () => {
    this.props.setCurrent("tokenreceive");
  }

  loadtrxdetail = event => {
    this.props.settrxdetail(
      event.currentTarget.dataset.block,
      event.currentTarget.dataset.hash,
      event.currentTarget.dataset.from,
      event.currentTarget.dataset.to,
      event.currentTarget.dataset.value,
      event.currentTarget.dataset.action,
      event.currentTarget.dataset.gasprice,
      event.currentTarget.dataset.gasused,
      event.currentTarget.dataset.timestamp,
      event.currentTarget.dataset.nonce,
      event.currentTarget.dataset.confirmation,
      event.currentTarget.dataset.signers.split(',')
      );
      this.props.setCurrent("transactiondetail");
  }

  render() {
    console.log(this.props.selectedWallet);
    return (
      <div className="walletdetailpanel fadeInAnim">
        {this.props.selectedWallet.walletname != null &&
          <div>
            <div className="walletname" >{this.props.selectedWallet.walletname}</div>
            <div className="contentpanel">
              <img width="80px" src="../../static/image/graphic/logo.png" />
              <div className="rvxbalance">{this.props.selectedWallet.rvx_balance} RVX</div>
              <div className="usdbalance">{this.props.selectedWallet.rvx_balance} USD</div>
              <Button className="butreceive button" onClick={this.receiveToken} style={{marginRight:"10px"}}><span><img src="../../static/image/icon/receive.png" /></span><span style={{marginLeft:"10px"}}>{intl.get('Token.Receive')}</span></Button>
              <Button className="butsend button" onClick={this.transferToken}><span><img src="../../static/image/icon/send.png" /></span><span style={{marginLeft:"10px"}}>{intl.get('Token.Send')}</span></Button>
            </div>

            <div className="subtitle" >{intl.get('Transaction.TransactionHistory')}</div>
            <div className="tablewrapper">              
              <table>
                <thead>
                  <tr>
                    <td className="tdcenter header">{intl.get('Table.Status')}</td>
                    <td className="tdright header">{intl.get('Table.Amount')}</td>
                    <td className="tdcenter header">{intl.get('Table.From')}</td>
                    <td className="tdcenter header">{intl.get('Table.To')}</td>
                    <td className="tdcenter header">{intl.get('Table.Time')}</td>
                  </tr>
                </thead>
                <tbody>
                {
                  this.props.gettrxlist.map((item, i) =>
                    {
                      var valueClass = "tdright tdgreen";
                      var plusminusSign = "+";
                      console.log(item);

                      if(item.value != 0){
                        if(this.props.selectedWallet.publicaddress.toLowerCase() == item.from.toLowerCase()){
                          valueClass = "tdright tdred";
                          plusminusSign = "-";
                        }
                      }else{
                        plusminusSign = "";
                        valueClass = "tdright tdgrey";
                      }

                      var dateobj = getDatefromTimestamp(item.timestamp);

                      return ( 
                        <tr 
                        key={i} 
                        data-hash={item.trxid} 
                        data-block={item.block} 
                        data-from={item.from} 
                        data-to={item.to} 
                        data-value={item.value} 
                        data-action={item.action} 
                        data-signers={item.signers} 
                        data-gasprice={item.gasprice} 
                        data-gasused={item.gasused} 
                        data-timestamp={item.timestamp} 
                        data-nonce={item.nonce} 
                        data-confirmation={item.confirmation}
                        onClick={this.loadtrxdetail}>
                          <td className="tdcenter tdgrey">{intl.get('STATUS.' + item.status)}</td>
                          <td className={valueClass}>{plusminusSign} {item.value} RVX</td>
                          <td className="tdcenter tdgrey"><span className="tdellipsis">{item.from}</span></td>
                          <td className="tdcenter tdgrey"><span className="tdellipsis">{item.to}</span></td>
                          <td className="tdcenter tdgrey">{dateobj.getFullYear() + "-" + (dateobj.getMonth()+1).toString().padStart(2, '0') + "-" + dateobj.getDate().toString().padStart(2, '0') + " " + dateobj.getHours().toString().padStart(2, '0') + ":" + dateobj.getMinutes().toString().padStart(2, '0') + ":" + dateobj.getSeconds().toString().padStart(2, '0')}</td>
                        </tr>
                      )
                    }
                  )
                }
                </tbody>
              </table>
            </div>
          </div>


        }
        
        {this.props.selectedWallet.walletname == null &&
          <div className='nowalletpanel'>
            <div className='label'>{intl.get('Wallet.SelectWallet')}</div>
            <img src="../../static/image/graphic/rivexlogo50opa.png" />
          </div>
        }

      </div>
    );
  }
}

export default WalletDetail;