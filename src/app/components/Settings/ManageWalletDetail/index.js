import React, {Component} from 'react';
import {Input, Modal} from 'antd';
import {inject, observer} from 'mobx-react';
import intl from 'react-intl-universal';
import buttonback from 'static/image/icon/back.png';
import buttonedit from 'static/image/icon/edit.png';
import buttonmultisigtick from 'static/image/icon/multisigtick.png';
import buttonnext from 'static/image/icon/next.png';
import './index.less';
import {createNotification} from '../../../utils/helper';

var bcrypt = require('bcryptjs');
const base32 = require('hi-base32');
const speakeasy = require("speakeasy");

@inject(stores => ({
    setCurrent: current => stores.setting.setCurrent(current),
    setSelectedPrivateAddress: privateaddress => stores.setting.setSelectedPrivateAddress(privateaddress),
    selectedwalletaddress: stores.setting.selectedwalletaddress,
    removeWallet: publicaddress => stores.walletStore.removeWallet(publicaddress),
    changeWalletName: (publicaddress, newwalletname) => stores.walletStore.changeWalletName(publicaddress, newwalletname),
    walletlist: stores.walletStore.walletlist,
    language: stores.languageIntl.language,
    getTotalWorth: wallet => stores.walletStore.getTotalWorth(wallet),
    currencycode: stores.setting.currencycode,
    decrypt: text => stores.walletStore.decrypt(text),
    removeBackendWallet: password => stores.walletStore.removeBackendWallet(password)
}))

@observer
class ManageWalletDetail extends Component {
    state = {
        removemodalvisible: false,
        exportprivatekeymodalvisible: false,
        exportmnemonicmodalvisible: false,
        changewalletnamemodalvisible: false,
        selectedwalletaddress: "",
        selectedwalletname: "",
        newwalletname: "",
        exportedseedphrase: "",
        tokenliststyle: "autolisthide",
        tokenoriginallist: [],
        tokenfilterlist: [],
        temporarytokenname: "",
        temporarytokencode: "/CA+8)D=@qW_3n=",
        temporarypublicaddress: "",
        mnemonicvisibility: {display: "none"},
        pkeyvisibility: {display: "none"},
        password: "",
        mnemonicpass: "",
        mfaenabled: {display: "none"},
        mfa: "",
        googleAuthKey: ""
    }

    componentDidMount() {
        var wallet = this.props.walletlist.find(x => x.publicaddress == this.props.selectedwalletaddress);
        this.setState({
            mnemonicpass: localStorage.getItem('password')
        });
        this.setState({
            tokenoriginallist: wallet.tokenassetlist,
            tokenfilterlist: wallet.tokenassetlist,
        })
    }

    inputPasswordChanged = e => {
        this.setState({password: e.target.value});
        this.setState({
            mnemonicpass: localStorage.getItem('password')
        });
    }

    inputChanged = e => {
        this.setState({newwalletname: e.target.value});
    }
    inputMfaChanged = e => {
        this.setState({mfa: e.target.value});
    }
    getRate = async () => {
        console.log("asyncing rate");
        await this.props.getConvertRate(this.props.selectedTokenAsset.AssetCode, this.props.currencycode);
    }

