import {
  App,
  Stack,
  StackProps,
  CfnOutput,
  aws_lambda,
  Duration,
} from "aws-cdk-lib";

export class LambdaPuppeteerStack extends Stack {
  constructor(
    scope: App,
    id: string,
    props: {
      environmentVariables?: any;
    } & StackProps
  ) {
    super(scope, id, props);

    const puppeteerLambda = new aws_lambda.Function(
      this,
      "PuppeteerLambdaStack",
      {
        runtime: aws_lambda.Runtime.NODEJS_20_X,
        code: aws_lambda.Code.fromAsset("../../dist"),
        handler: "index.handler",
        environment: props.environmentVariables,
        timeout: Duration.minutes(3),
        memorySize: 2048,
      }
    );

    // Create a function URL for the Lambda
    const functionUrl = puppeteerLambda.addFunctionUrl({
      authType: aws_lambda.FunctionUrlAuthType.NONE,
      cors: {
        allowedOrigins: ["*"],
        allowedMethods: [aws_lambda.HttpMethod.ALL],
        allowedHeaders: ["*"],
      },
    });

    // Output the function URL
    new CfnOutput(this, "PuppeteerFunctionUrl", {
      value: functionUrl.url,
      description: "Puppeteer Lambda Function URL",
    });
  }
}
