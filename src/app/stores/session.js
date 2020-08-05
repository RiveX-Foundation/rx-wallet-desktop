import { action, observable } from "mobx";

const os = require("os");

class Session {
  @observable IsLogin = false;
  @observable hasMnemonicOrNot = false;
  @observable hasUseAcc = false;
  @observable UserAccountExist = false;
  @observable RequestSignIn = false;
  @observable RequestForgotPassword = false;
  @observable IsShowWalletListing = true;

  constructor() {
    //super();
    //this.getMnemonic();
    this.getUserAcc();
  }

  @action setHasAcc(val) {
    this.hasUseAcc = val;
  }

  @action setIsShowWalletListing(val) {
    this.IsShowWalletListing = val;
  }

  @action setIsLogin(val) {
    this.IsLogin = val;
  }

  @action setRequestSignIn(val) {
    this.RequestSignIn = val;
  }

  @action setRequestForgotPassword(val) {
    this.RequestForgotPassword = val;
  }

  @action setUserAccountExist(val) {
    this.UserAccountExist = val;
  }

  @action logout() {
    localStorage.setItem("user", "");
    this.setIsLogin(false);
  }

  @action getMnemonic() {
    return new Promise((resolve, reject) => {
      wand.request("phrase_has", null, (err, val) => {
        if (!err) {
          self.hasMnemonicOrNot = val;
          resolve(val);
        } else {
          self.hasMnemonicOrNot = false;
          resolve(false);
        }
      });
    });
  }

  @action getUserAcc() {
    if (
      localStorage.getItem("registeredbefore") == "" ||
      localStorage.getItem("registeredbefore") == null
    ) {
      this.UserAccountExist = false;
    } else {
      //this.setIsLogin(true);
      this.UserAccountExist = true;
    }
    /*
        return new Promise((resolve, reject) => {
          wand.request('phrase_has', null, (err, val) => {
            if (!err) {
              resolve(val);
            } else {
              self.hasMnemonicOrNot = false;
              resolve(false);
            }
          });
        })
        */
  }

  /*
    @observable chainId = 1;
    @observable auth = false;
    @observable settings = {
      reinput_pwd: false,
      staking_advance: false,
    };

    @action setChainId(id) {
      self.chainId = id;
    }


    @action initChainId() {
      getChainId().then((chainId) => {
        self.chainId = chainId;
        console.log('Chain ID:', chainId);
      });
    }

    @action setMnemonicStatus(status) {
      self.hasMnemonicOrNot = status;
    }

    @action setAuth(val) {
      self.auth = val;
    }

    @action initSettings() {
      wand.request('setting_get', { keys: ['settings'] }, (err, ret) => {
        if(err) {
          console.log(`err: ${JSON.stringify(err)}`);
          return;
        };
        self.settings = ret[0];
        console.log('Setting:', self.settings);
      })
    }

    @action updateSettings(newValue) {
      let obj = self.settings;
      wand.request('setting_set', { settings: newValue }, (err, ret) => {
        if(err) return;
        if(ret) {
          self.settings = Object.assign(obj, newValue);
        }
      })
    }
    */
}

const self = new Session();
export default self;
