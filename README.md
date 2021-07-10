# cdk-api-bootstrap

This repo takes advantage of the "Yarn Workspaces" feature. It is recommended that you use Yarn as your dependency manager to contribute to this project.

## Quick Actions Reference

See below sections for setting up your AWS account.

### Workspaces

Run `yarn` in your root folder to install all dependencies in your workspaces. A wild card reference to `packages/*` includes all folders in `packages` as a workspace dependency. Allowing execution of scripts from anywhere in the workspace.

### Initial DynamoDB Database Deployment (using AWS Profiles)
Do this only once (or if you destroyed the stack).

```bash
yarn workspace db deploy --profile dev
```

### Destroy DynamoDB Database (using AWS Profiles)
**NOTE** This will not remove the DynamoDB table if the `STAGE` is set to `prod`.

```bash
yarn workspace db deploy --profile dev
```

### Run API Documentation Server (locally)

```bash
yarn workspace api docs
```
Launches API OpenAPI documentation at: http://localhost:2000

### Generate Lambda Function Stubs for the API

After editing the API Spec, you can generate the required handlers using...

```bash
yarn workspace api generate
```

### Deploy the API (using AWS Profiles)

```bash
yarn workspace api deploy --profile dev
```

### Destroy the API saving resources (using AWS Profiles)

```bash
yarn workspace api destroy --profile dev
```

### Seeding the DynamoDB database (using AWS Profiles)

Make changes to `./db-seeder/seeds/<STAGE>/put.json` and `./db-seeder/seeds/<STAGE>/delete.json`

```bash
# Add the seed data.
yarn workspace db-seeder deploy --profile dev
```

```bash
# Remove the seed data.
yarn workspace db-seeder destroy --profile dev
```

## Stages

All stacks references the `STAGE` environment variable during deployment. If its not given then it will assume `dev` as the stage to use.

`STAGE` can be anything as long as it contains no symbols or spaces, but the `prod` stage holds significant as it will prevent some stacks from being completely destroyed.

Stages can be prepended to any deployment action.

```bash
# Deploy API to `dev` profile using a `test` stage.
STAGE=test yarn workspace api deploy --profile dev

# Deploy API to `prod` profile using the `prod` stage.
STAGE=prod yarn workspace api deploy --profile prod
```

## AWS CDK

Deployment of packages in this repo is actioned using the AWS Cloud Development Kit. Each package in the `packages` folder will contain an `infra` folder with the CDK stack used for deployment.

## AWS Serverless and "local" development

The services in this repo uses serverless technologies and most (if not all) of them fit well within the AWS Free Tier. This means developing and testing on real AWS infrastructure, rather than using `cdk-local` or `localstack`, is achievable, affordable and fast!

You will need to:

* Register an AWS Account
* Visit the IAM service
* Create a new user and add them to the "Administrator" group
* Check the box to enable "Programattic Access" 
* Note your AWS Access Key and AWS Secret Access Key for below steps.

## AWS CLI and Configuration

Be sure that you have the AWS CLI installed locally and configured. Even though you won't be using it directly, you will be using the AWS profile features for deployment.

When you first configure AWS CLI and use the login you will have a few configuration files created for you. These are:

* `~/.aws/config`
* `~/.aws/credentials`

This is where you profile configuration lives and you may already have one profile defined as `[default]` (in `config`) and `[profile default]` (in `credentials`).

Configure your profile to use your AWS Access Key and AWS Secret Access Key.

File: `~/.aws/config`
```
[profile dev]
region=ap-southeast-2
```

File: `~/.aws/credentials`
```
[dev]
aws_access_key_id=YOUR_ACCESS_KEY
aws_secret_access_key=YOUR_SECRET_ACCESS_KEY
```

You can now append `--profile dev` to any AWS CLI command to use the specified account profile secrets.

(Optional) If you have been granted an AWS Account for deployment, create an additional profile in your `config` and `credentials` files.
