import React, {Component} from 'react';
import {Button, Input, Modal, Radio} from 'antd';
import {inject, observer} from 'mobx-react';
import intl from 'react-intl-universal';
import {createNotification} from 'utils/helper';
import unlock from 'static/image/graphic/lockunlock01.png';
import lock from 'static/image/graphic/lockunlock02.png';
import './index.less';

var bcrypt = require('bcryptjs');
const {currency} = require('../../../../../config/common/currency');
const {TextArea} = Input;
var QRCode = require('qrcode.react');
const base32 = require('hi-base32');
const speakeasy = require("speakeasy");

@inject(stores => ({
    mobile: stores.userRegistration.mobile,
    update2FA: info => stores.setting.update2FA(info),
    language: stores.languageIntl.language,
    twoFAType: stores.userRegistration.twoFAType,
    twoFAPassword: stores.userRegistration.twoFAPassword,
    setPassword: password => stores.walletStore.setPassword(password),
    twoFAPassword: stores.userRegistration.twoFAPassword,
    googleAuthKey: stores.walletStore.googleAuthKey,
    setCurrent: current => stores.walletStore.setCurrent(current),
    decrypt: text => stores.walletStore.decrypt(text)
}))

@observer
class Security extends Component {

    inputEl1 = null;

    state = {
        value: "password",
        password: "",
        passwordconfirm: "",
        currentpassword: "",
        googleAuthKey: "",
        removemodalvisible: false,
        mfaenabled: {display: "none"},
        mfa: ""
    }

    componentDidMount() {
        if (localStorage.getItem('twofasecret')) {
            this.setState({
                mfaenabled: {display: "block"},
                googleAuthKey: this.props.decrypt(localStorage.getItem('twofasecret'))
            });
        } else {
            this.setState({mfaenabled: {display: "none"}});
        }
        console.log(this.props.twoFAType);
        this.setState({
            value: this.props.twoFAType,
            password: this.props.twoFAPassword,
            googleAuthKey: localStorage.getItem('twofasecret')
        });
        console.log(this.state.googleAuthKey);
    }

    start2fa = () => {
        this.props.setCurrent('twofawarning');
    }

    inputMfaChanged = e => {
        this.setState({mfa: e.target.value});
    }

    _toHex = (key) => {
        return new Buffer(key, 'ascii').toString('hex');
    }


    disable2fa = () => {
        this.props.setCurrent('twofaremove');
    }

    onChange = e => {
        this.setState({value: e.target.value});
    }

    passwordChanged = e => {
        switch (e.target.id) {
            case "currentpassword":
                this.setState({currentpassword: e.target.value})
                break;

            case "newpassword":
                this.setState({password: e.target.value});
                break;

            case "newpasswordconfirm":
                this.setState({passwordconfirm: e.target.value});
                break;
        }

    }

    changePassword = () => {
        this.setState({removemodalvisible: true});
        if (localStorage.getItem('twofasecret')) {
            this.setState({
                mfaenabled: {display: "block"},
                googleAuthKey: this.props.decrypt(localStorage.getItem('twofasecret'))
            });
        } else {
            this.setState({mfaenabled: {display: "none"}});
        }
    }

    handleRemoveWalletOk = () => {
        this.setState({
            removemodalvisible: false
        });
        this.save();
    }

    handleCancel = () => {
        this.setState({
            removemodalvisible: false
        });
    }

    save = () => {
        if (localStorage.getItem('twofasecret') != null) {
            const secretAscii = base32.decode(this.state.googleAuthKey);
            bcrypt.compare(this.state.currentpassword, localStorage.getItem('password'), (err, res) => {
                if (res) {
                    const secretHex = this._toHex(secretAscii);
                    var authcode = speakeasy.totp({
                        secret: secretHex,
                        encoding: 'hex',
                        window: 1
                    });
                    if (authcode == this.state.mfa) {
                        if (this.state.password == this.state.passwordconfirm && this.state.password.length >= 6) {
                            bcrypt.hash(this.state.password, 10, (err, hash) => {
                                createNotification('success', 'Changed password, all wallets are deleted. The app will relaunch in 5 seconds.');
                                this.props.setPassword(hash);
                                localStorage.setItem('password', hash);
                                localStorage.setItem("wallets", "[]");
                                setTimeout(() => {
                                    wand.request('phrase_reset', null, () => {
                                    });
                                }, 5000);
                            });
                        } else {
                            createNotification('error', "Passwords don't match or are shorter than 6 characters.");
                            this.setState({password: "", currentpassword: "", passwordconfirm: ""});
                        }
                    } else {
                        createNotification('error', "Invalid Current Password");
                        this.setState({password: "", currentpassword: "", passwordconfirm: ""});
                    }
                } else {
                    createNotification('error', intl.get('Error.InvalidOTP'));
                    this.setState({password: "", currentpassword: "", passwordconfirm: ""});
                    this.setState({mfa: ""});
                }
            });
        } else {
            bcrypt.compare(this.state.currentpassword, localStorage.getItem('password'), (err, res) => {
                if (res) {
                    if (this.state.password == this.state.passwordconfirm && this.state.password.length >= 6) {
                        bcrypt.hash(this.state.password, 10, (err, hash) => {
                            createNotification('success', 'Changed password, all wallets are deleted. The app will relaunch in 5 seconds.');
                            this.props.setPassword(hash);
                            localStorage.setItem('password', hash);
                            localStorage.setItem("wallets", "[]");
                            setTimeout(() => {
                                wand.request('phrase_reset', null, () => {
                                });
                            }, 5000);
                        });
                    } else {
                        createNotification('error', "Passwords don't match or are shorter than 6 characters.");
                        this.setState({password: "", currentpassword: "", passwordconfirm: ""});
                    }
                } else {
                    createNotification('error', "Invalid Current Password");
                    this.setState({password: "", currentpassword: "", passwordconfirm: ""});
                }
            });
        }

    }

