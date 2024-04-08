'use strict';
const path = require('path');
const Controller = require('../baseController');

module.exports = app => {
    return class HomeApiController extends Controller {
        async index() {
            const { ctx } = this;
            const query1 =
                'SELECT s.id, s.index, s.resource_id, r.name, r.desc, r.preview_image, r.category_id, c.display_name as category ' +
                'FROM stars AS s INNER JOIN resources AS r ON r.id = s.resource_id INNER JOIN categories AS c ON c.id = r.category_id';
            let results = await app.mysql.query(query1);
            this.success(results);
        }

        async listHistories() {
            const { ctx } = this;
            const results = await app.mysql.select('histories', {
                orders: [['id', 'asc']]
            });
            this.success(results);
        }

        async listStar() {
            const { ctx } = this;
            const query1 =
                'SELECT s.id, s.index, s.resource_id, r.id as resource_id, r.name, r.desc, r.preview_image, r.category_id, c.display_name as category ' +
                'FROM stars AS s INNER JOIN resources AS r ON r.id = s.resource_id INNER JOIN categories AS c ON c.id = r.category_id';
            let results = await app.mysql.query(query1);
            this.success(results);
        }

        async updateStar() {
            const { ctx } = this;
            let data = {
                id: ctx.request.body.id,
                index: ctx.request.body.index,
                resource_id: ctx.request.body.resource_id
            };
            data.created_at = app.mysql.literals.now;
            const result = await app.mysql.update('stars', data);
            this.success(result);
        }
    };
};
