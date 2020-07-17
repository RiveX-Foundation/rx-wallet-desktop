module.exports = {
    phrase: ['generate', 'reveal', 'has', 'import', 'reset'],
    wallet: ['lock', 'unlock', 'getPubKey', 'connectToLedger', 'deleteLedger', 'isConnected', 'getPubKeyChainId', 'signTransaction', 'signPersonalMessage'],
    address: ['get', 'getOne', 'getNonce', 'balance', 'isWanAddress', 'fromKeyFile', 'getKeyStoreCount', 'isValidatorAddress', 'scanMultiOTA'],
    account: ['create', 'get', 'getAll', 'update', 'delete', 'deleteall'],
    transaction: ['normal', 'raw', 'estimateGas', 'showRecords', 'insertTransToDB'],
    query: ['config', 'getGasPrice'],
    staking: ['getContractAddr', 'info', 'delegateIn', 'delegateOut', 'getContractData', 'insertTransToDB', 'getNameAndIcon', 'posInfo'],
    setting: ['switchNetwork', 'set', 'get'],
    system: ['reload', 'getDAppInjectFile','getDAppInjectFileETH'],
    upgrade: ['start']
}
