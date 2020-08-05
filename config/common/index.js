import CHAN from "./channels";

export const WDS_PORT = 9988;
export const isDev = process.env.NODE_ENV === "development";
export const STATIC_PATH = "/static";

export const APP_ROOT = "root";
export const APP_NAME = "RX Wallet";

export const LANGUAGES = ["en_US", "zh_CN"];
export const FALLBACK_LANG = "en_US";
export const NAMESPACE = "translation";

export const API_EthGas = "https://ethgasstation.info/json/ethgasAPI.json";
export const API_Server = "https://rxp.rivex.io/";
export const etherscanAPIKey = process.env.ETHERSCAN_API_KEY;

export const BIP44PATH = {
  ETH: "m/44'/60'/0'/0/",
  WAN: "m/44'/5718350'/0'/0/",
};

export const CHANNELS = CHAN;
