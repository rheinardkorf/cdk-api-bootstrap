import * as cdk from "@aws-cdk/core";
import * as dynamodb from "@aws-cdk/aws-dynamodb";
import * as path from 'path'
import * as fs from 'fs'

const wsConfig = JSON.parse(fs.readFileSync(path.resolve(__dirname, '../../../workspace.config.json')).toString());
const stage = process.env.STAGE || "dev";
const stackId = `${wsConfig.stackPrefix}DB-${stage}`;
const tableName = `${wsConfig.defaultTable}-${stage}`;

export class ServiceStack extends cdk.Stack {
  constructor(scope: cdk.Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);
    
    const removalPolicy = !["prod", "production"].includes(stage)
      ? cdk.RemovalPolicy.DESTROY
      : cdk.RemovalPolicy.RETAIN;

    // DynamoDB Table Definition.
    const table = new dynamodb.Table(this, `${stackId}_DynamoDB`, {
      partitionKey: { name: "PK", type: dynamodb.AttributeType.STRING },
      sortKey: { name: "SK", type: dynamodb.AttributeType.STRING },
      billingMode: dynamodb.BillingMode.PAY_PER_REQUEST,
      tableName,
      removalPolicy,
      stream: dynamodb.StreamViewType.NEW_AND_OLD_IMAGES,
      pointInTimeRecovery: true
    });

    // Add GSI1.
    table.addGlobalSecondaryIndex({
      indexName: "GSI1",
      partitionKey: { name: "PK1", type: dynamodb.AttributeType.STRING },
      sortKey: { name: "SK1", type: dynamodb.AttributeType.STRING },
      projectionType: dynamodb.ProjectionType.ALL,
    });

    // Add GSI2.
    table.addGlobalSecondaryIndex({
      indexName: "GSI2",
      partitionKey: { name: "PK2", type: dynamodb.AttributeType.STRING },
      sortKey: { name: "SK2", type: dynamodb.AttributeType.STRING },
      projectionType: dynamodb.ProjectionType.ALL,
    });

    // Add GSI3.
    table.addGlobalSecondaryIndex({
      indexName: "GSI3",
      partitionKey: { name: "PK3", type: dynamodb.AttributeType.STRING },
      sortKey: { name: "SK3", type: dynamodb.AttributeType.STRING },
      projectionType: dynamodb.ProjectionType.ALL,
    });
  }
}
