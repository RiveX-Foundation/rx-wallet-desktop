import React, { Component } from 'react';
import { Menu, Icon } from 'antd';
import { Link } from 'react-router-dom';
import { observer, inject } from 'mobx-react';
import intl from 'react-intl-universal';
import $ from "jquery";
import './index.less';
import 'static/css/sidebar-menu.css';
import {SideMenu, Item} from 'react-sidemenu';
import logo from 'static/image/logo.png';
import buttonwallet from 'static/image/icon/wallet.png';
import buttonsettings from 'static/image/icon/settings.png';
import buttonnotification from 'static/image/icon/notification.png';
import buttonlogout from 'static/image/icon/logout.png';
import buttonimportwallet from 'static/image/icon/importwallet.png';
import buttonbasicwallet from 'static/image/icon/basicwallet.png';
import buttonsharedwallet from 'static/image/icon/sharedwallet.png';
import buttonhardwarewallet from 'static/image/icon/hardwarewallet.png';



const SubMenu = Menu.SubMenu;

@inject(stores => ({
  sidebarColumns: stores.languageIntl.sidebarColumns,
  settings: stores.session.settings,
  setCurrent: current => stores.walletStore.setCurrent(current),
  logout: () => stores.session.logout(),
  clearSelectedWallet: () => stores.walletStore.clearSelectedWallet(),
  setselectedwallettype: wallettype => stores.walletStore.setselectedwallettype(wallettype)
}))

@observer
class Sidebar extends Component {

  state = {
    selectedwallettype : "basicwallet",
    selectedtab : "basicwallet"
  }

  renderMenu = data => {
    return data.map(item => {
      if(item.children) {
        return (
          <SubMenu key={item.key} title={<span><img src={item.iconpath} width="20px" /><span style={{marginLeft:"5px"}}>{item.title}</span></span>}>
            { this.renderMenu(item.children) }
          </SubMenu>
        );
      }
      return (
        <Menu.Item key={item.key}>
          <Link to={item.key}>
            {item.step === '1' ? <Icon type={item.icon} /> : <em className="com-circle"></em>}
            {item.title}
          </Link>
        </Menu.Item>
      )
    });
  }

  selectwallettype = e => {
    var that = this;
    var wallettype = e.currentTarget.getAttribute('data-wallettype');
    this.setState({selectedwallettype:wallettype,selectedtab:"wallet"},function(){
      that.props.clearSelectedWallet();
      that.props.setselectedwallettype(wallettype);
      that.props.setCurrent('walletdetail');
    })
  }

  selectimportwallettype = () => {
    var that = this;    
    this.setState({selectedwallettype:"importwallet",selectedtab:"wallet"},function(){
      that.props.clearSelectedWallet();
      that.props.setselectedwallettype("importwallet");
      that.props.setCurrent('importwallettypeselection');
    })
  }

  selecthwwallettype = () => {
    var that = this;    
    this.setState({selectedwallettype:"hwwallet",selectedtab:"wallet"},function(){
      that.props.clearSelectedWallet();
      that.props.setselectedwallettype("hwwallet");
      that.props.setCurrent('hwwalletselection');
    })
  }

  selectsettings = () => {
    this.props.clearSelectedWallet();
    this.props.setselectedwallettype("");
    this.setState({selectedtab:"setting"});
    this.props.setCurrent('settings');
  }

  logout = () => {
    console.log("LOGOUT");
    this.props.logout();
  }
  
