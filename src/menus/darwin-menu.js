import path from "path";
import { APP_NAME, LANGUAGES } from "../../config/common";
import setting from "../utils/Settings";
import { app, shell } from "electron";
import { Windows } from "~/src/modules";

const platformAdapter = function (options) {
  if (process.platform in options) {
    return options[process.platform];
  } else if ("default" in options) {
    return options.default;
  }
  return null;
};

export default (i18n) => {
  const menu = [];

  // Mac OS menu
  const macMenu = {
    label: i18n.t("main.applicationMenu.app.label", { app: APP_NAME }),
    submenu: [
      {
        label: i18n.t("main.applicationMenu.app.about", { app: APP_NAME }),
        role: "about",
      },
      {
        label: i18n.t("main.applicationMenu.app.developer.label"),
        submenu: [
          {
            label: i18n.t("main.applicationMenu.app.developer.assets.label"),
            submenu: [
              {
                label: i18n.t(
                  "main.applicationMenu.app.developer.assets.wan.label"
                ),
                submenu: [
                  {
                    label: i18n.t(
                      "main.applicationMenu.app.developer.assets.wan.import"
                    ),
                    click: () => {
                      Windows.createModal("importKeyFile", {
                        width: 1200,
                        height: 800,
                        alwaysOnTop: true,
                      });
                    },
                  },
                ],
              },
            ],
          },
          { type: "separator" },
          {
            label: i18n.t("main.applicationMenu.app.developer.data.label"),
            submenu: [
              {
                label: i18n.t("main.applicationMenu.app.developer.data.db"),
                click: () => {
                  const dataDir = setting.userDataPath;
                  shell.showItemInFolder(path.join(dataDir, "Db"));
                },
              },
              {
                label: i18n.t("main.applicationMenu.app.developer.data.log"),
                click: () => {
                  const logDir = setting.appLogPath;
                  shell.showItemInFolder(logDir);
                },
              },
            ],
          },
          { type: "separator" },
          {
            label: i18n.t("main.applicationMenu.help.toggle"),
            accelerator: "Alt+CommandOrControl+I",
            role: "toggledevtools",
          },
        ],
      },
      { type: "separator" },
      {
        label: i18n.t("main.applicationMenu.app.services"),
        role: "services",
      },
      { type: "separator" },
      {
        label: i18n.t("main.applicationMenu.app.hide", { app: APP_NAME }),
        accelerator: "Command+H",
        role: "hide",
      },
      {
        label: i18n.t("main.applicationMenu.app.hideOthers"),
        accelerator: "Command+Alt+H",
        role: "hideothers",
      },
      {
        label: i18n.t("main.applicationMenu.app.showAll"),
        role: "unhide",
      },
      { type: "separator" },
      {
        label: i18n.t("main.applicationMenu.app.quit", { app: APP_NAME }),
        accelerator: "Command+Q",
        click() {
          app.quit();
        },
      },
    ],
  };
  menu.push(macMenu);

  // Edit menu
  const editMenu = {
    label: i18n.t("main.applicationMenu.edit.label"),
    submenu: [
      // {
      //     label: i18n.t('main.applicationMenu.edit.undo'),
      //     role: 'undo',
      // },
      // {
      //     label: i18n.t('main.applicationMenu.edit.redo'),
      //     role: 'redo',
      // },
      // { type: 'separator' },
      // {
      //     label: i18n.t('main.applicationMenu.edit.cut'),
      //     role: 'cut',
      // },
      {
        label: i18n.t("main.applicationMenu.edit.copy"),
        role: "copy",
      },
      {
        label: i18n.t("main.applicationMenu.edit.paste"),
        role: "paste",
      },
      {
        label: i18n.t("main.applicationMenu.edit.selectAll"),
        role: "selectall",
      },
    ],
  };

  menu.push(editMenu);

  // Setting menu
  const settingMenu = {
    label: i18n.t("main.applicationMenu.setting.label"),
    submenu: [
      // {
      /** TODO */
      // label: i18n.t('main.applicationMenu.setting.network.label'),
      // submenu: [
      // {
      //     label: i18n.t('main.applicationMenu.setting.network.main'),
      //     accelerator: 'Shift+CommandOrControl+M',
      //     checked: setting.network === 'main',
      //     type: 'radio',
      //     click: async (m) => {
      //         if (!setting.network.includes('main')) {
      //             menuFactoryService.networkMenu = m.menu
      //             const mainWin = Windows.getByType('main')
      //             mainWin.hide()
      //             Windows.createModal('changeNetwork', {
      //                 width: 1024 + 208,
      //                 height: 720,
      //                 alwaysOnTop: true
      //             })
      //         }
      //         return
      //     }
      // },
      // {
      //     label: i18n.t('main.applicationMenu.setting.network.test'),
      //     accelerator: 'Shift+CommandOrControl+P',
      //     checked: setting.network === 'testnet',
      //     type: 'radio',
      //     click: async (m) => {
      //         if (setting.network.includes('main')) {
      //             menuFactoryService.networkMenu = m.menu
      //             const mainWin = Windows.getByType('main')
      //             mainWin.hide()
      //             Windows.createModal('changeNetwork', {
      //                 width: 1024 + 208, height: 720, alwaysOnTop: true
      //             })
      //         }
      //         return
      //     }
      // }
      // ]
      // },
      // { type: 'separator' }
    ],
  };

  // Language menu
  const languageMenu = LANGUAGES.map((languageCode) => {
    return {
      label: i18n.t(`Settings.Lang.${languageCode}`),
      type: "radio",
      checked: i18n.language === languageCode,
      click: () => {
        if (setting.language !== languageCode) {
          i18n.changeLanguage(languageCode);
        }
      },
    };
  });

  settingMenu.submenu.push({
    label: i18n.t(`main.applicationMenu.setting.lang.label`),
    submenu: languageMenu,
  });
  menu.push(settingMenu);

  // Window menu
  const windowMenu = {
    label: i18n.t("main.applicationMenu.window.label"),
    submenu: [
      {
        label: i18n.t("main.applicationMenu.window.fullscreen"),
        accelerator: "CommandOrControl+F",
        role: "toggleFullScreen",
      },
      {
        label: i18n.t("main.applicationMenu.window.minimize"),
        accelerator: "CommandOrControl+M",
        role: "minimize",
      },
      {
        label: i18n.t("main.applicationMenu.window.close"),
        accelerator: "CommandOrControl+W",
        role: "close",
      },
      { type: "separator" },
      {
        label: i18n.t("main.applicationMenu.window.front"),
        role: "front",
      },
    ],
  };
  menu.push(windowMenu);

  // Help menu
  const helpMenu = {
    label: i18n.t("main.applicationMenu.help.label"),
    role: "help",
    submenu: [
      {
        label: i18n.t("main.applicationMenu.app.version", {
          version: app.getVersion(),
        }),
      },
      { type: "separator" },
      {
        label: i18n.t("main.applicationMenu.help.web"),
        click: () => {
          shell.openExternal("https://www.rivex.io");
        },
      },
      { type: "separator" },
      {
        label: i18n.t("main.applicationMenu.help.privacypolicy"),
        click: () => {
          shell.openExternal("https://www.rivex.io/privacy-policy");
        },
      },
      { type: "separator" },
      {
        label: i18n.t("main.applicationMenu.help.aml"),
        click: () => {
          shell.openExternal("https://www.rivex.io/rx-wallet-aml-policy");
        },
      },
      { type: "separator" },
      {
        label: i18n.t("main.applicationMenu.help.eula"),
        click: () => {
          shell.openExternal(
            "https://www.rivex.io/rx-wallet-end-user-license-agreemen"
          );
        },
      },
    ],
  };
  menu.push(helpMenu);

  return menu;
};
