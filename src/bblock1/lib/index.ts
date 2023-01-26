import * as cdk from "aws-cdk-lib";
import { Construct } from "constructs";

import * as emr from "aws-cdk-lib/aws-emrserverless";
import * as iam from "aws-cdk-lib/aws-iam";

export interface EmrServerlessAppProps {
  readonly teamName?: string;
  readonly applicationName: string;
  readonly environment?: "dev" | "tst" | "acc" | "prd";
  readonly releaseLabel?: "emr-6.8.0" | "emr-6.9.0";
  readonly type?: "Spark" | "Hive";
  readonly driverCpu?: 1 | 2 | 4;
  readonly driverDisk?: number; // 20 <= disk <= 200
  readonly driverMemory?:
    | 8
    | 10
    | 12
    | 14
    | 16
    | 18
    | 20
    | 22
    | 24
    | 26
    | 28
    | 30;
  readonly workerCpu?: 1 | 2 | 4;
  readonly workerDisk?: number; // 20 <= disk <= 200
  readonly workerMemory?:
    | 8
    | 10
    | 12
    | 14
    | 16
    | 18
    | 20
    | 22
    | 24
    | 26
    | 28
    | 30;
  readonly minDrivers?: number; // >= 0
  readonly minWorkers?: number; // >= 0
  readonly maxWorkers: number; // >= 0
  readonly autoStart?: boolean;
  readonly idleTimeoutMinutes?: number; // >= 0
}

export const EmrServerlessAppDefaults: EmrServerlessAppProps = {
  teamName: "default",
  applicationName: "default",
  environment: "dev",
  releaseLabel: "emr-6.9.0",
  type: "Spark",
  driverCpu: 2,
  driverDisk: 20,
  driverMemory: 8,
  workerCpu: 4,
  workerMemory: 16,
  minDrivers: 0,
  minWorkers: 0,
  maxWorkers: 10,
  autoStart: true,
  idleTimeoutMinutes: 5,
};

export class EmrServerlessApp extends Construct {
  public readonly name: string;
  public readonly entity: emr.CfnApplication;
  public readonly applicationId: string;

  constructor(scope: Construct, id: string, props: EmrServerlessAppProps) {
    super(scope, id);

    const account = cdk.Stack.of(this).account;
    const region = cdk.Stack.of(this).region;

    props = { ...EmrServerlessAppDefaults, ...props };

    const driverCpu = Math.min(
      Math.max(Math.floor(props.driverCpu ?? 2), 1),
      4
    );
    const driverMemory = Math.min(
      Math.max(Math.floor(props.driverMemory ?? 8), 4),
      16
    );
    const driverDisk = Math.min(
      Math.max(Math.floor(props.driverDisk ?? 20), 20),
      200
    );
    const workerCpu = Math.min(
      Math.max(Math.floor(props.workerCpu ?? 4), 1),
      4
    );
    const workerMemory = Math.min(
      Math.max(Math.floor(props.workerMemory ?? 16), 8),
      30
    );
    const workerDisk = Math.min(
      Math.max(Math.floor(props.workerDisk ?? 20), 20),
      200
    );
    const minDrivers = Math.max(Math.floor(props.minDrivers ?? 0), 0);
    const minDrivers1 = Math.max(minDrivers, 1);
    const minWorkers = Math.max(Math.floor(props.minWorkers ?? 0), 0);
    const maxWorkers = Math.max(Math.floor(props.maxWorkers ?? minWorkers), 1);
    const maxCpu = minDrivers1 * driverCpu + maxWorkers * workerCpu;
    const maxMemory = minDrivers1 * driverMemory + maxWorkers * workerMemory;
    const maxDisk = minDrivers1 * driverDisk + maxWorkers * workerDisk;

    const initialCapacity =
      minDrivers > 0 || minWorkers > 0
        ? {
            initialCapacity: [
              {
                key: "Driver",
                value: {
                  workerCount: Math.max(minDrivers, 1),
                  workerConfiguration: {
                    cpu: `${driverCpu} vCPU`,
                    memory: `${driverMemory} GB`,
                    disk: `${driverDisk} GB`,
                  },
                },
              },
              {
                key: "Executor",
                value: {
                  workerCount: Math.max(minWorkers, 0),
                  workerConfiguration: {
                    cpu: `${workerCpu} vCPU`,
                    memory: `${workerMemory} GB`,
                    disk: `${workerDisk} GB`,
                  },
                },
              },
            ],
          }
        : {};

    const emrslProps: emr.CfnApplicationProps = {
      name: `${props.teamName}-emr-serverless-${region}-${props.applicationName}-${props.environment}`,
      releaseLabel: props.releaseLabel ?? "emr-6.9.0",
      type: props.type ?? "Spark",
      autoStartConfiguration: { enabled: props.autoStart ?? true },
      autoStopConfiguration: { enabled: true, idleTimeoutMinutes: props.idleTimeoutMinutes ?? 5 },
      maximumCapacity: {
        cpu: `${maxCpu} vCPU`,
        memory: `${maxMemory} GB`,
        disk: `${maxDisk} GB`,
      },
      ...initialCapacity,
    };

    const entity = new emr.CfnApplication(this, `${id}EmrSlApp`, emrslProps);
    this.entity = entity;
    this.applicationId = this.entity.attrApplicationId;
    const jobPolicy = EmrServerlessApp.createIamProfile(
      scope,
      `${id}EmrSlJobProfile`,
      this.applicationId,
      `${this.entity.name}-job-profile`
    );
  }

  public static createIamProfile(
    scope: Construct,
    id: string,
    emrAppArn: string,
    name: string
  ): iam.ManagedPolicy {
    return new iam.ManagedPolicy(scope, id + "-job-policy", {
      managedPolicyName: this.name,
      document: new iam.PolicyDocument({
        assignSids: true,
        statements: [
          new iam.PolicyStatement({
            effect: iam.Effect.ALLOW,
            actions: [
              "emr-serverless:GetApplication",
              "emr-serverless:ListJobRuns",
              "emr-serverless:TagResource",
              "emr-serverless:UntagResource",
              "emr-serverless:ListTagsForResource",
              "emr-serverless:StartApplication",
              "emr-serverless:StartJobRun",
              "emr-serverless:StopApplication",
            ],
            resources: [emrAppArn],
          }),
          new iam.PolicyStatement({
            effect: iam.Effect.ALLOW,
            actions: [
              "emr-serverless:CancelJobRun",
              "emr-serverless:GetDashboardForJobRun",
              "emr-serverless:GetJobRun",
              "emr-serverless:ListTagsForResource",
              "emr-serverless:TagResource",
              "emr-serverless:UntagResource",
            ],
            resources: [`${emrAppArn}/jobruns/*`],
          }),
        ],
      }),
    });
  }
}