    render() {
        var totpurl = "otpauth://totp/RVXWallet?secret=" + this.state.googleAuthKey;
        var smstext = intl.get('Settings.2FASecurity.SMS');
        var smsdisabled = false;
        if (this.props.mobile == "") {
            smsdisabled = true;
        }

        return (
            <div className="currencypanel fadeInAnim">
                {/* <div className="title" ><span>{intl.get('Settings.2FASecurity')}</span></div>*/}
                <div className="centerpanel" style={{marginTop: "-50px"}}>
                    <div className="inputpanel">
                        <Radio.Group onChange={this.onChange} value={this.state.value}>
                            {
                                !smsdisabled &&
                                <div>
                                    <Radio value="sms">{smstext}</Radio>
                                    <br/><br/><br/>
                                </div>
                            }
                            <div>
                                {
                                    this.state.googleAuthKey == "" || this.state.googleAuthKey == null &&
                                    <React.Fragment>
                                        <div className="title" style={{marginTop: "30px", paddingLeft: "0px"}}><span
                                            className="lock">{intl.get('Settings.2FASecurity.Disabled')}</span></div>
                                        <img src={unlock} style={{width: "150px"}}/>
                                        <Button className="curvebutton"
                                                onClick={this.start2fa}>{intl.get('Settings.2FASecurity.Enable')}</Button>
                                        <div>
                                            <div className="title" style={{marginTop: "30px", paddingLeft: "0px"}}><span
                                                className="lock">{"Change password"}</span></div>
                                            <div className="panelwrapper borderradiusfull">
                                                <Input.Password
                                                    id="currentpassword"
                                                    value={this.state.currentpassword}
                                                    placeholder="Current password"
                                                    className="inputTransparent"
                                                    onChange={this.passwordChanged}/>
                                            </div>

                                            <div className="panelwrapper borderradiusfull">
                                                <Input.Password
                                                    id="newpassword"
                                                    value={this.state.password}
                                                    placeholder="New password"
                                                    className="inputTransparent"
                                                    onChange={this.passwordChanged}/>
                                            </div>

                                            <div className="panelwrapper borderradiusfull">
                                                <Input.Password
                                                    id="newpasswordconfirm"
                                                    value={this.state.passwordconfirm}
                                                    placeholder="Confirm password"
                                                    className="inputTransparent"
                                                    onChange={this.passwordChanged}/>
                                            </div>
                                            <div><Button className="curvebutton"
                                                         onClick={this.changePassword}>{"Change"}</Button></div>
                                            <br/>
                                        </div>
                                    </React.Fragment>
                                }
                                {
                                    this.state.googleAuthKey != null &&
                                    <React.Fragment>
                                        <div className="title" style={{marginTop: "30px", paddingLeft: "0px"}}><span
                                            className="lock">{intl.get('Settings.2FASecurity.Enabled')}</span></div>
                                        <img src={lock} style={{width: "150px"}}/>
                                        <div><Button className="curvebutton"
                                                     onClick={this.disable2fa}>{intl.get('Settings.2FASecurity.Disable')}</Button>
                                        </div>
                                        <div>
                                            <div className="panelwrapper borderradiusfull">
                                                <Input.Password
                                                    id="name"
                                                    value={this.state.password}
                                                    placeholder={this.state.password}
                                                    className="inputTransparent"
                                                    onChange={this.passwordChanged}/>
                                            </div>
                                            <div><Button className="curvebutton"
                                                         onClick={this.changePassword}>{intl.get('Common.Save')}</Button>
                                            </div>
                                            <br/>
                                        </div>
                                    </React.Fragment>
                                }
                                <br/><br/>
                            </div>

                        </Radio.Group>
                    </div>
                    <Modal
                        title=""
                        visible={this.state.removemodalvisible}
                        onOk={this.handleRemoveWalletOk}
                        onCancel={this.handleCancel}
                    >
                        <p className='modalcontent'>{"Warning! Changing the password will delete all the wallets!"}</p>
                        <div className="inputpanel">
                            <center>
                                <div className="panelwrapper borderradiusfull" style={this.state.mfaenabled}>
                                    <Input id="mfa" style={this.state.mfaenabled} value={this.state.mfa}
                                           placeholder={intl.get('Auth.EnterOTP')} className="inputTransparent2"
                                           onChange={this.inputMfaChanged}/>
                                </div>
                            </center>
                        </div>
                    </Modal>
                </div>
            </div>
        );
    }
}

export default Security;