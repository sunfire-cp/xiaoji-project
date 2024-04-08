import React, { Component } from 'react';
import HomeLayout from 'component/homelayout/homelayout.jsx';
import './add.css';
import axios from 'axios';
import config from '../../config/config';
import { Form, Input, Upload, Icon, Button, notification } from 'antd';
import Cookies from 'universal-cookie';

const cookies = new Cookies();
const FormItem = Form.Item;

let CategoryAdd = undefined;

class CategoryAddForm extends Component {
    constructor() {
        super();
        this.state = {
            confirmDirty: false,
            data: {},
            imageUrl: '',
            loading: false,
            action: `${config.server_url}category/upload/`
        };
        this.handleSubmit = e => {
            return new Promise((resolve, reject) => {
                e.preventDefault();
                this.props.form.validateFieldsAndScroll((err, values) => {
                    if (!err) {
                        console.log('Received values of form: ', values);
                        const postValues = { ...values, icon: values.icon[0].response.data };
                        console.log(postValues);
                        axios.post(`${config.server_url}category/add`, postValues).then(response => {
                            this.setState({ data: response.data.data, loading: false });
                            window.location = '/category/list';
                        });
                    }
                });
            });
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
        this.normFile = e => {
            if (Array.isArray(e)) {
                return e;
            }
            return e && e.fileList;
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

    componentDidMount() {
        const cache = cookies.get('loginInfo');
        if (!cache) {
            window.location = '/user/login';
        }
    }

    render() {
        const { getFieldDecorator } = this.props.form;
        const { autoCompleteResult } = this.state;
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

        return (
            <HomeLayout>
                <Form onSubmit={this.handleSubmit}>
                    <FormItem {...formItemLayout} label="Name">
                        {getFieldDecorator('display_name', {
                            rules: [
                                {
                                    required: true,
                                    message: 'Please input the name!'
                                }
                            ]
                        })(<Input />)}
                    </FormItem>
                    <FormItem {...formItemLayout} label="Icon">
                        <div className="dropbox">
                            {getFieldDecorator('icon', {
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
                    <FormItem {...tailFormItemLayout}>
                        <Button type="primary" htmlType="submit">
                            Create
                        </Button>
                    </FormItem>
                </Form>
            </HomeLayout>
        );
    }
}

export default (CategoryAdd = Form.create()(CategoryAddForm));
