//import wanUtil from "wanchain-util";
import React, { Component } from 'react';
import { Button, message, Steps, Tabs } from 'antd';
import { observer, inject } from 'mobx-react';
import intl from 'react-intl-universal';
import {NotificationContainer, NotificationManager} from 'react-notifications';
import ManageWallet from 'components/Settings/ManageWallet';
import ManageWalletDetail from 'components/Settings/ManageWalletDetail';
import ExportPrivateKey from 'components/Settings/ExportPrivateKey';
import Currency from 'components/Settings/Currency';
import Security from 'components/Settings/Security';
import Network from 'components/Settings/Network';
import Profile from 'components/Settings/Profile';
import Language from 'components/Settings/Language';
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
      },
      {
        content: <ExportPrivateKey />,
        key:'exportprivatekey'
      },
      {
        content: <Network />,
        key:'network'
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
          <TabPane tab={intl.get('Settings.Currency')} key="2">
            <Currency />
          </TabPane>
          <TabPane tab={intl.get('Settings.Network')} key="3">
            <Network />
          </TabPane>
        {/*   <TabPane tab={intl.get('Settings.Profile')} key="4">
            <Profile />
          </TabPane>*/}  
          <TabPane tab={intl.get('Settings.2FASecurity')} key="5">
            <Security />
          </TabPane>
        </Tabs>
      </div>
    );
  }
}

export default Settings;