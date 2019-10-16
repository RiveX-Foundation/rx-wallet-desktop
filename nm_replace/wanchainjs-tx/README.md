# wanchainjs-tx
 
[![CircleCI][circle-image]][circle-url]
[![Coverage Status][coveralls-image]][coveralls-url]
[![dependency status][dep-image]][dep-url]
[![NPM][npm-image]][npm-url]

[circle-image]: https://circleci.com/gh/WanJS/wanchainjs-tx.svg?style=svg
[circle-url]: https://circleci.com/gh/WanJS/wanchainjs-tx
[dep-image]: https://david-dm.org/WanJS/wanchainjs-tx.svg
[dep-url]: https://david-dm.org/WanJS/wanchainjs-tx
[coveralls-image]: https://coveralls.io/repos/github/WanJS/wanchainjs-tx/badge.svg?branch=dev
[coveralls-url]: https://coveralls.io/github/WanJS/wanchainjs-tx?branch=dev
[npm-image]: http://img.shields.io/npm/v/wanchainjs-tx.svg
[npm-url]: https://www.npmjs.org/package/wanchainjs-tx

# INSTALL
`npm install wanchainjs-tx`

# USAGE

  - [example](https://github.com/WanJS/wanchainjs-tx/blob/master/examples/transactions.js)

```javascript
const WanchainTx = require('wanchainjs-tx')
const privateKey = Buffer.from('e331b6d69882b4cb4ea581d88e0b604039a3de5967688d3dcffdd2270c0fd109', 'hex')

const txParams = {
  Txtype: '0x01',
  nonce: '0x00',
  gasPrice: '0x09184e72a000', 
  gasLimit: '0x2710',
  to: '0x0000000000000000000000000000000000000000', 
  value: '0x00', 
  data: '0x7f7465737432000000000000000000000000000000000000000000000000000000600057',
  // EIP 155 chainId - mainnet: 1, testnet: 3
  chainId: 1
}

const tx = new WanchainTx(txParams)
tx.sign(privateKey)
const serializedTx = tx.serialize()
```

**Note:** this package expects ECMAScript 6 (ES6) as a minimum environment. From browsers lacking ES6 support, please use a shim (like [es6-shim](https://github.com/paulmillr/es6-shim)) before including any of the builds from this repo.


# BROWSER  
For a browser build please see https://github.com/ethereumjs/browser-builds.

# API
[./docs/](./docs/index.md)

# LICENSE
[MPL-2.0](https://tldrlegal.com/license/mozilla-public-license-2.0-(mpl-2))
