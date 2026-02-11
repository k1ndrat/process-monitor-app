import { exec } from "child_process";
import type { TTask } from "../types/index.ts";

function getTaskList() {
  exec("tasklist /fo csv /nh", (error, stdout) => {
    if (error) {
      console.error(`Error: ${error}`);
      return;
    }

    const lines = stdout.trim().split(/\r?\n/);

    const tasks: TTask[] = lines
      .map((line) => {
        const parts = line.split('","').map((p) => p.replace(/"/g, ""));

        if (parts.length >= 5) {
          const name = parts[0];
          const pid = parts[1];
          const rawMem = parts[4].replace(/\D/g, "");
          const memUsage = parseInt(rawMem, 10) || 0;

          return {
            name: name,
            pid: pid,
            memUsage: memUsage,
            usage: `${(memUsage / 1024).toFixed(3)} MB`,
          };
        }
        return null;
      })
      .filter((t): t is TTask => t !== null);

    console.clear();
    console.table(tasks.sort((a, b) => b.memUsage - a.memUsage).slice(0, 5));
  });
}

setInterval(getTaskList, 1000);
getTaskList();
