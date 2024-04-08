import { Layout, Menu, Icon } from 'antd';
import React, { Component } from 'react';
import 'antd/dist/antd.css';
import './homelayout.css';
import Cookies from 'universal-cookie';
const cookies = new Cookies();
const { Header, Content, Footer, Sider } = Layout;

export default class HomeLayout extends Component {
    constructor() {
        super();
        this.state = {
            collapsed: false,
            mode: 'inline'
        };
        this.toggle = () => {
            this.setState({
                collapsed: !this.state.collapsed
            });
        };
        this.logout = () => {
            cookies.remove('loginInfo');
            cookies.remove('cacheInfo');
            window.location = '/user/login';
        };
        this.gethome = () => {
            window.location = '/';
        };
    }

    render() {
        return (
            <Layout>
                <Sider trigger={null} collapsible collapsed={this.state.collapsed}>
                    <Menu theme="dark" mode="inline">
                        <Menu.Item key="home">
                            <a onClick={this.gethome.bind(this)}>
                                <Icon type="home" />Home
                            </a>
                        </Menu.Item>
                        <Menu.SubMenu
                            key="user"
                            title={
                                <span>
                                    <Icon type="user" />
                                    <span>User</span>
                                </span>
                            }
                        >
                            <Menu.Item key="user-list">
                                <a href="/user/list">
                                    <Icon type="api" />User List
                                </a>
                            </Menu.Item>
                            <Menu.Item key="user-add">
                                <a href="/user/add">
                                    <Icon type="user-add" />Add New User
                                </a>
                            </Menu.Item>
                        </Menu.SubMenu>
                        <Menu.SubMenu
                            key="resource"
                            title={
                                <span>
                                    <Icon type="folder" />
                                    <span>Resource</span>
                                </span>
                            }
                        >
                            <Menu.Item key="resource-list">
                                <a href="/resource/list">
                                    <Icon type="switcher" />Resource List
                                </a>
                            </Menu.Item>
                            <Menu.Item key="resource-add">
                                <a href="/resource/add">
                                    <Icon type="folder-add" />Add New Resource
                                </a>
                            </Menu.Item>
                        </Menu.SubMenu>
                        <Menu.SubMenu
                            key="tag"
                            title={
                                <span>
                                    <Icon type="tags-o" />
                                    <span>Tag</span>
                                </span>
                            }
                        >
                            <Menu.Item key="tag-list">
                                <a href="/tag/list">
                                    <Icon type="tags-o" />Tag List
                                </a>
                            </Menu.Item>
                            <Menu.Item key="tag-add">
                                <a href="/tag/add">
                                    <Icon type="tag-o" />Add New Tag
                                </a>
                            </Menu.Item>
                        </Menu.SubMenu>
                        <Menu.SubMenu
                            key="category"
                            title={
                                <span>
                                    <Icon type="database" />
                                    <span>Category</span>
                                </span>
                            }
                        >
                            <Menu.Item key="category-list">
                                <a href="/category/list">
                                    <Icon type="switcher" />Category List
                                </a>
                            </Menu.Item>
                            <Menu.Item key="category-add">
                                <a href="/category/add">
                                    <Icon type="form" />Add New Category
                                </a>
                            </Menu.Item>
                        </Menu.SubMenu>
                        <Menu.SubMenu
                            key="mainpage"
                            title={
                                <span>
                                    <Icon type="appstore-o" />
                                    <span>Mainpage</span>
                                </span>
                            }
                        >
                            <Menu.Item key="home-star-list">
                                <a href="/home/star">
                                    <Icon type="star-o" />Star Project List
                                </a>
                            </Menu.Item>
                        </Menu.SubMenu>
                        <Menu.Item key="user-logout">
                            <a onClick={this.logout.bind(this)}>
                                <Icon type="logout" />Logout
                            </a>
                        </Menu.Item>
                    </Menu>
                </Sider>
                <Layout>
                    <Header style={{ background: '#000', padding: 0 }}>
                        <span style={{ color: '#fff', paddingLeft: '2%', fontSize: '1.4em' }}>
                            <Icon
                                className="trigger"
                                type={this.state.collapsed ? 'menu-unfold' : 'menu-fold'}
                                onClick={this.toggle}
                                style={{ cursor: 'pointer' }}
                            />
                        </span>
                        <span style={{ color: '#fff', paddingLeft: '2%', fontSize: '1.4em' }}>
                            Dashboard For goLand
                        </span>
                    </Header>
                    <Content style={{ margin: '0 16px' }}>
                        <div style={{ padding: 24, background: '#fff', minHeight: 780 }}>{this.props.children}</div>
                    </Content>
                    <Footer style={{ textAlign: 'center' }}>Dashboard For goLand ©2018 Created by Chris</Footer>
                </Layout>
            </Layout>
        );
    }
}
