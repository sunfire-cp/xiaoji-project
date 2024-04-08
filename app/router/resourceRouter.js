'use strict';

module.exports = app => {
    const { router, controller } = app;
    // 页面路由
    router.get('/resource/list', controller.resource.resource.index);
    router.get('/resource/add', controller.resource.resource.add);
    // 服务端路由
    router.get('/api/resource/list', controller.resource.resourceApi.index);
    router.get('/api/resource/get_resources', controller.resource.resourceApi.getResources);
    router.get('/api/resource/get_resources_by_user', controller.resource.resourceApi.getResourcesByUser);
    router.get('/api/resource/get_resource', controller.resource.resourceApi.getResource);
    router.post('/api/resource/add', controller.resource.resourceApi.add);
    router.post('/api/resource/update', controller.resource.resourceApi.update);
    router.post('/api/resource/delete', controller.resource.resourceApi.delete);
    router.post('/api/resource/upload', controller.resource.resourceApi.upload);
    router.post('/api/resource/set_status', controller.resource.resourceApi.setStatus);
    router.post('/api/resource/apply_to_delete', controller.resource.resourceApi.applyToDelete);
};
