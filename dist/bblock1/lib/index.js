"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.EmrServerlessApp = exports.EmrServerlessAppDefaults = void 0;
const cdk = require("aws-cdk-lib");
const constructs_1 = require("constructs");
const emr = require("aws-cdk-lib/aws-emrserverless");
const iam = require("aws-cdk-lib/aws-iam");
exports.EmrServerlessAppDefaults = {
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
class EmrServerlessApp extends constructs_1.Construct {
    constructor(scope, id, props) {
        super(scope, id);
        const account = cdk.Stack.of(this).account;
        const region = cdk.Stack.of(this).region;
        props = { ...exports.EmrServerlessAppDefaults, ...props };
        const driverCpu = Math.min(Math.max(Math.floor(props.driverCpu ?? 2), 1), 4);
        const driverMemory = Math.min(Math.max(Math.floor(props.driverMemory ?? 8), 4), 16);
        const driverDisk = Math.min(Math.max(Math.floor(props.driverDisk ?? 20), 20), 200);
        const workerCpu = Math.min(Math.max(Math.floor(props.workerCpu ?? 4), 1), 4);
        const workerMemory = Math.min(Math.max(Math.floor(props.workerMemory ?? 16), 8), 30);
        const workerDisk = Math.min(Math.max(Math.floor(props.workerDisk ?? 20), 20), 200);
        const minDrivers = Math.max(Math.floor(props.minDrivers ?? 0), 0);
        const minDrivers1 = Math.max(minDrivers, 1);
        const minWorkers = Math.max(Math.floor(props.minWorkers ?? 0), 0);
        const maxWorkers = Math.max(Math.floor(props.maxWorkers ?? minWorkers), 1);
        const maxCpu = minDrivers1 * driverCpu + maxWorkers * workerCpu;
        const maxMemory = minDrivers1 * driverMemory + maxWorkers * workerMemory;
        const maxDisk = minDrivers1 * driverDisk + maxWorkers * workerDisk;
        const initialCapacity = minDrivers > 0 || minWorkers > 0
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
        const emrslProps = {
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
        const jobPolicy = EmrServerlessApp.createIamProfile(scope, `${id}EmrSlJobProfile`, this.applicationId, `${this.entity.name}-job-profile`);
    }
    static createIamProfile(scope, id, emrAppArn, name) {
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
exports.EmrServerlessApp = EmrServerlessApp;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi9zcmMvYmJsb2NrMS9saWIvaW5kZXgudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7O0FBQUEsbUNBQW1DO0FBQ25DLDJDQUF1QztBQUV2QyxxREFBcUQ7QUFDckQsMkNBQTJDO0FBNkM5QixRQUFBLHdCQUF3QixHQUEwQjtJQUM3RCxRQUFRLEVBQUUsU0FBUztJQUNuQixlQUFlLEVBQUUsU0FBUztJQUMxQixXQUFXLEVBQUUsS0FBSztJQUNsQixZQUFZLEVBQUUsV0FBVztJQUN6QixJQUFJLEVBQUUsT0FBTztJQUNiLFNBQVMsRUFBRSxDQUFDO0lBQ1osVUFBVSxFQUFFLEVBQUU7SUFDZCxZQUFZLEVBQUUsQ0FBQztJQUNmLFNBQVMsRUFBRSxDQUFDO0lBQ1osWUFBWSxFQUFFLEVBQUU7SUFDaEIsVUFBVSxFQUFFLENBQUM7SUFDYixVQUFVLEVBQUUsQ0FBQztJQUNiLFVBQVUsRUFBRSxFQUFFO0lBQ2QsU0FBUyxFQUFFLElBQUk7SUFDZixrQkFBa0IsRUFBRSxDQUFDO0NBQ3RCLENBQUM7QUFFRixNQUFhLGdCQUFpQixTQUFRLHNCQUFTO0lBSzdDLFlBQVksS0FBZ0IsRUFBRSxFQUFVLEVBQUUsS0FBNEI7UUFDcEUsS0FBSyxDQUFDLEtBQUssRUFBRSxFQUFFLENBQUMsQ0FBQztRQUVqQixNQUFNLE9BQU8sR0FBRyxHQUFHLENBQUMsS0FBSyxDQUFDLEVBQUUsQ0FBQyxJQUFJLENBQUMsQ0FBQyxPQUFPLENBQUM7UUFDM0MsTUFBTSxNQUFNLEdBQUcsR0FBRyxDQUFDLEtBQUssQ0FBQyxFQUFFLENBQUMsSUFBSSxDQUFDLENBQUMsTUFBTSxDQUFDO1FBRXpDLEtBQUssR0FBRyxFQUFFLEdBQUcsZ0NBQXdCLEVBQUUsR0FBRyxLQUFLLEVBQUUsQ0FBQztRQUVsRCxNQUFNLFNBQVMsR0FBRyxJQUFJLENBQUMsR0FBRyxDQUN4QixJQUFJLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsS0FBSyxDQUFDLFNBQVMsSUFBSSxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsRUFDN0MsQ0FBQyxDQUNGLENBQUM7UUFDRixNQUFNLFlBQVksR0FBRyxJQUFJLENBQUMsR0FBRyxDQUMzQixJQUFJLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsS0FBSyxDQUFDLFlBQVksSUFBSSxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsRUFDaEQsRUFBRSxDQUNILENBQUM7UUFDRixNQUFNLFVBQVUsR0FBRyxJQUFJLENBQUMsR0FBRyxDQUN6QixJQUFJLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsS0FBSyxDQUFDLFVBQVUsSUFBSSxFQUFFLENBQUMsRUFBRSxFQUFFLENBQUMsRUFDaEQsR0FBRyxDQUNKLENBQUM7UUFDRixNQUFNLFNBQVMsR0FBRyxJQUFJLENBQUMsR0FBRyxDQUN4QixJQUFJLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsS0FBSyxDQUFDLFNBQVMsSUFBSSxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsRUFDN0MsQ0FBQyxDQUNGLENBQUM7UUFDRixNQUFNLFlBQVksR0FBRyxJQUFJLENBQUMsR0FBRyxDQUMzQixJQUFJLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsS0FBSyxDQUFDLFlBQVksSUFBSSxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUMsRUFDakQsRUFBRSxDQUNILENBQUM7UUFDRixNQUFNLFVBQVUsR0FBRyxJQUFJLENBQUMsR0FBRyxDQUN6QixJQUFJLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsS0FBSyxDQUFDLFVBQVUsSUFBSSxFQUFFLENBQUMsRUFBRSxFQUFFLENBQUMsRUFDaEQsR0FBRyxDQUNKLENBQUM7UUFDRixNQUFNLFVBQVUsR0FBRyxJQUFJLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsS0FBSyxDQUFDLFVBQVUsSUFBSSxDQUFD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QTZJQyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCAqIGFzIGNkayBmcm9tIFwiYXdzLWNkay1saWJcIjtcbmltcG9ydCB7IENvbnN0cnVjdCB9IGZyb20gXCJjb25zdHJ1Y3RzXCI7XG5cbmltcG9ydCAqIGFzIGVtciBmcm9tIFwiYXdzLWNkay1saWIvYXdzLWVtcnNlcnZlcmxlc3NcIjtcbmltcG9ydCAqIGFzIGlhbSBmcm9tIFwiYXdzLWNkay1saWIvYXdzLWlhbVwiO1xuXG5leHBvcnQgaW50ZXJmYWNlIEVtclNlcnZlcmxlc3NBcHBQcm9wcyB7XG4gIHJlYWRvbmx5IHRlYW1OYW1lPzogc3RyaW5nO1xuICByZWFkb25seSBhcHBsaWNhdGlvbk5hbWU6IHN0cmluZztcbiAgcmVhZG9ubHkgZW52aXJvbm1lbnQ/OiBcImRldlwiIHwgXCJ0c3RcIiB8IFwiYWNjXCIgfCBcInByZFwiO1xuICByZWFkb25seSByZWxlYXNlTGFiZWw/OiBcImVtci02LjguMFwiIHwgXCJlbXItNi45LjBcIjtcbiAgcmVhZG9ubHkgdHlwZT86IFwiU3BhcmtcIiB8IFwiSGl2ZVwiO1xuICByZWFkb25seSBkcml2ZXJDcHU/OiAxIHwgMiB8IDQ7XG4gIHJlYWRvbmx5IGRyaXZlckRpc2s/OiBudW1iZXI7IC8vIDIwIDw9IGRpc2sgPD0gMjAwXG4gIHJlYWRvbmx5IGRyaXZlck1lbW9yeT86XG4gICAgfCA4XG4gICAgfCAxMFxuICAgIHwgMTJcbiAgICB8IDE0XG4gICAgfCAxNlxuICAgIHwgMThcbiAgICB8IDIwXG4gICAgfCAyMlxuICAgIHwgMjRcbiAgICB8IDI2XG4gICAgfCAyOFxuICAgIHwgMzA7XG4gIHJlYWRvbmx5IHdvcmtlckNwdT86IDEgfCAyIHwgNDtcbiAgcmVhZG9ubHkgd29ya2VyRGlzaz86IG51bWJlcjsgLy8gMjAgPD0gZGlzayA8PSAyMDBcbiAgcmVhZG9ubHkgd29ya2VyTWVtb3J5PzpcbiAgICB8IDhcbiAgICB8IDEwXG4gICAgfCAxMlxuICAgIHwgMTRcbiAgICB8IDE2XG4gICAgfCAxOFxuICAgIHwgMjBcbiAgICB8IDIyXG4gICAgfCAyNFxuICAgIHwgMjZcbiAgICB8IDI4XG4gICAgfCAzMDtcbiAgcmVhZG9ubHkgbWluRHJpdmVycz86IG51bWJlcjsgLy8gPj0gMFxuICByZWFkb25seSBtaW5Xb3JrZXJzPzogbnVtYmVyOyAvLyA+PSAwXG4gIHJlYWRvbmx5IG1heFdvcmtlcnM6IG51bWJlcjsgLy8gPj0gMFxuICByZWFkb25seSBhdXRvU3RhcnQ/OiBib29sZWFuO1xuICByZWFkb25seSBpZGxlVGltZW91dE1pbnV0ZXM/OiBudW1iZXI7IC8vID49IDBcbn1cblxuZXhwb3J0IGNvbnN0IEVtclNlcnZlcmxlc3NBcHBEZWZhdWx0czogRW1yU2VydmVybGVzc0FwcFByb3BzID0ge1xuICB0ZWFtTmFtZTogXCJkZWZhdWx0XCIsXG4gIGFwcGxpY2F0aW9uTmFtZTogXCJkZWZhdWx0XCIsXG4gIGVudmlyb25tZW50OiBcImRldlwiLFxuICByZWxlYXNlTGFiZWw6IFwiZW1yLTYuOS4wXCIsXG4gIHR5cGU6IFwiU3BhcmtcIixcbiAgZHJpdmVyQ3B1OiAyLFxuICBkcml2ZXJEaXNrOiAyMCxcbiAgZHJpdmVyTWVtb3J5OiA4LFxuICB3b3JrZXJDcHU6IDQsXG4gIHdvcmtlck1lbW9yeTogMTYsXG4gIG1pbkRyaXZlcnM6IDAsXG4gIG1pbldvcmtlcnM6IDAsXG4gIG1heFdvcmtlcnM6IDEwLFxuICBhdXRvU3RhcnQ6IHRydWUsXG4gIGlkbGVUaW1lb3V0TWludXRlczogNSxcbn07XG5cbmV4cG9ydCBjbGFzcyBFbXJTZXJ2ZXJsZXNzQXBwIGV4dGVuZHMgQ29uc3RydWN0IHtcbiAgcHVibGljIHJlYWRvbmx5IG5hbWU6IHN0cmluZztcbiAgcHVibGljIHJlYWRvbmx5IGVudGl0eTogZW1yLkNmbkFwcGxpY2F0aW9uO1xuICBwdWJsaWMgcmVhZG9ubHkgYXBwbGljYXRpb25JZDogc3RyaW5nO1xuXG4gIGNvbnN0cnVjdG9yKHNjb3BlOiBDb25zdHJ1Y3QsIGlkOiBzdHJpbmcsIHByb3BzOiBFbXJTZXJ2ZXJsZXNzQXBwUHJvcHMpIHtcbiAgICBzdXBlcihzY29wZSwgaWQpO1xuXG4gICAgY29uc3QgYWNjb3VudCA9IGNkay5TdGFjay5vZih0aGlzKS5hY2NvdW50O1xuICAgIGNvbnN0IHJlZ2lvbiA9IGNkay5TdGFjay5vZih0aGlzKS5yZWdpb247XG5cbiAgICBwcm9wcyA9IHsgLi4uRW1yU2VydmVybGVzc0FwcERlZmF1bHRzLCAuLi5wcm9wcyB9O1xuXG4gICAgY29uc3QgZHJpdmVyQ3B1ID0gTWF0aC5taW4oXG4gICAgICBNYXRoLm1heChNYXRoLmZsb29yKHByb3BzLmRyaXZlckNwdSA/PyAyKSwgMSksXG4gICAgICA0XG4gICAgKTtcbiAgICBjb25zdCBkcml2ZXJNZW1vcnkgPSBNYXRoLm1pbihcbiAgICAgIE1hdGgubWF4KE1hdGguZmxvb3IocHJvcHMuZHJpdmVyTWVtb3J5ID8/IDgpLCA0KSxcbiAgICAgIDE2XG4gICAgKTtcbiAgICBjb25zdCBkcml2ZXJEaXNrID0gTWF0aC5taW4oXG4gICAgICBNYXRoLm1heChNYXRoLmZsb29yKHByb3BzLmRyaXZlckRpc2sgPz8gMjApLCAyMCksXG4gICAgICAyMDBcbiAgICApO1xuICAgIGNvbnN0IHdvcmtlckNwdSA9IE1hdGgubWluKFxuICAgICAgTWF0aC5tYXgoTWF0aC5mbG9vcihwcm9wcy53b3JrZXJDcHUgPz8gNCksIDEpLFxuICAgICAgNFxuICAgICk7XG4gICAgY29uc3Qgd29ya2VyTWVtb3J5ID0gTWF0aC5taW4oXG4gICAgICBNYXRoLm1heChNYXRoLmZsb29yKHByb3BzLndvcmtlck1lbW9yeSA/PyAxNiksIDgpLFxuICAgICAgMzBcbiAgICApO1xuICAgIGNvbnN0IHdvcmtlckRpc2sgPSBNYXRoLm1pbihcbiAgICAgIE1hdGgubWF4KE1hdGguZmxvb3IocHJvcHMud29ya2VyRGlzayA/PyAyMCksIDIwKSxcbiAgICAgIDIwMFxuICAgICk7XG4gICAgY29uc3QgbWluRHJpdmVycyA9IE1hdGgubWF4KE1hdGguZmxvb3IocHJvcHMubWluRHJpdmVycyA/PyAwKSwgMCk7XG4gICAgY29uc3QgbWluRHJpdmVyczEgPSBNYXRoLm1heChtaW5Ecml2ZXJzLCAxKTtcbiAgICBjb25zdCBtaW5Xb3JrZXJzID0gTWF0aC5tYXgoTWF0aC5mbG9vcihwcm9wcy5taW5Xb3JrZXJzID8/IDApLCAwKTtcbiAgICBjb25zdCBtYXhXb3JrZXJzID0gTWF0aC5tYXgoTWF0aC5mbG9vcihwcm9wcy5tYXhXb3JrZXJzID8/IG1pbldvcmtlcnMpLCAxKTtcbiAgICBjb25zdCBtYXhDcHUgPSBtaW5Ecml2ZXJzMSAqIGRyaXZlckNwdSArIG1heFdvcmtlcnMgKiB3b3JrZXJDcHU7XG4gICAgY29uc3QgbWF4TWVtb3J5ID0gbWluRHJpdmVyczEgKiBkcml2ZXJNZW1vcnkgKyBtYXhXb3JrZXJzICogd29ya2VyTWVtb3J5O1xuICAgIGNvbnN0IG1heERpc2sgPSBtaW5Ecml2ZXJzMSAqIGRyaXZlckRpc2sgKyBtYXhXb3JrZXJzICogd29ya2VyRGlzaztcblxuICAgIGNvbnN0IGluaXRpYWxDYXBhY2l0eSA9XG4gICAgICBtaW5Ecml2ZXJzID4gMCB8fCBtaW5Xb3JrZXJzID4gMFxuICAgICAgICA/IHtcbiAgICAgICAgICAgIGluaXRpYWxDYXBhY2l0eTogW1xuICAgICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAga2V5OiBcIkRyaXZlclwiLFxuICAgICAgICAgICAgICAgIHZhbHVlOiB7XG4gICAgICAgICAgICAgICAgICB3b3JrZXJDb3VudDogTWF0aC5tYXgobWluRHJpdmVycywgMSksXG4gICAgICAgICAgICAgICAgICB3b3JrZXJDb25maWd1cmF0aW9uOiB7XG4gICAgICAgICAgICAgICAgICAgIGNwdTogYCR7ZHJpdmVyQ3B1fSB2Q1BVYCxcbiAgICAgICAgICAgICAgICAgICAgbWVtb3J5OiBgJHtkcml2ZXJNZW1vcnl9IEdCYCxcbiAgICAgICAgICAgICAgICAgICAgZGlzazogYCR7ZHJpdmVyRGlza30gR0JgLFxuICAgICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAga2V5OiBcIkV4ZWN1dG9yXCIsXG4gICAgICAgICAgICAgICAgdmFsdWU6IHtcbiAgICAgICAgICAgICAgICAgIHdvcmtlckNvdW50OiBNYXRoLm1heChtaW5Xb3JrZXJzLCAwKSxcbiAgICAgICAgICAgICAgICAgIHdvcmtlckNvbmZpZ3VyYXRpb246IHtcbiAgICAgICAgICAgICAgICAgICAgY3B1OiBgJHt3b3JrZXJDcHV9IHZDUFVgLFxuICAgICAgICAgICAgICAgICAgICBtZW1vcnk6IGAke3dvcmtlck1lbW9yeX0gR0JgLFxuICAgICAgICAgICAgICAgICAgICBkaXNrOiBgJHt3b3JrZXJEaXNrfSBHQmAsXG4gICAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICBdLFxuICAgICAgICAgIH1cbiAgICAgICAgOiB7fTtcblxuICAgIGNvbnN0IGVtcnNsUHJvcHM6IGVtci5DZm5BcHBsaWNhdGlvblByb3BzID0ge1xuICAgICAgbmFtZTogYCR7cHJvcHMudGVhbU5hbWV9LWVtci1zZXJ2ZXJsZXNzLSR7cmVnaW9ufS0ke3Byb3BzLmFwcGxpY2F0aW9uTmFtZX0tJHtwcm9wcy5lbnZpcm9ubWVudH1gLFxuICAgICAgcmVsZWFzZUxhYmVsOiBwcm9wcy5yZWxlYXNlTGFiZWwgPz8gXCJlbXItNi45LjBcIixcbiAgICAgIHR5cGU6IHByb3BzLnR5cGUgPz8gXCJTcGFya1wiLFxuICAgICAgYXV0b1N0YXJ0Q29uZmlndXJhdGlvbjogeyBlbmFibGVkOiBwcm9wcy5hdXRvU3RhcnQgPz8gdHJ1ZSB9LFxuICAgICAgYXV0b1N0b3BDb25maWd1cmF0aW9uOiB7IGVuYWJsZWQ6IHRydWUsIGlkbGVUaW1lb3V0TWludXRlczogcHJvcHMuaWRsZVRpbWVvdXRNaW51dGVzID8/IDUgfSxcbiAgICAgIG1heGltdW1DYXBhY2l0eToge1xuICAgICAgICBjcHU6IGAke21heENwdX0gdkNQVWAsXG4gICAgICAgIG1lbW9yeTogYCR7bWF4TWVtb3J5fSBHQmAsXG4gICAgICAgIGRpc2s6IGAke21heERpc2t9IEdCYCxcbiAgICAgIH0sXG4gICAgICAuLi5pbml0aWFsQ2FwYWNpdHksXG4gICAgfTtcblxuICAgIGNvbnN0IGVudGl0eSA9IG5ldyBlbXIuQ2ZuQXBwbGljYXRpb24odGhpcywgYCR7aWR9RW1yU2xBcHBgLCBlbXJzbFByb3BzKTtcbiAgICB0aGlzLmVudGl0eSA9IGVudGl0eTtcbiAgICB0aGlzLmFwcGxpY2F0aW9uSWQgPSB0aGlzLmVudGl0eS5hdHRyQXBwbGljYXRpb25JZDtcbiAgICBjb25zdCBqb2JQb2xpY3kgPSBFbXJTZXJ2ZXJsZXNzQXBwLmNyZWF0ZUlhbVByb2ZpbGUoXG4gICAgICBzY29wZSxcbiAgICAgIGAke2lkfUVtclNsSm9iUHJvZmlsZWAsXG4gICAgICB0aGlzLmFwcGxpY2F0aW9uSWQsXG4gICAgICBgJHt0aGlzLmVudGl0eS5uYW1lfS1qb2ItcHJvZmlsZWBcbiAgICApO1xuICB9XG5cbiAgcHVibGljIHN0YXRpYyBjcmVhdGVJYW1Qcm9maWxlKFxuICAgIHNjb3BlOiBDb25zdHJ1Y3QsXG4gICAgaWQ6IHN0cmluZyxcbiAgICBlbXJBcHBBcm46IHN0cmluZyxcbiAgICBuYW1lOiBzdHJpbmdcbiAgKTogaWFtLk1hbmFnZWRQb2xpY3kge1xuICAgIHJldHVybiBuZXcgaWFtLk1hbmFnZWRQb2xpY3koc2NvcGUsIGlkICsgXCItam9iLXBvbGljeVwiLCB7XG4gICAgICBtYW5hZ2VkUG9saWN5TmFtZTogdGhpcy5uYW1lLFxuICAgICAgZG9jdW1lbnQ6IG5ldyBpYW0uUG9saWN5RG9jdW1lbnQoe1xuICAgICAgICBhc3NpZ25TaWRzOiB0cnVlLFxuICAgICAgICBzdGF0ZW1lbnRzOiBbXG4gICAgICAgICAgbmV3IGlhbS5Qb2xpY3lTdGF0ZW1lbnQoe1xuICAgICAgICAgICAgZWZmZWN0OiBpYW0uRWZmZWN0LkFMTE9XLFxuICAgICAgICAgICAgYWN0aW9uczogW1xuICAgICAgICAgICAgICBcImVtci1zZXJ2ZXJsZXNzOkdldEFwcGxpY2F0aW9uXCIsXG4gICAgICAgICAgICAgIFwiZW1yLXNlcnZlcmxlc3M6TGlzdEpvYlJ1bnNcIixcbiAgICAgICAgICAgICAgXCJlbXItc2VydmVybGVzczpUYWdSZXNvdXJjZVwiLFxuICAgICAgICAgICAgICBcImVtci1zZXJ2ZXJsZXNzOlVudGFnUmVzb3VyY2VcIixcbiAgICAgICAgICAgICAgXCJlbXItc2VydmVybGVzczpMaXN0VGFnc0ZvclJlc291cmNlXCIsXG4gICAgICAgICAgICAgIFwiZW1yLXNlcnZlcmxlc3M6U3RhcnRBcHBsaWNhdGlvblwiLFxuICAgICAgICAgICAgICBcImVtci1zZXJ2ZXJsZXNzOlN0YXJ0Sm9iUnVuXCIsXG4gICAgICAgICAgICAgIFwiZW1yLXNlcnZlcmxlc3M6U3RvcEFwcGxpY2F0aW9uXCIsXG4gICAgICAgICAgICBdLFxuICAgICAgICAgICAgcmVzb3VyY2VzOiBbZW1yQXBwQXJuXSxcbiAgICAgICAgICB9KSxcbiAgICAgICAgICBuZXcgaWFtLlBvbGljeVN0YXRlbWVudCh7XG4gICAgICAgICAgICBlZmZlY3Q6IGlhbS5FZmZlY3QuQUxMT1csXG4gICAgICAgICAgICBhY3Rpb25zOiBbXG4gICAgICAgICAgICAgIFwiZW1yLXNlcnZlcmxlc3M6Q2FuY2VsSm9iUnVuXCIsXG4gICAgICAgICAgICAgIFwiZW1yLXNlcnZlcmxlc3M6R2V0RGFzaGJvYXJkRm9ySm9iUnVuXCIsXG4gICAgICAgICAgICAgIFwiZW1yLXNlcnZlcmxlc3M6R2V0Sm9iUnVuXCIsXG4gICAgICAgICAgICAgIFwiZW1yLXNlcnZlcmxlc3M6TGlzdFRhZ3NGb3JSZXNvdXJjZVwiLFxuICAgICAgICAgICAgICBcImVtci1zZXJ2ZXJsZXNzOlRhZ1Jlc291cmNlXCIsXG4gICAgICAgICAgICAgIFwiZW1yLXNlcnZlcmxlc3M6VW50YWdSZXNvdXJjZVwiLFxuICAgICAgICAgICAgXSxcbiAgICAgICAgICAgIHJlc291cmNlczogW2Ake2VtckFwcEFybn0vam9icnVucy8qYF0sXG4gICAgICAgICAgfSksXG4gICAgICAgIF0sXG4gICAgICB9KSxcbiAgICB9KTtcbiAgfVxufVxuIl19