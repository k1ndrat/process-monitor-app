import { Socket } from "socket.io";
import { getTasksData } from "../services/tasks.service.ts";

export const handleTasksSocket = (socket: Socket) => {
  const interval = setInterval(async () => {
    try {
      const data = await getTasksData();
      socket.emit("tasks", data);
    } catch (error) {
      console.error("Error fetching tasks:", error);
    }
  }, 1000);

  socket.on("disconnect", () => {
    clearInterval(interval);
    console.log("Client disconnected");
  });
};