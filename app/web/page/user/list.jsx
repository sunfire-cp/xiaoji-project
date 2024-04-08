import React, {Component} from 'react'
import HomeLayout from 'component/homelayout/homelayout.jsx'
import EditPage from './edit.jsx'
import './list.css'
import axios from 'axios'
import config from '../../config/config'
import {Table, Modal, Icon, Tooltip, Badge, Switch, Radio, Button, Form, Divider, notification} from 'antd'
import Cookies from 'universal-cookie'
const cookies = new Cookies()
const FormItem = Form.Item

export default class UserList extends Component {
    constructor() {
        super()
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
                title: 'Nickname',
                dataIndex: 'nickname',
                key: 'nickname',
                width: 120
            },
            {
                title: 'Email',
                dataIndex: 'email',
                key: 'email',
                width: 170
            },
            {
                title: 'Avatar',
                dataIndex: 'avatar',
                key: 'avatar',
                width: 30,
                render: text => <img src={text} style={{width: 100, height: 100}} />
            },
            {
                title: 'Location',
                dataIndex: 'location',
                key: 'location',
                filters: [
                    {
                        text: 'Zhejiang',
                        value: 'Zhejiang'
                    },
                    {
                        text: 'Shanghai',
                        value: 'Shanghai'
                    }
                ],
                onFilter: (value, record) => record.location.indexOf(value) === 0
            },
            {
                title: 'Phone Number',
                dataIndex: 'phone',
                key: 'phone'
            },
            {
                title: 'Status',
                key: 'status',
                filters: [
                    {
                        text: 'Normal',
                        value: 1
                    },
                    {
                        text: 'Banned',
                        value: 0
                    }
                ],
                onFilter: (value, record) => record.status == value,
                render: (text, record) =>
                    !!record.status ? (
                        <span>
                            <Badge status="success" />Normal
                        </span>
                    ) : (
                        <span>
                            <Badge status="error" />Banned
                        </span>
                    )
            },
            {
                title: 'Action',
                key: 'action',
                width: 180,
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
                        {!!record.status ? (
                            <Tooltip title="Ban">
                                <Button shape="circle" icon="lock" onClick={() => this.showStatusModal(record)} />
                            </Tooltip>
                        ) : (
                            <Tooltip title="Unban">
                                <Button shape="circle" icon="unlock" onClick={() => this.showStatusModal(record)} />
                            </Tooltip>
                        )}
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
        ]
        this.getOperationText = data => {
            let content = ''
            let action = ''
            if (data.status === 0) {
                action = 'is still waiting for being reviewed'
            } else if (data.status === 1) {
                action = 'was approved by ' + data.operator_name
            } else if (data.status === 2) {
                action = 'was abandoned by ' + data.operator_name
            }
            // 1:add resource, 2:approve resource, 3:abandon resource, 4:delete resource, 5:apply to delete resource
            switch (data.operation_type) {
            case 1:
                content = `Add resource '${data.operation_relevant_data_name}'`
                break
            case 2:
                content = `Resource '${data.operation_relevant_data_name}' was approved by '${data.operator_name}'`
                break
            case 3:
                content = `Resource '${data.operation_relevant_data_name}' was abandoned by '${data.operator_name}'`
                break
            case 4:
                content = `Delete resource '${data.operation_relevant_data_name}'`
                break
            case 5:
                content = `Apply to delete resource '${data.operation_relevant_data_name}' and ${action}`
                break
            }
            return content
        }
        this.expandedRowRender = record => {
            const columns = [
                {
                    title: 'Operation Content',
                    dataIndex: 'operation_content',
                    key: 'operation_content',
                    render: (text, record) => {
                        return <p>{this.getOperationText(record)}</p>
                    }
                },
                {title: 'Operation Date', dataIndex: 'created_at', key: 'created_at'},
                {title: 'Reviewd Date', dataIndex: 'updated_at', key: 'updated_at'},
                {
                    title: 'Status',
                    dataIndex: 'status',
                    key: 'status',
                    render: (text, record) => {
                        if (record.status === 0) {
                            return (
                                <span>
                                    <Badge status="processing" />Pending
                                </span>
                            )
                        } else if (record.status === 1) {
                            return (
                                <span>
                                    <Badge status="success" />Approved
                                </span>
                            )
                        } else if (record.status === 2) {
                            return (
                                <span>
                                    <Badge status="error" />Abandoned
                                </span>
                            )
                        } else {
                            return (
                                <span>
                                    <Badge status="warning" />Warning
                                </span>
                            )
                        }
                    }
                },
                {
                    title: 'Action',
                    key: 'action',
                    render: (text, record) => (
                        <span>
                            {record.status == 0 ? (
                                <Tooltip title="Approve">
                                    <Button
                                        type="primary"
                                        style={{backgroundColor: '#65cc43', borderColor: '#65cc43'}}
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
                                        style={{backgroundColor: '#ff4949', borderColor: '#ff4949'}}
                                        shape="circle"
                                        icon="close"
                                        onClick={() => this.showConfirmAbandon(record)}
                                    />
                                </Tooltip>
                            ) : null}
                            {record.status != 0 ? <p>N/A</p> : null}
                        </span>
                    )
                }
            ]
            return <Table columns={columns} dataSource={record.operations} pagination={false} rowKey="id" />
        }
        this.showConfirmApprove = record => {
            confirm({
                title: 'Do you want to approve this operation?',
                onOk: () => {
                    return new Promise((resolve, reject) => {
                        const cache = cookies.get('loginInfo')
                        axios
                            .post(`${config.server_url}user/solve_operation`, {
                                id: record.id,
                                status: 1,
                                operator: cache.id
                            })
                            .then(response => {
                                this.openNotification('Success', 'Succeed to abandon it.')
                                this.init()
                                resolve()
                            })
                    }).catch(() => this.openNotification('Error', 'Failed to abandon it.'))
                },
                onCancel() {}
            })
        }
        this.showConfirmAbandon = record => {
            confirm({
                title: 'Do you want to abandon this operation?',
                onOk: () => {
                    return new Promise((resolve, reject) => {
                        const cache = cookies.get('loginInfo')
                        axios
                            .post(`${config.server_url}user/solve_operation`, {
                                id: record.id,
                                status: 2,
                                operator: cache.id
                            })
                            .then(response => {
                                this.openNotification('Success', 'Succeed to abandon it.')
                                this.init()
                                resolve()
                            })
                    }).catch(() => this.openNotification('Error', 'Failed to abandon it.'))
                },
                onCancel() {}
            })
        }
        this.openNotification = (msg, desc) => {
            notification.open({
                message: msg,
                description: desc,
                placement: 'topLeft'
            })
        }
        this.state = {
            bordered: true,
            loading: true,
            editLoading: false,
            deleteLoading: false,
            visibleDeleteModal: false,
            visibleStatusModal: false,
            visibleEditModal: false,
            banLoading: false,
            pagination: {position: 'bottom', pageSize: 10},
            size: 'default',
            expandedRowRender: this.expandedRowRender,
            title: undefined,
            showHeader: undefined,
            footer: undefined,
            scroll: undefined,
            statusText: 'Do you confirm to ',
            currentId: undefined,
            currentStatus: undefined,
            currentData: undefined,
            data: []
        }
        this.handleOkDeleteModal = () => {
            this.setState({
                deleteLoading: true
            })
            this.deleteData(this.state.currentId)
        }
        this.handleCancelDeleteModal = () => {
            this.setState({
                visibleDeleteModal: false
            })
        }
        this.showDeleteModal = r => {
            this.setState({
                visibleDeleteModal: true,
                currentId: r.id
            })
        }
        this.handleOkEditModal = e => {
            this.setState({
                editLoading: true
            })
            this.editpage
                .handleSubmit(e)
                .then(() => {
                    this.setState({
                        editLoading: false,
                        visibleEditModal: false
                    })
                    axios
                        .get(`${config.server_url}user/list`)
                        .then(response => this.setState({data: response.data.data, loading: false}))
                })
                .catch(err => {
                    this.setState({
                        editLoading: false
                    })
                })
        }
        this.handleCancelEditModal = () => {
            this.setState({
                visibleEditModal: false
            })
        }
        this.showEditModal = r => {
            this.setState({
                visibleEditModal: true,
                currentData: r
            })
        }
        this.handleOkStatusModal = () => {
            this.setState({
                banLoading: true
            })
            this.switchStatus(this.state.currentId, this.state.currentStatus)
        }
        this.handleCancelStatusModal = () => {
            this.setState({
                visibleStatusModal: false
            })
        }
        this.showStatusModal = r => {
            if (!!r.status) {
                this.setState({
                    visibleStatusModal: true,
                    statusText: 'Do you confirm to ban it?',
                    currentId: r.id,
                    currentStatus: r.status
                })
            } else {
                this.setState({
                    visibleStatusModal: true,
                    statusText: 'Do you confirm to unban it?',
                    currentId: r.id,
                    currentStatus: r.status
                })
            }
        }
        this.deleteData = id => {
            axios
                .post(`${config.server_url}user/delete`, {
                    id: id
                })
                .then(response => {
                    this.setState({
                        visibleDeleteModal: false,
                        deleteLoading: false
                    })
                    axios
                        .get(`${config.server_url}user/list`)
                        .then(response => this.setState({data: response.data.data, loading: false}))
                })
        }
        this.switchStatus = (id, status) => {
            axios
                .post(`${config.server_url}user/update`, {
                    id: id,
                    status: 1 - status
                })
                .then(response => {
                    this.setState({
                        visibleStatusModal: false,
                        banLoading: false
                    })
                    axios
                        .get(`${config.server_url}user/list`)
                        .then(response => this.setState({data: response.data.data, loading: false}))
                })
        }
    }

    componentWillMount() {
        axios.get(`${config.server_url}user/list`).then(response => {
            console.log(response.data)
            this.setState({data: response.data.data, loading: false})
        })
    }

    componentDidMount() {
        const cache = cookies.get('loginInfo')
        if (!cache) {
            window.location = '/user/login'
        }
    }

    render() {
        const state = this.state
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
                        okText="Confirm">
                        <EditPage onRef={ref => (this.editpage = ref)} exist={this.state.currentData} />
                    </Modal>
                </div>
                <div>
                    <Modal
                        title="Switch Status"
                        visible={this.state.visibleStatusModal}
                        onOk={this.handleOkStatusModal}
                        confirmLoading={this.state.banLoading}
                        onCancel={this.handleCancelStatusModal}
                        cancelText="Cancel"
                        okText="Confirm">
                        <p>{this.state.statusText}</p>
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
                        okText="Confirm">
                        <p>Do you confirm to delete it?</p>
                    </Modal>
                </div>
            </HomeLayout>
        )
    }
}
