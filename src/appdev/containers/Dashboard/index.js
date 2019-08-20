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
import CreateShareWallet from 'components/Wallet/CreateShareWallet';

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
  setUserAccountExist : val => stores.session.setUserAccountExist(val)
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
      content: <CreateShareWallet />,
      key:'createsharewallet'
    },{
      title: intl.get('Register.registerMobile'),
      content: <TokenReceive />,
      key:'tokenreceive'
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

  next = async () => {
    /*
    const { mobile } = this.props;
    const { current} = this.props;
    if(current === 0){
      this.props.setCurrent(1);
      //this.props.wsOTPVerification('registration');
    } else if(current === 1){
      this.props.setCurrent(2);
    } else if(current === 2){
      this.props.CreateEthAddress();
      this.props.setCurrent(3);
    }
    */
      //if(isAllEmptyPwd) {
        //console.log(mobile);
        //message.error(intl.get('Register.passwordsEmpty'));
        //return;
      //}
      /*
      if (isSamePwd) {
        if (checkCryptographic(pwd)) {
          if (method === 'create') {
            wand.request('phrase_generate', { pwd: pwd }, (err, val) => {
              if (err) {
                message.error(intl.get('Register.createSeedPhraseFailed'));
                return;
              }
              console.log(val);
              this.props.setMnemonic(val);
              setIndex(1);
            });
          } else {
            setIndex(1);
          }
        } else {
          message.error(intl.get('Register.passwordTip'));
        }
      } else {
        message.error(intl.get('Register.passwordsMismatched'));
      }
      */
     /*
    } else if (current === 1 && method === 'import') {
      if (checkPhrase(mnemonic)) {
        this.props.setMnemonic(mnemonic);
        setIndex(current + 1);
      } else {
        message.error(intl.get('Register.seedPhraseIsInvalid'));
      }
    */
    //} else {
    //  setIndex(current + 1);
    //}
  }

  prev = () => {
    const { setIndex, current } = this.props;
    setIndex(current - 1);
  }

  render() {
    const { walletsteps } = this.state;
    const { current,location } = this.props;
    return (
      <Row className="container">
        <Col className="nav-left">
          <SideBar path={'/'}/>
        </Col>
        <Col className="main">
          <MHeader />
          <Row className="content">
            {walletsteps.find(x => x.key === current).content}
          </Row>
          <MFooter />
        </Col>
      </Row>
    );
  }
}

export default Dashboard;