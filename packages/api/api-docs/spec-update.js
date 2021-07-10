import yaml from 'yamljs'
import path from 'path'
import fs from 'fs'

const wsConfig = JSON.parse(fs.readFileSync(path.resolve(__dirname, '../../../workspace.config.json')).toString());
const stage = process.env.STAGE || 'dev';
const stackId = `${wsConfig.stackPrefix}API-${stage}`;
const spec = yaml.load(path.resolve(__dirname, '../api-spec.yaml'));
if ( fs.existsSync(path.resolve(__dirname, '../cdk.out.json'))) {
    const cdkOutput = JSON.parse(fs.readFileSync(path.resolve(__dirname, '../cdk.out.json')))
    const normalized = {}
    Object.keys(cdkOutput[stackId]).forEach(key => {
        if ( key.startsWith('APIEndpoint') || key.startsWith(`${wsConfig.stackPrefix}APIEndpoint`) ) {
            normalized['APIEndpoint'] = cdkOutput[stackId][key]
        }
    })
    const updatedSpec = {
        ...spec,
        servers: spec.servers.map(server => {
            server.variables.resource.default = normalized['APIEndpoint']
            return server
        })
    }
    fs.writeFileSync(path.resolve(__dirname, './api-spec.yaml'),yaml.stringify(updatedSpec));    
} else {
    fs.writeFileSync(path.resolve(__dirname, './api-spec.yaml'),yaml.stringify(spec));
}