'use strict'

const AWS = require('aws-sdk')
const moment = require('moment')

module.exports = app => {
    return class ResourceService extends app.Service {
        uploadToAWS(buffer, name) {
            return new Promise((resolve, reject) => {
                const s3 = new AWS.S3()
                const params = {
                    Body: buffer,
                    Bucket: 'xiaojibucket',
                    Key: name,
                    ACL: 'public-read'
                }
                s3.putObject(params, (err, data) => {
                    if (err) reject(err)
                    resolve(data)
                })
            })
        }

        async uploadToALIOSS(buffer, extName) {
            const {ctx, app} = this
            const timestamp = moment().valueOf()
            const random = Math.floor((Math.random() + 1) * 10000)
            const finalName = random + timestamp + extName
            const object = await ctx.oss.put('resources/' + finalName, buffer)
            if (object) {
                let url = object.url
                if (url.indexOf('https') === -1) {
                    url = url.replace(/http/, 'https')
                }
                return url
            }
        }
    }
}
