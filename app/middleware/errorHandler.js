'use strict'
const {generalFailure} = require('../utils/tools')
const translation = require('../exception/codeTranslation')

module.exports = options => {
    return async function handler(ctx, next) {
        try {
            await next()
        } catch (e) {
            if (e.code && e.msg) {
                const locale = ctx.get('locale') ? ctx.get('locale') : 'en'
                e.msg = translation[e.code][locale]
            }
            ctx.body = generalFailure(e)
        }
    }
}
