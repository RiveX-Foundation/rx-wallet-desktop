import React, { Component } from 'react';
import { Input, InputNumber, Tooltip, Button } from 'antd';
import { observer, inject } from 'mobx-react';
import intl from 'react-intl-universal';
import { createNotification } from 'utils/helper';
const { currency } = require('../../../../../config/common/currency');
const { TextArea } = Input;

import './index.less';
import { setDefaultWordlist } from 'bip39';
@inject(stores => ({
  currencycode: stores.setting.currencycode,
  setCurrencyCode : code => stores.setting.setCurrencyCode(code),
  language: stores.languageIntl.language,
}))

@observer
class Currency extends Component {

  inputEl1 = null;

  state = {
    currencycode: "USD",
    autoliststyle: "autolisthide",
    originallist : [],
    filterlist : []
  }

  componentDidMount(){
    this.setState({
      originallist: currency,
      filterlist: currency
    });

    //this.readTextFile("../../static/currency.json");
    this.loadSelectedCurrencyCode();
  }

  loadSelectedCurrencyCode() {
    this.setState({currencycode:this.props.currencycode});
  }

  onChange = e => {
    this.setState({currencycode:e.target.value});
    
  }

  readTextFile = file => {
    var rawFile = new XMLHttpRequest();
    rawFile.open("GET", file, false);
    rawFile.onreadystatechange = () => {
        if (rawFile.readyState === 4) {
            if (rawFile.status === 200 || rawFile.status == 0) {
                var allText = rawFile.responseText;
                this.setState({
                  originallist: JSON.parse(allText),
                  filterlist: JSON.parse(allText)
                });
            }
        }
    };
    rawFile.send(null);
  };

  setfilterlist = e => {
    var newfilterlist = [];
    this.props.setCurrencyCode(e.target.value);
    this.state.originallist.forEach(function(item, index){
      if(item.name.toLowerCase().includes(e.target.value.toLowerCase())){
        newfilterlist.push(item);
      }
    });
    this.setState({filterlist: newfilterlist});
  }
  
  selectcurrency = e => {
    this.setState({currencycode:e.currentTarget.getAttribute('data-code')}, () => {
      this.props.setCurrencyCode(this.state.currencycode);
    });
    //console.log("IN");
    //console.log(e.currentTarget.getAttribute('data-code'));
    //this.setState({ mobilevalue : e.target.value }, () => {
    //  this.props.setMobile(this.state.mobilevalue);
    //});
  }

  showlist = e => {
    e.preventDefault();
    e.stopPropagation();
    this.setState({autoliststyle : "autolist"});
  }

  hidelist = e => {
    //e.preventDefault();
    //e.stopPropagation();
    this.setState({autoliststyle : "autolisthide"});
  }

  render() {
    const {autoliststyle,filterlist,currencycode} = this.state;
    return (
      <div className="currencypanel fadeInAnim">
        <div className="title" ><span>{intl.get('Settings.Currency')}</span></div>
        <div className="centerpanel">
          <div className="inputwrapper">
            <div className="panelwrapper countrycodewrapper">
              <Input ref={(input) => { this.inputEl1 = input; }} value={currencycode} id="countrycode" placeholder={intl.get('Settings.Currency')} onClick={this.showlist} onBlur={this.hidelist} onFocus={this.showlist} className="inputTransparent" onChange={this.setfilterlist} />
              <div className={autoliststyle}>
                {filterlist.length > 0 && 
                  <ul>
                    {filterlist.map((item, index) => <li key={index} data-code={item.shortcode} onMouseDown={this.selectcurrency}>{item.name}</li>)}
                  </ul>
                }

                {filterlist.length == 0 && 
                  <div className="noResult">{intl.get('Common.NoData')}</div>
                }
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }
}

export default Currency;