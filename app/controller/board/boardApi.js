'use strict'
const path = require('path')
const Controller = require('../baseController')
const Exception = require('../../exception/exception')
const {BOARD_EXIST, BOARD_INFO_EXIST, BOARD_NOT_EXIST} = require('../../exception/exceptionCode')

module.exports = app => {
    return class BoardApiController extends Controller {
        async index() {
            const {ctx} = this
            let results = await app.mysql.select('boards', {
                where: {created_by: ctx.query.user_id, is_delete: 0},
                orders: [['created_at', 'desc']]
            })
            for (let i = 0; i < results.length; i++) {
                let board_resources = await app.mysql.select('board_resource', {
                    where: {board_id: results[i].id},
                    orders: [['created_at', 'desc']]
                })
                for (let a = 0; a < board_resources.length; a++) {
                    let resource = (await app.mysql.select('resources', {
                        where: {id: board_resources[a].resource_id}
                    }))[0]
                    let tags = await app.mysql.select('resource_tag', {
                        where: {resource_id: resource.id}
                    })
                    for (let b = 0; b < tags.length; b++) {
                        const tag = (await app.mysql.select('tags', {
                            where: {id: tags[b].tag_id}
                        }))[0]
                        tags[b].tag = tag
                    }
                    resource.tags = tags
                    board_resources[a].resource = resource
                }
                results[i].resources = board_resources
            }
            this.success(results)
        }

        async indexSimple() {
            const {ctx} = this
            let results = await app.mysql.select('boards', {
                where: {created_by: ctx.query.user_id, is_delete: 0},
                orders: [['created_at', 'desc']]
            })
            for (let i = 0; i < results.length; i++) {
                const board_resources = await app.mysql.select('board_resource', {
                    where: {board_id: results[i].id},
                    orders: [['created_at', 'desc']]
                })
                const check = await app.mysql.select('board_resource', {
                    where: {board_id: results[i].id, resource_id: ctx.query.resource_id},
                    orders: [['created_at', 'desc']]
                })
                results[i].resourceCount = board_resources.length
                results[i].hasPinned = check.length > 0 ? true : false
            }
            this.success(results)
        }

        async indexResource() {
            const {ctx} = this
            let results = await app.mysql.select('boards', {
                where: {id: ctx.query.board_id, is_delete: 0}
            })
            if (results.length === 0) throw new Exception(BOARD_NOT_EXIST)
            results = results[0]
            let board_resources = await app.mysql.select('board_resource', {
                where: {board_id: results.id},
                orders: [['created_at', 'desc']]
            })
            for (let a = 0; a < board_resources.length; a++) {
                let resource = (await app.mysql.select('resources', {
                    where: {id: board_resources[a].resource_id}
                }))[0]
                let users = (await app.mysql.select('users', {
                    where: {id: resource.created_by}
                }))[0]
                let tags = await app.mysql.select('resource_tag', {
                    where: {resource_id: resource.id}
                })
                for (let b = 0; b < tags.length; b++) {
                    const tag = (await app.mysql.select('tags', {
                        where: {id: tags[b].tag_id}
                    }))[0]
                    tags[b].tag = tag
                }
                resource.tags = tags
                resource.creator = users.nickname
                board_resources[a].resource = resource
            }
            results.resources = board_resources
            this.success(results)
        }

        async add() {
            const {ctx} = this
            const check = await app.mysql.select('boards', {
                where: {
                    name: ctx.request.body.name,
                    created_by: ctx.request.body.user_id
                }
            })
            if (check.length > 0) throw new Exception(BOARD_EXIST)
            const result = await app.mysql.insert('boards', {
                name: ctx.request.body.name,
                created_by: ctx.request.body.user_id,
                created_at: app.mysql.literals.now,
                updated_at: app.mysql.literals.now
            })
            this.success(result)
        }

        async update() {
            const {ctx} = this
            const check = await app.mysql.select('boards', {
                where: {
                    id: ctx.request.body.id
                }
            })
            if (check.length === 0) throw new Exception(BOARD_NOT_EXIST)
            const result = await app.mysql.update('boards', {
                id: ctx.request.body.id,
                name: ctx.request.body.name,
                updated_at: app.mysql.literals.now
            })
            this.success(result)
        }

        async addBoardInfo() {
            const {ctx} = this
            const check = await app.mysql.select('board_resource', {
                where: {
                    board_id: ctx.request.body.board_id,
                    resource_id: ctx.request.body.resource_id
                }
            })
            if (check.length > 0) throw new Exception(BOARD_INFO_EXIST)
            const result = await app.mysql.insert('board_resource', {
                board_id: ctx.request.body.board_id,
                resource_id: ctx.request.body.resource_id,
                created_at: app.mysql.literals.now
            })
            this.success(result)
        }

        async delete() {
            const {ctx} = this
            const result = await app.mysql.update('boards', {id: ctx.request.body.id, is_delete: 1})
            this.success(result)
        }

        async deleteBoardInfo() {
            const {ctx} = this
            const check = await app.mysql.select('board_resource', {
                where: {board_id: ctx.request.body.board_id, resource_id: ctx.request.body.resource_id}
            })
            let result
            if (check.length > 0) {
                result = await app.mysql.delete('board_resource', {
                    board_id: ctx.request.body.board_id,
                    resource_id: ctx.request.body.resource_id
                })
            }
            this.success(result)
        }
    }
}
