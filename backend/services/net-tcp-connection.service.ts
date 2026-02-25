import { exec } from "child_process";
import { type TNetworkConnection } from "../../types/index.ts";

export const getNetworkData = (): Promise<TNetworkConnection[]> => {
  return new Promise((resolve, reject) => {
    // Однорядковий PowerShell скрипт, який збирає дані і відразу віддає JSON
    const psCommand = `Get-NetTCPConnection -ErrorAction SilentlyContinue | ForEach-Object { $p = Get-Process -Id $_.OwningProcess -ErrorAction SilentlyContinue; [PSCustomObject]@{ ProcessName = if ($p) { $p.Name } else { 'Unknown' }; PID = $_.OwningProcess; State = $_.State.ToString(); LocalAddress = $_.LocalAddress; LocalPort = $_.LocalPort; RemoteAddress = $_.RemoteAddress; RemotePort = $_.RemotePort; Path = if ($p -and $p.Path) { $p.Path } else { 'System / Access Denied' } } } | ConvertTo-Json -Compress`;

    // Запускаємо PowerShell. Додаємо maxBuffer, бо JSON може бути великим
    exec(
      `powershell.exe -NoProfile -NonInteractive -Command "${psCommand}"`,
      { maxBuffer: 1024 * 1024 * 10 }, // 10 MB буфер
      (error, stdout, stderr) => {
        if (error) {
          return reject(`Помилка виконання: ${error.message}`);
        }
        
        if (stderr) {
          console.warn(`PowerShell попередження: ${stderr}`);
        }

        try {
          const rawData = stdout.trim();
          if (!rawData) {
            return resolve([]);
          }

          // Парсимо JSON від PowerShell
          const connections: TNetworkConnection[] = JSON.parse(rawData);

          // За потреби можемо відсортувати (наприклад, ESTABLISHED зверху)
          const sortedConnections = connections.sort((a, b) => {
            if (a.State === "Established" && b.State !== "Established") return -1;
            if (a.State !== "Established" && b.State === "Established") return 1;
            return 0;
          });

          resolve(sortedConnections);
        } catch (parseError) {
          reject(`Помилка парсингу JSON: ${parseError}`);
        }
      }
    );
  });
};