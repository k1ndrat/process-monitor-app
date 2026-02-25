import { Router } from "express";
import { getWhois } from "../controllers/whois.controller.ts";

const router = Router();

router.get("/", getWhois);

export default router;