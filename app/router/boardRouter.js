'use strict'

module.exports = app => {
    const {router, controller} = app
    // 服务端路由
    router.get('/api/board/list', controller.board.boardApi.index)
    router.get('/api/board/list_simple', controller.board.boardApi.indexSimple)
    router.get('/api/board/list_resource', controller.board.boardApi.indexResource)
    router.post('/api/board/add', controller.board.boardApi.add)
    router.post('/api/board/update', controller.board.boardApi.update)
    router.post('/api/board/add_board_info', controller.board.boardApi.addBoardInfo)
    router.post('/api/board/delete', controller.board.boardApi.delete)
    router.post('/api/board/delete_board_info', controller.board.boardApi.deleteBoardInfo)
}
