#!/usr/bin/env node

const cdk = require('@aws-cdk/core');
const { Ec2ManagerStack } = require('../lib/ec2-manager-stack');

const app = new cdk.App();
new Ec2ManagerStack(app, 'Ec2ManagerStack');
