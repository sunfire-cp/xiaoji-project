const { failure, systemError } = require('./apiResponse');
const Exception = require('../exception/exception');

const generalFailure = e => {
    let result = systemError();
    if (e && e instanceof Exception) {
        if (e.code && e.msg) {
            const data = { code: e.code, msg: e.msg };
            result = failure(data);
        }
    }
    console.log(result);
    return result;
};

const generateRandomString = (length, limit) => {
    const sc = [];
    const chars = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
    let limitLength = limit;
    if (limitLength == 0) limitLength = chars.length;
    for (let i = 0; i < length; i++) {
        const temp = chars.charAt(Math.floor(Math.random() * limitLength));
        sc.push(temp);
    }
    const wholesc = sc.join('');
    return wholesc;
};

module.exports = {
    generalFailure,
    generateRandomString
};
