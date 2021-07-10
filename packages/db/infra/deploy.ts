#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from '@aws-cdk/core';
import { ServiceStack } from './stack';
import * as path from 'path';
import * as fs from 'fs';

const wsConfig = JSON.parse(fs.readFileSync(path.resolve(__dirname, '../../../workspace.config.json')).toString());
const stage = process.env.STAGE || 'dev';
const stackId = `${wsConfig.stackPrefix}DB-${stage}`;
const account = process.env.CDK_DEFAULT_ACCOUNT;
const region = process.env.CDK_DEFAULT_REGION || 'ap-southeast-2';

const app = new cdk.App();
new ServiceStack(app, stackId, {
  env: {
    account,
    region,
  },
  description: `Deploying Stack (${stackId})`
});