import { type Request, type Response } from "express";
import NodeCache from "node-cache";
import { getAutorunsData } from "../services/autoruns.service.ts";

const autorunsCache = new NodeCache({ stdTTL: 300 });

export const getAutoruns = async (req: Request, res: Response) => {
  try {
    const cacheKey = "autoruns_data";
    
    const cachedData = autorunsCache.get(cacheKey);
    if (cachedData) {
      console.log("Serving autoruns from cache 🚀");
      res.status(200).json(cachedData);
      return;
    }

    console.log("Fetching new autoruns data ⏳...");
    const data = await getAutorunsData();
    
    autorunsCache.set(cacheKey, data);
    
    res.status(200).json(data);
  } catch (error) {
    console.error("Failed to fetch autoruns data:", error);
    res.status(500).json({ error: "Failed to fetch autoruns data" });
  }
};
