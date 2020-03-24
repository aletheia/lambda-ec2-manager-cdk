const cdk = require('@aws-cdk/core');
const {Function, AssetCode, Runtime} = require('@aws-cdk/aws-lambda');
const {PolicyStatement, Effect} = require('@aws-cdk/aws-iam');
const apigateway = require('@aws-cdk/aws-apigateway');
const {Rule, Schedule} = require('@aws-cdk/aws-events');
const {LambdaFunction} = require('@aws-cdk/aws-events-targets');
const {instanceIds, scheduleInUTC} = require('./config.json');

class Ec2ManagerStack extends cdk.Stack {
  /**
   *
   * @param {cdk.Construct} scope
   * @param {string} id
   * @param {cdk.StackProps=} props
   */
  constructor(scope, id, props) {
    super(scope, id, props);

    const managerFunction = new Function(this, 'ec2ManagerFunction', {
      code: new AssetCode('lambda/bbb-ec2-manager'),
      runtime: Runtime.NODEJS_10_X,
      handler: 'index.handler',
      environment: {
        INSTANCE_IDS: instanceIds.join(','),
      },
    });
    managerFunction.addToRolePolicy(new PolicyStatement({
      effect: Effect.ALLOW,
      resources: '*',
      actions: ['ec2:*'],
    }));

    const api = new apigateway.RestApi(this, 'ec2manager-api', {
      restApiName: 'ec2 manager',
    });
    api.defaultCorsPreflightOptions = {
      allowOrigins: apigateway.Cors.ALL_ORIGINS,
      allowMethods: apigateway.Cors.ALL_METHODS, // this is also the default
    };

    const state = api.root.addResource('state');

    const desiredState = state.addResource('{desiredState}');
    const changeState = new apigateway.LambdaIntegration(managerFunction);
    desiredState.addMethod('GET', changeState);


    const switchOnRule = new Rule(this, 'SwitchOnRule', {
      schedule: Schedule.expression(scheduleInUTC.on),
    });
    switchOnRule.addTarget(new LambdaFunction(managerFunction));

    const switchOffRule = new Rule(this, 'SwitchOffRule', {
      schedule: Schedule.expression(scheduleInUTC.off),
    });
    switchOffRule.addTarget(new LambdaFunction(managerFunction));
  }
}


module.exports = {Ec2ManagerStack};
