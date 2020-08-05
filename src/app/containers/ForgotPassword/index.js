//import wanUtil from "wanchain-util";
import React, { Component } from "react";
import { Steps } from "antd";
import { inject, observer } from "mobx-react";
import intl from "react-intl-universal";

import "./index.less";
import InputMobile from "components/ForgotPassword/InputMobile";
import InputOTP from "components/ForgotPassword/InputOTP";
import InputNewPassword from "components/ForgotPassword/InputNewPassword";
import { NotificationContainer } from "react-notifications";
import bgimg from "static/image/graphic/loginbg.jpg";

//import { checkCryptographic, checkPhrase } from 'utils/support';

const Step = Steps.Step;

@inject((stores) => ({
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
  mobile: stores.userRegistration.mobile,
  otp: stores.userRegistration.otp,
  setHasAcc: (val) => stores.session.setHasAcc(val),
  setUserAccountExist: (val) => stores.session.setUserAccountExist(val),
  //wsMobileRegistration : () => stores.userRegistration.wsMobileRegistration(),
}))
@observer
class ForgotPassword extends Component {
  state = {
    steps: [
      {
        content: <InputMobile />,
        key: "inputmobile",
      },
      {
        title: intl.get("Register.registrationOTPEntry"),
        content: <InputOTP />,
        key: "inputotp",
      },
      {
        title: intl.get("Register.registerUserInfo"),
        content: <InputNewPassword />,
        key: "inputuserinfo",
      },
    ],
  };

  next = async () => {
    /*
        const { mobile,current } = this.props;
        const { steps } = this.state;
        if (steps[current].key === 'inputmobile') {
          this.props.wsMobileRegistration();
        } else if(steps[current].key === 'inputmobile'){
          this.props.wsOTPVerification('registration');
        } else if(current === 2){
          this.props.wsUserRegistration();
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
  };

  prev = () => {
    const { setIndex, current } = this.props;
    setIndex(current - 1);
  };

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
      <div className="zContent" style={{ backgroundImage: bgimg }}>
        <div className="registerContent">
          {steps.find((x) => x.key === current).content}
        </div>
        <NotificationContainer />
      </div>
    );
  }
}

export default ForgotPassword;
