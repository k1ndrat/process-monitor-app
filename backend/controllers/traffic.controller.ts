import { type Request, type Response } from "express";
import { getTrafficData } from "../services/traffic.service.ts";

export const getTrafficController = async (req: Request, res: Response) => {
	try {
		const durationParam = req.query.duration as string | undefined;
		const duration = durationParam ? parseInt(durationParam, 10) : 15;
		const validDuration = isNaN(duration) || duration <= 0 ? 15 : duration;

		const interfaceIndexParam = req.query.interfaceIndex as string | undefined;
		const interfaceIndex = interfaceIndexParam ? parseInt(interfaceIndexParam, 10) : 5;
		const validInterfaceIndex = isNaN(interfaceIndex) || interfaceIndex <= 0 ? 5 : interfaceIndex;

		const data = await getTrafficData(validDuration, validInterfaceIndex);
		res.json(data);
	} catch (error) {
		console.error("Traffic Data Error:", error);
		res.status(500).json({ error: "Failed to fetch traffic data", details: String(error) });
	}
};
