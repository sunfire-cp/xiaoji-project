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
            alertText: ''
        };
        this.ifRemember = e => {
            const email = this.props.form.getFieldValue('email');
            const password = this.props.form.getFieldValue('password');
            if (e.target.checked) {
                cookies.set('cacheInfo', { email, password }, { path: '/' });
            } else {
                cookies.remove('cacheInfo');
            }
        };
        this.handleSubmit = e => {
            if (e) e.preventDefault();
            this.props.form.validateFields((err, values) => {
                if (!err) {
                    console.log('Received values of form: ', values);
                    delete values.remember;
                    delete values.loginBtn;
                    delete values.forget;
                    axios.post(`${config.server_url}user/login_dashboard`, values).then(response => {
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
                            cookies.set('loginInfo', response.data.data, { path: '/' });
                            window.location = '/';
                        }
                    });
                }
            });
        };
    }

    componentDidMount() {
        const cache = cookies.get('cacheInfo');
        if (cache) {
            this.props.form.setFieldsValue({ email: cache.email, password: cache.password, remember: true });
            this.handleSubmit();
        }
    }

    render() {
        const { getFieldDecorator } = this.props.form;
        return (
            <Form
                style={{ marginLeft: '40%', marginRight: '40%', marginTop: '15%' }}
                onSubmit={this.handleSubmit}
                className="login-form"
            >
                <h1 style={{ textAlign: 'center', alignItems: 'center' }}>
                    <img src="https://xiaoji-web.oss-cn-hangzhou.aliyuncs.com/web/logo.png" style={{}} />
                    <br />Management System
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
                        <Input prefix={<Icon type="mail" style={{ color: 'rgba(0,0,0,.25)' }} />} placeholder="Email" />
                    )}
                </FormItem>
                <FormItem>
                    {getFieldDecorator('password', {
                        rules: [{ required: true, message: 'Please input your Password!' }]
                    })(
                        <Input
                            prefix={<Icon type="lock" style={{ color: 'rgba(0,0,0,.25)' }} />}
                            type="password"
                            placeholder="Password"
                        />
                    )}
                </FormItem>
                <FormItem style={{ textAlign: 'right' }}>
                    {getFieldDecorator('remember', {
                        valuePropName: 'checked',
                        initialValue: false
                    })(<Checkbox onChange={this.ifRemember}>Remember me</Checkbox>)}
                </FormItem>
                <FormItem style={{ textAlign: 'center' }}>
                    {getFieldDecorator('loginBtn', {
                        rules: []
                    })(
                        <Button type="primary" htmlType="submit" className="login-form-button">
                            Log in
                        </Button>
                    )}
                    {this.state.canDisplayAlert ? (
                        <Alert message={this.state.alertText} type="error" showIcon style={{ textAlign: 'center' }} />
                    ) : null}
                    {this.state.canDisplaySuccess ? (
                        <Alert message="Success" type="success" showIcon style={{ textAlign: 'center' }} />
                    ) : null}
                </FormItem>
                <FormItem style={{ textAlign: 'center' }}>
                    {getFieldDecorator('forget', {
                        rules: []
                    })(
                        <div>
                            <a className="login-form-forgot" href="/user/forget">
                                Forgot password?
                            </a>
                        </div>
                    )}
                </FormItem>
            </Form>
        );
    }
}

const WrappedNormalLoginForm = Form.create()(NormalLoginForm);

export default WrappedNormalLoginForm;
