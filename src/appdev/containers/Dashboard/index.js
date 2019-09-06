//import wanUtil from "wanchain-util";
import { Row, Col } from 'antd';
import React, { Component } from 'react';
import { Button, message, Steps } from 'antd';
import SideBar from '../Sidebar';
import { observer, inject } from 'mobx-react';
import intl from 'react-intl-universal';
import MHeader from 'components/MHeader';
import MFooter from 'components/MFooter';
import Loading from 'components/Loading';

import './index.less';
import WalletListing from 'components/Wallet/WalletListing';
import WalletCreation from 'components/Wallet/WalletCreation';
import WalletKeyInSeed from 'components/Wallet/WalletKeyInSeed';
import WalletCreated from 'components/Wallet/WalletCreated';
import WalletDetail from 'components/Wallet/WalletDetail';
import WalletNameEntry from 'components/Wallet/WalletNameEntry';
import WalletTypeSelection from 'components/Wallet/WalletTypeSelection';
import TokenTransfer from 'components/Wallet/TokenTransfer';
import TokenReceive from 'components/Wallet/TokenReceive';
import WalletRestorebySeed from 'components/Wallet/WalletRestorebySeed';
import WalletRestorebyPrivateKey from 'components/Wallet/WalletRestorebyPrivateKey';
import CreateShareWallet from 'components/Wallet/CreateShareWallet';
import TransactionDetail from 'components/Wallet/TransactionDetail';
import JoinShareWallet from 'components/Wallet/JoinShareWallet';
import TokenTransferConfirmation from 'components/Wallet/TokenTransferConfirmation';
import SplashBasicWalletCreation from 'components/Wallet/SplashBasicWalletCreation';
import BackupWalletTutorial from 'components/Wallet/BackupWalletTutorial';
import TokenTransferSuccessful from 'components/Wallet/TokenTransferSuccessful';
import ImportWalletTypeSelection from 'components/Wallet/ImportWalletTypeSelection';
import HWWalletSelection from 'components/Wallet/HWWalletSelection';
import Settings from 'components/Settings';
import {NotificationContainer, NotificationManager} from 'react-notifications';

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
  current: stores.walletStore.current,
  changeTitle: newTitle => stores.languageIntl.changeTitle(newTitle),
  CreateEthAddress: () => stores.walletStore.CreateEthAddress(),
  setCurrent: current => stores.walletStore.setCurrent(current),
  CreateEthAddress: () => stores.walletStore.CreateEthAddress(),
  setUserAccountExist : val => stores.session.setUserAccountExist(val),
  IsShowWalletListing : stores.session.IsShowWalletListing
}))

@observer
class Dashboard extends Component {
  state = {
    walletsteps: [{
      title: intl.get('Register.registerMobile'),
      content: <WalletListing />,
      key:'walletlisting'
    },{
      title: intl.get('Register.registerMobile'),
      content: <WalletTypeSelection />,
      key:'wallettypeselection'
    },{
      title: intl.get('Register.registerMobile'),
      content: <WalletNameEntry />,
      key:'walletnameentry'
    },{
      title: intl.get('Register.registerMobile'),
      content: <WalletCreation />,
      key:'walletcreation'
    },{
      title: intl.get('Register.registerMobile'),
      content: <WalletKeyInSeed />,
      key:'walletkeyinseed'
    },{
      title: intl.get('Register.registerMobile'),
      content: <WalletCreated />,
      key:'walletcreated'
    },{
      title: intl.get('Register.registerMobile'),
      content: <WalletDetail />,
      key:'walletdetail'
    },{
      title: intl.get('Register.registerMobile'),
      content: <TokenTransfer />,
      key:'tokentransfer'
    },{
      title: intl.get('Register.registerMobile'),
      content: <WalletRestorebySeed />,
      key:'walletrestorebyseed'
    },{
      title: intl.get('Register.registerMobile'),
      content: <WalletRestorebyPrivateKey />,
      key:'walletrestorebyprivatekey'
    },{
      title: intl.get('Register.registerMobile'),
      content: <CreateShareWallet />,
      key:'createsharewallet'
    },{
      title: intl.get('Register.registerMobile'),
      content: <TokenReceive />,
      key:'tokenreceive'
    },{
      title: intl.get('Register.registerMobile'),
      content: <JoinShareWallet />,
      key:'joinsharewallet'
    },{
      title: intl.get('Register.registerMobile'),
      content: <TransactionDetail />,
      key:'transactiondetail'
    },{
      title: intl.get('Register.registerMobile'),
      content: <TokenTransferConfirmation />,
      key:'tokentransferconfirmation'
    },{
      title: intl.get('Register.registerMobile'),
      content: <SplashBasicWalletCreation />,
      key:'splashbasicwalletcreation'
    },{
      title: intl.get('Register.registerMobile'),
      content: <BackupWalletTutorial />,
      key:'backupwallettutorial'
    },{
      content: <TokenTransferSuccessful />,
      key:'tokentransfersuccessful'
    },{
      content: <ImportWalletTypeSelection />,
      key:'importwallettypeselection'
    },{
      content: <HWWalletSelection />,
      key:'hwwalletselection'
    },{
      content: <Settings />,
      key:'settings'
    }]
  }

  constructor(props) {
    super(props);
    this.props.changeTitle(intl.get('Dashboard.Title'));
    //this.props.CreateEthAddress();
  }
    
  //  componentDidMount(){
  //  console.log("TEST");
  //  console.log(intl.get('Dashboard.Title'));
  //}

  render() {
    const { walletsteps } = this.state;
    const { current,IsShowWalletListing } = this.props;

    var IsDoubleColumn = (
      current == "walletlisting" || 
      current == "tokentransfer" || 
      current == "transactiondetail" || 
      current == "walletdetail"
    );

    return (
      <Row className="container">
        <Col className="nav-left">
          <SideBar path={'/'}/>
        </Col>
        {IsDoubleColumn && 
          <div>
            <Col className="walletcol">
              <WalletListing />
            </Col>
            <Col className="main">
              <Row>
                {walletsteps.find(x => x.key === current).content}
              </Row>
            </Col>
          </div>
        }

        {!IsDoubleColumn &&
          <Col className="fullmain">
            <Row>
              {walletsteps.find(x => x.key === current).content}
            </Row>
          </Col>
        }
        <NotificationContainer/>
      </Row>


    );
  }
}

export default Dashboard;