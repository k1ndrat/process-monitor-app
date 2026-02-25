import { type Request, type Response } from "express";
import { getNetworkData } from "../services/net-tcp-connection.service.ts";

export const getNetworkConnections = async (req: Request, res: Response) => {
	try {
		const data = await getNetworkData();
		res.json(data);
	} catch (error) {
		res.status(500).json({ error: "Failed to fetch network data" });
	}
};
