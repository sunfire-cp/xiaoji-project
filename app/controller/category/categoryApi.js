'use strict';
const path = require('path');
const sendToWormhole = require('stream-wormhole');
const Controller = require('../baseController');
const toArray = require('stream-to-array');
const sharp = require('sharp');

module.exports = app => {
    return class CategoryApiController extends Controller {
        async index() {
            const { ctx } = this;
            const results = await app.mysql.select('categories', {
                orders: [['display_name', 'asc']],
                where: { is_delete: 0 }
            });
            this.success(results);
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
            if (
                stream.fields.fileType === 'thumbnail' &&
                imageData &&
                (imageData.width > 200 || imageData.height > 200)
            ) {
                buffer = await sharp(buffer)
                    .resize(200, 200)
                    .toBuffer();
            }
            let result;
            try {
                result = await ctx.service.categoryService.uploadToALIOSS(buffer, extName);
                console.log(result);
            } catch (err) {
                await sendToWormhole(stream);
                throw err;
            }
            this.success(result);
        }

        async add() {
            const { ctx } = this;
            const result = await app.mysql.insert('categories', ctx.request.body);
            this.success(result);
        }

        async update() {
            const { ctx } = this;
            const row = {
                id: ctx.request.body.id,
                display_name: ctx.request.body.display_name,
                icon: ctx.request.body.icon
            };
            const result = await app.mysql.update('categories', row);
            this.success(result);
        }

        async delete() {
            const { ctx } = this;
            const result = await app.mysql.update('categories', { id: ctx.request.body.id, is_delete: 1 });
            this.success(result);
        }
    };
};
