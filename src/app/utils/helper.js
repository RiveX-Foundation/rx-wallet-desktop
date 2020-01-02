import { fromWei } from 'utils/support';
import { BigNumber } from 'bignumber.js';
import intl from 'react-intl-universal';
import {NotificationContainer, NotificationManager} from 'react-notifications';

let emitterHandlers = {};

export const createNotification = (type,message) => {
  //console.log('TYPE',type);
  //console.log(message);
  switch (type) {
    case 'info':
      return NotificationManager.info(message, intl.get('Info.Info'), 5000);
      break;
    case 'success':
      NotificationManager.success(message, intl.get('Success.Success'), 5000);
      break;
    case 'warning':
      NotificationManager.warning(message, intl.get('Warning.Warning'), 3000);
      break;
    case 'error':
      NotificationManager.error(message, intl.get('Error.Error'), 5000);
    //case 'error':
    //  NotificationManager.error('Error', message, 5000, () => {
    //    alert('callback');
    //  }
    //);
      break;
  };
};

export const getDatefromTimestamp = function (timestamp){
  return new Date(timestamp*1000);
}


export const getUnixTime = function (dateobj) { 
  return dateobj.getTime()/1000|0 
};


export const getBalance = function (arr) {
  const addrArr = arr.map(item => item.substr(2));

  return new Promise((resolve, reject) => {
    let thisVal
    wand.request('address_balance', { addr: addrArr }, (err, val) => {
      thisVal = Object.assign({}, val);
      if (err) {
        return reject('Get balance failed ', err)
      } else {
        Object.keys(thisVal).forEach(item => {
          return thisVal[item] = fromWei(thisVal[item])
        });
        return resolve(thisVal);
      }
    })
  })
};

export const getNonce = function (addrArr, chainType) {
  return new Promise((resolve, reject) => {
    wand.request('address_getNonce', { addr: addrArr, chainType: chainType }, (err, val) => {
      if (err) {
        return reject('Get nonce failed', err);
      } else {
        let nonce = parseInt(val, 16);
        return resolve(nonce);
      }
    });
  })
};

export const getGasPrice = function (chainType) {
  return new Promise((resolve, reject) => {
    wand.request('query_getGasPrice', { chainType: chainType }, (err, val) => {
      if (err) {
        return reject('Get gas price failed ', err)
      } else {
        let gasPrice = new BigNumber(val).div(BigNumber(10).pow(9)).toString(10);
        return resolve(gasPrice);
      }
    })
  })
};

export const estimateGas = function (chainType, tx) {
  return new Promise((resolve, reject) => {
    wand.request('transaction_estimateGas', { chainType: chainType, tx: tx }, (err, val) => {
      if (err) {
        return reject('Estimate gas failed ', err)
      } else {
        return resolve(val);
      }
    })
  })
};

export const checkWanAddr = function (address) {
  return new Promise((resolve, reject) => {
    wand.request('address_isWanAddress', { address: address }, (err, val) => {
      if (err) {
        return reject('Check WAN address failed ', err)
      } else {
        return resolve(val);
      }
    })
  })
};

export const checkWanValidatorAddr = function (address) {
  return new Promise((resolve, reject) => {
    wand.request('address_isValidatorAddress', { address: address }, (err, val) => {
      if (err) {
        return reject('Check WAN address failed ', err)
      } else {
        return resolve(val);
      }
    })
  })
};

export const getChainId = function () {
  return new Promise((resolve, reject) => {
    wand.request('query_config', {
      param: 'network'
    }, function (err, val) {
      if (err) {
        return reject('Get chain ID failed', err);
      } else {
        if (val['network'].includes('main')) {
          return resolve(1);
        } else {
          return resolve(3);
        }
      }
    });
  });
};

export const isSdkReady = function () {
  return new Promise((resolve, reject) => {
    wand.request('query_config', {
      param: 'sdkStatus'
    }, function (err, val) {
      if (err) {
        return reject('Get SDK status failed ', err);
      } else {
        if (val['sdkStatus'].includes('ready')) {
          return resolve(true);
        } else {
          return resolve(false);
        }
      }
    });
  });
};

export const checkAddrType = function (addr, addrInfo) {
  let type = false;
  if(typeof addr === 'string') {
    addr = addr.startsWith('0x') ? addr : `0x${addr}`.toLowerCase();
    Object.keys(addrInfo).forEach(item => {
      let has = Object.keys(addrInfo[item]).find(val => val.toLowerCase() === addr.toLowerCase());
      if(has) {
        type = item;
        return type;
      }
    })
    return type
  }
}

export const hasSameName = function (type, record, addrInfo) {
  let tmp;
  let bool = false;
  if(type === 'normal') {
    tmp = Object.assign({}, addrInfo[type], addrInfo['import']);
  } else {
    tmp = Object.assign({}, addrInfo[type]);
  }
  Object.values(tmp).forEach(item => {
    if(item.name === record.name && item.address !== record.address) {
      bool = true;
    }
  })
  return bool;
}

