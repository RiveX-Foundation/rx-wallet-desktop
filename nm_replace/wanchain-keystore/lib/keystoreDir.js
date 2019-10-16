const fs = require('fs');
const path = require('path');
let Account = require('./Account.js');
module.exports = class keystoreDir{
    constructor(keystorePath){
        this.setKeystorePath(keystorePath);
    }
    setKeystorePath(keystorePath){
        this.keystorePath = keystorePath;
        this.Accounts = {}
        if(keystorePath){
            this.initAccounts();
        }
    }
    mkdirsSync(dirname) {
        if (fs.existsSync(dirname)) {
            return true;
        } else {
            if (this.mkdirsSync(path.dirname(dirname))) {
                fs.mkdirSync(dirname);
                return true;
            }
        }
    }   
    initAccounts(){
        this.Accounts = {};
        try{
            let files = fs.readdirSync(this.keystorePath);
            for (var i in files) {
                var item = files[i];
                let filename = path.join(this.keystorePath,item);
                var stat = fs.lstatSync(filename);
                if(!stat.isDirectory()){
                    let account = new Account(filename);
                    if(account.keystore){
                        let address = account.getAddress();
                        this.Accounts[address.toLowerCase()] = account;
                    }
                }
            }            
        }
        catch(error){
            console.log(this.keystorePath, "doesn't exist");
            this.mkdirsSync(this.keystorePath);
        }
    }
    getAccounts() {
        this.initAccounts(); // try to get fresh info if new account added.
        return this.Accounts;
    }
    getAccount(address){
        return this.Accounts[address.toLowerCase()];
    }
}