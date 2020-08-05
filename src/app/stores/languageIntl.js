import { action, computed, observable } from "mobx";
import intl from "react-intl-universal";

class LanguageIntl {
  @observable language = "en_US";
  @observable title = "Portfolio.portfolio";

  constructor() {
    this.loadLanguageCode();
  }

  @computed get pageTitle() {
    return self.language && intl.get(self.title);
  }

  @computed get transColumns() {
    return (
      self.language && [
        {
          title: intl.get("TransHistory.time"),
          dataIndex: "time",
          key: "time",
        },
        {
          title: intl.get("TransHistory.from"),
          dataIndex: "from",
          key: "from",
        },
        {
          title: intl.get("TransHistory.to"),
          dataIndex: "to",
          key: "to",
        },
        {
          title: intl.get("TransHistory.value"),
          dataIndex: "value",
          key: "value",
        },
        {
          title: intl.get("TransHistory.status"),
          dataIndex: "status",
          key: "status",
        },
      ]
    );
  }

  @computed get stakingColumns() {
    return (
      self.language && [
        {
          title: intl.get("TransHistory.time"),
          dataIndex: "time",
          key: "time",
        },
        {
          title: intl.get("staking.table.type"),
          dataIndex: "annotate",
          key: "annotate",
        },
        {
          title: intl.get("TransHistory.from"),
          dataIndex: "from",
          key: "from",
        },
        {
          title: intl.get("staking.table.validator"),
          dataIndex: "validator",
          key: "validator",
        },
        {
          title: intl.get("TransHistory.value"),
          dataIndex: "stakeAmount",
          key: "stakeAmount",
        },
        {
          title: intl.get("TransHistory.status"),
          dataIndex: "status",
          key: "status",
        },
      ]
    );
  }

  @computed get validatorColumns() {
    return (
      self.language && [
        {
          title: intl.get("staking.table.myAccount"),
        },
        {
          title: intl.get("staking.table.myStake"),
        },
        {
          title: "",
        },
        {
          title: intl.get("staking.table.validator"),
        },
        {
          title: "",
        },
        {
          title: intl.get("staking.table.distributedReward"),
        },
        {
          title: intl.get("staking.table.modifyStake"),
        },
      ]
    );
  }

  @computed get sidebarColumns() {
    return (
      self.language && [
        /*
            {
              title: intl.get('menuConfig.portfolio'),
              step: '1',
              key: '/',
              icon: 'user'
            },
            */
        {
          title: intl.get("menuConfig.wallet"),
          step: "1",
          key: "/",
          icon: "wallet",
          iconpath: "../../static/image/icon/wallet.png",
          children: [
            {
              title: intl.get("menuConfig.basicwallet"),
              key: "/basicwallet",
              icon: "wallet",
            },
            {
              title: intl.get("menuConfig.sharedwallet"),
              key: "/sharedwallet",
              icon: "wallet",
            },
            {
              title: intl.get("menuConfig.hardwarewallet"),
              key: "/hardwarewallet",
              icon: "wallet",
            },
          ],
        },
        /*,
            {
              title: intl.get('menuConfig.hardwareWallet'),
              step: '1',
              key: '/hardwareWallet',
              icon: 'usb',
              iconpath: '../../static/image/icon/wallet.png',
              children: [
                {
                  title: intl.get('menuConfig.ledger'),
                  key: '/ledger',
                  icon: 'block'
                },
                // {
                //   title: intl.get('menuConfig.trezor'),
                //   key: '/trezor',
                //   icon: 'block'
                // }
              ]
            },
            {
              title: intl.get('menuConfig.galaxyPos'),
              step: '1',
              key: '/staking',
              icon: 'pie-chart',
              iconpath: '../../static/image/icon/wallet.png',
              children: [
                {
                  title: intl.get('menuConfig.delegation'),
                  key: '/staking',
                  icon: 'block'
                },
              ]
            },*/
        {
          title: intl.get("menuConfig.settings"),
          step: "1",
          iconpath: "../../static/image/icon/wallet.png",
          key: "/settings",
          icon: "setting",
        },
      ]
    );
  }

  @computed get portfolioColumns() {
    return (
      self.language && [
        {
          title: intl.get("Portfolio.name"),
          dataIndex: "name",
          key: "name",
        },
        {
          title: intl.get("Portfolio.price"),
          dataIndex: "price",
          key: "price",
        },
        {
          title: intl.get("Portfolio.balance"),
          dataIndex: "balance",
          key: "balance",
        },
        {
          title: intl.get("Portfolio.value"),
          dataIndex: "value",
          key: "value",
        },
        {
          title: intl.get("Portfolio.portfolioUppercase"),
          dataIndex: "portfolio",
          key: "portfolio",
        },
      ]
    );
  }

  @computed get selectAddrColumns() {
    return (
      self.language && [
        { title: intl.get("HwWallet.Connect.address"), dataIndex: "address" },
        { title: intl.get("HwWallet.Connect.balance"), dataIndex: "balance" },
      ]
    );
  }

  @computed get settingsColumns() {
    return (
      self.language && [
        {
          title: intl.get("Settings.config"),
          key: "config",
        },
        {
          title: intl.get("Settings.backup"),
          key: "backup",
        },
        {
          title: intl.get("Settings.restore"),
          key: "restore",
        },
      ]
    );
  }

  @action loadLanguageCode() {
    if (
      localStorage.getItem("language") == "" ||
      localStorage.getItem("language") == null
    ) {
      this.language = "en_US";
      localStorage.setItem("language", "en_US");
    } else {
      //this.setIsLogin(true);
      this.language = localStorage.getItem("language");
      if (this.language == "en") {
        localStorage.setItem("language", "en_US");
        this.language = "en_US";
      }
    }
  }

  @action setLanguage(language) {
    if (language == "en") language = "en_US";
    self.language = language;
    localStorage.setItem("language", language);
  }

  @action getLanguage() {
    if (self.language == "en") self.language = "en_US";
    return self.language;
  }

  @action changeTitle(newTitle) {
    self.title = newTitle;
  }

  @action setTitle(newTitle) {
    self.title = newTitle;
  }

  getTitle() {
    return self.title;
  }
}

const self = new LanguageIntl();
export default self;
