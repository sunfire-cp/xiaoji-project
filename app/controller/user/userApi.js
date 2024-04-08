'use strict';

const Exception = require('../../exception/exception');
const {
    LOGIN_INFO_MISMATCH,
    ACCOUNT_BANNED,
    CODE_NOT_EXIST,
    NO_ACCESS,
    EMAIL_HAS_EXIST
} = require('../../exception/exceptionCode');
const Controller = require('../baseController');
const { generateRandomString } = require('../../utils/tools');
const { sendMail } = require('../../utils/mailer');
const sendToWormhole = require('stream-wormhole');
const toArray = require('stream-to-array');
const sharp = require('sharp');

class UserApiController extends Controller {
    async index() {
        const { ctx, app } = this;
        let results = await app.mysql.select('users', {
            orders: [['created_at', 'desc'], ['id', 'desc']],
            where: { is_delete: 0 }
        });
        for (let i = 0; i < results.length; i++) {
            let operations = await app.mysql.select('operations', {
                orders: [['updated_at', 'desc'], ['created_at', 'desc']],
                where: { user_id: results[i].id }
            });
            for (let a = 0; a < operations.length; a++) {
                if (operations[a].operator) {
                    const operator = await app.mysql.select('users', {
                        where: { id: operations[a].operator }
                    });
                    if (operator.length > 0) {
                        operations[a].operator_name = operator[0].nickname;
                    }
                }
                if (operations[a].operation_relevant_type) {
                    if (operations[a].operation_relevant_type === 1) {
                        const relevantResource = await app.mysql.select('resources', {
                            where: { id: operations[a].operation_relevant_id }
                        });
                        if (relevantResource.length > 0) {
                            operations[a].operation_relevant_type_name = 'Resource';
                            operations[a].operation_relevant_data_name = relevantResource[0].name;
                        }
                    }
                }
            }
            results[i].operations = operations;
        }
        this.success(results);
    }

    async login() {
        const { ctx, app } = this;
        let results = await app.mysql.select('users', {
            where: { email: ctx.request.body.email, password: ctx.request.body.password, is_delete: 0 },
            columns: ['id', 'status', 'nickname', 'avatar']
        });
        if (results.length > 0) {
            results = results[0];
            if (results.status === 0) throw new Exception(ACCOUNT_BANNED);
        } else throw new Exception(LOGIN_INFO_MISMATCH);
        this.success(results);
    }

    async loginDashboard() {
        const { ctx, app } = this;
        let results = await app.mysql.select('users', {
            where: { email: ctx.request.body.email, password: ctx.request.body.password, is_delete: 0 },
            columns: ['id', 'status', 'nickname', 'avatar', 'permission']
        });
        if (results.length > 0) {
            results = results[0];
            if (results.status === 0) throw new Exception(ACCOUNT_BANNED);
            if (results.permission === 0) throw new Exception(NO_ACCESS);
        } else throw new Exception(LOGIN_INFO_MISMATCH);
        this.success(results);
    }

    async forget() {
        const { ctx, app } = this;
        let results = await app.mysql.select('users', {
            where: { email: ctx.request.body.email, is_delete: 0 },
            columns: ['id', 'nickname']
        });
        if (results.length > 0) {
            let rd = '0';
            let check = await app.mysql.select('confirms', {
                where: { email: ctx.request.body.email }
            });
            if (check.length > 0) {
                rd = generateRandomString(8, 0).toUpperCase();
                await app.mysql.update('confirms', {
                    id: check[0].id,
                    content: rd,
                    created_at: app.mysql.literals.now
                });
            } else {
                rd = generateRandomString(8, 0).toUpperCase();
                await app.mysql.insert('confirms', {
                    content: rd,
                    email: ctx.request.body.email,
                    created_at: app.mysql.literals.now
                });
            }
            await sendMail(rd, ctx.request.body.email, results[0].nickname);
            this.success(true);
        } else this.success(true);
    }

    async resetPwd() {
        const { ctx, app } = this;
        const row = { ...ctx.request.body };
        row.updated_at = app.mysql.literals.now;
        const check = await app.mysql.select('confirms', {
            where: { email: ctx.request.body.email, content: ctx.request.body.content }
        });
        if (check.length > 0) {
            const results = await app.mysql.beginTransactionScope(async conn => {
                const result = await conn.update('users', {
                    id: check[0].id,
                    email: ctx.request.body.email,
                    password: ctx.request.body.password
                });
                await conn.delete('confirms', {
                    email: ctx.request.body.email,
                    content: ctx.request.body.content
                });
                return result;
            });
            this.success(true);
        } else throw new Exception(CODE_NOT_EXIST);
    }

    async add() {
        const { ctx, app } = this;
        let check = await app.mysql.select('users', {
            where: { email: ctx.request.body.email },
            columns: ['id']
        });
        if (check.length > 0) throw new Exception(EMAIL_HAS_EXIST);
        const results = await app.mysql.beginTransactionScope(async conn => {
            const result = await conn.insert('users', ctx.request.body);
            await conn.insert('histories', { h_type: 3, created_at: app.mysql.literals.now });
            return result;
        });
        this.success(results);
    }

    async update() {
        const { ctx, app } = this;
        const row = { ...ctx.request.body };
        row.updated_at = app.mysql.literals.now;
        const result = await app.mysql.update('users', row);
        this.success(result);
    }

    async delete() {
        const { ctx } = this;
        const result = await app.mysql.update('users', { id: ctx.request.body.id, is_delete: 1 });
        this.success(result);
    }

    async upload() {
        const { ctx } = this;
        const stream = await ctx.getFileStream();
        const filename = stream.filename;
        let extName = '';
        if (filename.indexOf('.') > -1) extName = filename.substring(filename.indexOf('.'));
        const parts = await toArray(stream);
        let buffer = Buffer.concat(parts);
        let imageData = undefined;
        if (stream.fields.fileType !== 'video') {
            imageData = await sharp(buffer).metadata();
        }
        if (stream.fields.fileType === 'thumbnail' && imageData && (imageData.width > 200 || imageData.height > 200)) {
            buffer = await sharp(buffer)
                .resize(200, 200)
                .toBuffer();
        }
        let result;
        try {
            result = await ctx.service.userService.uploadToALIOSS(buffer, extName);
        } catch (err) {
            await sendToWormhole(stream);
            throw err;
        }
        this.success(result);
    }

    async solveOperation() {
        const { ctx, app } = this;
        const results = await app.mysql.beginTransactionScope(async conn => {
            const row = {
                id: ctx.request.body.id,
                status: ctx.request.body.status,
                operator: ctx.request.body.operator,
                updated_at: app.mysql.literals.now
            };
            const result = await conn.update('operations', row);
            const exist = await conn.select('operations', { id: ctx.request.body.id });
            if (exist.length > 0) {
                if (exist[0].status === 1) {
                    if (exist[0].operation_type === 5) {
                        await conn.update('resources', {
                            id: exist[0].operation_relevant_id,
                            is_delete: 1,
                            updated_at: app.mysql.literals.now
                        });
                    }
                }
            }
            return result;
        });
        this.success(result);
    }
}

module.exports = UserApiController;
