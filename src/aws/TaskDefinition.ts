import { RegisterTaskDefinitionCommand } from "@aws-sdk/client-ecs";
import { publicIpv4 } from "public-ip";

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
            name: "test-dev-3000-tcp",
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
            "awslogs-region": "us-east-1",
            "awslogs-stream-prefix": "ecs",
          },
          secretOptions: [],
        },
        // healthCheck: {
        //   command: [
        //     "CMD-SHELL",
        //     "curl -f http://localhost:3000/health || exit 1",
        //   ],
        //   interval: 30,
        //   timeout: 5,
        //   retries: 3,
        // },
        systemControls: [],
      },
    ],
    taskRoleArn: "arn:aws:iam::096246688499:role/taskEFSWriteRole",
    executionRoleArn: "arn:aws:iam::096246688499:role/taskEFSWriteRole",
    networkMode: "awsvpc",
    volumes: [
      {
        name: "react-pg",
        efsVolumeConfiguration: {
          fileSystemId: "fs-01a88dcb7a383c904",
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
