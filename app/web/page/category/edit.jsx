import React, { Component } from 'react';
import './edit.css';
import axios from 'axios';
import config from '../../config/config';
import { SketchPicker } from 'react-color';
import { Form, Input, Tooltip, Upload, Icon, Cascader, Select, Row, Col, Checkbox, Button, AutoComplete } from 'antd';
import Cookies from 'universal-cookie';
const cookies = new Cookies();
const FormItem = Form.Item;
const Option = Select.Option;
const AutoCompleteOption = AutoComplete.Option;

let CategoryAdd = undefined;

const getBase64 = (img, callback) => {
    const reader = new FileReader();
    reader.addEventListener('load', () => {
        callback(reader.result);
    });
    reader.readAsDataURL(img);
};

const beforeUpload = file => {
    const isLt2M = file.size / 1024 / 1024 < 2;
    if (!isLt2M) {
        console.log('Image must smaller than 2MB!');
    }
    return isLt2M;
};

class RegistrationForm extends Component {
    constructor() {
        super();
        this.state = {
            confirmDirty: false,
            autoCompleteResult: [],
            data: {},
            imageUrl: '',
            loading: false,
            action: `${config.server_url}category/upload`
        };
        this.handleSubmit = e => {
            return new Promise((resolve, reject) => {
                e.preventDefault();
                this.props.form.validateFieldsAndScroll((err, values) => {
                    if (!err) {
                        console.log('Received values of form: ', values);
                        const postValues = { ...values, id: this.state.data.id, icon: this.state.imageUrl };
                        console.log(postValues);
                        axios.post(`${config.server_url}category/update`, postValues).then(response => {
                            this.setState({ data: response.data.data, loading: false });
                            resolve();
                        });
                    } else reject();
                });
            });
        };
        this.onChange = ({ hex }) => {
            this.setState({ currentColor: hex });
        };
        this.handleChange = info => {
            if (info.file.status === 'uploading') {
                this.setState({ loading: true });
                return;
            }
            if (info.file.status === 'done') {
                getBase64(info.file.originFileObj, imageUrl => {
                    console.log(info.file.response);
                    this.setState({
                        imageUrl: info.file.response.data,
                        loading: false
                    });
                });
            }
        };
        this.normFile = e => {
            console.log('Upload event:', e);
            if (Array.isArray(e)) {
                return e;
            }
            return e && e.fileList;
        };
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
                display_name: this.props.exist.display_name,
                icon: this.props.exist.icon
            },
            imageUrl: this.props.exist.icon
        });
    }

    componentDidUpdate() {
        if (this.state.uid && this.state.uid != this.props.exist.id) {
            this.setState({
                uid: this.props.exist.id,
                data: {
                    id: this.props.exist.id,
                    display_name: this.props.exist.display_name,
                    icon: this.props.exist.icon
                },
                imageUrl: this.props.exist.icon
            });
        }
    }

    render() {
        const { getFieldDecorator } = this.props.form;
        const { autoCompleteResult } = this.state;

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
        const uploadButton = (
            <div>
                <Icon type={this.state.loading ? 'loading' : 'plus'} />
                <div className="ant-upload-text" />
            </div>
        );
        const imageUrl = this.state.imageUrl;

        return (
            <Form onSubmit={this.handleSubmit}>
                <FormItem {...formItemLayout} label="Name">
                    {getFieldDecorator('display_name', {
                        rules: [
                            {
                                required: true,
                                message: 'Please input the name!'
                            }
                        ],
                        initialValue: this.state.data.display_name
                    })(<Input />)}
                </FormItem>
                <FormItem {...formItemLayout} label="Preview Image">
                    <div className="dropbox">
                        {getFieldDecorator('icon', {
                            rules: [],
                            valuePropName: 'fileList',
                            getValueFromEvent: this.normFile
                        })(
                            <Upload
                                name="avatar"
                                listType="picture-card"
                                className="avatar-uploader"
                                showUploadList={false}
                                action={this.state.action}
                                beforeUpload={beforeUpload}
                                onChange={this.handleChange}
                                data={{ fileType: 'thumbnail' }}
                            >
                                {imageUrl ? (
                                    <img src={imageUrl} style={{ width: '100px', height: '100px' }} alt="" />
                                ) : (
                                    uploadButton
                                )}
                            </Upload>
                        )}
                    </div>
                </FormItem>
            </Form>
        );
    }
}

export default (CategoryAdd = Form.create()(RegistrationForm));
