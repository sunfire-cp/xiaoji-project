'use strict';

const { SYSTEM_ERROR } = require('./exceptionCode');

class Exception extends Error {
    constructor(e) {
        super();
        if (e.code) {
            this.msg = e.msg;
            this.code = e.code;
        } else {
            this.msg = SYSTEM_ERROR.msg;
            this.code = SYSTEM_ERROR.code;
        }
    }
}

module.exports = Exception;