    validatePasswords = () => {
        if (localStorage.getItem('twofasecret') != null) {
            const secretAscii = base32.decode(this.state.googleAuthKey);
            bcrypt.compare(this.state.password, this.state.mnemonicpass, (err, res) => {
                if (res) {
                    const secretHex = this._toHex(secretAscii);
                    var authcode = speakeasy.totp.verifyDelta({
                        secret: secretHex,
                        encoding: 'hex',
                        token:this.state.mfa,
                        window: 3
                    });
                    if (authcode) {
                        console.log("passwords match");
                        createNotification('success', 'Valid password');
                        this.setState({mnemonicvisibility: {display: "block"}});
                        this.setState({pkeyvisibility: {display: "block"}});
                        this.setState({password: ""});
                        this.setState({mfa: ""});
                    } else {
                        createNotification('error', intl.get('Error.InvalidOTP'));
                        this.setState({mfa: ""});
                        this.setState({password: ""});
                    }
                } else {
                    console.log("passwords don't match");
                    createNotification('error', intl.get('Error.Userwrongpassword'));
                    this.setState({mnemonicvisibility: {display: "none"}});
                    this.setState({pkeyvisibility: {display: "none"}});
                    this.setState({password: ""});
                }
            });
        } else {
            bcrypt.compare(this.state.password, this.state.mnemonicpass, (err, res) => {
                if (res) {
                    createNotification('success', 'Valid password');
                    this.setState({mnemonicvisibility: {display: "block"}});
                    this.setState({pkeyvisibility: {display: "block"}});
                    this.setState({password: ""});

                } else {
                    createNotification('error', intl.get('Error.Userwrongpassword'));
                    this.setState({mnemonicvisibility: {display: "none"}});
                    this.setState({pkeyvisibility: {display: "none"}});
                    this.setState({password: ""});
                }
            });
        }

    }
    _toHex = (key) => {
        return new Buffer(key, 'ascii').toString('hex');
    }


    validatePasswordsPkey = () => {
        if (localStorage.getItem('twofasecret') != null) {
            const secretAscii = base32.decode(this.state.googleAuthKey);
            bcrypt.compare(this.state.password, this.state.mnemonicpass, (err, res) => {
                if (res) {
                    const secretHex = this._toHex(secretAscii);
                    var authcode = speakeasy.totp.verifyDelta({
                        secret: secretHex,
                        encoding: 'hex',
                        token:this.state.mfa,
                        window: 3
                    });
                    if (authcode ) {
                        console.log("passwords match");
                        createNotification('success', 'Valid password');
                        this.setState({pkeyvisibility: {display: "block"}});
                        if (this.state.temporarypublicaddress == "") {
                            return;
                        }
                        this.setState({
                            exportprivatekeymodalvisible: false
                        }, () => {
                            this.props.setCurrent('exportprivatekey');
                        });
                        this.setState({password: ""});
                    } else {
                        createNotification('error', intl.get('Error.InvalidOTP'));
                        this.setState({password: ""});
                        this.setState({mfa: ""});
                    }
                } else {
                    console.log("passwords don't match");
                    createNotification('error', intl.get('Error.Userwrongpassword'));
                    this.setState({pkeyvisibility: {display: "none"}});
                    this.setState({password: ""});
                    this.setState({mfa: ""});
                }
            });
        } else {
            bcrypt.compare(this.state.password, this.state.mnemonicpass, (err, res) => {
                if (res) {
                    console.log("passwords match");
                    createNotification('success', 'Valid password');
                    this.setState({pkeyvisibility: {display: "block"}});
                    if (this.state.temporarypublicaddress == "") {
                        return;
                    }

                    this.setState({
                        exportprivatekeymodalvisible: false
                    }, () => {
                        this.props.setCurrent('exportprivatekey');
                    });
                    this.setState({password: ""});
                } else {
                    console.log("passwords don't match");
                    createNotification('error', intl.get('Error.Userwrongpassword'));
                    this.setState({pkeyvisibility: {display: "none"}});
                    this.setState({password: ""});
                }
            });
        }

    }

