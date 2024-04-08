'use strict';
module.exports = app => {
    return class UserController extends app.Controller {
        async index() {
            const { ctx } = this;
            await ctx.render('user/list.js', { message: 'react server side render!' });
        }

        async add() {
            const { ctx } = this;
            await ctx.render('user/add.js', { message: 'react server side render!' });
        }

        async login() {
            const { ctx } = this;
            await ctx.render('user/login.js', { message: 'react server side render!' });
        }

        async forget() {
            const { ctx } = this;
            await ctx.render('user/forget.js', { message: 'react server side render!' });
        }
    };
};
