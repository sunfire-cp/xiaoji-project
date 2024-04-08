'use strict';

module.exports = app => {
    const { router, controller } = app;
    // 页面路由
    router.get('/tag/list', controller.tag.tag.index);
    router.get('/tag/add', controller.tag.tag.add);
    // 服务端路由
    router.get('/api/tag/list', controller.tag.tagApi.index);
    router.post('/api/tag/update', controller.tag.tagApi.update);
    router.post('/api/tag/add', controller.tag.tagApi.add);
    router.post('/api/tag/delete', controller.tag.tagApi.delete);
};
