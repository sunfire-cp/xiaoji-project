module.exports = app => {
    return class AppController extends app.Controller {
        async index() {
            const { ctx } = this;
            await ctx.render('home/home.js');
        }

        async star() {
            const { ctx } = this;
            await ctx.render('home/star.js');
        }
    };
};
