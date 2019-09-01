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
    selectedwallettype : "basicwallet"
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
    this.setState({selectedwallettype:wallettype},function(){
      that.props.clearSelectedWallet();
      that.props.setselectedwallettype(wallettype);
      that.props.setCurrent('walletdetail');
    })
  }

  selectimportwallettype = () => {
    this.props.clearSelectedWallet();
    this.props.setCurrent('importwallettypeselection');
  }

  selectsettings = () => {
    this.props.setCurrent('settings');
  }

  logout = () => {
    console.log("LOGOUT");
    this.props.logout();
  }
  
  render() {
    const { sidebarColumns, settings } = this.props;
    const { selectedwallettype } = this.state;

    const basicwalletstyle = (selectedwallettype == "basicwallet") ? "ant-menu-item fontcolor_red ant-menu-item-selected" : "ant-menu-item fontcolor_red";
    const sharedwalletstyle = (selectedwallettype == "sharedwallet") ? "ant-menu-item fontcolor_orange ant-menu-item-selected" : "ant-menu-item fontcolor_orange";
    const hardwarewalletstyle = (selectedwallettype == "hardwarewallet") ? "ant-menu-item fontcolor_green ant-menu-item-selected" : "ant-menu-item fontcolor_green";
    const importwalletstyle = (selectedwallettype == "importwallet") ? "ant-menu-item fontcolor_purple ant-menu-item-selected" : "ant-menu-item fontcolor_purple";


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
      <div className="sidebar">
        <div className="logo">
          <img src={logo} alt={intl.get('Sidebar.RVX')} />
        </div>

        <div>

        {
          /*
          <ul class="ant-menu menuTreeNode ant-menu-dark ant-menu-root ant-menu-inline" role="menu">
            <li class="ant-menu-submenu ant-menu-submenu-inline ant-menu-submenu-open ant-menu-submenu-selected" role="menuitem">
              <div class="ant-menu-submenu-title" aria-expanded="true" aria-haspopup="true" aria-owns="/$Menu"><span><img src="../../static/image/icon/wallet.png" width="20px" /><span>Wallet</span></span><i class="ant-menu-submenu-arrow"></i></div>
              <ul id="/$Menu" class="ant-menu ant-menu-sub ant-menu-inline" role="menu">
                <li class="ant-menu-item ant-menu-item-selected" role="menuitem"><a href="#/basicwallet"><em class="com-circle"></em>Basic Wallet</a></li>
                <li class="ant-menu-item" role="menuitem"><a href="#/sharedwallet"><em class="com-circle"></em>Shared Wallet</a></li>
                <li class="ant-menu-item" role="menuitem"><a href="#/hardwarewallet"><em class="com-circle"></em>Hardware Wallet</a></li>
              </ul>
            </li>
          </ul>
          */
        }

          <ul className="ant-menu menuTreeNode ant-menu-dark ant-menu-root ant-menu-inline" role="menu">
            <li className="ant-menu-submenu ant-menu-submenu-inline ant-menu-submenu-open ant-menu-submenu-selected" role="menuitem">
              <div className="ant-menu-submenu-title" aria-expanded="true" aria-haspopup="true" aria-owns="/$Menu">
                <span><img src="../../static/image/icon/wallet.png" width="20px" /><span>{intl.get('menuConfig.wallet')}</span></span>
              </div>
              <ul id="/$Menu" className="ant-menu ant-menu-sub ant-menu-inline" role="menu">
                <li className={basicwalletstyle} data-wallettype="basicwallet" onClick={this.selectwallettype} role="menuitem"><img src='../../static/image/icon/basicwallet.png' width="25px" />{intl.get('menuConfig.basicwallet')}</li>
                <li className={sharedwalletstyle} data-wallettype="sharedwallet" onClick={this.selectwallettype} role="menuitem"><img src='../../static/image/icon/sharedwallet.png' width="25px" />{intl.get('menuConfig.sharedwallet')}</li>
                <li className={hardwarewalletstyle} data-wallettype="hardwarewallet" onClick={this.selectwallettype} role="menuitem"><img src='../../static/image/icon/hardwarewallet.png' width="25px" />{intl.get('menuConfig.hardwarewallet')}</li>
                <li className={importwalletstyle} data-wallettype="importwallet" onClick={this.selectimportwallettype} role="menuitem"><img src='../../static/image/icon/importwallet.png' width="25px" />{intl.get('menuConfig.importwallet')}</li>
              </ul>
            </li>
            <li className="ant-menu-submenu ant-menu-submenu-inline ant-menu-submenu-open ant-menu-submenu-selected" onClick={this.selectsettings} role="menuitem">
              <div className="ant-menu-submenu-title" aria-expanded="true" aria-haspopup="true" aria-owns="/$Menu">
                <span><img src="../../static/image/icon/settings.png" width="20px" /><span>{intl.get('Settings.settings')}</span></span>
              </div>
            </li>
            <li className="ant-menu-submenu ant-menu-submenu-inline ant-menu-submenu-open ant-menu-submenu-selected" role="menuitem">
              <div className="ant-menu-submenu-title" aria-expanded="true" aria-haspopup="true" aria-owns="/$Menu">
                <span><img src="../../static/image/icon/notification.png" width="20px" /><span>{intl.get('Notification.Notification')}</span></span>
              </div>
            </li>
          </ul>
          <div className="logoutpanel" onClick={this.logout} ><span><img src="../../static/image/icon/logout.png" width="20px" /><span>{intl.get('Common.logout')}</span></span></div>
        </div>
      </div>
    );
  }
}

export default Sidebar;