import React, { Component } from 'react';
import { SketchPicker } from 'react-color';
import HomeLayout from 'component/homelayout/homelayout.jsx';
import './add.css';
import axios from 'axios';
import config from '../../config/config';
import { Form, Modal, Input, Tooltip, Icon, Cascader, Select, Row, Col, Checkbox, Button, AutoComplete } from 'antd';
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
            data: {},
            currentColor: '#f50',
            visiblePicker: false
        };
        this.handleSubmit = e => {
            return new Promise((resolve, reject) => {
                e.preventDefault();
                this.props.form.validateFieldsAndScroll((err, values) => {
                    if (!err) {
                        console.log('Received values of form: ', values);
                        const postValues = { ...values, color: this.state.currentColor };
                        console.log(postValues);
                        axios.post(`${config.server_url}tag/add`, postValues).then(response => {
                            this.setState({ data: response.data.data, loading: false });
                            window.location = '/tag/list';
                        });
                    }
                });
            });
        };
        this.onChange = ({ hex }) => {
            this.setState({ currentColor: hex });
        };
        this.showPickerModal = () => {
            this.setState({
                visiblePicker: true
            });
        };
        this.handleCancelPickerModal = () => {
            this.setState({
                visiblePicker: false
            });
        };
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
                        {getFieldDecorator('name', {
                            rules: [
                                {
                                    required: true,
                                    message: 'Please input the name!'
                                }
                            ]
                        })(<Input />)}
                    </FormItem>
                    <FormItem {...formItemLayout} label="Color">
                        {getFieldDecorator('color', {
                            rules: []
                        })(
                            <Button
                                style={{
                                    backgroundColor: this.state.currentColor,
                                    width: '3rem',
                                    height: '3rem',
                                    marginTop: '-0.5%',
                                    borderRadius: '50%'
                                }}
                                onClick={this.showPickerModal}
                                size="medium"
                            />
                        )}
                    </FormItem>
                    <FormItem {...tailFormItemLayout}>
                        <Button type="primary" htmlType="submit">
                            Create
                        </Button>
                    </FormItem>
                </Form>
                <Modal
                    visible={this.state.visiblePicker}
                    onCancel={this.handleCancelPickerModal}
                    footer={null}
                    width={268}
                    closable={false}
                >
                    <SketchPicker color={this.state.currentColor} onChange={this.onChange} />
                </Modal>
            </HomeLayout>
        );
    }
}

export default (TagAdd = Form.create()(RegistrationForm));
