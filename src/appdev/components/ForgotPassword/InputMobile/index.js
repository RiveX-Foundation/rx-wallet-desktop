import React, { Component } from 'react';
import { Input, Radio, Icon, Tooltip } from 'antd';
import { observer, inject } from 'mobx-react';
import intl from 'react-intl-universal';

import './index.less';
@inject(stores => ({
  setMobile: mobile => stores.userRegistration.setMobile(mobile),
  language: stores.languageIntl.language
}))

@observer
class InputMobile extends Component {
  state = {
    mobilevalue : ""
  }

  inputChanged = e => {
    this.setState({ mobilevalue : e.target.value }, () => {
      this.props.setMobile(this.state.mobilevalue);
    });
  }

  render() {
    return (
      <div className="textc">
        <h1 className="mneCom-h1">{intl.get('Mnemonic.InputPwd.createAWANWallet')}</h1>
        <div className="mne-input">
          <p className="pwdTitle">{intl.get('Mnemonic.InputPwd.confirmPassword')}:</p>
          <Input id="mobile" onChange={this.inputChanged} />
        </div>
      </div>
    );
  }
}

export default InputMobile;