//import wanUtil from "wanchain-util";
import React, { Component } from 'react';
import { Button, message, Steps } from 'antd';
import { observer, inject } from 'mobx-react';
import intl from 'react-intl-universal';

import './index.less';
import WalletListing from 'components/Wallet/WalletListing';
import WalletCreation from 'components/Wallet/WalletCreation';
import WalletKeyInSeed from 'components/Wallet/WalletKeyInSeed';
import WalletCreated from 'components/Wallet/WalletCreated';
import WalletDetail from 'components/Wallet/WalletDetail';
import TokenTransfer from 'components/Wallet/TokenTransfer';

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
  CreateEthAddress: () => stores.walletStore.CreateEthAddress(),
  setCurrent: current => stores.walletStore.setCurrent(current),
  setUserAccountExist : val => stores.session.setUserAccountExist(val)
}))

@observer
class Dashboard extends Component {
  state = {
    walletsteps: [{
      title: intl.get('Register.registerMobile'), //0
      content: <WalletListing />,
    },{
      title: intl.get('Register.registerMobile'), //1
      content: <WalletCreation />,
    },{
      title: intl.get('Register.registerMobile'), //2
      content: <WalletKeyInSeed />,
    },{
      title: intl.get('Register.registerMobile'), //3
      content: <WalletCreated />,
    },{
      title: intl.get('Register.registerMobile'), //3
      content: <WalletDetail />,
    },{
      title: intl.get('Register.registerMobile'), //3
      content: <TokenTransfer />,
    }]
  }

  next = async () => {
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

  /*
  done = () => {
    const { mnemonic, newPhrase, pwd, addAddress } = this.props;
    if (newPhrase.join(' ') === mnemonic) {
      wand.request('phrase_import', { phrase: mnemonic, pwd }, (err) => {
        if (err) {
          message.error(intl.get('Register.writeSeedPhraseToDatabaseFailed'));
          return;
        }
        wand.request('wallet_unlock', { pwd: pwd }, (err, val) => {
          if (err) {
            console.log(intl.get('Register.unlockWalletFailed'), err)
          } else {
            let path = "m/44'/5718350'/0'/0/0";
            wand.request('address_getOne', { walletID: 1, chainType: 'WAN', path: path }, (err, val_address_get) => {
              if (!err) {
                wand.request('account_create', { walletID: 1, path: path, meta: { name: 'Account1', addr: `0x${val_address_get.address}` } }, (err, val_account_create) => {
                  if (!err && val_account_create) {
                    let addressInfo = {
                      start: 0,
                      address: wanUtil.toChecksumAddress(`0x${val_address_get.address}`)
                    }
                    addAddress(addressInfo);
                    this.props.setMnemonicStatus(true);
                    this.props.setAuth(true);
                  }
                });
              }
            });
          }
        })
      });
    } else {
      message.error(intl.get('Register.seedPhraseMismatched'));
    }
  }
  */

  render() {
    const { walletsteps } = this.state;
    const { current } = this.props;
    return (
      <div className="zContent">
        <div className="registerContent">
          <div className="steps-content">{walletsteps[current].content}</div>
          <div className="steps-action">
            {
              (current == 1 || current == 2) && (<Button type="primary" onClick={this.next} >{intl.get('Register.Next')}</Button>)
            }
          </div>
        </div>
      </div>
    );
  }
}

export default Dashboard;