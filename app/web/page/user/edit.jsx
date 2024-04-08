import React, { Component } from 'react';
import './edit.css';
import axios from 'axios';
import config from '../../config/config';
import { Form, Input, Tooltip, Icon, Cascader, Select, Button, notification, Upload } from 'antd';
import Cookies from 'universal-cookie';

const cookies = new Cookies();
const FormItem = Form.Item;
const Option = Select.Option;

const location = [
    {
        value: 'Shanghai',
        label: 'Shanghai',
        children: [
            {
                value: 'Shanghai',
                label: 'Shanghai',
                children: [
                    {
                        value: 'Xu Hui',
                        label: 'Xu Hui'
                    }
                ]
            }
        ]
    },
    {
        value: 'Zhejiang',
        label: 'Zhejiang',
        children: [
            {
                value: 'Hangzhou',
                label: 'Hangzhou',
                children: [
                    {
                        value: 'Xi Hu',
                        label: 'Xi Hu'
                    }
                ]
            }
        ]
    },
    {
        value: 'Jiangsu',
        label: 'Jiangsu',
        children: [
            {
                value: 'Nanjing',
                label: 'Nanjing',
                children: [
                    {
                        value: 'Zhong Hua Men',
                        label: 'Zhong Hua Men'
                    }
                ]
            }
        ]
    }
];

let UserAdd = undefined;

class RegistrationForm extends Component {
    constructor() {
        super();
        this.state = {
            confirmDirty: false,
            data: {},
            loading: false,
            action: `${config.server_url}user/upload/`,
            imageUrl: ''
        };
        this.handleSubmit = e => {
            return new Promise((resolve, reject) => {
                e.preventDefault();
                this.props.form.validateFieldsAndScroll((err, values) => {
                    if (!err) {
                        console.log('Received values of form: ', values);
                        const postValues = { ...values, avatar: values.avatar[0].response.data };
                        delete postValues.confirm;
                        postValues.id = this.props.exist.id;
                        postValues.phone = '+' + postValues.prefix + ' ' + postValues.phone;
                        postValues.location = postValues.location.join('-');
                        delete postValues.prefix;
                        console.log(postValues);
                        axios.post(`${config.server_url}user/update`, postValues).then(response => {
                            this.setState({ data: response.data, loading: false });
                            resolve();
                        });
                    } else reject();
                });
            });
        };
        this.handleConfirmBlur = e => {
            const value = e.target.value;
            this.setState({ confirmDirty: this.state.confirmDirty || !!value });
        };
        this.compareToFirstPassword = (rule, value, callback) => {
            const form = this.props.form;
            if (value && value !== form.getFieldValue('password')) {
                callback('Two passwords that you enter is inconsistent!');
            } else {
                callback();
            }
        };
        this.validateToNextPassword = (rule, value, callback) => {
            const form = this.props.form;
            if (value && this.state.confirmDirty) {
                form.validateFields(['confirm'], { force: true });
            }
            callback();
        };
        this.normFile = e => {
            if (Array.isArray(e)) {
                return e;
            }
            return e && e.fileList;
        };
        this.handleChange = info => {
            if (info.file.status === 'uploading') {
                this.setState({ loading: true });
                return;
            }
            if (info.file.status === 'done') {
                this.getBase64(info.file.originFileObj, imageUrl =>
                    this.setState({
                        imageUrl: info.file.response.data,
                        loading: false
                    })
                );
            }
        };
    }

    openNotification(msg, desc) {
        notification.open({
            message: msg,
            description: desc,
            placement: 'topLeft'
        });
    }

    getBase64(img, callback) {
        const reader = new FileReader();
        reader.addEventListener('load', () => callback(reader.result));
        reader.readAsDataURL(img);
    }

    beforeUpload(file) {
        const isLt2M = file.size / 1024 / 1024 < 2;
        if (!isLt2M) {
            this.openNotification('Error', 'The image must be less than 2MB');
        }
        return isLt2M;
    }

    componentWillUnmount() {
        this.props.onRef(undefined);
    }

    componentDidMount() {
        const cache = cookies.get('loginInfo');
        if (!cache) {
            this.props.onRef(undefined);
            window.location = '/user/login';
        }
        this.props.onRef(this);
        this.setState({
            uid: this.props.exist.id,
            data: {
                id: this.props.exist.id,
                email: this.props.exist.email,
                password: this.props.exist.password,
                nickname: this.props.exist.nickname,
                location: this.props.exist.location.split('-'),
                phone: this.props.exist.phone.split(' ')[1],
                prefix: this.props.exist.phone.split(' ')[0].substring(1)
            },
            imageUrl: this.props.exist.avatar
        });
    }

