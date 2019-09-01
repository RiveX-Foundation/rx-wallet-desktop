import React, { Component } from 'react';
import { Input, Radio, Tooltip, Button } from 'antd';
import { observer, inject } from 'mobx-react';
import intl from 'react-intl-universal';
import { getDatefromTimestamp } from 'utils/helper';

const { TextArea } = Input;

import './index.less';
import { setDefaultWordlist } from 'bip39';
import { timingSafeEqual } from 'crypto';
@inject(stores => ({
  setCurrent: current => stores.walletStore.setCurrent(current),
  selectedwallet: stores.walletStore.selectedwallet,
  trxdetail : stores.walletStore.trxdetail,
  multisigtrxloglist : stores.walletStore.multisigtrxloglist,
  language: stores.languageIntl.language,
  wsGetMultiSigTrxLog : trxid => stores.walletStore.wsGetMultiSigTrxLog(trxid),
  wsApproveMultiSigTrx : (trxid,to,total,isexecute) => stores.walletStore.wsApproveMultiSigTrx(trxid,to,total,isexecute),
  WalletEntryNextDirection: stores.walletStore.WalletEntryNextDirection
}))

@observer
class TransactionDetail extends Component {
  state = {
    layout:null
  }

  componentDidMount(){
    this.formatdetail();
    this.props.wsGetMultiSigTrxLog(this.props.trxdetail.hash);
  }

  formatdetail = () => {
    let layout;
    console.log(this.props.selectedwallet);
    var dateobj = getDatefromTimestamp(this.props.trxdetail.timestamp);
    if(this.props.selectedwallet.wallettype == "basicwallet"){
      layout = 
      (
        <div>
          <div className="panelwrapper borderradiusfull spacebetween" style={{marginBottom:"10px"}}>
            <div className="panellabel">{intl.get('Transaction.Block')}</div>
            <div className="panelvalue">{this.props.trxdetail.block}</div>
          </div>
          <div className="panelwrapper borderradiusfull spacebetween" style={{marginBottom:"10px"}}>
            <div className="panellabel">{intl.get('Transaction.Hash')}</div>
            <div className="panelvalue">{this.props.trxdetail.hash}</div>
          </div>
          <div className="panelwrapper borderradiusfull spacebetween" style={{marginBottom:"10px"}}>
            <div className="panellabel">{intl.get('Transaction.From')}</div>
            <div className="panelvalue">{this.props.trxdetail.from}</div>
          </div>
          <div className="panelwrapper borderradiusfull spacebetween" style={{marginBottom:"10px"}}>
            <div className="panellabel">{intl.get('Transaction.To')}</div>
            <div className="panelvalue">{this.props.trxdetail.to}</div>
          </div>
          <div className="panelwrapper borderradiusfull" style={{marginBottom:"15px"}}>
            <div className="spacebetween" style={{marginBottom:"10px"}}>
              <div className="panellabel">{intl.get('Transaction.Amount')}</div>
              <div className="panelvalue">{this.props.trxdetail.value}</div>
            </div>

            <div className="spacebetween" style={{marginBottom:"15px"}}>
              <div className="panellabel">{intl.get('Transaction.GasPrice')}</div>
              <div className="panelvalue">{this.props.trxdetail.gasprice}</div>
            </div>

            <div className="spacebetween">
              <div className="panellabel">{intl.get('Transaction.GasUsed')}</div>
              <div className="panelvalue">{this.props.trxdetail.gasused}</div>
            </div>
          </div>
          <div className="panelwrapper borderradiusfull spacebetween" style={{marginBottom:"10px"}}>
            <div className="panellabel">{intl.get('Transaction.CreatedOn')}</div>
            <div className="panelvalue">{dateobj.getFullYear() + "-" + (dateobj.getMonth()+1).toString().padStart(2, '0') + "-" + dateobj.getDate().toString().padStart(2, '0') + " " + dateobj.getHours().toString().padStart(2, '0') + ":" + dateobj.getMinutes().toString().padStart(2, '0') + ":" + dateobj.getSeconds().toString().padStart(2, '0')}</div>
          </div>
          <div className="panelwrapper borderradiusfull spacebetween" style={{marginBottom:"10px"}}>
            <div className="panellabel">{intl.get('Transaction.Nonce')}</div>
            <div className="panelvalue">{this.props.trxdetail.nonce}</div>
          </div>
          <div className="panelwrapper borderradiusfull spacebetween" style={{marginBottom:"10px"}}>
            <div className="panellabel">{intl.get('Transaction.Confirmation')}</div>
            <div className="panelvalue">{this.props.trxdetail.confirmation}</div>
          </div>
        </div>
      );
    }else{
      layout = 
      (
        <div>
          <div className="panelwrapper borderradiusfull spacebetween" style={{marginBottom:"10px"}}>
            <div className="panellabel">{intl.get('Transaction.TransactionID')}</div>
            <div className="panelvalue">{this.props.trxdetail.hash}</div>
          </div>
          <div className="panelwrapper borderradiusfull spacebetween" style={{marginBottom:"10px"}}>
            <div className="panellabel">{intl.get('Transaction.From')}</div>
            <div className="panelvalue">{this.props.trxdetail.from}</div>
          </div>
          <div className="panelwrapper borderradiusfull spacebetween" style={{marginBottom:"10px"}}>
            <div className="panellabel">{intl.get('Transaction.To')}</div>
            <div className="panelvalue">{this.props.trxdetail.to}</div>
          </div>
          <div className="panelwrapper borderradiusfull spacebetween" style={{marginBottom:"10px"}}>
            <div className="panellabel">{intl.get('Transaction.Amount')}</div>
            <div className="panelvalue">{this.props.trxdetail.value}</div>
          </div>
          <div className="panelwrapper borderradiusfull spacebetween" style={{marginBottom:"10px"}}>
            <div className="panellabel">{intl.get('Transaction.CreatedOn')}</div>
            <div className="panelvalue">{dateobj.getFullYear() + "-" + (dateobj.getMonth()+1).toString().padStart(2, '0') + "-" + dateobj.getDate().toString().padStart(2, '0') + " " + dateobj.getHours().toString().padStart(2, '0') + ":" + dateobj.getMinutes().toString().padStart(2, '0') + ":" + dateobj.getSeconds().toString().padStart(2, '0')}</div>
          </div>
          <div className="spacebetween" style={{width:"600px"}}>
            <div className="panelwrapper borderradiusfull spacebetween signerspanelcolor" style={{marginBottom:"10px",padding:"10px 10px",width:"500px"}}>
              <div className="panellabel">{intl.get('Transaction.TotalSigners')}</div>
              <div className="panelvalue">{this.props.trxdetail.signers.length} / {this.props.selectedwallet.totalsignatures}</div>
            </div>
            {
              this.props.trxdetail.action == "approve" && 
                <Button type="primary" className="approvebutton" onClick={this.approve} data-trxid={this.props.trxdetail.hash} >{intl.get('Transaction.Approve')}</Button>
            }

            {
              this.props.trxdetail.action != "approve" && 
                <div className="actionlabel">{intl.get('STATUS.' + this.props.trxdetail.action)}</div>
            }

          </div>
        </div>
      );
    }
    this.setState({layout:layout});
  }

