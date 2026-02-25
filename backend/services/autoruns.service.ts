import { exec } from "child_process";
import type { TAutorun } from "../../types/index.ts";
import { getIconBase64 } from "../utils/get-icon.ts";

export const getAutorunsData = (): Promise<TAutorun[]> => {
  return new Promise((resolve, reject) => {
    const cmd = `"C:\\Users\\haker\\Downloads\\Autoruns\\autorunsc64.exe" -c -h -s -m -accepteula -nobanner`;

    // Зверни увагу: додав async перед колбеком (error, stdoutBuffer)
    exec(cmd, { maxBuffer: 1024 * 1024 * 10, encoding: "buffer" }, async (error: Error | null, stdoutBuffer: Buffer) => {
      if (error) {
        console.error("Помилка виконання Autoruns:", error);
        return reject(error);
      }

      // Конвертуємо Buffer з UTF-16LE у звичайний рядок
      const stdout = stdoutBuffer.toString("utf16le");
      const lines = stdout.trim().split(/\r?\n/);

      // КРОК 1: Парсимо і відфільтровуємо сміття
      const rawAutoruns = lines
        .map((line: string) => {
          const parts = line
            .split(/,(?=(?:(?:[^"]*"){2})*[^"]*$)/)
            .map((p) => p.replace(/^"|"$/g, "").trim());

          // Повертаємо жорсткі фільтри!
          if (parts.length < 12) return null; 

          const entryName = parts[2] || "";
          const imagePath = parts[9] || "";

          // Відкидаємо шапку і порожні папки реєстру
          if (entryName === "Entry" && imagePath === "Image Path") return null;
          if (!entryName || !imagePath) return null;

          const signer = parts[7] || "";
          const isVerified = signer.toLowerCase().includes("(verified)");

          let vtDetections = null;
          let vtTotal = null;
          if (parts[12] && parts[12].includes("|")) {
            const vtParts = parts[12].split("|");
            vtDetections = parseInt(vtParts[0], 10);
            vtTotal = parseInt(vtParts[1], 10);
          }

          return {
            time: parts[0],
            location: parts[1],
            entryName: entryName,
            state: parts[3],
            category: parts[4],
            profile: parts[5] || "",
            description: parts[6] || "",
            signer: signer,
            isVerified,
            company: parts[8] || "",
            imagePath: imagePath,
            version: parts[10] || "",
            launchCommand: parts[11] || "",
            virusTotalDetections: vtDetections,
            virusTotalTotal: vtTotal,
            virusTotalLink: parts[13] || null,
          };
        })
        .filter((item: TAutorun) => item !== null);

      // ДОДАЄМО ОЧИЩЕННЯ ВІД ДУБЛІКАТІВ
      const uniqueAutoruns: TAutorun[] = [];
      const seenPaths = new Set();

      for (const item of rawAutoruns) {
        // Створюємо унікальний ключ для кожного запису (Назва + Шлях до файлу)
        const uniqueKey = `${item.entryName}-${item.imagePath}`;
        
        if (!seenPaths.has(uniqueKey)) {
          seenPaths.add(uniqueKey);
          uniqueAutoruns.push(item);
        }
      }

      // КРОК 2: Асинхронно дістаємо іконки для кожного процесу
      try {
        const enrichedAutoruns = await Promise.all(
          uniqueAutoruns.map(async (item: TAutorun) => {
            const iconBase64 = await getIconBase64(item.imagePath);
            return {
              ...item,
              iconBase64,
            };
          })
        );
        
        resolve(enrichedAutoruns);
      } catch (iconError) {
        console.error("Помилка під час отримання іконок:", iconError);
        resolve(uniqueAutoruns);
      }
    });
  });
};