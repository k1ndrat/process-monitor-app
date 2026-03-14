import { exec } from "child_process";
import path from "path";

const SCRIPT_PATH = path.resolve(
  process.cwd(),
  "scripts",
  "monitor_traffic.ps1",
);

export const getTrafficData = (duration: number = 15, interfaceIndex: number = 5): Promise<any> => {
  return new Promise((resolve, reject) => {
    const startTime = new Date().toISOString();
    
    exec(
      `powershell.exe -ExecutionPolicy Bypass -File "${SCRIPT_PATH}" -duration ${duration} -interfaceIndex ${interfaceIndex}`,
      { maxBuffer: 1024 * 1024 * 50 },
      async (error, stdout) => {
        if (error) {
          return reject(`Помилка виконання скрипта: ${error.message}`);
        }

        try {
          const endTime = new Date().toISOString();
          const trafficData = JSON.parse(stdout.trim());
          
          resolve({
            metadata: {
              startTime,
              endTime,
              durationSeconds: duration,
            },
            data: trafficData,
          });
        } catch (err: any) {
          reject(`Помилка парсингу: ${err.message}. Отримано: ${stdout}`);
        }
      },
    );
  });
};
