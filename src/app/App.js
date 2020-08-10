import React, { Component } from "react";
import { render } from "react-dom";
import { Provider } from "mobx-react";
//import { message } from 'antd';
import { AppContainer } from "react-hot-loader";
import intl from "react-intl-universal";

//import './global.less';
import Router from "./Routes";
import stores from "./stores";
import locales from "./locales";
import { initEmitterHandler, regEmitterHandler } from "utils/helper";

class App extends Component {
  constructor(props) {
    super(props);
    this.changeLanguage(stores.languageIntl.getLanguage());
    initEmitterHandler();

    /*
    let id = setInterval(async () => {
      let ready = await isSdkReady();
      if (ready) {
        stores.session.initChainId();
        stores.session.initSettings();
        stores.portfolio.updateCoinPrice();
        stores.wanAddress.getUserAccountFromDB();
        clearInterval(id);
      }
    }, 1000);
    */
  }

  componentDidMount() {
    regEmitterHandler("language", (val) => {
      this.changeLanguage(val);
    });

    /*

    regEmitterHandler('uiAction', action => {
      if (action === 'lockWallet' && stores.session.auth === true) {
        wand.request('wallet_lock', null, (err, val) => {
          if (err) {
            console.log('Lock failed ', err)
            return
          }
          stores.session.setAuth(false);
        })
      }
    });


    regEmitterHandler('network', net => {
      wand.request('wallet_lock', null, (err, val) => {
        if (err) {
          console.log('Lock failed ', err)
          return
        }
        stores.session.setAuth(false);
        stores.session.setChainId(net.includes('main') ? 1 : 3);
        stores.wanAddress.updateAddress(['ledger', 'trzeor']);
        stores.wanAddress.updateTransHistory(true);
      })
    });

    regEmitterHandler('keyfilepath', data => {
      stores.wanAddress.addKeyStoreAddr(data);
    })
    */
  }

  changeLanguage = (lan) => {
    intl
      .init({
        currentLocale: lan,
        locales,
      })
      .then(() => {
        stores.languageIntl.setLanguage(lan);
      });
  };

  render() {
    return (
      <AppContainer>
        <Provider {...stores}>
          <Router />
        </Provider>
      </AppContainer>
    );
  }
}

render(<App />, document.getElementById("root"));

if (module.hot && false && false) {
  module.hot.accept("./Routes", () => {
    const NextApp = require("./Routes").default;
    render(<NextApp />, document.getElementById("root"));
  });
}
