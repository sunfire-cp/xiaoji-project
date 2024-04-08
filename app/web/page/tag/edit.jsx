import React, { Component } from 'react';
import './edit.css';
import axios from 'axios';
import config from '../../config/config';
import { SketchPicker } from 'react-color';
import { Form, Input, Tooltip, Icon, Cascader, Select, Row, Col, Checkbox, Button, AutoComplete } from 'antd';
import Cookies from 'universal-cookie';
const cookies = new Cookies();
const FormItem = Form.Item;
const Option = Select.Option;
const AutoCompleteOption = AutoComplete.Option;

let TagAdd = undefined;

class RegistrationForm extends Component {
    constructor() {
        super();
        this.state = {
            confirmDirty: false,
            autoCompleteResult: [],
            data: {}
        };
        this.handleSubmit = e => {
            return new Promise((resolve, reject) => {
                e.preventDefault();
                this.props.form.validateFieldsAndScroll((err, values) => {
                    if (!err) {
                        console.log('Received values of form: ', values);
                        const postValues = { ...values, color: this.state.currentColor, id: this.state.data.id };
                        console.log(postValues);
                        axios.post(`${config.server_url}tag/update`, postValues).then(response => {
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
                name: this.props.exist.name,
                color: this.props.exist.color
            },
            currentColor: this.props.exist.color
        });
    }

    componentDidUpdate() {
        if (this.state.uid && this.state.uid != this.props.exist.id) {
            this.setState({
                uid: this.props.exist.id,
                data: {
                    id: this.props.exist.id,
                    name: this.props.exist.name,
                    color: this.props.exist.color
                },
                currentColor: this.props.exist.color
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

        return (
            <Form onSubmit={this.handleSubmit}>
                <FormItem {...formItemLayout} label="Name">
                    {getFieldDecorator('name', {
                        rules: [
                            {
                                required: true,
                                message: 'Please input the name!'
                            }
                        ],
                        initialValue: this.state.data.name
                    })(<Input />)}
                </FormItem>
                <FormItem {...formItemLayout} label="Color">
                    {getFieldDecorator('color', {
                        rules: []
                    })(<SketchPicker color={this.state.currentColor} onChange={this.onChange} />)}
                </FormItem>
            </Form>
        );
    }
}

export default (TagAdd = Form.create()(RegistrationForm));
