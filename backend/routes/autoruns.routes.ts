import { Router } from "express";
import { getAutoruns } from "../controllers/autoruns.controller.ts";

const router = Router();

router.get("/", getAutoruns);

export default router;