    validatePasswordsRemoval = () => {
        if (localStorage.getItem('twofasecret') != null) {
            const secretAscii = base32.decode(this.state.googleAuthKey);
            bcrypt.compare(this.state.password, this.state.mnemonicpass, (err, res) => {
                if (res) {
                    const secretHex = this._toHex(secretAscii);
                    var authcode = speakeasy.totp.verifyDelta({
                        secret: secretHex,
                        encoding: 'hex',
                        token:this.state.mfa,
                        window: 3
                    });
                    if (authcode ) {
                        var wallets = JSON.parse(localStorage.getItem("wallets"));
                        if (wallets[0].publicaddress == this.state.selectedwalletaddress) {
                            createNotification('success', 'Removed dApp wallet! The app will relaunch in 5 seconds');
                            this.setState({
                                removemodalvisible: false
                            });
                            this.props.removeWallet(this.state.selectedwalletaddress);
                            
                            wand.request('account_deleteall', { password: this.state.password }, function(err, val) {
                              if (err) { 
                                  console.log('error printed inside callback: ', err)
                                  return
                              }
                              console.log("deleted all");
                          }.bind(this));
                            setTimeout(() => {
                              wand.request('phrase_reset', null, () => {
                              });
                            }, 5000);
                            this.back();
                        } else {
                            createNotification('success', 'Successfully removed the wallet!');
                            this.props.removeWallet(this.state.selectedwalletaddress);
                            this.setState({password: ""});
                            this.back();
                        }
                    } else {
                        createNotification('error', intl.get('Error.InvalidOTP'));
                        this.setState({password: ""});
                        this.setState({mfa: ""});
                    }

                } else {
                    console.log("passwords don't match");
                    createNotification('error', intl.get('Error.Userwrongpassword'));
                    this.setState({password: ""});
                }
            });
        } else {
            bcrypt.compare(this.state.password, this.state.mnemonicpass, (err, res) => {
                if (res) {
                    var wallets = JSON.parse(localStorage.getItem("wallets"));
                    if (wallets[0].publicaddress == this.state.selectedwalletaddress) {
                        createNotification('success', 'Removed dApp wallet! The app will relaunch in 5 seconds');
                        this.setState({
                            removemodalvisible: false
                        });
                        this.props.removeWallet(this.state.selectedwalletaddress);
                        this.back();
                        wand.request('account_deleteall', { password: this.state.password }, function(err, val) {
                          if (err) { 
                              console.log('error printed inside callback: ', err)
                              return
                          }
                          console.log("deleted all");
                      }.bind(this));
                        setTimeout(() => {
                          wand.request('phrase_reset', null, () => {
                          });
                        }, 5000);
                        this.setState({password: ""});
                    } else {
                        createNotification('success', 'Successfully removed the wallet!');
                        this.props.removeWallet(this.state.selectedwalletaddress);
                        this.setState({password: ""});
                        this.back();
                    }
                } else {
                    console.log("passwords don't match");
                    createNotification('error', intl.get('Error.Userwrongpassword'));
                    this.setState({password: ""});
                }
            });
        }
    }

    exportprivatekey = e => {
        const walletaddress = e.currentTarget.getAttribute('data-publicaddress');
        if (localStorage.getItem('twofasecret')) {
            this.setState({
                mfaenabled: {display: "block"},
                googleAuthKey: this.props.decrypt(localStorage.getItem('twofasecret'))
            });
        } else {
            this.setState({mfaenabled: {display: "none"}});
        }
        this.setState({selectedwalletaddress: walletaddress, exportprivatekeymodalvisible: true});
    }

    exportmnemonic = e => {
        const wallet = this.props.walletlist.find(x => x.publicaddress == this.props.selectedwalletaddress);
        if (localStorage.getItem('twofasecret') != null) {
            this.setState({
                mfaenabled: {display: "block"},
                googleAuthKey: this.props.decrypt(localStorage.getItem('twofasecret'))
            });
        } else {
            this.setState({mfaenabled: {display: "none"}});
        }
        this.setState({exportedseedphrase: this.props.decrypt(wallet.seedphase)});
        //console.log("EXPORT MNEMONIC: "+wallet.seedphase);
        const walletaddress = e.currentTarget.getAttribute('data-publicaddress');
        this.setState({selectedwalletaddress: walletaddress, exportmnemonicmodalvisible: true});
    }

    removewallet = e => {
        const walletaddress = e.currentTarget.getAttribute('data-publicaddress');
        if (localStorage.getItem('twofasecret')) {
            this.setState({
                mfaenabled: {display: "block"},
                googleAuthKey: this.props.decrypt(localStorage.getItem('twofasecret'))
            });
        } else {
            this.setState({mfaenabled: {display: "none"}});
        }
        const walletname = e.currentTarget.getAttribute('data-walletname');
        this.setState({selectedwalletaddress: walletaddress, selectedwalletname: walletname, removemodalvisible: true});
    }

    editwalletname = e => {
        this.setState({changewalletnamemodalvisible: true});
    }

    handleRemoveWalletOk = () => {
        this.setState({
            removemodalvisible: false
        });
        this.props.removeWallet(this.state.selectedwalletaddress);
        this.back();
    }

