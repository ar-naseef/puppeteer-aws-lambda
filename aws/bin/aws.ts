#!/usr/bin/env node
import "source-map-support/register";
import { App, Environment } from "aws-cdk-lib";
import { LambdaPuppeteerStack } from "../lib/lambda-puppeteer-stack";

const app = new App();

// Get environment configuration from context or environment variables
const account = process.env.CDK_DEFAULT_ACCOUNT;
const region = process.env.CDK_DEFAULT_REGION || "us-east-1";

// Define the deployment environment
const env: Environment = {
  account,
  region,
};

// Environment variables to pass to the Lambda function
const environmentVariables = {};

// Create the Lambda Puppeteer stack
new LambdaPuppeteerStack(app, "LambdaPuppeteerStack", {
  env,
  environmentVariables,
  description: "AWS Lambda function with Puppeteer for web scraping",
  tags: {
    Project: "aws-lambda-puppeteer",
    Environment: "production",
    ManagedBy: "AWS CDK",
  },
});
