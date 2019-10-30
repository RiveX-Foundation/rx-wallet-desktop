# RVX Desktop Wallet
[![GitHub License][license]][license-url]

RVX Desktop Wallet using Eletron

## Features

* ERC20 , Eth , WAN , WRC20
* BIP39/BIP44
* Ledger
* English/Chinese

## Development

### Initialization

Before install RVX Wallet's dependencies, you need to pre-install following tools:

Windows :
* Node.js
* Python (v2.7 is recommended, v3 is not supported)
* Git

Linux (Ubuntu) :
* Node.js

        wget https://nodejs.org/dist/v10.9.0/node-v10.9.0-linux-x64.tar.xz
        tar xf  node-v10.9.0-linux-x64.tar.xz
        cd node-v10.9.0-linux-x64/
        ./bin/node -v

        sudo ln -s /home/user/node/node-v10.9.0-linux-x64/bin/npm   /usr/local/bin/
        sudo ln -s /home/user/node/node-v10.9.0-linux-x64/bin/node   /usr/local/bin/

* Python

        sudo apt install python2.7
* Git

        sudo apt install git

MAC OS :
* Node.js

        brew install node
        brew install yarn 

* Python

        brew install python@2

* Git

        brew install git

### Download
Download source code from github

    git clone https://github.com/RiveX-Foundation/rvx-desktop-wallet.git
    cd rvx-desktop-wallet

### Environment File
iWan SDK is needed to Integrate with Wanchain, therefore to get started please access [iWan website](https://iwan.wanchain.org/), and apply for you personal API_KEY and SECRET_KEY.

Then, create a file named ".env" in the root directory of the project and add your personal API_KEY and SECRET_KEY into it:
.env:

    API_KEY=xxxxxxxxxxxxxxxxxxxxxxxxxxxx
    SECRET_KEY=xxxxxxxxxxxxxxxxxxxxxxxxxxxx

### Dependencies
1. Windows :

        npm install

1. Linux (Ubuntu) :

        sudo apt install build-essential libxss-dev pkg-config libusb-1.0-0 libusb-1.0-0-dev libudev-dev
        npm install

1. MAC OS :

        yarn install or npm install

### Get Started
    npm run dev

## Package
* Windows :

        npm run pack:win

* Linux (Ubuntu) :

        npm run pack:linux

* MAC OS :

        npm run pack:mac

## License

RVX Wallet is open source software licensed as GPL-3.0

[license]: https://img.shields.io/badge/license-GNUGPL3-blue.svg
[license-url]:https://github.com/RiveX-Foundation/rvx-desktop-wallet/blob/master/LICENSE
