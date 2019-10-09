import React, { Component } from 'react';
import { Input, Radio, Icon, Button } from 'antd';
import { observer, inject } from 'mobx-react';
import intl from 'react-intl-universal';
import './index.less';
import { toJS } from "mobx";
import { getDatefromTimestamp, toFixedNoRounding, numberWithCommas } from 'utils/helper';
import logo from 'static/image/graphic/logo.png';
import buttonreceive from 'static/image/icon/receive.png';
import buttonsend from 'static/image/icon/send.png';
import rivelogo500 from 'static/image/graphic/rivexlogo50opa.png';
import buttonback from 'static/image/icon/back.png';
import {
  AreaChart, defs, Area, linearGradient, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts';
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
  language: stores.languageIntl.language,
  getTokenSparkLineByAssetCode: crypto => stores.walletStore.getTokenSparkLineByAssetCode(crypto),
  TokenSparkLine:stores.walletStore.TokenSparkLine,
  selectedTokenAsset:stores.walletStore.selectedTokenAsset,
  convertrate:stores.walletStore.convertrate
}))

@observer
class WalletDetail extends Component {

  state = {
    trxlist : []
  }

  componentDidMount(){
    this.props.getTokenSparkLineByAssetCode('rvx');
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

  back = () => {
    this.props.setCurrent("selectedwallet");
  }

  render() {
    // console.log(this.props.TokenSparkLine);
    const Tips = ({ x, y, data }) => (
      data.map((value, index) => Math.max(...this.props.TokenSparkLine) == value || Math.min(...this.props.TokenSparkLine) == value ?(
        
      <div key={index.toString()}
        style={{
          position: 'absolute',
          left:20,
          right:20,
          top: y(value) - 20,
        }}>
          <div className="sparklinetiptt">{value}</div>
        </div>
      ) : null)
    )
    return (
      <div className="walletdetailpanel fadeInAnim">
        {this.props.selectedWallet.walletname != null &&
          <div>
            {/* <div className="walletname" >{this.props.selectedWallet.walletname}</div> */}
            <div className="walletname" onClick={this.back} style={{cursor:"pointer"}}>
              <img width="20px" src={buttonback} />
            </div>
            <div className="contentpanel">
              <img width="80px" src={this.props.selectedTokenAsset.LogoUrl} />
              <div className="rvxbalance">{this.props.selectedTokenAsset.TokenBalance ? `${this.props.selectedTokenAsset.TokenBalance % 1 != 0 ? toFixedNoRounding(this.props.selectedTokenAsset.TokenBalance,4) : toFixedNoRounding(this.props.selectedTokenAsset.TokenBalance,2)}` : `0.00`}<span>{this.props.selectedTokenAsset.AssetCode.toUpperCase()}</span></div>
              <div className="usdbalance">${numberWithCommas(parseFloat(!isNaN(this.props.convertrate * this.props.selectedTokenAsset.TokenBalance) ? this.props.convertrate * this.props.selectedTokenAsset.TokenBalance : 0),true)} USD</div>
              <ResponsiveContainer width={'100%'} height={150}>
                <AreaChart data={this.props.TokenSparkLine}>
                  <defs>
                    <linearGradient id="gradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="rgb(100, 244, 244)" stopOpacity={0.4}/>
                      <stop offset="95%" stopColor="rgb(28, 31, 70)" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  {/* <XAxis dataKey="value" />
                  <YAxis />
                  <CartesianGrid strokeDasharray="3 3" />
                  <Tooltip cursor={false} /> */}
                  <Tips />
                  <Area type="monotone" dataKey="value" stroke="rgb(100, 244, 244)" fillOpacity={1} fill="url(#gradient)" />
                </AreaChart>
              </ResponsiveContainer>
              <Button className="butreceive button" onClick={this.receiveToken} style={{marginRight:"20px"}}><span><img src={buttonreceive} /></span><span style={{marginLeft:"10px"}}>{intl.get('Token.Receive')}</span></Button>
              <Button className="butsend button" onClick={this.transferToken}><span><img src={buttonsend} /></span><span style={{marginLeft:"10px"}}>{intl.get('Token.Send')}</span></Button>
            </div>
            <div className="subtitle" >{intl.get('Transaction.TransactionHistory').toUpperCase()}</div>
            <div className="tablewrapper">              
              <table>
                <thead>
                  <tr className="hovernone">
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

                      if(item.value != 0){
                        if(this.props.selectedWallet.publicaddress.toLowerCase() == item.from.toLowerCase()){
                          valueClass = "tdright tdred";
                          plusminusSign = "-";
                        }
                      }else{
                        plusminusSign = "";
                        valueClass = "tdright tdgrey ";
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
                          <td className={valueClass}>{plusminusSign} {item.value} {this.props.selectedTokenAsset.AssetCode.toUpperCase()}</td>
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
            <img src={rivelogo500} />
          </div>
        }

      </div>
    );
  }
}

export default WalletDetail;