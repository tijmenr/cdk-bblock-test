// import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
// import * as sqs from 'aws-cdk-lib/aws-sqs';

export interface NxpCcoeCdpBblocks2Props {
  // Define construct properties here
}

export class NxpCcoeCdpBblocks2 extends Construct {

  constructor(scope: Construct, id: string, props: NxpCcoeCdpBblocks2Props = {}) {
    super(scope, id);

    // Define construct contents here

    // example resource
    // const queue = new sqs.Queue(this, 'NxpCcoeCdpBblocks2Queue', {
    //   visibilityTimeout: cdk.Duration.seconds(300)
    // });
  }
}
