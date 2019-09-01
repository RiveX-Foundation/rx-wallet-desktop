//import wanUtil from "wanchain-util";
import React, { Component } from 'react';
import { Button, message, Steps, Tabs } from 'antd';
import { observer, inject } from 'mobx-react';
import intl from 'react-intl-universal';
import {NotificationContainer, NotificationManager} from 'react-notifications';
import './index.less';

//import { checkCryptographic, checkPhrase } from 'utils/support';

const Step = Steps.Step;

@inject(stores => ({
  /*
  pwd: stores.mnemonic.pwd,
  method: stores.mnemonic.method,
  mnemonic: stores.mnemonic.mnemonic,
  newPhrase: stores.mnemonic.newPhrase,
  isSamePwd: stores.mnemonic.isSamePwd,
  language: stores.languageIntl.language,
  isAllEmptyPwd: stores.mnemonic.isAllEmptyPwd,
  */
  current: stores.userRegistration.current,
  mobile : stores.userRegistration.mobile,
  otp : stores.userRegistration.otp,
  setCurrent: val => stores.userRegistration.setCurrent(val),
  setHasAcc : val => stores.session.setHasAcc(val),
  setUserAccountExist : val => stores.session.setUserAccountExist(val),
  wsMobileRegistration : () => stores.userRegistration.wsMobileRegistration(),
  wsUserRegistration : () => stores.userRegistration.wsUserRegistration(),
  wsOTPVerification : type => stores.userRegistration.wsOTPVerification(type)
}))

@observer
class Settings extends Component {
  state = {}

  constructor(props){
    super(props);
  }

  callback = key => {
    console.log(key);
  }
  
  render() {
    const { current } = this.props;
    const { TabPane } = Tabs;

    console.log(current);
    return (
      <div className="tabcontainer">
        <Tabs defaultActiveKey="1" onChange={this.callback}>
          <TabPane tab="Tab 1" key="1">
            Content of Tab Pane 1
          </TabPane>
          <TabPane tab="Tab 2" key="2">
            Content of Tab Pane 2
          </TabPane>
          <TabPane tab="Tab 3" key="3">
            Content of Tab Pane 3
          </TabPane>
        </Tabs>
      </div>
    );
  }
}

export default Settings;