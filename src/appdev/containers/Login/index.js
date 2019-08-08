//import wanUtil from "wanchain-util";
import React, { Component } from 'react';
import { Button, message, Steps } from 'antd';
import { observer, inject } from 'mobx-react';
import intl from 'react-intl-universal';

import './index.less';
import InputMobile from 'components/RegisterAcc/InputMobile';
import InputOTP from 'components/RegisterAcc/InputOTP';
import InputUserInfo from 'components/RegisterAcc/InputUserInfo';

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
  setHasAcc : val => stores.session.setHasAcc(val),
  setUserAccountExist : val => stores.session.setUserAccountExist(val),
  wsMobileRegistration : () => stores.userRegistration.wsMobileRegistration(),
  wsUserRegistration : () => stores.userRegistration.wsUserRegistration(),
  wsOTPVerification : type => stores.userRegistration.wsOTPVerification(type)
}))

@observer
class Login extends Component {
  state = {
    steps: [{
      title: intl.get('Register.registerMobile'),
      content: <InputMobile />,
    }, {
      title: intl.get('Register.registrationOTPEntry'),
      content: <InputOTP />,
    }, {
      title: intl.get('Register.registerUserInfo'),
      content: <InputUserInfo />,
    }]
  }

  next = async () => {
    const { mobile } = this.props;
    const { current} = this.props;
    if (current === 0) {
      this.props.wsMobileRegistration();
    } else if(current === 1){
      this.props.wsOTPVerification('registration');
    } else if(current === 2){
      this.props.wsUserRegistration();
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
    const { steps } = this.state;
    const { current } = this.props;
    return (
      <div className="zContent">
        <div className="registerContent">
          <div className="steps-content">{steps[current].content}</div>
        </div>
      </div>
    );
  }
}

export default Login;