'use strict';

module.exports = app => {
    const { router, controller } = app;
    // 页面路由
    router.get('/category/list', controller.category.category.index);
    router.get('/category/add', controller.category.category.add);
    // 服务端路由
    router.get('/api/category/list', controller.category.categoryApi.index);
    router.post('/api/category/upload', controller.category.categoryApi.upload);
    router.post('/api/category/add', controller.category.categoryApi.add);
    router.post('/api/category/update', controller.category.categoryApi.update);
    router.post('/api/category/delete', controller.category.categoryApi.delete);
};
