import * as cdk from '@aws-cdk/core';
import * as apigateway from '@aws-cdk/aws-apigateway';
import * as dynamodb from '@aws-cdk/aws-dynamodb';
import * as lambda from '@aws-cdk/aws-lambda';
import * as yaml from 'yamljs';
import * as path from 'path';
import * as fs from 'fs';

const wsConfig = JSON.parse(fs.readFileSync(path.resolve(__dirname, '../../../workspace.config.json')).toString());
const stage = process.env.STAGE || "dev";
const stackId = `${wsConfig.stackPrefix}API-${stage}`;
const tableName = `${wsConfig.defaultTable}-${stage}`;

export class ServiceStack extends cdk.Stack {
  constructor(scope: cdk.Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // Get reference to DynamoDB table.
    // Must specify `globalIndexes` for permissions to work on indexes.
    const table = dynamodb.Table.fromTableAttributes(this,`${stackId}_DynamoDB`, {
        tableName,
        globalIndexes: ['GSI1', 'GSI2', 'GSI3']
    });

    // Create API Gateway.
    const api = new apigateway.RestApi(this, `${stackId}_API`, {
      defaultCorsPreflightOptions: {
        allowOrigins: apigateway.Cors.ALL_ORIGINS,
        allowHeaders:['Content-Type', 'X-Amz-Date', 'X-Amz-Security-Token', 'Authorization', 'X-Api-Key', 'X-Requested-With', 'Accept', 'Access-Control-Allow-Methods', 'Access-Control-Allow-Origin', 'Access-Control-Allow-Headers']
      }
    });

    // Create common layer for include dependencies in all lambdas.
    const commonLayer = new lambda.LayerVersion(this, `${stackId}_Common`, {
        code: new lambda.AssetCode(`layers/common`),
        compatibleRuntimes: [lambda.Runtime.NODEJS_14_X]
    })

    // Custom Authorizer Function.
    const lambdaAuthorizerFunction = new lambda.Function(this, `${stackId}_Authorization_Handler`, {
      runtime: lambda.Runtime.NODEJS_14_X,
      code: new lambda.AssetCode(`authorizer`),
      handler: `authorizer.authorizer`,
      layers: [commonLayer]
    })

    // Custom Authorizer.
    const lambdaAuthorizer = new apigateway.TokenAuthorizer(this, `${stackId}_TokenAuthorizer`, {
      handler: lambdaAuthorizerFunction
    })

    // Load the API Spec.
    const spec = yaml.load(path.resolve(__dirname, '../api-spec.yaml'))

    // Generate resources for API paths and methods.
    for ( const key in spec.paths ) {

      // New API Gateway resource for path.
      const resource = api.root.resourceForPath(key);

      // Get the root of the path to point to functions.
      const fullPath = key.replace(/^\//,'')
      const root = fullPath.split('/')[0]

      // For each of the path methods add a new API Gateway method.
      for ( const method in spec.paths[key]) {
        const pathMethod = spec.paths[key][method]
        const isSecured = pathMethod.security && true || false

        // Create a new Lambda Function to handle the method.
        const lambdaHandler = new lambda.Function(this, `${pathMethod.operationId}_Handler`, {
          runtime: lambda.Runtime.NODEJS_14_X,
          code: new lambda.AssetCode(`functions/${root}`),
          handler: `${pathMethod.operationId}.${pathMethod.operationId}`,
					layers: [commonLayer],
          environment: {
            TABLE_NAME: table.tableName
          },
          
        })

        if ( 'GET' === method.toUpperCase() ) {
          table.grantReadData(lambdaHandler);
        } else {
          table.grantReadWriteData(lambdaHandler);
        }

        const authorizer = isSecured && {
          authorizationType: apigateway.AuthorizationType.CUSTOM,
          authorizer: lambdaAuthorizer
        } || {};

        // Attach the Lambda function to the API Gateway resource.
        resource.addMethod(method.toUpperCase(), new apigateway.LambdaIntegration(lambdaHandler), {
          ...authorizer
        });
      }
    }
  }
}