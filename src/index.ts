import express from "express";
import { createServer } from "http";
import cors from "cors";
import SocketServer from "./SocketServer";
import ContainerManager from "./ContainerManager";

const app = express();
app.use(cors());
app.use(express.json());

const httpServer = createServer(app);
const socketManager = new SocketServer(httpServer);

const port = 3002;

app.post("/deploy", async (req, res) => {
  const { id, baseImage, NFSaccesspoint } = req.body;
  if (!id || !baseImage || !NFSaccesspoint) {
    return res.status(400).json({ message: "invalid fields" });
  }

  console.log(`creating a container for ${id} with base image ${baseImage}`);

  try {
    const message = await ContainerManager.deployContainer(
      id,
      baseImage,
      NFSaccesspoint
    );
    res.json({ message });
  } catch (e) {
    console.log(e);
    return res.status(500);
  }
});

app.get("/", (req, res) => {
  res.send("CNC Server v1.2.1");
});

app.get("/health", (req, res) => {
  res.status(200).json({ message: "server is healthy." });
});

httpServer.listen(port, async () => {
  console.log("listening on port", port);
  socketManager.facilitate();
});
