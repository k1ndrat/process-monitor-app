// anomalyDetection.ts (Новий файл або модуль)

// Зберігаємо історію: Key = Process Name, Value = Array of memory usage numbers
const processHistory: Record<string, number[]> = {};
const WINDOW_SIZE = 300; // 5 хвилин * 60 секунд (якщо опитування щосекунди)

export function detectAnomaly(processPid: string, currentUsage: number): {isAnomaly: boolean, mean: number, stdDev: number} {
  // 1. Ініціалізація історії для нового процесу
  if (!processHistory[processPid]) {
    processHistory[processPid] = [];
  }

  const history = processHistory[processPid];

  // 2. Додаємо нове значення і обрізаємо старі (Sliding Window)
  history.push(currentUsage);
  if (history.length > WINDOW_SIZE) {
    history.shift(); 
  }

  // Для коректного розрахунку потрібно хоча б 10-20 замірів
  if (history.length < 50) return {isAnomaly: false, mean: 0, stdDev: 0};
  console.log('history.length', history.length);

  // 3. Математика: Середнє (Mean)
  const mean = history.reduce((sum, val) => sum + val, 0) / history.length;

  // 4. Математика: Стандартне відхилення (Sigma)
  const variance = history.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / history.length;
  const stdDev = Math.sqrt(variance);

  // 5. Перевірка на аномалію (3-sigma rule)
  // Додаткова перевірка (stdDev > 1), щоб не реагувати на мізерні коливання стабільних процесів
  const isAnomaly = stdDev > 5 && currentUsage > (mean + 3 * stdDev);

  return {isAnomaly, mean, stdDev};
}