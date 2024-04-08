'use strict';

module.exports = app => {
    const { router, controller } = app;
    // 页面路由
    router.get('/', controller.home.home.index);
    router.get('/home/star', controller.home.home.star);
    // 服务端路由
    router.get('/api/home/list', controller.home.homeApi.index);
    router.get('/api/home/list_star', controller.home.homeApi.listStar);
    router.get('/api/home/list_history', controller.home.homeApi.listHistories);
    router.post('/api/home/update_star', controller.home.homeApi.updateStar);
};
