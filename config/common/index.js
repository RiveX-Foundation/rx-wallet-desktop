import CHAN from './channels'

export const WDS_PORT = 9988
export const isDev = process.env.NODE_ENV === 'development' 
export const STATIC_PATH = '/static'

export const APP_ROOT = 'root'
export const APP_NAME = 'RVX Wallet'

export const LANGUAGES = ['en_US', 'zh_CN']
export const FALLBACK_LANG = 'en_US'
export const NAMESPACE = 'translation'

export const BIP44PATH = {
    WAN: "m/44'/5718350'/0'/0/"
}

export const CHANNELS = CHAN