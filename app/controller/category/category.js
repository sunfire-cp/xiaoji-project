'use strict';
module.exports = app => {
    return class CategoryController extends app.Controller {
        async index() {
            const { ctx } = this;
            await ctx.render('category/list.js', { message: 'react server side render!' });
        }

        async add() {
            const { ctx } = this;
            await ctx.render('category/add.js', { message: 'react server side render!' });
        }
    };
};
