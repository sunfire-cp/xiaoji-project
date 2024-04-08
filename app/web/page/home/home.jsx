import React, { Component } from 'react';
import HomeLayout from 'component/homelayout/homelayout.jsx';
import './home.css';
import Cookies from 'universal-cookie';
import { Calendar, Badge } from 'antd';
import moment from 'moment';
import config from '../../config/config';
import axios from 'axios';

const cookies = new Cookies();

class Home extends Component {
    constructor(props) {
        super(props);
        this.state = { canDisplay: false, data: {} };
        this.getListData = value => {
            if (this.state.histories) {
                return Object.values(this.state.histories[value.month()][value.date() - 1]);
            } else return [];
        };

        this.dateCellRender = value => {
            const listData = this.getListData(value);
            return (
                <ul className="events">
                    {listData.map(item => (
                        <li key={item.content} style={{ display: 'flex' }}>
                            <Badge status={item.type} text={item.content} />
                            <Badge count={item.count} style={{ backgroundColor: '#52c41a' }} />
                        </li>
                    ))}
                </ul>
            );
        };

        this.getMonthData = value => {
            if (this.state.historiesYear) {
                return Object.values(this.state.historiesYear[value.month()]);
            } else return [];
        };

        this.monthCellRender = value => {
            const listData = this.getMonthData(value);
            return (
                <ul className="events">
                    {listData.map(item => (
                        <li key={item.content} style={{ display: 'flex' }}>
                            <Badge status={item.type} text={item.content} />
                            <Badge count={item.count} style={{ backgroundColor: '#52c41a' }} />
                        </li>
                    ))}
                </ul>
            );
        };

        this.onPanelChange = (date, mode) => {};

        this.onSelect = date => {};
    }

    componentDidMount() {
        const cache = cookies.get('loginInfo');
        if (!cache) {
            this.setState({ canDisplay: false });
            window.location = '/user/login';
        } else {
            this.setState({ canDisplay: true, cache });
        }
        axios.get(`${config.server_url}home/list_history`).then(response => {
            if (response.data.code == 0) response = response.data;
            const currentYear = moment().year();
            let temp = {
                0: {},
                1: {},
                2: {},
                3: {},
                4: {},
                5: {},
                6: {},
                7: {},
                8: {},
                9: {},
                10: {},
                11: {}
            };
            let tempYear = {
                0: {},
                1: {},
                2: {},
                3: {},
                4: {},
                5: {},
                6: {},
                7: {},
                8: {},
                9: {},
                10: {},
                11: {}
            };
            for (let i = 0; i < 12; i++) {
                const currentDays = moment(
                    `${currentYear}-${(i + 1).toString().padStart(2, '0')}`,
                    'YYYY-MM'
                ).daysInMonth();
                for (let a = 0; a < currentDays; a++) {
                    temp[i][a] = {};
                }
            }
            for (let i = 0; i < response.data.length; i++) {
                const date = moment(response.data[i].created_at, moment.ISO_8601);
                let type = 'processing';
                let content = 'New resource';
                switch (response.data[i].h_type) {
                case 0:
                    type = 'processing';
                    content = 'Publish new resource';
                    break;
                case 1:
                    type = 'error';
                    content = 'Abandon resource';
                    break;
                case 2:
                    type = 'success';
                    content = 'Approve resource';
                    break;
                case 3:
                    type = 'success';
                    content = 'New user';
                    break;
                }
                if (temp[date.month()][date.date() - 1][response.data[i].h_type]) {
                    temp[date.month()][date.date() - 1][response.data[i].h_type].count++;
                } else {
                    temp[date.month()][date.date() - 1][response.data[i].h_type] = {
                        ...response.data[i],
                        type,
                        content,
                        count: 1
                    };
                }
                if (tempYear[date.month()][response.data[i].h_type]) {
                    tempYear[date.month()][response.data[i].h_type].count++;
                } else {
                    tempYear[date.month()][response.data[i].h_type] = {
                        ...response.data[i],
                        type,
                        content,
                        count: 1
                    };
                }
            }
            this.setState({ data: response.data, histories: temp, historiesYear: tempYear });
        });
    }

    render() {
        return (
            <div>
                {this.state.canDisplay ? (
                    <HomeLayout>
                        {this.state.canDisplay ? <h1>Welcome back, {this.state.cache.nickname}</h1> : null}
                        <Calendar
                            dateCellRender={this.dateCellRender}
                            monthCellRender={this.monthCellRender}
                            onPanelChange={this.onPanelChange}
                            onSelect={this.onSelect}
                        />
                    </HomeLayout>
                ) : null}
            </div>
        );
    }
}

export default Home;
