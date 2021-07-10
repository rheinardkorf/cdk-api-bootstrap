const fs = require('fs')

exports.corsHeaders = (stage = "dev") => {
  let corsHeaders = {};
  if (fs.existsSync(`/opt/nodejs/cors-headers-${stage}.json`)) {
    corsHeaders = {
      ...JSON.parse(fs.readFileSync(`/opt/nodejs/cors-headers-${stage}.json`))
    };
  } else if (fs.existsSync(`/opt/nodejs/cors-headers-default.json`)) {
    corsHeaders = {
        ...JSON.parse(fs.readFileSync(`/opt/nodejs/cors-headers-default.json`))
    };
  }
  return corsHeaders;
};
