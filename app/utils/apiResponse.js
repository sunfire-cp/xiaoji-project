'use strict';

const { SYSTEM_ERROR } = require('../exception/exceptionCode');

module.exports = {
    success(data) {
        const res = {
            code: 0,
            msg: 'OK',
            data: data
        };
        return res;
    },
    failure(error) {
        const res = {
            code: error.code,
            msg: error.msg,
            data: error.data
        };
        return res;
    },
    systemError() {
        return SYSTEM_ERROR;
    }
};
