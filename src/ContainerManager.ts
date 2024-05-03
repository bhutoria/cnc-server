import { ECSClient, ListTaskDefinitionsCommand } from "@aws-sdk/client-ecs";
import { generateTaskDefinition } from "./aws/TaskDefinition";
import { generateRunTask, generateStopTask } from "./aws/Task";
import dotenv from "dotenv";

dotenv.config();

class ContainerManager {
  private static instance: ContainerManager;
  private containerMap: Map<string, string> = new Map();

  private client = new ECSClient({
    region: "us-east-1",
    credentials: {
      accessKeyId: process.env.AWS_ACCESS!,
      secretAccessKey: process.env.AWS_SECRET!,
    },
  });

  static getInstance() {
    if (!ContainerManager.instance) {
      ContainerManager.instance = new ContainerManager();
    }
    return ContainerManager.instance;
  }

  deployContainer = (id: string, baseImage: string, accessPoint: string) => {
    return new Promise<string>(async (res, rej) => {
      if (baseImage === "React") {
        const imageURI =
          "096246688499.dkr.ecr.us-east-1.amazonaws.com/react-pg";

        if (this.containerMap.has(id)) {
          return res(
            `container already exists for ${id} with id:${this.containerMap.get(
              id
            )}`
          );
        }

        console.log("checking if task definition already exists");

        let output;
        try {
          const command = new ListTaskDefinitionsCommand({ familyPrefix: id });
          output = await this.client.send(command);
        } catch (e) {
          console.log(e);
          return rej("unable to check if task definition exists");
        }

        if (
          output?.taskDefinitionArns &&
          output.taskDefinitionArns.length < 1
        ) {
          console.log("creating task definition");

          console.log("access point:", accessPoint);

          try {
            const taskDefinition = await generateTaskDefinition(
              accessPoint,
              imageURI,
              id
            );
            await this.client.send(taskDefinition);
          } catch (e) {
            console.log(e);
            return rej("unable to create task definition");
          }
        } else if (output?.taskDefinitionArns) {
          console.log("using existing task definition");
        } else {
          return rej("unable to verify task definition existence");
        }

        console.log("launching container");

        try {
          const output = await this.client.send(generateRunTask(id));
          if (output.tasks && output.tasks[0].taskArn) {
            const task = output.tasks[0].taskArn.split("/").pop();
            this.containerMap.set(id, task!);
            console.log("deployment successful, container id:", task);
          } else {
            throw Error("cant get task id");
          }
        } catch (e) {
          console.log(e);
          return rej("unable to launch container");
        }

        return res("container launched...");
      }
    });
  };

  stopContainer = async (id: string) => {
    const taskId = this.containerMap.get(id);
    if (!taskId) return;
    console.log("stopping container with id", taskId);

    try {
      const data = await this.client.send(generateStopTask(taskId));
      if (data) {
        this.containerMap.delete(id);
      }
    } catch (e) {
      console.log(e);
    }
  };
}

const instance = ContainerManager.getInstance();
export default instance;
