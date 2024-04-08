'use strict';
module.exports = app => {
    return class TagController extends app.Controller {
        async index() {
            const { ctx } = this;
            await ctx.render('tag/list.js', { message: 'react server side render!' });
        }

        async add() {
            const { ctx } = this;
            await ctx.render('tag/add.js', { message: 'react server side render!' });
        }
    };
};
