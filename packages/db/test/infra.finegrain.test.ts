import { SynthUtils } from "@aws-cdk/assert"
import { Stack } from "@aws-cdk/core"
import "@aws-cdk/assert/jest"

import { ServiceStack } from "../infra/stack"

import * as path from 'path'
import * as fs from 'fs'

const wsConfig = JSON.parse(fs.readFileSync(path.resolve(__dirname, '../../../workspace.config.json')).toString());
const stage = process.env.STAGE || "dev";
const tableName = `${wsConfig.defaultTable}-${stage}`;

test("Stack has DynamoDB table with Workspace name", () => {
    const stack = new Stack();
    const service_stack = new ServiceStack(stack, 'service_stack');
    expect(service_stack).toHaveResource('AWS::DynamoDB::Table', {
        TableName: tableName,
    });
});