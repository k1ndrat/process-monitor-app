import cors from "cors";
import express from "express";
import { createServer } from "http";
import { Server } from "socket.io";
import autorunsRoutes from "./routes/autoruns.routes.ts";
import networkConnectionsRoutes from "./routes/net-tcp-connection.routes.ts";
import whoisRoutes from "./routes/whois.routes.ts";
import { setupSockets } from "./sockets/index.ts";

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});

app.use(cors());

app.use("/api/autoruns", autorunsRoutes);
app.use("/api/network-connections", networkConnectionsRoutes);
app.use("/api/whois", whoisRoutes);

setupSockets(io);

httpServer.listen(3001, () => console.log("Server runs on http://localhost:3001"));
