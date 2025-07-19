# AWS Lambda Puppeteer Web Scraper

A serverless web scraping solution built with AWS CDK v2, AWS Lambda, and Puppeteer for scraping Google search results.

## Architecture

- **AWS Lambda**: Serverless function runtime (Node.js 22.x)
- **Puppeteer**: Headless browser automation
- **@sparticuz/chromium**: Optimized Chromium for AWS Lambda
- **AWS CDK v2**: Infrastructure as Code
- **Function URL**: Direct HTTPS access without API Gateway

## Project Structure

```
├── src/                    # Lambda function source code
│   └── index.ts           # Main handler function
├── aws/                   # CDK infrastructure code
│   ├── lib/
│   │   ├── index.ts      # CDK app entry point
│   │   └── lambda-puppeteer-stack.ts  # Stack definition
│   ├── package.json      # CDK dependencies
│   ├── tsconfig.json     # CDK TypeScript config
│   └── cdk.json          # CDK configuration
├── package.json          # Main project dependencies
├── tsconfig.json         # Main TypeScript config
└── README.md
```

## Features

- ✅ **CDK v2 Compatible**: Uses latest AWS CDK v2 patterns and best practices
- ✅ **TypeScript**: Fully typed with proper AWS Lambda interfaces
- ✅ **Function URL**: No API Gateway required for HTTPS access
- ✅ **Error Handling**: Comprehensive error handling and validation
- ✅ **Optimized for Lambda**: Proper bundling and Lambda-specific configurations
- ✅ **CORS Support**: Built-in CORS configuration
- ✅ **CloudWatch Logs**: Structured logging with retention policies
- ✅ **Resource Tagging**: Proper resource tagging for cost management

## Prerequisites

- Node.js 18+
- AWS CLI configured
- AWS CDK v2 installed globally: `npm install -g aws-cdk`

## Installation

1. **Install dependencies**:

   ```bash
   npm run install-deps
   ```

2. **Bootstrap CDK** (if not done before):
   ```bash
   cd aws && npm run bootstrap
   ```

## Deployment

1. **Build and deploy**:

   ```bash
   npm run deploy
   ```

2. **View outputs**:
   The deployment will output the Function URL which you can use to invoke the Lambda.

## Usage

### API Endpoint

Send a POST request to the Function URL with JSON body:

```json
{
  "keyword": "your search query"
}
```

### Example Request

```bash
curl -X POST "https://your-function-url.lambda-url.us-east-1.on.aws/" \
  -H "Content-Type: application/json" \
  -d '{"keyword": "AWS Lambda tutorial"}'
```

### Example Response

```json
{
  "success": true,
  "keyword": "AWS Lambda tutorial",
  "data": "<html>...complete HTML of Google search results...</html>"
}
```

### Error Response

```json
{
  "success": false,
  "error": "Keyword is required and must be a non-empty string"
}
```

## CDK v2 Features Used

- **Modern Import Syntax**: Uses `aws-cdk-lib` instead of individual `@aws-cdk/*` packages
- **Constructs v10**: Latest Constructs library
- **Function URLs**: Direct Lambda invocation without API Gateway
- **NodejsFunction**: Optimized TypeScript bundling
- **Log Retention**: Automatic CloudWatch log management
- **Lambda Insights**: Enhanced monitoring capabilities
- **Resource Tagging**: Consistent tagging across all resources

## Configuration

### Lambda Function

- **Runtime**: Node.js 22.x
- **Memory**: 1024 MB
- **Timeout**: 5 minutes
- **Architecture**: x86_64
- **Reserved Concurrency**: 5 (to manage costs)

### Puppeteer Configuration

- **Headless**: True (Lambda optimized)
- **Chromium**: @sparticuz/chromium (Lambda compatible)
- **Args**: Optimized for Lambda environment

## Development

### Local Development

```bash
# Install dependencies
npm install
cd aws && npm install

# Build TypeScript
npm run build

# Deploy to AWS
npm run deploy
```

### CDK Commands

```bash
cd aws

# Synthesize CloudFormation template
npm run synth

# View diff before deployment
npm run diff

# Deploy stack
npm run deploy

# Destroy stack
npm run destroy
```

## Monitoring

- **CloudWatch Logs**: Function logs are automatically sent to CloudWatch
- **Lambda Insights**: Enhanced monitoring enabled
- **X-Ray Tracing**: Can be enabled for detailed request tracing

## Cost Optimization

- **Reserved Concurrency**: Limited to 5 concurrent executions
- **Log Retention**: Set to 1 week to manage CloudWatch costs
- **Memory Optimization**: 1024 MB provides good price/performance ratio

## Security

- **Function URL**: No authentication (configure as needed)
- **CORS**: Configured for web browser access
- **IAM**: Minimal required permissions

## Troubleshooting

### Common Issues

1. **Bundle size too large**: Chromium is excluded from bundle and loaded as external module
2. **Timeout errors**: Increase Lambda timeout if needed
3. **Memory errors**: Increase Lambda memory allocation
4. **Google blocking**: Function includes user agent rotation and delay mechanisms

### Debugging

Check CloudWatch logs for detailed error information:

```bash
aws logs tail /aws/lambda/LambdaPuppeteerStack-PuppeteerFunction --follow
```

## License

MIT License - see LICENSE file for details.
