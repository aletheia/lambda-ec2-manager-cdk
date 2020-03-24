# Lambda EC2 Manager
An AWS CDK project to manage EC2 instances with a lambda function that can be invoked manually through an API or with a scheduled task

## Getting started
To get started you need an AWS account to be setup, a profile configured on you machine (named _profileName_) and nodejs 12.x

**1.Install AWS-CDK**
```bash
npm i -g aws-cdk
```

**2.Install depdendencies**
```bash
npm install
```

**3. Deploy on aws**
```bash
cdk bootstrap --profile profileName
cdk deploy --profile profileName
```