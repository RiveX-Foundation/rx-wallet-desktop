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
}))

@observer
class Sidebar extends Component {
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

  render() {
    const { sidebarColumns, settings } = this.props;

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
          <ul class="ant-menu ant-menu-sub ant-menu-inline" role="menu">
            <li class="ant-menu-item" role="menuitem" style={{paddingLeft: "48px"}}>
              <img src='../../static/image/icon/wallet.png' width="20px" /><span style={{marginLeft:"5px"}}>{intl.get('menuConfig.wallet')}</span>
            </li>
            <li class="ant-menu-item" role="menuitem" style={{paddingLeft: "48px"}}>
              <img src='../../static/image/icon/wallet.png' width="20px" /><span style={{marginLeft:"5px"}}>{intl.get('menuConfig.sharedwallet')}</span>
            </li>
            <li class="ant-menu-item" role="menuitem" style={{paddingLeft: "48px"}}>
              <img src='../../static/image/icon/wallet.png' width="20px" /><span style={{marginLeft:"5px"}}>{intl.get('menuConfig.ledger')}</span>
            </li>
            <li class="ant-menu-item" role="menuitem" style={{paddingLeft: "48px"}}>
              <img src='../../static/image/icon/wallet.png' width="20px" /><span style={{marginLeft:"5px"}}>{intl.get('menuConfig.trezor')}</span>
            </li>
          </ul>
        </div>

        <Menu theme="dark" mode="inline" defaultSelectedKeys={[this.props.path]} className="menuTreeNode">
          { this.renderMenu(sidebarColumns) }
        </Menu>
      </div>
    );
  }
}

export default Sidebar;