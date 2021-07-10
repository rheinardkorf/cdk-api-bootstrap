import * as cdk from '@aws-cdk/core';
import * as dynamodb from '@aws-cdk/aws-dynamodb';
import * as lambda from '@aws-cdk/aws-lambda';
import * as cr from '@aws-cdk/custom-resources';
import * as logs from '@aws-cdk/aws-logs';
import * as iam from '@aws-cdk/aws-iam';
import * as path from 'path'
import * as fs from 'fs'

const wsConfig = JSON.parse(fs.readFileSync(path.resolve(__dirname, '../../../workspace.config.json')).toString());
const stage = process.env.STAGE || "dev";
const stackId = `${wsConfig.stackPrefix}DB-Seeder-${stage}`;
const tableName = `${wsConfig.defaultTable}-${stage}`;
const seedsStage = process.env.SEEDS_STAGE || stage;

export class SeederStack extends cdk.Stack {
  constructor(scope: cdk.Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const table: dynamodb.ITable = dynamodb.Table.fromTableAttributes(this,`${stackId}__DynamoDB`, {
        tableName,
        globalIndexes: ['GSI1', 'GSI2', 'GSI3']
    });

    const seederResourceRole = new iam.Role(this,`${stackId}_seederResourceRole`,{
        assumedBy: new iam.ServicePrincipal('lambda.amazonaws.com')
    })

    seederResourceRole.addToPolicy(new iam.PolicyStatement({
        effect: iam.Effect.ALLOW,
        resources: ['*'],
        actions: [
            "dynamodb:GetItem",
            "dynamodb:BatchGetItem",
            "dynamodb:Query",
            "dynamodb:PutItem",
            "dynamodb:UpdateItem",
            "dynamodb:DeleteItem",
            "dynamodb:BatchWriteItem",
            "dynamodb:updateTable",
            "dynamodb:describeTable"
        ]
    }));

    const seedLayer = new lambda.LayerVersion(this, `${stackId}_SeedLayer`, {
        code: new lambda.AssetCode(`seeds`)
    })

    table.grantReadWriteData(seederResourceRole);
    const onEvent = new lambda.Function(this, `${stackId}-${tableName}-seedHandler`, {
        runtime: lambda.Runtime.NODEJS_14_X,
        handler: 'seeder.handler',
        code: lambda.Code.fromAsset(path.resolve(__dirname, '../seeder')),
        environment: {
            SEED_STAGE: seedsStage,
            TABLE_NAME: tableName
        },
        layers: [seedLayer],
        timeout: cdk.Duration.minutes(15),
        role: seederResourceRole
    })
    table.grantReadWriteData(onEvent);

    const seederProvider = new cr.Provider(this, `${stackId}_seederProvider`, {
        onEventHandler: onEvent,
        logRetention: logs.RetentionDays.ONE_DAY
    })

    /**
     * NOTE: For some reason the custom resource is not triggering
     * the "Update" action for Custom Resources. You will need
     * to destroy and deploy for changes in seed data to be reflected.
     */
    new cdk.CustomResource(this, `${stackId}_seederCustomResource`, {
        serviceToken: seederProvider.serviceToken
    })

  }
}