#!/usr/bin/env node
require("dotenv").config();

import "source-map-support/register";

import { App } from "@aws-cdk/core";

import { FragateStack } from "./../lib";

/**
 * AWS Account / Region Definition
 */
const {
  PREFIX: prefix = "[STACK PREFIX NAME]",
  STAGE: stage = "[DEPLOYMENT STAGE]",
  CDK_ACCOUNT: accountId = "[AWS ACCOUNT ID]",
  CDK_REGION: region = "ap-southeast-1",
} = process.env;

/**
 * AWS defulat ENV config Definition
 */
const env = {
  account: accountId,
  region: region,
};

const app = new App();

/**
 * Create Ecs Stack
 */
const ecs = new FragateStack(app, `${prefix}-${stage}-FragateStack`, {
  prefix,
  stage,
  env,
});

/**
 * Create Elb Stack
 */
// new ElbStack(app, `${prefix}-${stage}-ElbStack`, {
//   prefix,
//   stage,
//   cluster: ecs.cluster,
//   ecsService: ecs.ecsService,
// });

app.synth();