    componentDidUpdate() {
        if (this.state.uid && this.state.uid != this.props.exist.id) {
            this.setState({
                uid: this.props.exist.id,
                data: {
                    id: this.props.exist.id,
                    email: this.props.exist.email,
                    password: this.props.exist.password,
                    nickname: this.props.exist.nickname,
                    location: this.props.exist.location.split('-'),
                    phone: this.props.exist.phone.split(' ')[1],
                    prefix: this.props.exist.phone.split(' ')[0].substring(1)
                },
                imageUrl: this.props.exist.avatar
            });
        }
    }

    render() {
        const { getFieldDecorator } = this.props.form;
        const uploadButton = (
            <div>
                <Icon type={this.state.loading ? 'loading' : 'plus'} />
                <div className="ant-upload-text" />
            </div>
        );
        const imageUrl = this.state.imageUrl;
        const formItemLayout = {
            labelCol: {
                xs: { span: 24 },
                sm: { span: 8 }
            },
            wrapperCol: {
                xs: { span: 24 },
                sm: { span: 16 }
            }
        };
        const tailFormItemLayout = {
            wrapperCol: {
                xs: {
                    span: 24,
                    offset: 0
                },
                sm: {
                    span: 16,
                    offset: 8
                }
            }
        };
        const prefixSelector = getFieldDecorator('prefix', {
            initialValue: this.state.data.prefix
        })(
            <Select style={{ width: 70 }}>
                <Option value="86">+86</Option>
                <Option value="87">+87</Option>
            </Select>
        );

        return (
            <Form onSubmit={this.handleSubmit}>
                <FormItem {...formItemLayout} label="E-mail">
                    {getFieldDecorator('email', {
                        rules: [
                            {
                                type: 'email',
                                message: 'The input is not valid E-mail!'
                            },
                            {
                                required: true,
                                message: 'Please input your E-mail!'
                            }
                        ],
                        initialValue: this.state.data.email
                    })(<Input />)}
                </FormItem>
                <FormItem {...formItemLayout} label="Password">
                    {getFieldDecorator('password', {
                        rules: [
                            {
                                required: true,
                                message: 'Please input your password!'
                            },
                            {
                                validator: this.validateToNextPassword
                            }
                        ],
                        initialValue: this.state.data.password
                    })(<Input type="password" />)}
                </FormItem>
                <FormItem {...formItemLayout} label="Confirm">
                    {getFieldDecorator('confirm', {
                        rules: [
                            {
                                required: true,
                                message: 'Please confirm your password!'
                            },
                            {
                                validator: this.compareToFirstPassword
                            }
                        ]
                    })(<Input type="password" onBlur={this.handleConfirmBlur} />)}
                </FormItem>
                <FormItem
                    {...formItemLayout}
                    label={
                        <span>
                            Nickname&nbsp;
                            <Tooltip title="What do you want others to call you?">
                                <Icon type="question-circle-o" />
                            </Tooltip>
                        </span>
                    }
                >
                    {getFieldDecorator('nickname', {
                        rules: [{ required: true, message: 'Please input your nickname!', whitespace: true }],
                        initialValue: this.state.data.nickname
                    })(<Input />)}
                </FormItem>
                <FormItem {...formItemLayout} label="Avatar">
                    <div className="dropbox">
                        {getFieldDecorator('avatar', {
                            rules: [{ required: true, message: 'Please select a file!' }],
                            valuePropName: 'fileList',
                            getValueFromEvent: this.normFile
                        })(
                            <Upload
                                name="avatar"
                                listType="picture-card"
                                className="avatar-uploader"
                                showUploadList={false}
                                action={this.state.action}
                                beforeUpload={this.beforeUpload}
                                onChange={this.handleChange}
                                data={{ fileType: 'thumbnail' }}
                            >
                                {imageUrl ? <img src={imageUrl} alt="" /> : uploadButton}
                            </Upload>
                        )}
                    </div>
                </FormItem>
                <FormItem {...formItemLayout} label="Location">
                    {getFieldDecorator('location', {
                        initialValue: this.state.data.location,
                        rules: [{ type: 'array', required: true, message: 'Please select your location!' }]
                    })(<Cascader options={location} />)}
                </FormItem>
                <FormItem {...formItemLayout} label="Phone">
                    {getFieldDecorator('phone', {
                        rules: [{ required: true, message: 'Please input your phone number!' }],
                        initialValue: this.state.data.phone
                    })(<Input addonBefore={prefixSelector} style={{ width: '100%' }} />)}
                </FormItem>
            </Form>
        );
    }
}

export default (UserAdd = Form.create()(RegistrationForm));
