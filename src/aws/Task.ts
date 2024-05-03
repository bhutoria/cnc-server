import { RunTaskCommand, StopTaskCommand } from "@aws-sdk/client-ecs";

export const generateRunTask = (id: string) =>
  new RunTaskCommand({
    cluster: "playgrounds-dev",
    taskDefinition: id,
    launchType: "FARGATE",
    overrides: {
      containerOverrides: [
        {
          name: "test-dev",
          environment: [
            {
              name: "DEPLOYMENT_ID",
              value: id,
            },
          ],
        },
      ],
    },
    count: 1,
    networkConfiguration: {
      awsvpcConfiguration: {
        securityGroups: ["sg-0c5c46e09c1abc68a"],
        subnets: [
          "subnet-059254fdeb93906d7",
          "subnet-0b0eeb1e14477e523",
          "subnet-034cb9372a71fb8f2",
          "subnet-0be10691d04598f5a",
          "subnet-0b41088202d6bfe77",
          "subnet-0dc5e3e71f5847f22",
        ],
        assignPublicIp: "ENABLED",
      },
    },
  });

export const generateStopTask = (taskId: string) =>
  new StopTaskCommand({ cluster: "playgrounds-dev", task: taskId });
