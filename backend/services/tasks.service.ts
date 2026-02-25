import { exec } from "child_process";
import { type TTask } from "../../types/index.ts";
import { detectAnomaly } from "../utils/detect-anomaly.ts";

const MEMORY_THRESHOLD_KB = 100 * 1024;

export const getTasksData = (): Promise<TTask[]> => {
  return new Promise((resolve, reject) => {
    exec("tasklist /fo csv /nh", (error, stdout) => {
      if (error) return reject(error);

      const lines = stdout.trim().split(/\r?\n/);
      const tasks: TTask[] = lines
        .map((line) => {
          const parts = line.split('","').map((p) => p.replace(/"/g, ""));
          if (parts.length >= 5) {
            const name = parts[0];
            const pid = parts[1];
            const rawMem = parts[4].replace(/\D/g, "");
            const memUsage = parseInt(rawMem, 10) || 0;
            const anomalyData = detectAnomaly(pid, memUsage);

            return {
              name,
              memUsage,
              pid,
              isAnomaly: anomalyData.isAnomaly,
              mean: anomalyData.mean,
              stdDev: anomalyData.stdDev,
              usage: `${(memUsage / 1024).toFixed(3)} MB`,
            };
          }
          return null;
        })
        .filter((task): task is TTask => task !== null);

      const sortedTasks = tasks.sort((a, b) => b.memUsage - a.memUsage);

      // const top10 = sortedTasks.slice(0, 10);

      // const others = sortedTasks.slice(10);

      // if (others.length > 0) {
      //     const othersMemUsage = others.reduce((acc, curr) => acc + curr.memUsage, 0);

      //     top10.push({
      //         name: "Others",
      //         memUsage: othersMemUsage,
      //         usage: `${(othersMemUsage / 1024).toFixed(3)} MB`
      //     });
      // }

      const heavyTasks = sortedTasks.filter(
        (t) => t.memUsage >= MEMORY_THRESHOLD_KB,
      );

      const lightTasks = sortedTasks.filter(
        (t) => t.memUsage < MEMORY_THRESHOLD_KB,
      );

      if (lightTasks.length > 0) {
        const othersMemUsage = lightTasks.reduce(
          (acc, curr) => acc + curr.memUsage,
          0,
        );

        heavyTasks.push({
          name: "Others (<100MB)",
          pid: "others",
          memUsage: othersMemUsage,
          isAnomaly: false,
          mean: 0,
          stdDev: 0,
          usage: `${(othersMemUsage / 1024).toFixed(3)} MB`,
        });
      }

      resolve(heavyTasks);
    });
  });
};
