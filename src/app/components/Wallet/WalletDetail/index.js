import React, { Component } from 'react';
import { Input, Radio, Icon, Button, Dropdown, Menu, Modal } from 'antd';
import { observer, inject } from 'mobx-react';
import intl from 'react-intl-universal';
import './index.less';
import { toJS } from "mobx";
import { getDatefromTimestamp, toFixedNoRounding, numberWithCommas, createNotification } from 'utils/helper';
import logo from 'static/image/graphic/logo.png';
import buttonreceive from 'static/image/icon/receive.png';
import buttonsend from 'static/image/icon/send.png';
import rivelogo500 from 'static/image/graphic/rivexlogo50opa.png';
import buttonback from 'static/image/icon/back.png';
import menuicon from 'static/image/icon/menu.png';
import deleteicon from 'static/image/icon/rubbish-bin-delete-button.png';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  Curve, LineChart, Line
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
  convertrate:stores.walletStore.convertrate,
  currencycode:stores.setting.currencycode,
  selectednetwork:stores.network.selectednetwork,
  setSelectedWallet : publicaddress => stores.walletStore.setSelectedWallet(publicaddress),
  RemoveTokenAssetInCloudWallet: (cb) => stores.walletStore.RemoveTokenAssetInCloudWallet(cb)
}))


@observer
class WalletDetail extends Component {

  state = {
    trxlist : [],
    showhideremovetoken:false,
    isPrimary:false
  }

  componentDidMount(){
    this.props.getTokenSparkLineByAssetCode('rvx');
    // console.log("selectedTokenAsset" , this.props.selectedTokenAsset)
    var TokenInfo = this.props.selectedTokenAsset.TokenInfoList.find(x => x.Network == this.props.selectednetwork.shortcode);
    this.setState({
      isPrimary:TokenInfo.IsPrimary
    })
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
  
  dropdownmenu = () =>{
    return(
      <Menu>
          <Menu.Item key="0" onClick={this.showHideRemoveToken}>
            <img src={deleteicon} />
            <div>{intl.get('Wallet.RemoveAsset')}</div>
          </Menu.Item>
      </Menu>
    )
  };

  showHideRemoveToken = () =>{
    console.log("showHideRemoveToken")
    this.setState({
      showhideremovetoken:!this.state.showhideremovetoken
    })
  }

  confirmRemoveToken = () => {
    console.log("come in liao 0")
    if(this.props.selectedWallet.isCloud){
      this.props.RemoveTokenAssetInCloudWallet(()=>{
        this._UpdateWalletStorage();
      })
    }else{
      this.showHideRemoveToken();
      this._UpdateWalletStorage();
    }
  }

  _UpdateWalletStorage = () =>{
    console.log("come in liao 1")
    try {
      const value = localStorage.getItem('wallets')
      if(value !== null) {
        let walletlist = JSON.parse(value);
        if(walletlist.length > 0){
          walletlist.map((wallet,index)=>{
            console.log(wallet.publicaddress , this.props.selectedWallet.publicaddress)
            if(wallet.publicaddress == this.props.selectedWallet.publicaddress){
              console.log("come in liao 2")
              createNotification('success',intl.get('Wallet.RemovedTokenAsset',{code:this.props.selectedTokenAsset.AssetCode.toUpperCase()}));
              wallet.tokenassetlist = wallet.tokenassetlist.filter(x => x.AssetCode != this.props.selectedTokenAsset.AssetCode);
              localStorage.setItem('wallets',JSON.stringify(walletlist));
              this.props.loadWallet();
              this.props.setSelectedWallet(wallet.publicaddress);
              this.props.setCurrent("selectedwallet");
            }
          })
        }
      }
    }catch(e) {
      // error reading value
    }
  }

  render() {
    const dataMax = Math.max(...this.props.TokenSparkLine.map(i => i.value));
    const dataMin = Math.min(...this.props.TokenSparkLine.map(i => i.value));
    return (
      <div className="walletdetailpanel fadeInAnim">
        {this.props.selectedWallet.walletname != null &&
          <div>
            {/* <div className="walletname" >{this.props.selectedWallet.walletname}</div> */}
            <div className="walletname" >
              <img width="20px" src={buttonback} onClick={this.back} style={{cursor:"pointer"}}/>
              {!this.state.isPrimary ?
              <Dropdown overlay={this.dropdownmenu} trigger={['click']}>
                <a className="ant-dropdown-link" href="#">
                  <img width="20px" src={menuicon} style={{cursor:"pointer"}}/>
                </a>
              </Dropdown>
              : null }
            </div>
            <div className="contentpanel">
              <img width="80px" src={this.props.selectedTokenAsset.LogoUrl} />
              <div className="rvxbalance">{this.props.selectedTokenAsset.TokenBalance ? `${this.props.selectedTokenAsset.TokenBalance % 1 != 0 ? toFixedNoRounding(this.props.selectedTokenAsset.TokenBalance,4) : toFixedNoRounding(this.props.selectedTokenAsset.TokenBalance,2)}` : `0.00`}<span>{this.props.selectedTokenAsset.AssetCode.toUpperCase()}</span></div>
              <div className="usdbalance">${numberWithCommas(parseFloat(!isNaN(this.props.convertrate * this.props.selectedTokenAsset.TokenBalance) ? this.props.convertrate * this.props.selectedTokenAsset.TokenBalance : 0),true)} {this.props.currencycode}</div>
              <div style={{height:'100px'}}>
                <ResponsiveContainer width={'100%'} height={500}>
                  <AreaChart data={this.props.TokenSparkLine} baseValue={dataMin}>
                    <defs>
                      <linearGradient id="gradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="rgb(100, 244, 244)" stopOpacity={0.7}/>
                        <stop offset="95%" stopColor="rgb(28, 31, 70)" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    {/* <XAxis dataKey="value" />
                    <YAxis />
                    <CartesianGrid strokeDasharray="3 3" />
                    <Tooltip cursor={false} />  */}
                    <Curve type={"natural"} />
                    <Area type="monotone" dataKey="value" baseLine={5} stroke="rgb(100, 244, 244)" fillOpacity={1} fill="url(#gradient)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
              <Button className="butreceive button" onClick={this.receiveToken} style={{marginRight:"20px"}}><span><img src={buttonreceive} /></span><span style={{marginLeft:"10px"}}>{intl.get('Token.Receive')}</span></Button>
              <Button className="butsend button" onClick={this.transferToken}><span><img src={buttonsend} /></span><span style={{marginLeft:"10px"}}>{intl.get('Token.Send')}</span></Button>
            </div>
            {
              this.props.gettrxlist.length > 0 ?
              <div>
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
              :
              <div className="notransaction">{intl.get('Transaction.NoTransaction')}</div>
            }
          </div>


        }
        
        {/* {this.props.selectedWallet.walletname == null &&
          <div className='nowalletpanel'>
            <div className='label'>{intl.get('Wallet.SelectWallet')}</div>
            <img src={rivelogo500} />
          </div>
        } */}
        <Modal
          title=""
          visible={this.state.showhideremovetoken}
          onOk={this.confirmRemoveToken}
          onCancel={this.showHideRemoveToken}
          centered
        >
          <p className='modalcontent'>{intl.get('Modal.AreYouSureRemoveTokenAsset')}</p>
          <div className="middletitle">{this.props.selectedTokenAsset.AssetCode}</div>
        </Modal>
      </div>
    );
  }
}

export default WalletDetail;