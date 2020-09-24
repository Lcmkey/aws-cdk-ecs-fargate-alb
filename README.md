# Welcome to your CDK TypeScript project!

This is a blank project for TypeScript development with CDK.

The `cdk.json` file tells the CDK Toolkit how to execute your app.

## Useful commands

- `npm run build` compile typescript to js
- `npm run watch` watch for changes and compile
- `npm run test` perform the jest unit tests
- `cdk deploy` deploy this stack to your default AWS account/region
- `cdk diff` compare deployed stack with current state
- `cdk synth` emits the synthesized CloudFormation template

## How to Deploy

1. install app package

   ```sh
   $ cd ./app && npm install
   ```

2. install cdk pacakge

   ```sh
   $ cd .. && npm install
   ```

3. bootstrap the cdk resource

   ```sh
   $ cdk bootstrap
   ```

4. List Stack

   ```sh
   $ cdk list
   ```

5. Deploy

   ```sh
   $ cdk deploy Fragate-Dev-FragateStack
   ```

6. Destroy the deployed services

   ```sh
   $ cdk destroy Fragate-Dev-FragateStack
   ```

<!-- Reference -->

[aws cdk - fragate]: https://miyahara.hikaru.dev/posts/20191205/
