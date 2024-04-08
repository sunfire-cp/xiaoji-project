import React, { Component } from 'react';
import HomeLayout from 'component/homelayout/homelayout.jsx';
import './home.css';
import Cookies from 'universal-cookie';
import { Card, Tag, Icon, Select, notification } from 'antd';
import axios from 'axios';
import config from '../../config/config';
const { Meta } = Card;
const { Option } = Select;
const cookies = new Cookies();

class Star extends Component {
    constructor(props) {
        super(props);
        this.state = {
            canDisplay: false,
            data: [],
            resources: [],
            allResources: [],
            selected: [],
            stars: []
        };
        this.openNotification = (msg, desc) => {
            notification.open({
                message: msg,
                description: desc,
                placement: 'topLeft'
            });
        };
        this.handleChange = (index, value) => {
            for (let i = 0; i < this.state.resources.length; i++) {
                if (this.state.resources[i].id == value) {
                    let temp = this.state.data;
                    temp[index - 1] = (
                        <Card
                            hoverable
                            key={index}
                            style={{ width: 240 }}
                            cover={<img alt={this.state.resources[i].id} src={this.state.resources[i].preview_image} />}
                            actions={[
                                <Select
                                    showSearch
                                    style={{ width: 200 }}
                                    placeholder="Select a resource"
                                    optionFilterProp="name"
                                    defaultValue={this.state.resources[i].id}
                                    onChange={this.handleChange.bind(this, index)}
                                    onFocus={this.handleFocus}
                                    onBlur={this.handleBlur}
                                    filterOption={(input, option) =>
                                        option.props.name.toLowerCase().indexOf(input.toLowerCase()) >= 0
                                    }
                                >
                                    {this.state.allResources}
                                </Select>
                            ]}
                        >
                            <div style={{ marginLeft: '42%', alignItems: 'center' }}>
                                <Tag color={this.getColor(index)} style={{ textAlign: 'center' }}>
                                    {this.convertStyle(index)}
                                </Tag>
                            </div>
                            <Meta title={this.state.resources[i].name} description={this.state.resources[i].desc} />
                        </Card>
                    );
                    this.setState({ data: temp });
                    break;
                }
            }
            axios
                .post(`${config.server_url}home/update_star`, {
                    id: this.state.stars[index - 1].id,
                    resource_id: value,
                    index: index
                })
                .then(response => {
                    this.openNotification('Success', 'Succeed to set a star project.');
                    this.init();
                });
        };
        this.handleBlur = () => {
            console.log('blur');
        };
        this.handleFocus = () => {
            console.log('focus');
        };
        this.convertStyle = number => {
            switch (number) {
            case 1:
                return '1st';
            case 2:
                return '2nd';
            case 3:
                return '3rd';
            }
        };
        this.getColor = number => {
            switch (number) {
            case 1:
                return '#FFD700';
            case 2:
                return '#C0C0C0';
            case 3:
                return '#D2691E';
            }
        };
        this.init = () => {
            axios.get(`${config.server_url}resource/list`).then(response1 => {
                if (response1.data.code == 0) response1 = response1.data;
                let allResources = [];
                for (let i = 0; i < response1.data.length; i++) {
                    allResources.push(
                        <Option value={response1.data[i].id} key={response1.data[i].id}>
                            {response1.data[i].id}. {response1.data[i].name}
                        </Option>
                    );
                }
                axios.get(`${config.server_url}home/list_star`).then(response => {
                    if (response.data.code == 0) response = response.data;
                    let temp = [];
                    let tempSelected = [];
                    for (let i = 0; i < response.data.length; i++) {
                        temp.push(
                            <Card
                                hoverable
                                key={response.data[i].index}
                                style={{ width: 240 }}
                                cover={<img alt={response.data[i].resource_id} src={response.data[i].preview_image} />}
                                actions={[
                                    <Select
                                        showSearch
                                        style={{ width: 200 }}
                                        placeholder="Select a resource"
                                        optionFilterProp="name"
                                        defaultValue={response.data[i].resource_id}
                                        onChange={this.handleChange.bind(this, response.data[i].index)}
                                        onFocus={this.handleFocus}
                                        onBlur={this.handleBlur}
                                        filterOption={(input, option) =>
                                            option.props.name.toLowerCase().indexOf(input.toLowerCase()) >= 0
                                        }
                                    >
                                        {allResources}
                                    </Select>
                                ]}
                            >
                                <div style={{ marginLeft: '42%', alignItems: 'center' }}>
                                    <Tag color={this.getColor(response.data[i].index)} style={{ textAlign: 'center' }}>
                                        {this.convertStyle(response.data[i].index)}
                                    </Tag>
                                </div>
                                <Meta title={response.data[i].name} description={response.data[i].desc} />
                            </Card>
                        );
                        tempSelected.push(response.data[i].resource_id);
                    }
                    this.setState({
                        data: temp,
                        resources: response1.data,
                        allResources: allResources,
                        selected: tempSelected,
                        stars: response.data
                    });
                });
            });
        };
    }

    componentDidMount() {
        const cache = cookies.get('loginInfo');
        if (!cache) {
            window.location = '/user/login';
        }
        this.init();
    }

    render() {
        return (
            <HomeLayout>
                <div
                    style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(5, 200px)',
                        gridGap: '60px'
                    }}
                >
                    {this.state.data}
                </div>
            </HomeLayout>
        );
    }
}

export default Star;
