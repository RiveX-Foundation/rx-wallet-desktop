import React, { Component } from 'react';
import { Input, Modal } from 'antd';
import { observer, inject } from 'mobx-react';
import intl from 'react-intl-universal';
import { createNotification } from 'utils/helper';

const { TextArea } = Input;

import './index.less';
@inject(stores => ({
  selectednetwork : stores.network.selectednetwork,
  networklist : stores.network.networklist,
  setNetwork : code => stores.network.setNetwork(code),
  language: stores.languageIntl.language,
}))

@observer
class Network extends Component {

  inputEl1 = null;

  state = {
    networkcode: "mainnet",
    autoliststyle: "autolisthide",
    originallist : [],
    filterlist : [],
    modalvisible : false,
    temporarynewnetworkcode: "mainnet"
  }

  componentDidMount(){

    this.setState({
      originallist : this.props.networklist,
      filterlist : this.props.networklist,
      networkcode : this.props.selectednetwork.shortcode
    }) ;
  }

  onChange = e => {
    this.setState({networkcode:this.props.networklist.find(x => x.name == e.target.value).shortcode});
  }

  setfilterlist = e => {
    var newfilterlist = [];
    this.props.setNetwork(this.props.networklist.find(x => x.name == e.target.value).shortcode);
    this.state.originallist.forEach(function(item, index){
      if(item.name.toLowerCase().includes(e.target.value.toLowerCase())){
        newfilterlist.push(item);
      }
    });
    this.setState({filterlist: newfilterlist});
  }
  
  selectnetwork = e => {
    this.setState({
      modalvisible: true,
      temporarynewnetworkcode: e.currentTarget.getAttribute('data-code')
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

  handleCancel = () => {
    this.setState({
      modalvisible: false
    });
  }

  handleOk = () => {
    this.setState({
      modalvisible: false
    },() => {
      this.setState({networkcode:this.state.temporarynewnetworkcode}, () => {
        this.props.setNetwork(this.state.networkcode);
        wand.request('system_reload', null, (err, val) => {
          if (err) {
            console.log('Refresh Failed ', err)
            return
          }
          stores.session.setAuth(false);
        });

      });
    });
  }

  render() {
    const {autoliststyle,filterlist,networkcode} = this.state;
    return (
      <div className="networkpanel fadeInAnim">
        <div className="title" ><span>{intl.get('Settings.Network')}</span></div>
        <div className="centerpanel">
          <div className="inputwrapper">
            <div className="panelwrapper">
              <Input value={this.props.selectednetwork.name } placeholder={intl.get('Settings.Network')} onClick={this.showlist} onBlur={this.hidelist} onFocus={this.showlist} className="inputTransparent" onChange={this.setfilterlist} />
              <div className={autoliststyle}>
                {
                  filterlist.length > 0 && 
                  <ul>
                    {filterlist.map((item, index) => <li key={index} data-code={item.shortcode} onMouseDown={this.selectnetwork} style={{color:item.color}}>{item.name}</li>)}
                  </ul>
                }

                {filterlist.length == 0 && 
                  <div className="noResult">{intl.get('Common.NoData')}</div>
                }
              </div>
            </div>
          </div>
        </div>

        <Modal
              title=""
              visible={this.state.modalvisible}
              onOk={this.handleOk}
              onCancel={this.handleCancel}
            >
          <p className='modalcontent'>{intl.get('Modal.AreYouSureChangeNetwork.Msg1')}</p>
          <p className='modalcontent'>{intl.get('Modal.AreYouSureChangeNetwork.Msg2')}</p>
        </Modal>

      </div>
    );
  }
}

export default Network;