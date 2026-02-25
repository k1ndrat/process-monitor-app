import { type Request, type Response } from "express";
import NodeCache from "node-cache";
import { getWhoisData } from "../services/whois.service.ts"; // Шлях до сервісу, який ми писали вище

// Кешуємо на 1 годину. WHOIS сервери швидко дають бан за спам запитами!
const whoisCache = new NodeCache({ stdTTL: 3600 });

export const getWhois = async (req: Request, res: Response): Promise<void> => {
  try {
    // Беремо домен з параметрів запиту: /api/whois?domain=google.com
    const domain = req.query.domain as string;

    if (!domain) {
      res.status(400).json({ error: "Домен не вказано. Використовуйте ?domain=example.com" });
      return;
    }

    const cleanDomain = domain.trim().toLowerCase();
    const cacheKey = `whois_data_${cleanDomain}`;
    
    // 1. Перевіряємо кеш
    const cachedData = whoisCache.get(cacheKey);
    if (cachedData) {
      console.log(`Serving WHOIS for ${cleanDomain} from cache 🚀`);
      res.status(200).json(cachedData);
      return;
    }

    // 2. Якщо в кеші нема, робимо запит
    console.log(`Fetching new WHOIS data for ${cleanDomain} ⏳...`);
    const data = await getWhoisData(cleanDomain);
    
    // 3. Зберігаємо в кеш
    whoisCache.set(cacheKey, data);
    
    // 4. Віддаємо на фронт
    res.status(200).json(data);
  } catch (error) {
    console.error(`Failed to fetch WHOIS data for ${req.query.domain}:`, error);
    
    // Передаємо текст помилки на фронт, якщо це наша кастомна помилка валідації/парсингу
    const errorMessage = error instanceof Error ? error.message : String(error);
    res.status(500).json({ error: errorMessage || "Не вдалося отримати дані WHOIS" });
  }
};