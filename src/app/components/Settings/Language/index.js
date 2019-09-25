import React, { Component } from 'react';
import { Input, InputNumber, Tooltip, Button } from 'antd';
import { observer, inject } from 'mobx-react';
import intl from 'react-intl-universal';
import locales from '../../../locales';
const { language } = require('../../../../../config/common/language');
import { createNotification } from 'utils/helper';

const { TextArea } = Input;

import './index.less';
import { setDefaultWordlist } from 'bip39';
@inject(stores => ({
  setLanguage : code => stores.languageIntl.setLanguage(code),
  language: stores.languageIntl.language,
}))

@observer
class Language extends Component {

  inputEl1 = null;

  state = {
    language: "en_US",
    autoliststyle: "autolisthide",
    originallist : [],
    filterlist : []
  }

  componentDidMount(){
    this.setState({
      originallist: language,
      filterlist: language
    });

    //this.readTextFile("../../static/language.json");
    this.loadSelectedLanguage();
  }

  loadSelectedLanguage() {
    this.setState({language:this.props.language});
  }

  onChange = e => {
    this.setState({language:e.target.value});
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
    this.props.setLanguage(e.target.value);
    this.state.originallist.forEach(function(item, index){
      if(item.name.toLowerCase().includes(e.target.value.toLowerCase())){
        newfilterlist.push(item);
      }
    });
    this.setState({filterlist: newfilterlist});
  }
  
  selectlanguage = e => {
    this.setState({language:e.currentTarget.getAttribute('data-code')}, () => {
      this.props.setLanguage(this.state.language);

      intl.init({
        currentLocale: this.state.language,
        locales
      }).then(() => {
        //stores.languageIntl.setLanguage(lan);
      });

      //i18n.init(i18nOptions, (err) => {
      //  if (err) {
      //    console.log(err);
      //  }
      //})

      //i18n.changeLanguage(this.state.language);
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
    const {autoliststyle,originallist,filterlist,language} = this.state;
    var name = "";
    if(originallist.length == 0) {name = "" } else {name = originallist.find(x => x.shortcode == language).name; }
    return (
      <div className="languagepanel fadeInAnim">
        <div className="title" ><span>{intl.get('Settings.Language')}</span></div>
        <div className="centerpanel">
          <div className="inputwrapper">
            <div className="panelwrapper">
              <Input ref={(input) => { this.inputEl1 = input; }} value={name} id="language" placeholder={intl.get('Settings.Language')} onClick={this.showlist} onBlur={this.hidelist} onFocus={this.showlist} className="inputTransparent" onChange={this.setfilterlist} />
              <div className={autoliststyle}>
                {filterlist.length > 0 && 
                  <ul>
                    {filterlist.map((item, index) => <li key={index} data-code={item.shortcode} onMouseDown={this.selectlanguage}>{item.name}</li>)}
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

export default Language;