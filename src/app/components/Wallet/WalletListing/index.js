import React, { Component } from 'react';
import { Input, Radio, Icon, Tooltip, Button } from 'antd';
import { observer, inject, computed } from 'mobx-react';
import intl from 'react-intl-universal';
import buttonplussign from 'static/image/icon/plussign.png';
import { numberWithCommas } from 'utils/helper';
import './index.less';


@inject(stores => ({
  wallets : stores.walletStore.walletlist,
  selectedwallettype : stores.walletStore.selectedwallettype,
  loadWallet: () => stores.walletStore.loadWallet(),
  setSelectedWallet : publicaddress => stores.walletStore.setSelectedWallet(publicaddress),
  setCurrent: current => stores.walletStore.setCurrent(current),
  language: stores.languageIntl.language,
  selectedwalletlist: stores.walletStore.selectedwalletlist,
  convertrate:stores.walletStore.convertrate
}))

@observer
class WalletListing extends Component {
  constructor(props){
    super(props);
    this.state = {
      selectedwalletaddress:''
    }
  }

  componentDidMount(){
    this.loadwallet();
  }

  componentWillReceiveProps(newProps){
    // console.log(JSON.stringify(newProps.selectedwalletlist));
    if(newProps.selectedwalletlist.length > 0){
      this.selectWalletOnLoad(newProps.selectedwalletlist[0].publicaddress);
    }
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
    this.selectWalletOnLoad(walletpublicaddress);
  }

  selectWalletOnLoad = (walletpublicaddress) =>{
    this.setState({
      selectedwalletaddress:walletpublicaddress
    },()=>{
      this.props.setSelectedWallet(walletpublicaddress);
      this.props.setCurrent("selectedwallet");
    });
  }

  _getTotalWorth(selectedWallet){
    var totalworth = 0;
    if(selectedWallet.tokenassetlist.length > 0){
      selectedWallet.tokenassetlist.map((asset,index)=>{
        totalworth += asset.TokenBalance;
      })
    }
    return `$${numberWithCommas(parseFloat(!isNaN(this.props.convertrate * totalworth) ? this.props.convertrate * totalworth : 0),true)}`;
  }

  render() {
    return (
      <div className='walllistingpanel fadeInAnim'>
        <div className="plussign" onClick={this.createWallet}><img src={buttonplussign} /></div>
        <ul>
        {
          this.props.selectedwalletlist.map((item, i) =>
            {
              return (
                <li key={i} onClick={this.selectWallet} className={this.state.selectedwalletaddress == item.publicaddress ? `active` : null} data-publicaddress={item.publicaddress}>
                  <div className='walletname'>{item.walletname}</div>
                  {/* <div className='walletbalance'>{item.rvx_balance} RVX</div> */}
                  <div className='walletbalance'>{this._getTotalWorth(item)} USD</div>
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