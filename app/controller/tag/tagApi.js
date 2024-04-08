'use strict';
const Controller = require('../baseController');

module.exports = app => {
    return class TagApiController extends Controller {
        async index() {
            const { ctx } = this;
            const results = await app.mysql.select('tags', {
                orders: [['id', 'asc']],
                where: { is_delete: 0 }
            });
            this.success(results);
        }

        async update() {
            const { ctx } = this;
            const row = {
                id: ctx.request.body.id,
                name: ctx.request.body.name,
                color: ctx.request.body.color
            };
            const result = await app.mysql.update('tags', row);
            this.success(result);
        }

        async add() {
            const { ctx, app } = this;
            const results = await app.mysql.beginTransactionScope(async conn => {
                const result = await conn.insert('tags', ctx.request.body);
                return result;
            });
            this.success(results);
        }

        async delete() {
            const { ctx } = this;
            const result = await app.mysql.update('tags', { id: ctx.request.body.id, is_delete: 1 });
            this.success(result);
        }
    };
};
