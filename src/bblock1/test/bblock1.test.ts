import * as cdk from "aws-cdk-lib";
import { Template } from "aws-cdk-lib/assertions";
import * as emrsl from "../lib/index";

test("EMR Serverless Application Created", () => {
  const app = new cdk.App();
  const stack = new cdk.Stack(app, "TestStack");
  const emrProps: emrsl.EmrServerlessAppProps = {
    applicationName: "test",
    maxWorkers: 1,
  };

  const allProps = {
    ...emrsl.EmrServerlessAppDefaults,
    ...emrProps
  };

  // WHEN
  new emrsl.EmrServerlessApp(stack, "MyTestConstruct", emrProps);
  // THEN
  const template = Template.fromStack(stack);

  template.hasResourceProperties("AWS::EMRServerless::Application", {
    ReleaseLabel: allProps.releaseLabel,
    Type: allProps.type,
    AutoStartConfiguration: { 'Enabled': true },
    AutoStopConfiguration: { 'Enabled': true, 'IdleTimeoutMinutes': allProps.idleTimeoutMinutes },
  });
});
