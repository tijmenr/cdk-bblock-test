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
    readonly driverDisk?: number;
    readonly driverMemory?: 8 | 10 | 12 | 14 | 16 | 18 | 20 | 22 | 24 | 26 | 28 | 30;
    readonly workerCpu?: 1 | 2 | 4;
    readonly workerDisk?: number;
    readonly workerMemory?: 8 | 10 | 12 | 14 | 16 | 18 | 20 | 22 | 24 | 26 | 28 | 30;
    readonly minDrivers?: number;
    readonly minWorkers?: number;
    readonly maxWorkers: number;
    readonly autoStart?: boolean;
    readonly idleTimeoutMinutes?: number;
}
export declare const EmrServerlessAppDefaults: EmrServerlessAppProps;
export declare class EmrServerlessApp extends Construct {
    readonly name: string;
    readonly entity: emr.CfnApplication;
    readonly applicationId: string;
    constructor(scope: Construct, id: string, props: EmrServerlessAppProps);
    static createIamProfile(scope: Construct, id: string, emrAppArn: string, name: string): iam.ManagedPolicy;
}
