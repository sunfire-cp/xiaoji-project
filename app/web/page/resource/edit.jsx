import React, {Component} from 'react'
import HomeLayout from 'component/homelayout/homelayout.jsx'
import './edit.css'
import axios from 'axios'
let BraftEditor
import 'braft-editor/dist/braft.css'
import config from '../../config/config'
import {
    Form,
    Input,
    Tooltip,
    Upload,
    Icon,
    Cascader,
    Select,
    InputNumber,
    Modal,
    Row,
    Col,
    Checkbox,
    Button,
    AutoComplete,
    Breadcrumb,
    Spin,
    Radio,
    Tag
} from 'antd'
import {max} from 'moment'
import Cookies from 'universal-cookie'
const cookies = new Cookies()
const FormItem = Form.Item
const TextArea = Input.TextArea
const RadioButton = Radio.Button
const Option = Select.Option
const AutoCompleteOption = AutoComplete.Option
const RadioGroup = Radio.Group

let categorys = []
let tags = []

const getBase64 = (img, callback) => {
    const reader = new FileReader()
    reader.addEventListener('load', () => {
        console.log(reader.result)
        callback(reader.result)
    })
    reader.readAsDataURL(img)
}

const beforeUpload = file => {
    console.log(file)
    const isLt2M = file.size / 1024 / 1024 < 2
    if (!isLt2M) {
        console.log('Image must smaller than 2MB!')
    }
    return isLt2M
}

let ResourceEdit = undefined

class ResourceEditForm extends Component {
    constructor(props) {
        super(props)
        this.state = {
            canRenderEditor: false,
            autoCompleteResult: [],
            loading: false,
            richTextLoading: false,
            action: `${config.server_url}resource/upload`,
            height: 0,
            contentFormat: 'html',
            onChange: this.handleRichChange,
            onRawChange: this.handleRichRawChange,
            language: 'en',
            media: {
                uploadFn: undefined,
                audio: false,
                allowPasteImage: true,
                externalMedias: {
                    image: false,
                    audio: false,
                    video: false,
                    embed: false
                }
            },
            data: {},
            currentTags: [],
            forceNewLine: true,
            excludeControls: ['code']
        }
        this.handleRichChange = content => {
            console.log(content)
        }
        this.handleRichRawChange = rawContent => {
            console.log(rawContent)
        }
        this.state.media.uploadFn = param => {
            const serverURL = this.state.action
            const xhr = new XMLHttpRequest()
            const fd = new FormData()
            const successFn = response => {
                param.success({
                    url: JSON.parse(xhr.responseText).data
                })
            }
            const progressFn = event => {
                param.progress(event.loaded / event.total * 100)
            }
            const errorFn = response => {
                param.error({
                    msg: 'unable to upload.'
                })
            }
            xhr.upload.addEventListener('progress', progressFn, false)
            xhr.addEventListener('load', successFn, false)
            xhr.addEventListener('error', errorFn, false)
            xhr.addEventListener('abort', errorFn, false)
            fd.append('fileType', param.file.type.substring(0, param.file.type.indexOf('/')))
            fd.append('file', param.file)
            xhr.open('POST', serverURL, true)
            xhr.send(fd)
        }
        this.handleSubmit = e => {
            return new Promise((resolve, reject) => {
                e.preventDefault()
                this.props.form.validateFieldsAndScroll((err, values) => {
                    if (!err) {
                        console.log(values.preview_image)
                        if (values.preview_image) {
                            values.preview_image = values.preview_image[0].response.data
                        } else if (this.state.imageUrl) {
                            values.preview_image = this.state.imageUrl
                        }
                        let html = this.editorInstance.getContent('html')
                        values.content = html
                        values.category_id = values.category[0]
                        delete values.category
                        console.log(values)
                        values.id = this.state.rid
                        axios.post(`${config.server_url}resource/update`, values).then(response => {
                            this.setState({data: response.data.data, loading: false})
                            resolve()
                        })
                    } else reject()
                })
            })
        }
        this.normFile = e => {
            console.log('Upload event:', e)
            if (Array.isArray(e)) {
                return e
            }
            return e && e.fileList
        }
        this.handleChange = info => {
            if (info.file.status === 'uploading') {
                this.setState({loading: true})
                return
            }
            if (info.file.status === 'done') {
                getBase64(info.file.originFileObj, imageUrl =>
                    this.setState({
                        imageUrl: info.file.response.data,
                        loading: false
                    })
                )
            }
        }
    }

    componentDidMount() {
        const cache = cookies.get('loginInfo')
        if (!cache) {
            this.props.onRef(undefined)
            this.setState({canRenderEditor: false})
            window.location = '/user/login'
        }
        BraftEditor = require('braft-editor').default
        axios.get(`${config.server_url}category/list`).then(response1 => {
            categorys = response1.data.data.map(v => {
                v.value = v.id
                v.label = v.display_name
                return v
            })
            axios.get(`${config.server_url}tag/list`).then(response2 => {
                tags = response2.data.data.map(v => {
                    return <Option key={v.id}>{v.name}</Option>
                })
                let currentCategory = undefined
                for (let i = 0; i < response1.data.data.length; i++) {
                    if (response1.data.data[i].id === this.props.exist.category_id) {
                        currentCategory = response1.data.data[i].display_name
                        break
                    }
                }
                this.props.onRef(this)
                this.setState({
                    canRenderEditor: true,
                    imageUrl: this.props.exist.preview_image,
                    currentTags: this.props.exist.tags.map(v => {
                        return v.tag
                    }),
                    initialContent: this.props.exist.content,
                    rid: this.props.exist.id,
                    data: {
                        name: this.props.exist.name,
                        desc: this.props.exist.desc,
                        category: [this.props.exist.category_id]
                    }
                })
            })
        })
    }

