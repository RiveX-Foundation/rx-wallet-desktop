import { observable, action } from 'mobx';
import { inject } from 'mobx-react';
import axios from 'axios';
import { createNotification } from 'utils/helper';
import intl from 'react-intl-universal';
const { ethnetwork,wannetwork } = require('../../../config/common/network');

class Network {
  @observable ethnetworklist = [];
  @observable wannetworklist = [];
  @observable selectedethnetwork = {};
  @observable selectedwannetwork = {};

  @action setNetwork(networkcode,networktype){
    if(networktype == "eth"){
      this.selectedethnetwork = this.ethnetworklist.find(x => x.shortcode == networkcode);
      localStorage.setItem("ethnetwork",JSON.stringify(this.selectedethnetwork));
    }

    if(networktype == "wan"){
      this.selectedwannetwork = this.wannetworklist.find(x => x.shortcode == networkcode);
      localStorage.setItem("wannetwork",JSON.stringify(this.selectedwannetwork));
    }
  }

  getthisstore(){
    return this;
  }

  constructor(){
    this.ethnetworklist = ethnetwork;
    this.ethnetworklist = this.ethnetworklist.filter(x => x.active == true);

    this.wannetworklist = wannetwork;
    this.wannetworklist = this.wannetworklist.filter(x => x.active == true);

    this.loadNetworkConfig();
  }

  @action loadNetworkConfig(){
    var ethnetwork = localStorage.getItem("ethnetwork");
    if(ethnetwork == "" || ethnetwork == null){
      ethnetwork = JSON.stringify(this.ethnetworklist[0]);
      localStorage.setItem("ethnetwork",ethnetwork);
    }
    this.selectedethnetwork = JSON.parse(ethnetwork);

    var wannetwork = localStorage.getItem("wannetwork");
    if(wannetwork == "" || wannetwork == null){
      wannetwork = JSON.stringify(this.wannetworklist[0]);
      localStorage.setItem("wannetwork",wannetwork);
    }
    this.selectedwannetwork = JSON.parse(wannetwork);
  }
}

const self = new Network();
export default self;