    handleExportPrivateKeyOk = () => {

        if (this.state.temporarypublicaddress == "") {
            return;
        }

        this.setState({
            exportprivatekeymodalvisible: false
        }, () => {
            this.props.setCurrent('exportprivatekey');
        });
    }

    handleExportMnemonicOk = () => {
        this.setState({
            exportmnemonicmodalvisible: false
        });
    }

    handleCancel = () => {
        this.setState({
            removemodalvisible: false,
            exportprivatekeymodalvisible: false,
            changewalletnamemodalvisible: false,
            exportmnemonicmodalvisible: false,
            password: "",
            mnemonicvisibility: {display: "none"},
            pkeyvisibility: {display: "none"}
        });
    }

    handleChangeWalletNameOk = () => {
        this.setState({
            changewalletnamemodalvisible: false
        }, () => {
            this.props.changeWalletName(this.props.selectedwalletaddress, this.state.newwalletname);
        });
    }

    handleFocus = e => {
        e.target.select();
    }

    back = () => {
        this.props.setCurrent("managewalletlist");
    }

    onKeyDownChangeName = (e) => {
        if (e.key === 'Enter') {
            this.handleChangeWalletNameOk();
        }
    }

    showlist = e => {
        e.preventDefault();
        e.stopPropagation();

        //if(e.currentTarget.getAttribute('data-networktype') == "eth"){
        this.setState({tokenliststyle: "autolist"});
        //}
    }

    hidelist = e => {
        //e.preventDefault();
        //e.stopPropagation();
        this.setState({tokenliststyle: "autolisthide"});
    }

    selectToken = e => {
        this.setState({
            modalvisible: true,
            temporarytokenname: e.currentTarget.getAttribute('data-name'),
            temporarytokencode: e.currentTarget.getAttribute('data-code'),
            temporarypublicaddress: e.currentTarget.getAttribute('data-publicaddress')
        });

        this.props.setSelectedPrivateAddress(e.currentTarget.getAttribute('data-privateaddress'));
    }

    setfilterlist = e => {
        var newfilterlist = [];

        this.state.tokenoriginallist.forEach(function (item, index) {
            if (item.Name.toLowerCase().includes(e.target.value.toLowerCase())) {
                newfilterlist.push(item);
            }
        });
        this.setState({tokenfilterlist: newfilterlist});
    }

