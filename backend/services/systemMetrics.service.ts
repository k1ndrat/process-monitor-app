import os from 'os';
import { type TSystemMetrics } from '../../types/index.ts';

// Допоміжна функція для отримання поточних тактів (ticks) процесора
const getCpuTicks = () => {
  const cpus = os.cpus();
  return cpus.reduce(
    (acc, cpu) => {
      acc.idle += cpu.times.idle;
      acc.total += Object.values(cpu.times).reduce((sum, time) => sum + time, 0);
      return acc;
    },
    { idle: 0, total: 0 }
  );
};

let previousTicks = getCpuTicks();

export const getSystemMetricsData = (): Promise<TSystemMetrics> => {
  return new Promise((resolve) => {
    // 1. Рахуємо завантаження CPU (порівнюємо з попереднім викликом)
    const currentTicks = getCpuTicks();
    const idleDifference = currentTicks.idle - previousTicks.idle;
    const totalDifference = currentTicks.total - previousTicks.total;
    
    // Відсоток завантаження = 100 - (відсоток простою)
    const cpuUsage = 100 - Math.floor((100 * idleDifference) / totalDifference);
    previousTicks = currentTicks; // Оновлюємо для наступного тіку

    // 2. Рахуємо пам'ять
    const totalMem = os.totalmem();
    const freeMem = os.freemem();
    const usedMem = totalMem - freeMem;
    const ramUsage = Math.floor((usedMem / totalMem) * 100);

		console.log('cpuUsage', cpuUsage);
		console.log('ramUsage', ramUsage);
		console.log('ramUsedGb', usedMem / 1024 ** 3);
		console.log('ramTotalGb', totalMem / 1024 ** 3);

    resolve({
      cpuUsage: isNaN(cpuUsage) ? 0 : cpuUsage,
      ramUsage,
      ramUsedGb: (usedMem / 1024 ** 3).toFixed(1),
      ramTotalGb: (totalMem / 1024 ** 3).toFixed(1),
    });
  });
};