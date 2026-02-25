import { exec } from "child_process";
import { type TWhoisData } from "../../types/index.ts"; // Твій шлях до типів

// Валідація домену (дозволяємо тільки літери, цифри, дефіси та крапки)
const isValidDomain = (domain: string) => /^[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(domain);

export const getWhoisData = (domain: string): Promise<TWhoisData> => {
  return new Promise((resolve, reject) => {
    if (!isValidDomain(domain)) {
      return reject("Некоректний формат домену");
    }

    // Шлях до твоєї утиліти. Можливо доведеться вказати повний шлях, 
    // наприклад 'C:\\Users\\haker\\Downloads\\WhoIs\\whois64.exe'
		const whoisPath = '"C:\\Users\\haker\\Downloads\\WhoIs\\whois64.exe"';
    const command = `${whoisPath} ${domain} -nobanner`;

    exec(command, { maxBuffer: 1024 * 1024 * 5 }, (error, stdout, stderr) => {
      if (error) {
        return reject(`Помилка виконання WHOIS: ${error.message}`);
      }

      const rawText = stdout.trim();
      if (!rawText) return reject("Порожня відповідь від WHOIS");

      // Функція-хелпер для витягування даних регуляркою
      const extract = (regex: RegExp): string | null => {
        const match = rawText.match(regex);
        return match ? match[1].trim() : null;
      };

      // Парсимо дані
      const parsedData: TWhoisData = {
        domainName: domain,
        registrar: extract(/Registrar:\s*(.+)/i),
        creationDate: extract(/Creation Date:\s*(.+)/i),
        expirationDate: extract(/Registry Expiry Date:\s*(.+)|Registrar Registration Expiration Date:\s*(.+)/i),
        updatedDate: extract(/Updated Date:\s*(.+)/i),
        organization: extract(/Registrant Organization:\s*(.+)/i),
        abuseEmail: extract(/Registrar Abuse Contact Email:\s*(.+)/i),
        
        // Збираємо всі Name Servers, переводимо в нижній регістр і прибираємо дублікати
        nameServers: [...new Set(
          [...rawText.matchAll(/Name Server:\s*(.+)/gi)].map(m => m[1].trim().toLowerCase())
        )],
        
        // Збираємо статуси (відкидаємо URL, що йде після пробілу)
        statuses: [...new Set(
          [...rawText.matchAll(/Domain Status:\s*([^\s]+)/gi)].map(m => m[1].trim())
        )],
      };

      resolve(parsedData);
    });
  });
};