export const getBalanceByAddr = function (addr, addrInfo) {
  let balance = 0;
  let tmp = {};
  Object.keys(addrInfo).forEach(item => {
    tmp = Object.assign(tmp, addrInfo[item])
  })
  Object.values(tmp).forEach(item => {
    if(item.address === addr) {
      balance = item.balance;
      return;
    }
  })
  return balance;
}

export const checkAmountUnit = function (decimals, amount) {
  if(!Number.isInteger(decimals)) {
    throw new Error('Decimals must be a integer');
  }
  let decimalLen = amount.toString().length - amount.toString().indexOf('.') - 1;
  return !!(amount >= 1 / (10 ** decimals)) && decimalLen <= decimals;
}

export const formatAmount = function (amount) {
  let amountStr = amount.toString();
  if(amountStr.indexOf('.') === 0) {
    amount = new BigNumber(`0${amount}`);
  }
  if(amountStr.indexOf('.') === amountStr.length - 1) {
    amount = new BigNumber(`${amount}0`);
  }
  
  return amount.toString();
}

export const getChainIdByAddr = function (addrInfo) {
  Object.keys(addrInfo).forEach(type => {
    Object.keys(addrInfo[type]).forEach(() => {})
  })
}

export const regEmitterHandler = function (key, callback) {
  emitterHandlers[key] = callback;
}

export const initEmitterHandler = function () {
  wand.emitter.on('notification', function (key, val) {
    console.log('Emitter: ', key, val)
    if (emitterHandlers.hasOwnProperty(key)) {
      emitterHandlers[key](val);
    }
  })
};

export const getContractAddr = function () {
  return new Promise((resolve, reject) => {
    wand.request('staking_getContractAddr', {}, (err, val) => {
      if (err) {
        return reject('staking_getContractAddr failed', err);
      } else {
        return resolve(val);
      }
    });
  })
};

export const getContractData = function (func, validatorAddr) {
  return new Promise((resolve, reject) => {
    wand.request('staking_getContractData', {func, validatorAddr}, (err, val) => {
      if (err) {
        return reject('staking_getContractData failed', err);
      } else {
        return resolve(val);
      }
    });
  })
};

export const getNameAndIcon = function (address) {
  return new Promise((resolve, reject) => {
    wand.request('staking_getNameAndIcon', {address}, (err, val) => {
      if (err) {
        return reject('staking_getNameAndIcon failed', err);
      } else {
        return resolve(val);
      }
    });
  })
};

export const convertHexToDecimal = function(val) {
  var hex = val;
  hex = hex.replace("0x","");
  hex = hex.replace("0X","");
  var x;
  try {
    x = new BigNumber(hex, 16);
  }
  catch(err) {
    return 0;
  }
  var xx=x.toString(10);
  return xx;
  /*
  document.getElementById("y3").value = x.toString(2);
  if( x.isInt() && x.gte(0) ) {
    if( hex.length==2 && x.gte("80", 16) ) { x=x.minus("100",16); }
    if( hex.length==4 && x.gte("8000", 16) ) { x=x.minus("10000",16); }
    if( hex.length==8 && x.gte("80000000", 16) ) { x=x.minus("100000000",16); }
    var t1 = new BigNumber("8000000000000000",16);
    var t2 = new BigNumber("10000000000000000",16);
    if( hex.length==16 && x.gte(t1) ) { x=x.minus(t2); }
    if( hex.length==2 || hex.length==4 || hex.length==8 || hex.length==16 )
      document.getElementById("y2").value = x.toString(10);
    else
      document.getElementById("y2").value = "N/A";
  }
  else
    document.getElementById("y2").value = "N/A";
  hex=hex.toUpperCase();
  var txt=hex+" = ";
  var d,e,minus=false;
  var len=hex.length;
  if( hex[0]=="-" ) { txt+="-["; hex=hex.substr(1); len--; minus=true; }
  var idot=hex.indexOf(".");
  if( idot>=0 ) { hex=hex.substring(0,idot)+hex.substring(idot+1,len); len--; }
  else idot=len;
  etbl = ["\u2070","\u00B9","\u00B2","\u00B3","\u2074","\u2075","\u2076","\u2077","\u2078","\u2079"];
  for(var i=0; i<len; i++) {
    d = hex.charCodeAt(i);
    if( d<58 ) d-=48;
    else if( d>64 ) d-=55;
    //e = len-i-1;
    e = idot-i-1;
    e=e.toString();
    txt+="("+d+" \u00D7 16";
    for(var k=0; k<e.length; k++)
      if( e[k]=="-" )
        txt+="\u207B";
      else
        txt+=etbl[e[k]];
    txt+=")";
    if( i<len-1 ) txt+=" + ";
  }
  if( minus ) txt+="]";
  txt+=" = "+xx;
  document.getElementById("y4").value = txt;
  */
}

export const isNullOrEmpty = (value) => {
  return (value == null || value == "") ? true : false;
}

export const toFixedNoRounding = (str,n) =>{
  return str.toFixed(n);
}

export const numberWithCommas = (x,fixed) =>{
  return fixed? x.toFixed(2).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",") : x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}