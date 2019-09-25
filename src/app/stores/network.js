import { observable, action } from 'mobx';
import { inject } from 'mobx-react';
import axios from 'axios';
import { createNotification } from 'utils/helper';
import intl from 'react-intl-universal';
const { network } = require('../../../config/common/network');

class Network {
  @observable networklist = [];
  @observable selectednetwork = {};

  @action setNetwork(networkcode){
    this.selectednetwork = this.networklist.find(x => x.shortcode == networkcode);
    localStorage.setItem('network',JSON.stringify(this.selectednetwork));
  }

  getthisstore(){
    return this;
  }

  constructor(){
    this.networklist = network;
    this.networklist = this.networklist.filter(x => x.contractaddress != "");
    this.loadNetworkConfig();

    //this.readTextFile("../../static/network.json");
  }

  @action loadNetworkConfig(){
    var network = localStorage.getItem("network");
    if(network == "" || network == null){
      network = JSON.stringify(this.networklist[0]);
      localStorage.setItem("network",network);
    }
    this.selectednetwork = JSON.parse(network);
  }

  @action readTextFile = file => {
    var that = this;
    var rawFile = new XMLHttpRequest();
    rawFile.open("GET", file, false);
    rawFile.onreadystatechange = () => {
        if (rawFile.readyState === 4) {
            if (rawFile.status === 200 || rawFile.status == 0) {
                var allText = rawFile.responseText;
                console.log(allText);
                this.networklist = JSON.parse(allText);
                this.networklist = this.networklist.filter(x => x.contractaddress != "");
                this.loadNetworkConfig();
            }
        }
    };
    rawFile.send(null);
  };
}

const self = new Network();
export default self;
