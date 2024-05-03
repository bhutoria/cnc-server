import { Server as HTTPServer } from "http";
import { Server, Socket } from "socket.io";

import ContainerManager from "./ContainerManager";

class SocketServer {
  private rooms: {
    [id: string]: {
      client?: Socket;
      deployment?: Socket;
      decoupleId?: NodeJS.Timeout;
    };
  } = {};

  private io: Server;

  constructor(server: HTTPServer) {
    // the origin can be changed to our next js server and the ecs server
    this.io = new Server(server, {
      cors: { origin: "*", methods: ["GET", "POST"] },
    });
  }

  facilitate() {
    this.io.on("connection", async (socket) => {
      console.log("received new connections:", socket.id);
      const { id: deploymentId, type } = socket.handshake.query;

      if (
        !deploymentId ||
        Array.isArray(deploymentId) ||
        !type ||
        Array.isArray(type)
      ) {
        console.log("invalid deployment id:", deploymentId);
        console.log("deployment id not found, disconnecting:", socket.id);
        return socket.disconnect();
      }

      if (!this.rooms[deploymentId]) {
        this.rooms[deploymentId] = {};
      }

      if (type === "client") {
        console.log("adding client to", deploymentId);
        this.rooms[deploymentId].client = socket;
      } else if (type === "deployment") {
        console.log("adding deployment to", deploymentId);
        this.rooms[deploymentId].deployment = socket;
      }

      if (
        this.rooms[deploymentId].client &&
        this.rooms[deploymentId].deployment
      ) {
        console.log(
          "connected with both client and deployment on",
          deploymentId
        );
        if (this.rooms[deploymentId].decoupleId) {
          clearTimeout(this.rooms[deploymentId].decoupleId);
        }
        console.log("initializing handlers");

        this.handlers(
          this.rooms[deploymentId].client!,
          this.rooms[deploymentId].deployment!,
          deploymentId
        );
      }
    });
  }

  handlers(client: Socket, deployment: Socket, deploymentId: string) {
    deployment.emit("terminalData", { data: "" });

    client.emit("ready");

    client.on("disconnect", () => {
      console.log("client disconnected: ", deploymentId);
      if (this.rooms[deploymentId].client) {
        delete this.rooms[deploymentId].client;
      }

      this.rooms[deploymentId].decoupleId = setTimeout(() => {
        deployment.disconnect();
        ContainerManager.stopContainer(deploymentId);
        delete this.rooms[deploymentId];
      }, 1000 * 300);
    });
    deployment.on("disconnect", () => {
      console.log("deployment disconnected", deploymentId);
      if (this.rooms[deploymentId].deployment) {
        delete this.rooms[deploymentId].deployment;
      }
    });

    client.onAny((e, ...args) => {
      deployment.emit(e, ...args);
    });

    deployment.onAny((e, ...args) => {
      client.emit(e, ...args);
    });
  }
}

export default SocketServer;
