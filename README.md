# CNC Server

CNC Server acts as an intermediary inside a cluster to create and deploy containers and facilitate communication between the user and the container through web sockets.

## Key Components

### Container Manager Class

The `ContainerManager` class is a singleton that enables ECS (Amazon Elastic Container Service) task management. It handles the creation, deployment, and management of containers within the cluster.

### Socket Server Class

The `SocketServer` class is a singleton that acts as a mediator between the user and the deployment process. It facilitates communication between the user and the containers through web sockets, allowing for real-time interaction and data exchange.

## Key Learnings

During the development of this project, the following key learnings were gained:

1. **AWS Services**

- Utilization of Amazon Elastic File System (EFS) for persistent storage.
- Integration with Amazon Elastic Container Service (ECS) for container orchestration.

2. **Socket.IO**

- Implementation of Socket.IO for real-time, bidirectional communication between the server and clients.

3. **AWS Networking and Security**

- Configuration of security groups and networks within the AWS environment.
- Exploration of various AWS storage methods, including EFS.