  next = () => {
  }

  approve = e => {

    var isexecute = false;
    if(this.props.selectedwallet.totalsignatures - this.props.trxdetail.signers.length <= 1){
      isexecute = true;
    }

    var hash = e.currentTarget.dataset.trxid;
    this.props.wsApproveMultiSigTrx(hash,this.props.trxdetail.to,this.props.trxdetail.value,isexecute);
    console.log(hash);
  }

  back = () => {
    this.props.setCurrent("walletdetail");
  }

  render() {
    return (
      <div className="trxdetailpanel">
        <div className="title" ><span><img onClick={this.back} width="20px" src="../../static/image/icon/back.png" /></span><span style={{marginLeft:"20px"}}>{intl.get('Transaction.Detail')}</span></div>
        <div className="content">
          <center>
            <div>{this.state.layout}</div>
            <div className="spacebetween" style={{width:"600px"}}>
              <div className="panelwrapper borderradiusfull signerspanelcolor" style={{marginBottom:"10px",padding:"10px",width:"500px"}}>
              {
                
                this.props.selectedwallet.wallettype == "sharedwallet" &&  
                this.props.multisigtrxloglist.map(function(item, i){
                  return (
                    <div key={i} className="panellabel logname"><span className="multisigtick"><img src="../../static/image/icon/multisigtick.png" /></span>{item.UserName}</div>
                  )
                })
              }
              </div>
            </div>
          </center>
        </div>
      </div>
    );
  }
}

export default TransactionDetail;