  render() {
    const { sidebarColumns, settings } = this.props;
    const { selectedwallettype,selectedtab } = this.state;

    console.log(selectedtab,selectedwallettype);

    const basicwalletstyle = (selectedtab == "wallet" && selectedwallettype == "basicwallet") ? "ant-menu-item fontcolor_red ant-menu-item-selected" : "ant-menu-item fontcolor_red";
    const sharedwalletstyle = (selectedtab == "wallet" && selectedwallettype == "sharedwallet") ? "ant-menu-item fontcolor_orange ant-menu-item-selected" : "ant-menu-item fontcolor_orange";
    const hardwarewalletstyle = (selectedtab == "wallet" && selectedwallettype == "hardwarewallet") ? "ant-menu-item fontcolor_green ant-menu-item-selected" : "ant-menu-item fontcolor_green";
    const importwalletstyle = (selectedtab == "wallet" && selectedwallettype == "importwallet") ? "ant-menu-item fontcolor_purple ant-menu-item-selected" : "ant-menu-item fontcolor_purple";
    const settingstyle = (selectedtab == "setting") ? "ant-menu-submenu ant-menu-submenu-inline ant-menu-submenu-open ant-menu-submenu-selected" : "ant-menu-submenu ant-menu-submenu-inline ant-menu-submenu-open";


    if(settings && settings.staking_advance) {
      if(sidebarColumns.length >= 4) {
        for (let i = 0; i < sidebarColumns.length; i++) {
          if (sidebarColumns[i].key == "/staking" ) {
            sidebarColumns[i].children.push({
              title: intl.get('menuConfig.validator'),
              key: '/validator',
              icon: 'block'
            })
          }
        }
      }
    } else {
      if(sidebarColumns.length >= 4) {
        for (let i = 0; i < sidebarColumns.length; i++) {
          if (sidebarColumns[i].key == "/staking" ) {
            if(sidebarColumns[i].children.length > 1) {
              sidebarColumns[i].children.pop();
            }
          }
        }
      }
    }

    return (
      <div className="sidebar fadeInAnim">
        <div className="logo">
          <img src={logo} alt={intl.get('Sidebar.RVX')} />
        </div>

        <div>
          <ul className="ant-menu menuTreeNode ant-menu-dark ant-menu-root ant-menu-inline" role="menu">
            <li className="ant-menu-submenu ant-menu-submenu-inline" role="menuitem">
              <div className="ant-menu-submenu-title" aria-expanded="true" aria-haspopup="true" aria-owns="/$Menu">
                <span><img src={buttonwallet} width="20px" /><span>{intl.get('menuConfig.wallet')}</span></span>
              </div>
              <ul id="/$Menu" className="ant-menu ant-menu-sub ant-menu-inline" role="menu">
                <li className={basicwalletstyle} data-tabvalue="wallet" data-wallettype="basicwallet" onClick={this.selectwallettype} role="menuitem"><img src={buttonbasicwallet} width="25px" />{intl.get('menuConfig.basicwallet')}</li>
                <li className={sharedwalletstyle} data-tabvalue="wallet" data-wallettype="sharedwallet" onClick={this.selectwallettype} role="menuitem"><img src={buttonsharedwallet} width="25px" />{intl.get('menuConfig.sharedwallet')}</li>
                <li className={hardwarewalletstyle} data-tabvalue="wallet" data-wallettype="hardwarewallet" onClick={this.selecthwwallettype} role="menuitem"><img src={buttonhardwarewallet} width="25px" />{intl.get('menuConfig.hardwarewallet')}</li>
                <li className={importwalletstyle} data-tabvalue="wallet" data-wallettype="importwallet" onClick={this.selectimportwallettype} role="menuitem"><img src={buttonimportwallet} width="25px" />{intl.get('menuConfig.importwallet')}</li>
              </ul>
            </li>
            <li data-tabvalue="setting" className={settingstyle} onClick={this.selectsettings} role="menuitem">
              <div className="ant-menu-submenu-title" aria-expanded="true" aria-haspopup="true" aria-owns="/$Menu">
                <span><img src={buttonsettings} width="20px" /><span>{intl.get('Settings.settings')}</span></span>
              </div>
            </li>
            <li style={{display:'None'}} className="ant-menu-submenu ant-menu-submenu-inline ant-menu-submenu-open" role="menuitem">
              <div className="ant-menu-submenu-title" aria-expanded="true" aria-haspopup="true" aria-owns="/$Menu">
                <span><img src={buttonnotification} width="20px" /><span>{intl.get('Notification.Notification')}</span></span>
              </div>
            </li>
          </ul>
          <div className="logoutpanel" onClick={this.logout} ><span><img src={buttonlogout} width="20px" /><span>{intl.get('Common.logout')}</span></span></div>
        </div>
      </div>
    );
  }
}

export default Sidebar;