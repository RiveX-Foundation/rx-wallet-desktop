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
  convertrate:stores.walletStore.convertrate,
  currencycode:stores.setting.currencycode,
  getTotalWorth: wallet => stores.walletStore.getTotalWorth(wallet)
}))

@observer
class WalletListing extends Component {
  constructor(props){
    super(props);
    this.state = {
      selectedwalletaddress:'',
      barheight:0,
      baroffsettop:0
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
      case "local":
        // this.props.setCurrent("splashbasicwalletcreation");
        this.props.setCurrent("basicwallettypeselection");
        break;
      case "sharedwallet":
        this.props.setCurrent("wallettypeselection");
        break;
      case "hwwallet":
        this.props.setCurrent("hwwalletselection");
        break;
    }
  }

  selectWallet = e => {
    var walletpublicaddress = e.currentTarget.getAttribute("data-publicaddress");
    this.setState({
      barheight:e.currentTarget.clientHeight,
      baroffsettop:e.currentTarget.offsetTop
    })
    this.selectWalletOnLoad(walletpublicaddress);
  }

  selectWalletOnLoad = (walletpublicaddress) =>{
    this.setState({
      selectedwalletaddress:walletpublicaddress
    },()=>{
      this.props.setSelectedWallet(walletpublicaddress);
      this.props.setCurrent("selectedwallet");
      var firstele = document.getElementById("rvxwallet_0");
      this.setState({
        barheight:firstele.clientHeight
      })
    });
  }

  render() {
    return (
      <div className='walllistingpanel fadeInAnim'>
        <div className="plussign" onClick={this.createWallet}><img src={buttonplussign} /></div>
        <ul style={{position:'relative'}}>
        {
          this.props.selectedwalletlist.map((item, i) =>
            {
              return (
                <li key={i} id={`rvxwallet_${i}`} onClick={this.selectWallet} data-publicaddress={item.publicaddress}>
                  <div className='walletname'>{item.walletname}</div>
                  {/*<div className='walletbalance'>{this.props.getTotalWorth(item)} {this.props.currencycode}</div>*/}
                </li> 
              )
            }
          )
        }
        <div className="activebar" style={{height:`${this.state.barheight}px`,top:`${this.state.baroffsettop}px`}}></div>
        </ul>
      </div>
    );
  }
}

export default WalletListing;