    render() {

        var wallet = this.props.walletlist.find(x => x.publicaddress == this.props.selectedwalletaddress);
        if (wallet == null) {
            wallet = {
                walletname: "null",
                publicaddress: "null",
                wallettype: "null",
                totalsignatures: "null",
                totalowners: "null",
                holders: "null"

            }
        }
        const {mnemonicvisibility} = this.state;
        const {pkeyvisibility} = this.state;
        return (
            <div className="managewalletdetailpanel fadeInAnim">
                <div className="centerpanel">
                    <div className="">
                        <div className="title"><span><img onClick={this.back} width="20px"
                                                          src={buttonback}/></span><span
                            style={{marginLeft: "10px"}}>{intl.get('Settings.ManageWallets')}</span></div>

                        <div className="panelwrapper borderradiusfull spacebetween" style={{marginBottom: "10px"}}>
                            <div className="panellabel">{wallet.walletname}</div>
                            <div className="panelvalue"><img onClick={this.editwalletname} style={{cursor: "pointer"}}
                                                             width="20px" src={buttonedit}/></div>
                        </div>

                        {
                            wallet.holders != null &&
                            wallet.wallettype == "sharedwallet" &&
                            <div className="spacebetween" style={{width: "600px"}}>

                                <div className="panelwrapper borderradiusfull signerspanel"
                                     style={{marginBottom: "10px", padding: "10px"}}>
                                    <div
                                        className="panellabel coplayertitle">{intl.get('Wallet.CoPlayers')} {wallet.totalsignatures}-{wallet.totalowners}</div>

                                    {

                                        wallet.wallettype == "sharedwallet" &&
                                        wallet.holders.map(function (item, i) {
                                            return (
                                                <div key={i} className="panellabel logname"><span
                                                    className="multisigtick"><img
                                                    src={buttonmultisigtick}/></span>{item.UserName}</div>
                                            )
                                        })
                                    }
                                </div>
                            </div>
                        }


                        {

                            wallet.wallettype != "sharedwallet" &&
                            <React.Fragment>
                                <div onClick={this.exportprivatekey}
                                     className="panelwrapper borderradiusfull spacebetween"
                                     style={{marginBottom: "10px"}}>
                                    <div className="panellabel">{intl.get('Settings.ExportPrivateKey')}</div>
                                    <div className="panelvalue"><img style={{cursor: "pointer"}} width="20px"
                                                                     src={buttonnext}/></div>
                                </div>
                                <div onClick={this.exportmnemonic}
                                     className="panelwrapper borderradiusfull spacebetween"
                                     style={{marginBottom: "30px"}}>
                                    <div className="panellabel">{intl.get('Settings.ExportMnemonic')}</div>
                                    <div className="panelvalue"><img style={{cursor: "pointer"}} width="20px"
                                                                     src={buttonnext}/></div>
                                </div>
                            </React.Fragment>
                        }


                        <div onClick={this.removewallet} data-walletname={wallet.walletname}
                             data-publicaddress={wallet.publicaddress}
                             className="panelwrapper borderradiusfull spacebetween removepanelcolor"
                             style={{marginBottom: "10px"}}>
                            <div className="panellabel">{intl.get('Modal.RemoveWallet')}</div>
                            <div className="panelvalue"></div>
                        </div>

                        <Modal
                            title=""
                            visible={this.state.removemodalvisible}
                            onOk={this.validatePasswordsRemoval}
                            onCancel={this.handleCancel}
                            okText = {intl.get('ValidatorRegister.acceptAgency')}
                            cancelText= {intl.get('ValidatorRegister.notAcceptAgency')}
                        >
                            <p className='modalcontent'>{intl.get('Modal.AreYouSureRemoveWallet').replace('{walletname}', this.state.selectedwalletname)}</p>
                            <div className="inputpanel">
                                <center>
                                    <div className="panelwrapper borderradiusfull">
                                        <Input id="mfa" style={this.state.mfaenabled} value={this.state.mfa}
                                               placeholder={intl.get('Auth.EnterOTP')} className="inputTransparent2"
                                               onChange={this.inputMfaChanged}/>
                                        <Input.Password id="password" style={{marginLeft: "-40px", paddingLeft: "0px"}}
                                                        value={this.state.password}
                                                        placeholder={intl.get('Register.Password')}
                                                        className="inputTransparent"
                                                        onChange={this.inputPasswordChanged}/>
                                    </div>
                                </center>
                            </div>
                        </Modal>

                        <Modal
                            title=""
                            visible={this.state.exportprivatekeymodalvisible}
                            onOk={this.validatePasswordsPkey}
                            onCancel={this.handleCancel}
                        >
                            <div className="pheader">{intl.get('Info.Warning')}</div>
                            <div>
                                <div className='pmodalcontent'>{intl.get('Settings.ExportPrivateKey.Msg1')}</div>
                                <div className='pmodalcontent'>{intl.get('Settings.ExportPrivateKey.Msg2')}</div>
                                <div className='pmodalcontent'>{intl.get('Settings.ExportPrivateKey.Msg3')}</div>

                                <div
                                    className='pmodalcontent'>{intl.get('Settings.ExportPrivateKey.SelectTokenAsset')}</div>
                                <center>
                                    <div className="inputwrapper" style={{width: "50%",alignItems:"center"}}>
                                        <div className="panelwrapper">
                                            <Input value={this.state.temporarytokenname}
                                                   placeholder={intl.get('Settings.Token')} onClick={this.showlist}
                                                   onBlur={this.hidelist} onFocus={this.showlist}
                                                   className="inputTransparent" onChange={this.setfilterlist}/>
                                            {
                                                this.state.tokenfilterlist.length > 0 &&
                                                <div className={this.state.tokenliststyle}>
                                                    <ul>
                                                        {
                                                            this.state.tokenfilterlist.map((item, index) =>
                                                                <li key={index} data-code={item.AssetCode}
                                                                    data-name={item.Name}
                                                                    data-privateaddress={item.PrivateAddress}
                                                                    data-publicaddress={item.PublicAddress}
                                                                    onMouseDown={this.selectToken}>{item.Name}</li>
                                                            )
                                                        }
                                                    </ul>
                                                </div>
                                            }

                                            {this.state.tokenfilterlist.length == 0 &&
                                            <div className="noResult">{intl.get('Common.NoData')}</div>
                                            }
                                        </div>
                                        <div className="inputpanel">

                                            <div className="panelwrapper borderradiusfull">
                                                <Input id="mfa" style={this.state.mfaenabled} value={this.state.mfa}
                                                       placeholder={intl.get('Auth.EnterOTP')}
                                                       className="inputTransparent" onChange={this.inputMfaChanged}/>
                                                <Input.Password id="password" style={{paddingLeft: "0px"}}
                                                                value={this.state.password}
                                                                placeholder={intl.get('Register.Password')}
                                                                className="inputTransparent"
                                                                onChange={this.inputPasswordChanged}/>

                                            </div>
                                        </div>
                                    </div>
                                </center>
                            </div>
                        </Modal>

                        <Modal
                            title=""
                            visible={this.state.exportmnemonicmodalvisible}
                            onOk={this.validatePasswords}
                            onCancel={this.handleCancel}

                        >
                            <div className="pheader">{intl.get('Info.Warning')}</div>
                            <div>
                                <div className='pmodalcontent'>{intl.get('Settings.ExportMnemonic.Msg1')}</div>
                                <div className="inputpanel">
                                    <center>
                                        <div className="panelwrapper borderradiusfull">
                                            <Input id="mfa" style={this.state.mfaenabled} value={this.state.mfa}
                                                   placeholder={intl.get('Auth.EnterOTP')} className="inputTransparent2"
                                                   onChange={this.inputMfaChanged}/>
                                            <Input.Password id="password"
                                                            style={{marginLeft: "-40px", paddingLeft: "0px"}}
                                                            value={this.state.password}
                                                            placeholder={intl.get('Register.Password')}
                                                            className="inputTransparent"
                                                            onChange={this.inputPasswordChanged}/>
                                        </div>
                                    </center>
                                </div>
                                <div className='pmodalmnemonickey'
                                     style={mnemonicvisibility}>{this.state.exportedseedphrase}</div>
                            </div>
                        </Modal>

                        <Modal
                            title=""
                            visible={this.state.changewalletnamemodalvisible}
                            onOk={this.handleChangeWalletNameOk}
                            onCancel={this.handleCancel}
                            okText = {intl.get('ValidatorRegister.acceptAgency')}
                            cancelText= {intl.get('ValidatorRegister.notAcceptAgency')}
                        >
                             <div className="pheader">{intl.get('Settings.Walletrename')}</div>
                            <div className='pmodalcontent'> {intl.get('Settings.Newwalletname')}
                                <div className="panelwrapper borderradiusfull">
                                    <Input className="inputTransparent" onChange={this.inputChanged}
                                           onKeyDown={this.onKeyDownChangeName}/>
                                </div>
                            </div>
                        </Modal>

                    </div>
                </div>

                {
                    /*
                    <div>
                    <Button type="primary" onClick={this.basicwallet} >{intl.get('Wallet.BasicWallet')}</Button>
                    <Button type="primary" onClick={this.sharedwallet} >{intl.get('Wallet.SharedWallet')}</Button>
                    <Button type="primary" onClick={this.joinwallet} >{intl.get('Wallet.JoinWallet')}</Button>
                    <Button type="primary" onClick={this.importwallet} >{intl.get('Wallet.ImportWallet')}</Button>
                    <Button type="primary" onClick={this.trezor} >{intl.get('Wallet.Trezor')}</Button>
                    <Button type="primary" onClick={this.ledger} >{intl.get('Wallet.Ledger')}</Button>

                    <div className="steps-action">
                      <Button type="primary" onClick={this.back} >{intl.get('Common.Back')}</Button>
                    </div>
                  </div>
                  */
                }
            </div>
        );
    }
}

export default ManageWalletDetail;