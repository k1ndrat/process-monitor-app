import { Router } from "express";
import { getNetworkConnections } from "../controllers/net-tcp-connection.controller.ts";

const router = Router();

router.get("/", getNetworkConnections);

export default router;
