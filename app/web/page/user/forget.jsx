import React, { Component } from 'react';
import { Form, Icon, Input, Button, Checkbox, Alert } from 'antd';
import Cookies from 'universal-cookie';
import axios from 'axios';
import config from '../../config/config';
const cookies = new Cookies();
const FormItem = Form.Item;

class NormalLoginForm extends Component {
    constructor(props) {
        super(props);
        this.state = {
            canDisplayAlert: false,
            canDisplaySuccess: false,
            alertText: '',
            hasSent: false
        };
        this.sendConfirm = e => {
            if (e) e.preventDefault();
            this.props.form.validateFields((err, values) => {
                if (!err) {
                    console.log('Received values of form: ', values);
                    delete values.submitBtn;
                    delete values.login;
                    axios.post(`${config.server_url}user/forget`, values).then(response => {
                        console.log(response.data);
                        if (response.data && response.data.code !== 0) {
                            this.setState({
                                alertText: response.data.msg,
                                canDisplayAlert: true,
                                canDisplaySuccess: false,
                                hasSent: false
                            });
                        } else {
                            this.setState({
                                canDisplayAlert: false,
                                canDisplaySuccess: true,
                                hasSent: true
                            });
                        }
                    });
                }
            });
        };
        this.handleSubmit = e => {
            if (e) e.preventDefault();
            this.props.form.validateFields((err, values) => {
                if (!err) {
                    console.log('Received values of form: ', values);
                    delete values.submitBtn;
                    delete values.login;
                    axios.post(`${config.server_url}user/reset_password`, values).then(response => {
                        if (response.data && response.data.code !== 0) {
                            this.setState({
                                alertText: response.data.msg,
                                canDisplayAlert: true,
                                canDisplaySuccess: false
                            });
                        } else {
                            this.setState({
                                canDisplayAlert: false,
                                canDisplaySuccess: true
                            });
                            window.location = '/user/login';
                        }
                    });
                }
            });
        };
    }

    componentDidMount() {}

    render() {
        const { getFieldDecorator } = this.props.form;
        return (
            <div>
                {this.state.hasSent ? (
                    <Form
                        style={{ marginLeft: '40%', marginRight: '40%', marginTop: '15%' }}
                        onSubmit={this.handleSubmit}
                        className="login-form"
                    >
                        <h1 style={{ textAlign: 'center', alignItems: 'center' }}>
                            <img src="https://xiaoji-web.oss-cn-hangzhou.aliyuncs.com/web/logo.png" style={{}} />
                            <br />Reset your password
                        </h1>

                        <FormItem>
                            {getFieldDecorator('email', {
                                rules: [
                                    {
                                        type: 'email',
                                        message: 'The input is not valid E-mail!'
                                    },
                                    { required: true, message: 'Please input your email!' }
                                ]
                            })(
                                <Input
                                    prefix={<Icon type="mail" style={{ color: 'rgba(0,0,0,.25)' }} />}
                                    placeholder="Email"
                                />
                            )}
                        </FormItem>
                        <FormItem>
                            {getFieldDecorator('content', {
                                rules: [{ required: true, message: 'Please input the confirm code!' }]
                            })(
                                <Input
                                    prefix={<Icon type="key" style={{ color: 'rgba(0,0,0,.25)' }} />}
                                    placeholder="Code"
                                />
                            )}
                        </FormItem>
                        <FormItem>
                            {getFieldDecorator('password', {
                                rules: [{ required: true, message: 'Please input a new password!' }]
                            })(
                                <Input
                                    prefix={<Icon type="lock" style={{ color: 'rgba(0,0,0,.25)' }} />}
                                    type="password"
                                    placeholder="Password"
                                />
                            )}
                        </FormItem>
                        <FormItem style={{ textAlign: 'center' }}>
                            {getFieldDecorator('submitBtn', {
                                rules: []
                            })(
                                <Button type="primary" htmlType="submit" className="login-form-button">
                                    Confirm Reset
                                </Button>
                            )}
                            {this.state.canDisplayAlert ? (
                                <Alert
                                    message={this.state.alertText}
                                    type="error"
                                    showIcon
                                    style={{ textAlign: 'center' }}
                                />
                            ) : null}
                            {this.state.canDisplaySuccess ? (
                                <Alert message="Success" type="success" showIcon style={{ textAlign: 'center' }} />
                            ) : null}
                        </FormItem>
                        <FormItem style={{ textAlign: 'center' }}>
                            {getFieldDecorator('login', {
                                rules: []
                            })(
                                <div>
                                    <a className="login-form-forgot" href="/user/login">
                                        Back to login
                                    </a>
                                </div>
                            )}
                        </FormItem>
                    </Form>
                ) : (
                    <Form
                        style={{ marginLeft: '40%', marginRight: '40%', marginTop: '15%' }}
                        onSubmit={this.sendConfirm}
                        className="login-form"
                    >
                        <h1 style={{ textAlign: 'center', alignItems: 'center' }}>
                            <img src="https://s3-ap-northeast-1.amazonaws.com/xiaojibucket/web/logo.png" style={{}} />
                            <br />Reset your password
                        </h1>

                        <FormItem>
                            {getFieldDecorator('email', {
                                rules: [
                                    {
                                        type: 'email',
                                        message: 'The input is not valid E-mail!'
                                    },
                                    { required: true, message: 'Please input your email!' }
                                ]
                            })(
                                <Input
                                    prefix={<Icon type="mail" style={{ color: 'rgba(0,0,0,.25)' }} />}
                                    placeholder="Email"
                                />
                            )}
                        </FormItem>
                        <FormItem style={{ textAlign: 'center' }}>
                            {getFieldDecorator('submitBtn', {
                                rules: []
                            })(
                                <Button type="primary" htmlType="submit" className="login-form-button">
                                    Send
                                </Button>
                            )}
                            {this.state.canDisplayAlert ? (
                                <Alert
                                    message={this.state.alertText}
                                    type="error"
                                    showIcon
                                    style={{ textAlign: 'center' }}
                                />
                            ) : null}
                            {this.state.canDisplaySuccess ? (
                                <Alert message="Success" type="success" showIcon style={{ textAlign: 'center' }} />
                            ) : null}
                        </FormItem>
                        <FormItem style={{ textAlign: 'center' }}>
                            {getFieldDecorator('login', {
                                rules: []
                            })(
                                <div>
                                    <a className="login-form-forgot" href="/user/login">
                                        Back to login
                                    </a>
                                </div>
                            )}
                        </FormItem>
                    </Form>
                )}
            </div>
        );
    }
}

const WrappedNormalLoginForm = Form.create()(NormalLoginForm);

export default WrappedNormalLoginForm;
