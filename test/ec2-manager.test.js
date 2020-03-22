const { expect, matchTemplate, MatchStyle } = require('@aws-cdk/assert');
const cdk = require('@aws-cdk/core');
const Ec2Manager = require('../lib/ec2-manager-stack');

test('Empty Stack', () => {
    const app = new cdk.App();
    // WHEN
    const stack = new Ec2Manager.Ec2ManagerStack(app, 'MyTestStack');
    // THEN
    expect(stack).to(matchTemplate({
      "Resources": {}
    }, MatchStyle.EXACT))
});