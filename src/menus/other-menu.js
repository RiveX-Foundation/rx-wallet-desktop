import {APP_NAME, LANGUAGES} from '../../config/common'
import setting from '../utils/Settings'
import {app, shell} from 'electron'

export default (i18n) => {
    const menu = []

    // Edit menu
    const editMenu = {
        label: i18n.t('main.applicationMenu.edit.label', {app: APP_NAME}),
        submenu: [
            // {
            //     label: i18n.t('main.applicationMenu.edit.undo', { app: APP_NAME }),
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
                label: i18n.t('main.applicationMenu.edit.copy'),
                role: 'copy'
            },
            {
                label: i18n.t('main.applicationMenu.edit.paste'),
                role: 'paste'
            },
            {
                label: i18n.t('main.applicationMenu.edit.selectAll'),
                role: 'selectall',
            },
        ]
    }

    menu.push(editMenu)

    // Setting menu
    const settingMenu = {
        label: i18n.t('main.applicationMenu.setting.label'),
        submenu: [
            /** TODO */
            //     {
            //         label: i18n.t('main.applicationMenu.setting.network.label'),
            //         submenu: [
            //             {
            //                 label: i18n.t('main.applicationMenu.setting.network.main'),
            //                 accelerator: 'Shift+CommandOrControl+M',
            //                 checked: setting.network === 'main',
            //                 type: 'radio',
            //                 click: async (m) => {
            //                     if (!setting.network.includes('main')) {
            //                         menuFactoryService.networkMenu = m.menu
            //                         const mainWin = Windows.getByType('main')
            //                         mainWin.hide()
            //                         Windows.createModal('changeNetwork', {
            //                             width: 1024 + 208, height: 720, alwaysOnTop: true
            //                         })
            //                     }

            //                     return
            //                 }
            //             },
            //             {
            //                 label: i18n.t('main.applicationMenu.setting.network.test'),
            //                 accelerator: 'Shift+CommandOrControl+P',
            //                 checked: setting.network === 'testnet',
            //                 type: 'radio',
            //                 click: async (m) => {
            //                     if (setting.network.includes('main')) {
            //                         menuFactoryService.networkMenu = m.menu
            //                         const mainWin = Windows.getByType('main')
            //                         mainWin.hide()
            //                         Windows.createModal('changeNetwork', {
            //                             width: 1024 + 208, height: 720, alwaysOnTop: true
            //                         })
            //                     }

            //                     return
            //                 }
            //             }
            //         ]
            //     }
        ],
    }

    // Language menu
    const languageMenu = LANGUAGES.map((languageCode) => {
        console.log(languageCode);
        return {
            label: i18n.t(`main.applicationMenu.setting.lang.code.${languageCode}`),
            type: 'radio',
            checked: i18n.language === languageCode,
            click: () => {
                if (!setting.language.includes(languageCode)) {
                    i18n.changeLanguage(languageCode)
                }
            }
        }
    })

    settingMenu.submenu.push({
        label: i18n.t(`main.applicationMenu.setting.lang.label`),
        submenu: languageMenu
    })
    menu.push(settingMenu)

    // Window menu
    const windowMenu = {
        label: i18n.t('main.applicationMenu.window.label'),
        submenu: [
            {
                label: i18n.t('main.applicationMenu.window.fullscreen'),
                accelerator: 'CommandOrControl+F',
                role: 'toggleFullScreen'
            },
            {
                label: i18n.t('main.applicationMenu.window.minimize'),
                accelerator: 'CommandOrControl+M',
                role: 'minimize',
            },
            {
                label: i18n.t('main.applicationMenu.window.close'),
                accelerator: 'CommandOrControl+W',
                role: 'close',
            },
            {type: 'separator'},
            {
                label: i18n.t('main.applicationMenu.window.front'),
                role: 'front',
            }
        ],
    }
    menu.push(windowMenu)

    // Help menu
    const helpMenu = {
        label: i18n.t('main.applicationMenu.help.label'),
        role: 'help',
        submenu: [
            {
                label: i18n.t('main.applicationMenu.app.version', {version: app.getVersion()}),
            },
            {type: 'separator'},
            {
                label: i18n.t('main.applicationMenu.help.web'),
                click: () => {
                    shell.openExternal('https://www.rivex.io')
                }
            },
            {type: 'separator'},
            {
                label: i18n.t('main.applicationMenu.help.privacypolicy'),
                click: () => {
                    shell.openExternal('https://www.rivex.io/privacy-policy')
                }
            },
            {type: 'separator'},
            {
                label: i18n.t('main.applicationMenu.help.aml'),
                click: () => {
                    shell.openExternal('https://www.rivex.io/rx-wallet-aml-policy')
                }
            },
            {type: 'separator'},
            {
                label: i18n.t('main.applicationMenu.help.eula'),
                click: () => {
                    shell.openExternal('https://www.rivex.io/rx-wallet-end-user-license-agreemen')
                }
            }
        ]
    }
    menu.push(helpMenu)

    const developerMenu = {
        label: i18n.t('main.applicationMenu.app.developer.label'),
        submenu: [
            {
                label: i18n.t('main.applicationMenu.help.toggle'),
                accelerator: 'Alt+CommandOrControl+I',
                role: 'toggledevtools'
            },
            {type: 'separator'},
            {
                label: i18n.t('main.applicationMenu.app.quit', {app: APP_NAME}),
                click() {
                    app.quit()
                }
            }
        ]
    }

    menu.unshift(developerMenu)

    return menu
}