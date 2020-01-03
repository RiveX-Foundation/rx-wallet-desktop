import React, { Component } from 'react';
import { Row, Col } from 'antd';
import { observer, inject } from 'mobx-react';
import { isSdkReady } from 'utils/helper';

import './Layout.less';
import RegisterMobile from './RegisterMobile';
import ForgotPassword from './ForgotPassword';
import Dashboard from './Dashboard';


import Login from 'containers/Login';
import '../../../static/lib/notifications.css';

import { getBalance } from 'utils/helper';

@inject(stores => ({
  //auth: stores.session.auth,
  //addrInfo: stores.wanAddress.addrInfo,
  IsLogin : stores.session.IsLogin,
  RequestSignIn: stores.session.RequestSignIn,
  RequestForgotPassword: stores.session.RequestForgotPassword,
  UserAccountExist: stores.session.UserAccountExist,
  hasMnemonicOrNot: stores.session.hasMnemonicOrNot,
  getMnemonic: () => stores.session.getMnemonic(),
  getuserStore: () => stores.userRegistration.getthisstore(),
  getnetworkStore: () => stores.network.getthisstore(),
  getwalletStore: () => stores.walletStore.getthisstore(),
  setuserstore: thestore => stores.walletStore.setuserstore(thestore),
  setsettinguserstore: thestore => stores.setting.setuserstore(thestore),
  setnetworkstore: thestore => stores.walletStore.setnetworkstore(thestore),
  setwalletstore: thestore => stores.userRegistration.setwalletstore(thestore)
  //updateWANBalance: newBalanceArr => stores.wanAddress.updateWANBalance(newBalanceArr),
}))

@observer
export default class Layout extends Component {
  state = {
    loading: true
  }

  /*
  waitUntilSdkReady() {
    let id = setInterval(async () => {
      let ready = await isSdkReady();
      if (ready) {
        try {
          await this.props.getMnemonic();
          this.setState({
            loading: false
          });
          console.log('SDK is ready');
          clearInterval(id);
        } catch (err) {
          console.log('Get mnemonic failed');
        }
      }
    }, 1000);
  }
  */

  componentDidMount() {
    this.props.setuserstore(this.props.getuserStore());
    this.props.setsettinguserstore(this.props.getuserStore());
    this.props.setnetworkstore(this.props.getnetworkStore());
    this.props.setwalletstore(this.props.getwalletStore());
    //this.wanTimer = setInterval(() => this.updateWANBalanceForInter(), 5000);
    //this.waitUntilSdkReady();
  }

  componentWillUnmount() {
    clearInterval(this.wanTimer);
  }

  updateWANBalanceForInter = () => {
    const { addrInfo } = this.props;
    const allAddr = (Object.values(addrInfo).map(item => Object.keys(item))).flat();
    if (Array.isArray(allAddr) && allAddr.length === 0) return;
    getBalance(allAddr).then(res => {
      if (res && Object.keys(res).length) {
        this.props.updateWANBalance(res);
      }
    }).catch(err => {
      console.log(err);
    });
  }

  render() {
    const { UserAccountExist , RequestSignIn , RequestForgotPassword, IsLogin } = this.props;//, auth, location } = this.props;
    //if (this.state.loading) {
    //  return <Loading />
    //} else {

      console.log(UserAccountExist);

      if (RequestSignIn) {
        return <RegisterMobile />
      }else if (RequestForgotPassword) {
        return <ForgotPassword />
      } else if (!IsLogin) {
        return <Login />
      } else {
        return <Dashboard />
      } 
    //}
  }
}