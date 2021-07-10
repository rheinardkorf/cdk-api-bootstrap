'use strict'
    
const { corsHeaders } = require('/opt/nodejs/cors-headers.js');

const stage = process.env.STAGE || 'dev'
module.exports.newCollection = (event, context, callback) => {
    const response = {
        statusCode:200,
        headers: {
            ...corsHeaders(stage),
          },
        body: 'Hello Again!'
    }

    callback(null, response)
}