import { RegisterTaskDefinitionCommand } from "@aws-sdk/client-ecs";
import { publicIpv4 } from "public-ip";
import dotenv from "dotenv";

dotenv.config();

export const generateTaskDefinition = async (
  accessPoint: string,
  image: string,
  id: string
) => {
  const url = await publicIpv4();

  return new RegisterTaskDefinitionCommand({
    family: id,
    containerDefinitions: [
      {
        name: "test-dev",
        image: image,
        portMappings: [
          {
            name: "vite-5173",
            containerPort: 5173,
            hostPort: 5173,
            protocol: "tcp",
            appProtocol: "http",
          },
        ],
        essential: true,
        environment: [{ name: "CNC_SERVER", value: `http://${url}:3002` }],
        environmentFiles: [],
        mountPoints: [
          {
            sourceVolume: "react-pg",
            containerPath: "/home/player/code",
            readOnly: false,
          },
        ],
        volumesFrom: [],
        logConfiguration: {
          logDriver: "awslogs",
          options: {
            "awslogs-create-group": "true",
            "awslogs-group": "/ecs/playgrounds-test",
            "awslogs-region": process.env.AWS_REGION!,
            "awslogs-stream-prefix": "ecs",
          },
          secretOptions: [],
        },
        systemControls: [],
      },
    ],
    taskRoleArn: process.env.AWS_TASK_ROLE,
    executionRoleArn: process.env.AWS_TASK_ROLE,
    networkMode: "awsvpc",
    volumes: [
      {
        name: "react-pg",
        efsVolumeConfiguration: {
          fileSystemId: process.env.EFS_ID,
          rootDirectory: "/",
          transitEncryption: "ENABLED",
          transitEncryptionPort: 2049,
          authorizationConfig: {
            accessPointId: accessPoint,
            iam: "DISABLED",
          },
        },
      },
    ],
    requiresCompatibilities: ["FARGATE"],
    cpu: "1024",
    memory: "3072",
    runtimePlatform: {
      cpuArchitecture: "ARM64",
      operatingSystemFamily: "LINUX",
    },
  });
};
