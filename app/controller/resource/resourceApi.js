'use strict'
const path = require('path')
const sendToWormhole = require('stream-wormhole')
const toArray = require('stream-to-array')
const sharp = require('sharp')
const Controller = require('../baseController')
const Exception = require('../../exception/exception')
const {OPERATION_EXIST} = require('../../exception/exceptionCode')

module.exports = app => {
    return class ResourceApiController extends Controller {
        async index() {
            const {ctx} = this
            const query1 =
                'SELECT r.id, r.name, r.status, r.preview_image, r.category_id, r.desc, r.content, r.created_at, c.display_name as category, u.nickname as creator ' +
                'FROM resources AS r INNER JOIN categories AS c ON r.category_id = c.id INNER JOIN users AS u ON r.created_by = u.id WHERE r.is_delete = 0 AND c.is_delete = 0'
            let results = await app.mysql.query(query1)
            for (let i = 0; i < results.length; i++) {
                const query =
                    'SELECT rt.resource_id, rt.tag_id, t.name as tag, t.color as color ' +
                    'FROM resource_tag AS rt INNER JOIN tags AS t ON rt.tag_id = t.id WHERE rt.resource_id = ? AND t.is_delete = 0'
                const tags = await app.mysql.query(query, results[i].id)
                results[i].tags = tags
            }
            this.success(results)
        }

        async getResources() {
            const {ctx} = this
            const query1 =
                'SELECT r.id, r.name, r.status, r.preview_image, r.category_id, r.desc, r.content, r.created_at, c.display_name as category, u.nickname as creator ' +
                'FROM resources AS r INNER JOIN categories AS c ON r.category_id = c.id INNER JOIN users AS u ON r.created_by = u.id WHERE r.category_id = ? AND r.id <> ? AND r.status = 2 AND r.is_delete = 0 AND u.is_delete = 0 AND c.is_delete = 0 ORDER BY r.created_at'
            let queyrData = [ctx.query.category_id]
            if (ctx.query.resource_id) queyrData.push(ctx.query.resource_id)
            else queyrData.push(0)
            let results = await app.mysql.query(query1, queyrData)
            for (let i = 0; i < results.length; i++) {
                const query =
                    'SELECT rt.resource_id, rt.tag_id, t.name as tag, t.color as color ' +
                    'FROM resource_tag AS rt INNER JOIN tags AS t ON rt.tag_id = t.id WHERE rt.resource_id = ? AND t.is_delete = 0'
                const tags = await app.mysql.query(query, results[i].id)
                results[i].tags = tags
            }
            this.success(results)
        }

        async getResourcesByUser() {
            const {ctx} = this
            const query1 =
                'SELECT r.id, r.name, r.status, r.preview_image, r.category_id, r.desc, r.content, r.created_at, r.updated_at, r.created_by, c.display_name as category ' +
                'FROM resources AS r INNER JOIN categories AS c ON r.category_id = c.id INNER JOIN users AS u ON r.created_by = u.id WHERE r.created_by = ? AND u.is_delete = 0 AND r.is_delete = 0 ORDER BY r.created_at'
            let queyrData = [ctx.query.user_id]
            let results = await app.mysql.query(query1, queyrData)
            this.success(results)
        }

        async getResource() {
            const {ctx} = this
            const query1 =
                'SELECT r.id, r.name, r.preview_image, r.category_id, r.desc, r.content, r.created_at, c.display_name as category, u.nickname as creator ' +
                'FROM resources AS r INNER JOIN categories AS c ON r.category_id = c.id INNER JOIN users AS u ON r.created_by = u.id WHERE r.id = ? AND r.is_delete = 0 AND c.is_delete = 0 AND u.is_delete = 0'
            let results = await app.mysql.query(query1, ctx.query.resource_id)
            for (let i = 0; i < results.length; i++) {
                const query =
                    'SELECT rt.resource_id, rt.tag_id, t.name as tag, t.color as color ' +
                    'FROM resource_tag AS rt INNER JOIN tags AS t ON rt.tag_id = t.id WHERE rt.resource_id = ? AND t.is_delete = 0'
                const tags = await app.mysql.query(query, results[i].id)
                results[i].tags = tags
            }
            for (let i = 0; i < results.length; i++) {
                const query =
                    'SELECT c.id, c.content, c.upvotes, c.downvotes, u.nickname as creator, u.avatar as creator_avatar, c.created_at ' +
                    'FROM comments AS c INNER JOIN users AS u ON u.id = c.created_by WHERE c.resource_id = ? AND u.is_delete = 0 ORDER BY c.upvotes DESC'
                const comments = await app.mysql.query(query, results[i].id)
                results[i].comments = comments
            }
            this.success(results[0])
        }

        async add() {
            const {ctx} = this
            const result = await app.mysql.beginTransactionScope(async conn => {
                const tags = ctx.request.body.tags
                delete ctx.request.body.tags
                ctx.request.body.status = 0
                const results = await conn.insert('resources', ctx.request.body)
                for (let i = 0; i < tags.length; i++) {
                    await conn.insert('resource_tag', {tag_id: tags[i], resource_id: results.insertId})
                }
                await conn.insert('histories', {h_type: 0, created_at: app.mysql.literals.now})
                const data = {
                    user_id: ctx.request.body.created_by,
                    operation_type: 1, // 1:add resource, 2:approve resource, 3:abandon resource, 4:delete resource, 5:apply to delete resource
                    status: 1, // 0:pending, 1:resolve, 2:reject
                    operation_relevant_type: 1, // 1:resource
                    operation_relevant_id: results.insertId,
                    created_at: app.mysql.literals.now,
                    updated_at: app.mysql.literals.now
                }
                const result = await conn.insert('operations', data)
                return results
            }, ctx)
            this.success(result)
        }

        async upload() {
            const {ctx} = this
            const stream = await ctx.getFileStream()
            const filename = stream.filename
            let extName = ''
            if (filename.indexOf('.') > -1) extName = filename.substring(filename.indexOf('.'))
            const parts = await toArray(stream)
            let buffer = Buffer.concat(parts)
            let imageData = undefined
            if (stream.fields.fileType !== 'video') {
                imageData = await sharp(buffer).metadata()
            }
            if (
                stream.fields.fileType === 'thumbnail' &&
                imageData &&
                (imageData.width > 200 || imageData.height > 200)
            ) {
                buffer = await sharp(buffer)
                    .resize(200, 200)
                    .toBuffer()
            }
            let result
            try {
                result = await ctx.service.resourceService.uploadToALIOSS(buffer, extName)
            } catch (err) {
                await sendToWormhole(stream)
                throw err
            }
            this.success(result)
        }

        async update() {
            const {ctx} = this
            const result = await app.mysql.beginTransactionScope(async conn => {
                const tags = ctx.request.body.tags
                delete ctx.request.body.tags
                const results = await conn.update('resources', ctx.request.body)
                for (let i = 0; i < tags.length; i++) {
                    const checkTag = await conn.select('tags', {where: {name: tags[i]}})
                    if (checkTag.length > 0) {
                        const checkTagResource = await conn.select('resource_tag', {
                            where: {tag_id: checkTag[0].id, resource_id: ctx.request.body.id}
                        })
                        if (checkTagResource.length == 0) {
                            await conn.insert('resource_tag', {
                                tag_id: checkTag[0].id,
                                resource_id: ctx.request.body.id
                            })
                        }
                    } else {
                        const temp = await conn.insert('tags', {name: tags[i], color: '#4e43cc'})
                        await conn.insert('resource_tag', {tag_id: temp.insertId, resource_id: ctx.request.body.id})
                    }
                }
                return results
            }, ctx)
            this.success(result)
        }

        async setStatus() {
            const {ctx} = this
            let data = {
                id: ctx.request.body.id,
                status: ctx.request.body.status
            }
            data.updated_at = app.mysql.literals.now
            const result = await app.mysql.beginTransactionScope(async conn => {
                const result = await conn.update('resources', data)
                await conn.insert('histories', {h_type: data.status, created_at: app.mysql.literals.now})
                let operationType = 0
                if (data.status === 2) operationType = 2
                else operationType = 3
                const temp = {
                    user_id: ctx.request.body.user_id,
                    operation_type: operationType, // 1:add resource, 2:approve resource, 3:abandon resource, 4:delete resource, 5:apply to delete resource
                    status: 1, // 0:pending, 1:resolve, 2:reject
                    operation_relevant_type: 1, // 1:resource
                    operation_relevant_id: ctx.request.body.id,
                    created_at: app.mysql.literals.now,
                    updated_at: app.mysql.literals.now
                }
                await conn.insert('operations', temp)
                return result
            })
            this.success(result)
        }

        async delete() {
            const {ctx} = this
            const result = await app.mysql.beginTransactionScope(async conn => {
                const result = await conn.update('resources', {id: ctx.request.body.id, is_delete: 1})
                const data = {
                    user_id: ctx.request.body.user_id,
                    operation_type: 4, // 1:add resource, 2:approve resource, 3:abandon resource, 4:delete resource, 5:apply to delete resource
                    status: 1, // 0:pending, 1:resolve, 2:reject
                    operation_relevant_type: 1, // 1:resource
                    operation_relevant_id: ctx.request.body.id,
                    created_at: app.mysql.literals.now,
                    updated_at: app.mysql.literals.now
                }
                await conn.insert('operations', data)
                return result
            })
            this.success(result)
        }

        async applyToDelete() {
            const {ctx} = this
            const results = await app.mysql.select('operations', {
                where: {
                    user_id: ctx.request.body.user_id,
                    operation_relevant_id: ctx.request.body.resource_id,
                    operation_type: 5,
                    operation_relevant_type: 1
                }
            })
            if (results.length > 0) throw new Exception(OPERATION_EXIST)
            const data = {
                user_id: ctx.request.body.user_id,
                operation_type: 5, // 1:add resource, 2:approve resource, 3:abandon resource, 4:delete resource, 5:apply to delete resource
                status: 0, // 0:pending, 1:resolve, 2:reject
                operation_relevant_type: 1, // 1:resource
                operation_relevant_id: ctx.request.body.resource_id,
                created_at: app.mysql.literals.now,
                updated_at: app.mysql.literals.now
            }
            const result = await app.mysql.insert('operations', data)
            this.success(result)
        }
    }
}
