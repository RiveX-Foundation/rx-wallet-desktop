//import wanUtil from "wanchain-util";
import React, { Component } from 'react';
import { Button, message, Steps, Tabs } from 'antd';
import { observer, inject } from 'mobx-react';
import intl from 'react-intl-universal';
import {NotificationContainer, NotificationManager} from 'react-notifications';
import ManageWallet from 'components/Settings/ManageWallet';
import ManageWalletDetail from 'components/Settings/ManageWalletDetail';
import './index.less';

//import { checkCryptographic, checkPhrase } from 'utils/support';

const Step = Steps.Step;

@inject(stores => ({
  current: stores.setting.current,
  setCurrent: val => stores.setting.setCurrent(val)
}))

@observer
class Settings extends Component {
  state = {
    walletsteps: [
      {
      content: <ManageWallet />,
      key:'managewalletlist'
      },
      {
        content: <ManageWalletDetail />,
        key:'managewalletdetail'  
    }]
  }

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
          <TabPane tab={intl.get('Settings.ManageWallets')} key="1">
            {this.state.walletsteps.find(x => x.key === current).content}
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