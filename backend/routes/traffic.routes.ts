import { Router } from "express";
import { getTrafficController } from "../controllers/traffic.controller.ts";

const router = Router();

router.get("/", getTrafficController);

export default router;
