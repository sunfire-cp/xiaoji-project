'use strict';

const { Controller } = require('egg');
const { success, failure } = require('../utils/apiResponse');
const { PARAMETER_ERROR } = require('../exception/exceptionCode');
const Exception = require('../exception/exception');
const { generalFailure } = require('../utils/tools');

class BaseController extends Controller {
    success(data) {
        this.ctx.body = success(data);
    }

    failure(data) {
        this.ctx.body = failure(data);
    }

    generalFailure(e) {
        this.ctx.body = generalFailure(e);
    }

    validate(rule, param) {
        const { ctx } = this;
        try {
            ctx.validate(rule, param);
        } catch (e) {
            ctx.logger.warn(e);
            throw new Exception(PARAMETER_ERROR);
        }
    }
}

module.exports = BaseController;
