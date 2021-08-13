import SwaggerParser from '@apidevtools/swagger-parser'
import fs from "fs"
import mkdirp from 'mkdirp'

const parser = new SwaggerParser()

parser.validate('api-spec.yaml').then((api)=>{

    const functionsPath = 'functions'
    
    // Loop paths.
    for ( const key in api.paths ) {
        const fullPath = key.replace(/^\//,'')
        const root = fullPath.split('/')[0]
        mkdirp.sync(`${functionsPath}/${root}`)
    
        // Loop methods.
        for ( const method in api.paths[key]) {
            const pathMethod = api.paths[key][method]
            if ( pathMethod.operationId ) {
    
                const template = `'use strict'
const { corsHeaders } = require('/opt/nodejs/cors-headers.js');

const stage = process.env.STAGE || 'dev'
                    
module.exports.${pathMethod.operationId} = async (event, context, callback) => {
    const response = {
        statusCode:200,
        headers: {
            ...corsHeaders(stage),
        },
        body: 'Hello!'
    }

    callback(null, response)
}`
    
                const handlerFile = `${functionsPath}/${root}/${pathMethod.operationId}.js`
    
                // Don't override if file exists.
                if ( ! fs.existsSync(handlerFile) ) {
                    let file = fs.openSync(handlerFile, "w+")
                    fs.writeSync(file,template)
                    fs.closeSync(file)
                }
    
            }
        }
    }
})
