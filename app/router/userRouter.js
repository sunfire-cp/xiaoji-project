'use strict';

module.exports = app => {
    const { router, controller } = app;
    // 页面路由
    router.get('/user/list', controller.user.user.index);
    router.get('/user/login', controller.user.user.login);
    router.get('/user/forget', controller.user.user.forget);
    router.get('/user/add', controller.user.user.add);
    // 服务端路由
    router.get('/api/user/list', controller.user.userApi.index);
    router.post('/api/user/login', controller.user.userApi.login);
    router.post('/api/user/login_dashboard', controller.user.userApi.loginDashboard);
    router.post('/api/user/forget', controller.user.userApi.forget);
    router.post('/api/user/upload', controller.user.userApi.upload);
    router.post('/api/user/add', controller.user.userApi.add);
    router.post('/api/user/update', controller.user.userApi.update);
    router.post('/api/user/reset_password', controller.user.userApi.resetPwd);
    router.post('/api/user/delete', controller.user.userApi.delete);
    router.post('/api/user/solve_operation', controller.user.userApi.solveOperation);
};
