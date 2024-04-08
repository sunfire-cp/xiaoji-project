'use strict';

module.exports = app => {
    // 主页相关
    require('./router/homeRouter')(app);
    // 用户相关
    require('./router/userRouter')(app);
    // 类别相关
    require('./router/categoryRouter')(app);
    // 资源相关
    require('./router/resourceRouter')(app);
    // 标签相关
    require('./router/tagRouter')(app);
    // 评论相关
    require('./router/commentRouter')(app);
    // 资料板相关
    require('./router/boardRouter')(app);
};
