import { Socket } from "socket.io";
import { getSystemMetricsData } from "../services/systemMetrics.service.ts";

export const handleSystemMetricsSocket = (socket: Socket) => {
  const interval = setInterval(async () => {
    try {
      const data = await getSystemMetricsData();
      socket.emit("system_metrics", data);
    } catch (error) {
      console.error("Помилка збору системних метрик:", error);
    }
  }, 1000);

  socket.on("disconnect", () => {
    clearInterval(interval);
    console.log("Клієнт відключився від моніторингу метрик");
  });
};
