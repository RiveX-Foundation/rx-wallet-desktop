const fs = require('fs');
var keythereum = require("keythereum");
let wanUtil = require('wanchain-util');
module.exports = class Account{
    constructor(fileName){
        try{
            let keystoreStr = fs.readFileSync(fileName, "utf8");
            this.keystore = JSON.parse(keystoreStr);
        }catch (e){
            this.keystore = null;
        }
    }
    getPrivateKey(password){
        return this.getPrivateKeyFunc({version:this.keystore.version, crypto:this.keystore.crypto},password);
    }
    getWanPrivateKey(password){
        return this.getPrivateKeyFunc({version:this.keystore.version, crypto:this.keystore.crypto2},password);
    }
    getPrivateKeyFunc(cryptoObj,password){
        let privateKey;
        try {
            privateKey = keythereum.recover(password, cryptoObj);
        }catch(error){
            console.log('wrong password!');
            return null;
        }
        return privateKey;
    }
    getAddress(){
        return '0x'+this.keystore.address;
    }
    getWaddress(){
        return '0x'+this.keystore.waddress;
    }
    getOTAPrivateKey(password,OTAAddress) {
        let privateKey = this.getPrivateKey(password);
        let wanKey = this.getWanPrivateKey(password);
        if (privateKey && wanKey) {
            return wanUtil.computeWaddrPrivateKey(OTAAddress, privateKey, wanKey);
        }
        return null;
    }
}