import React, { Component } from 'react';
import HomeLayout from 'component/homelayout/homelayout.jsx';
import EditPage from './edit.jsx';
import './list.css';
import axios from 'axios';
import config from '../../config/config';
import { Table, Modal, Icon, Tooltip, Badge, Switch, Radio, Button, Form, Divider } from 'antd';
import Cookies from 'universal-cookie';
const cookies = new Cookies();
const FormItem = Form.Item;

export default class TagList extends Component {
    constructor() {
        super();
        this.columns = [
            {
                title: 'ID',
                dataIndex: 'id',
                key: 'id',
                width: 80,
                sorter: (a, b) => a.id - b.id,
                render: text => <a href="#">{text}</a>
            },
            {
                title: 'Name',
                dataIndex: 'name',
                key: 'name',
                width: 120
            },
            {
                title: 'Color',
                dataIndex: 'color',
                key: 'color',
                width: 50,
                render: (text, record) => {
                    const { r, g, b } = this.hexToRgb(record.color);
                    return (
                        <div style={{ display: 'flex' }}>
                            <div
                                style={{
                                    backgroundColor: record.color,
                                    borderRadius: '50%',
                                    width: '3rem',
                                    height: '3rem'
                                }}
                            />
                            <div style={{ marginLeft: '5%', marginTop: '1%' }}>
                                <div>Hex: {record.color}</div>
                                <div>
                                    RGB: R-{r}, G-{g}, B-{b}
                                </div>
                            </div>
                        </div>
                    );
                }
            },
            {
                title: 'Action',
                key: 'action',
                width: 100,
                render: (text, record) => (
                    <span>
                        <Tooltip title="Edit">
                            <Button
                                type="primary"
                                shape="circle"
                                icon="edit"
                                onClick={() => this.showEditModal(record)}
                            />
                        </Tooltip>
                        <Divider type="vertical" />
                        <Tooltip title="Delete">
                            <Button
                                type="danger"
                                shape="circle"
                                icon="delete"
                                onClick={() => this.showDeleteModal(record)}
                            />
                        </Tooltip>
                    </span>
                )
            }
        ];
        this.state = {
            bordered: true,
            loading: true,
            editLoading: false,
            deleteLoading: false,
            visibleDeleteModal: false,
            visibleEditModal: false,
            pagination: { position: 'bottom', pageSize: 10 },
            size: 'default',
            title: undefined,
            showHeader: undefined,
            footer: undefined,
            scroll: undefined,
            currentId: undefined,
            currentData: undefined,
            data: []
        };
        this.hexToRgb = hex => {
            const shorthandRegex = /^#?([a-f\d])([a-f\d])([a-f\d])$/i;
            hex = hex.replace(shorthandRegex, function(m, r, g, b) {
                return r + r + g + g + b + b;
            });
            const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
            return result
                ? {
                    r: parseInt(result[1], 16),
                    g: parseInt(result[2], 16),
                    b: parseInt(result[3], 16)
                }
                : null;
        };
        this.handleOkDeleteModal = () => {
            this.setState({
                deleteLoading: true
            });
            this.deleteData(this.state.currentId);
        };
        this.handleCancelDeleteModal = () => {
            this.setState({
                visibleDeleteModal: false
            });
        };
        this.showDeleteModal = r => {
            this.setState({
                visibleDeleteModal: true,
                currentId: r.id
            });
        };
        this.handleOkEditModal = e => {
            this.setState({
                editLoading: true
            });
            this.editpage
                .handleSubmit(e)
                .then(() => {
                    this.setState({
                        editLoading: false,
                        visibleEditModal: false
                    });
                    axios
                        .get(`${config.server_url}tag/list`)
                        .then(response => this.setState({ data: response.data.data, loading: false }));
                })
                .catch(err => {
                    this.setState({
                        editLoading: false
                    });
                });
        };
        this.handleCancelEditModal = () => {
            this.setState({
                visibleEditModal: false
            });
        };
        this.showEditModal = r => {
            this.setState({
                visibleEditModal: true,
                currentData: r
            });
        };
        this.deleteData = id => {
            axios
                .post(`${config.server_url}tag/delete`, {
                    id: id
                })
                .then(response => {
                    this.setState({
                        visibleDeleteModal: false,
                        deleteLoading: false
                    });
                    axios
                        .get(`${config.server_url}tag/list`)
                        .then(response => this.setState({ data: response.data.data, loading: false }));
                });
        };
    }

    componentWillMount() {
        axios.get(`${config.server_url}tag/list`).then(response => {
            if (response.data.code == 0) response = response.data;
            this.setState({ data: response.data, loading: false });
        });
    }

    componentDidMount() {
        const cache = cookies.get('loginInfo');
        if (!cache) {
            window.location = '/user/login';
        }
    }

    render() {
        const state = this.state;
        return (
            <HomeLayout>
                <Table {...this.state} columns={this.columns} dataSource={this.state.data} rowKey="id" />
                <div>
                    <Modal
                        title="Edit"
                        visible={this.state.visibleEditModal}
                        onOk={this.handleOkEditModal}
                        confirmLoading={this.state.editLoading}
                        onCancel={this.handleCancelEditModal}
                        cancelText="Cancel"
                        okText="Confirm"
                    >
                        <EditPage onRef={ref => (this.editpage = ref)} exist={this.state.currentData} />
                    </Modal>
                </div>
                <div>
                    <Modal
                        title="Delete"
                        visible={this.state.visibleDeleteModal}
                        onOk={this.handleOkDeleteModal}
                        confirmLoading={this.state.deleteLoading}
                        onCancel={this.handleCancelDeleteModal}
                        cancelText="Cancel"
                        okText="Confirm"
                    >
                        <p>Do you confirm to delete it?</p>
                    </Modal>
                </div>
            </HomeLayout>
        );
    }
}
