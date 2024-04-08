import React, { Component } from 'react';
import HomeLayout from 'component/homelayout/homelayout.jsx';
import './list.css';
import EditPage from './edit.jsx';
import axios from 'axios';
import config from '../../config/config';
import { Table, Icon, Switch, Radio, Form, Divider, Tag, Tooltip, Button, Modal, Badge, notification } from 'antd';
import HtmlToReact from 'html-to-react';
import Cookies from 'universal-cookie';
const cookies = new Cookies();
const HtmlToReactParser = HtmlToReact.Parser;
const FormItem = Form.Item;
const confirm = Modal.confirm;

export default class ResourceList extends Component {
    constructor() {
        super();
        this.openNotification = (msg, desc) => {
            notification.open({
                message: msg,
                description: desc,
                placement: 'topLeft'
            });
        };
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
                title: 'Preview Image',
                dataIndex: 'preview_image',
                key: 'preview_image',
                width: 50,
                render: text => <img src={text} style={{ width: 100, height: 100 }} />
            },
            {
                title: 'Name',
                dataIndex: 'name',
                key: 'name',
                width: 120
            },
            {
                title: 'Category',
                dataIndex: 'category',
                key: 'category',
                width: 170
            },
            {
                title: 'Description',
                dataIndex: 'desc',
                key: 'desc',
                width: 170
            },
            {
                title: 'Creator',
                dataIndex: 'creator',
                key: 'creator',
                width: 100
            },
            {
                title: 'Status',
                dataIndex: 'status',
                key: 'status',
                filters: [
                    {
                        text: 'Approved',
                        value: 2
                    },
                    {
                        text: 'Abandoned',
                        value: 1
                    },
                    {
                        text: 'Pending',
                        value: 0
                    }
                ],
                onFilter: (value, record) => {
                    return record.status == value;
                },
                render: (text, record) => {
                    if (record.status === 0) {
                        return (
                            <span>
                                <Badge status="processing" />Pending
                            </span>
                        );
                    } else if (record.status === 1) {
                        return (
                            <span>
                                <Badge status="error" />Abandoned
                            </span>
                        );
                    } else if (record.status === 2) {
                        return (
                            <span>
                                <Badge status="success" />Approved
                            </span>
                        );
                    } else {
                        return (
                            <span>
                                <Badge status="warning" />Warning
                            </span>
                        );
                    }
                }
            },
            {
                title: 'Tags',
                dataIndex: 'adjustedTags',
                key: 'adjustedTags'
            },
            {
                title: 'Action',
                key: 'action',
                width: 220,
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
                        {record.status == 0 ? <Divider type="vertical" /> : null}
                        {record.status == 0 ? (
                            <Tooltip title="Approve">
                                <Button
                                    type="primary"
                                    style={{ backgroundColor: '#65cc43', borderColor: '#65cc43' }}
                                    shape="circle"
                                    icon="check"
                                    onClick={() => this.showConfirmApprove(record)}
                                />
                            </Tooltip>
                        ) : null}
                        {record.status == 0 ? <Divider type="vertical" /> : null}
                        {record.status == 0 ? (
                            <Tooltip title="Abandon">
                                <Button
                                    type="primary"
                                    style={{ backgroundColor: '#ff4949', borderColor: '#ff4949' }}
                                    shape="circle"
                                    icon="close"
                                    onClick={() => this.showConfirmAbandon(record)}
                                />
                            </Tooltip>
                        ) : null}
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
        const htmlToReactParser = new HtmlToReactParser();

        const expandedRowRender = record => {
            console.log(record.content);
            const reactElement = htmlToReactParser.parse(record.content);
            console.log(reactElement);
            return reactElement;
        };
        this.init = () => {
            axios.get(`${config.server_url}resource/list`).then(response => {
                if (response.data.code == 0) response = response.data;
                for (let x = 0; x < response.data.length; x++) {
                    let temp = [];
                    for (let i = 0; i < response.data[x].tags.length; i++) {
                        temp.push(
                            <Tag color={response.data[x].tags[i].color} key={response.data[x].tags[i].tag_id}>
                                {response.data[x].tags[i].tag}
                            </Tag>
                        );
                    }
                    response.data[x].adjustedTags = temp;
                }
                this.setState({ data: response.data, loading: false });
            });
        };
        this.showConfirmApprove = record => {
            confirm({
                title: 'Do you want to approve this resource?',
                onOk: () => {
                    return new Promise((resolve, reject) => {
                        const cache = cookies.get('loginInfo');
                        axios
                            .post(`${config.server_url}resource/set_status`, {
                                id: record.id,
                                status: 2,
                                user_id: cache.id
                            })
                            .then(response => {
                                this.openNotification('Success', 'Succeed to abandon it.');
                                this.init();
                                resolve();
                            });
                    }).catch(() => this.openNotification('Error', 'Failed to abandon it.'));
                },
                onCancel() {}
            });
        };
        this.showConfirmAbandon = record => {
            confirm({
                title: 'Do you want to abandon this resource?',
                onOk: () => {
                    return new Promise((resolve, reject) => {
                        const cache = cookies.get('loginInfo');
                        axios
                            .post(`${config.server_url}resource/set_status`, {
                                id: record.id,
                                status: 1,
                                user_id: cache.id
                            })
                            .then(response => {
                                this.openNotification('Success', 'Succeed to abandon it.');
                                this.init();
                                resolve();
                            });
                    }).catch(() => this.openNotification('Error', 'Failed to abandon it.'));
                },
                onCancel() {}
            });
        };
        this.state = {
            bordered: true,
            loading: true,
            pagination: { position: 'bottom' },
            size: 'default',
            expandedRowRender,
            title: undefined,
            showHeader: undefined,
            footer: undefined,
            scroll: undefined,
            visibleDeleteModal: false,
            deleteLoading: false,
            currentId: undefined,
            editLoading: false,
            visibleEditModal: false,
            currentData: undefined,
            data: []
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
                    axios.get(`${config.server_url}resource/list`).then(response => {
                        if (response.data.code == 0) response = response.data;
                        for (let x = 0; x < response.data.length; x++) {
                            let temp = [];
                            for (let i = 0; i < response.data[x].tags.length; i++) {
                                temp.push(
                                    <Tag color={response.data[x].tags[i].color} key={response.data[x].tags[i].tag_id}>
                                        {response.data[x].tags[i].tag}
                                    </Tag>
                                );
                            }
                            response.data[x].adjustedTags = temp;
                        }
                        this.setState({ data: response.data, loading: false });
                    });
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
            const cache = cookies.get('loginInfo');
            axios
                .post(`${config.server_url}resource/delete`, {
                    id: id,
                    user_id: cache.id
                })
                .then(response => {
                    this.setState({
                        visibleDeleteModal: false,
                        deleteLoading: false
                    });
                    axios.get(`${config.server_url}resource/list`).then(response => {
                        if (response.data.code == 0) response = response.data;
                        for (let x = 0; x < response.data.length; x++) {
                            let temp = [];
                            for (let i = 0; i < response.data[x].tags.length; i++) {
                                temp.push(
                                    <Tag color={response.data[x].tags[i].color} key={response.data[x].tags[i].tag_id}>
                                        {response.data[x].tags[i].tag}
                                    </Tag>
                                );
                            }
                            response.data[x].adjustedTags = temp;
                        }
                        this.setState({ data: response.data, loading: false });
                    });
                });
        };
    }

    componentWillMount() {
        axios.get(`${config.server_url}resource/list`).then(response => {
            if (response.data.code == 0) response = response.data;
            for (let x = 0; x < response.data.length; x++) {
                let temp = [];
                for (let i = 0; i < response.data[x].tags.length; i++) {
                    temp.push(
                        <Tag color={response.data[x].tags[i].color} key={response.data[x].tags[i].tag_id}>
                            {response.data[x].tags[i].tag}
                        </Tag>
                    );
                }
                response.data[x].adjustedTags = temp;
            }
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
                        width={1000}
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