    componentDidUpdate() {
        if (this.state.rid != this.props.exist.id) {
            axios.get(`${config.server_url}category/list`).then(response1 => {
                categorys = response1.data.data.map(v => {
                    v.value = v.id
                    v.label = v.display_name
                    return v
                })
                axios.get(`${config.server_url}tag/list`).then(response2 => {
                    tags = response2.data.data.map(v => {
                        return <Option key={v.id}>{v.name}</Option>
                    })
                    let currentCategory = undefined
                    for (let i = 0; i < response1.data.data.length; i++) {
                        if (response1.data.data[i].id === this.props.exist.category_id) {
                            currentCategory = response1.data.data[i].display_name
                            break
                        }
                    }
                    this.props.onRef(this)
                    this.setState({
                        canRenderEditor: true,
                        imageUrl: this.props.exist.preview_image,
                        currentTags: this.props.exist.tags.map(v => {
                            return v.tag
                        }),
                        initialContent: this.props.exist.content,
                        rid: this.props.exist.id,
                        data: {
                            name: this.props.exist.name,
                            desc: this.props.exist.desc,
                            category: [this.props.exist.category_id]
                        }
                    })
                })
            })
        }
    }

    componentWillUnmount() {
        this.props.onRef(undefined)
        this.setState({canRenderEditor: false})
    }

    render() {
        const {getFieldDecorator} = this.props.form
        const {autoCompleteResult} = this.state

        const formItemLayout = {
            labelCol: {
                xs: {span: 24},
                sm: {span: 8}
            },
            wrapperCol: {
                xs: {span: 24},
                sm: {span: 16}
            }
        }
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
        }

        const uploadButton = (
            <div>
                <Icon type={this.state.loading ? 'loading' : 'plus'} />
                <div className="ant-upload-text" />
            </div>
        )
        const imageUrl = this.state.imageUrl
        const checkIfIsImage = () => {
            const form = this.props.form
            if (form.getFieldValue('resource-type') === 'image') return false
            else return true
        }
        return (
            <Form onSubmit={this.handleSubmit}>
                <FormItem
                    {...formItemLayout}
                    label={
                        <span>
                            Resource Name&nbsp;
                            <Tooltip title="What do you want others to call it?">
                                <Icon type="question-circle-o" />
                            </Tooltip>
                        </span>
                    }>
                    {getFieldDecorator('name', {
                        rules: [{required: true, message: 'Please input the name!', whitespace: true}],
                        initialValue: this.state.data.name
                    })(<Input />)}
                </FormItem>
                <FormItem {...formItemLayout} label="Category">
                    {getFieldDecorator('category', {
                        initialValue: this.state.data.category,
                        rules: [{type: 'array', required: true, message: 'Please select the category!'}]
                    })(<Cascader options={categorys} />)}
                </FormItem>
                <FormItem {...formItemLayout} label="Tags">
                    {getFieldDecorator('tags', {
                        rules: [{required: true, message: 'Please select tags for the resource!', type: 'array'}],
                        initialValue: this.state.currentTags
                    })(
                        <Select mode="multiple" placeholder="Please select tags">
                            {tags}
                        </Select>
                    )}
                </FormItem>
                <FormItem {...formItemLayout} label={<span>Brief Introduction</span>}>
                    {getFieldDecorator('desc', {
                        rules: [{required: true, message: 'Please input the description!', whitespace: true}],
                        initialValue: this.state.data.desc
                    })(<TextArea autosize={true} row={20} />)}
                </FormItem>
                <FormItem {...formItemLayout} label="Preview Image">
                    <div className="dropbox">
                        {getFieldDecorator('preview_image', {
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
                                data={{fileType: 'thumbnail'}}>
                                {imageUrl ? <img src={imageUrl} alt="" /> : uploadButton}
                            </Upload>
                        )}
                    </div>
                </FormItem>
                {this.state.canRenderEditor ? (
                    <FormItem {...formItemLayout} label="Content">
                        <div
                            style={{
                                borderStyle: 'solid',
                                borderWidth: 'thin',
                                borderColor: '#d8d8d8',
                                borderRadius: 5
                            }}>
                            <Spin spinning={this.state.richTextLoading}>
                                {BraftEditor !== undefined ? (
                                    <BraftEditor {...this.state} ref={instance => (this.editorInstance = instance)} />
                                ) : null}
                            </Spin>
                        </div>
                    </FormItem>
                ) : null}
            </Form>
        )
    }
}

export default (ResourceEdit = Form.create()(ResourceEditForm))
