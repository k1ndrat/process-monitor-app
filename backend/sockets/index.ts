import { Server, Socket } from "socket.io";
import { handleSystemMetricsSocket } from "./metrics.socket.ts";
import { handleTasksSocket } from "./tasks.socket.ts";

export const setupSockets = (io: Server) => {
  io.on("connection", (socket: Socket) => {
    console.log(`Client connected to Socket.IO: ${socket.id}`);
    
    handleTasksSocket(socket);
    handleSystemMetricsSocket(socket);

    socket.on("disconnect", () => {
      console.log(`Client disconnected from Socket.IO: ${socket.id}`);
    });
  });
};