import {
  ArcElement,
  Chart as ChartJS,
  Legend,
  Tooltip
} from 'chart.js';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Doughnut } from 'react-chartjs-2';
import type { TTask } from '../../../types';
import { getChartOptions } from '../config/chartConfig';
import { CHART_COLORS, POLLING_INTERVAL } from '../constants';
import { fetchTasks } from '../services/api';
import styles from './ProcessMonitorChartJS.module.scss';

ChartJS.register(ArcElement, Tooltip, Legend);

const ProcessMonitor = () => {
  const [tasks, setTasks] = useState<TTask[]>([]);
  const [error, setError] = useState<string | null>(null);

  const colorMapRef = useRef<Map<string, string>>(new Map());
  const colorIndexRef = useRef(0);

  const hiddenNamesRef = useRef<Set<string>>(new Set());

  const chartRef = useRef<ChartJS<'doughnut'> | null>(null);

  const getColorForName = useCallback((pid: string) => {
    const map = colorMapRef.current;
    if (!map.has(pid)) {
      map.set(pid, CHART_COLORS[colorIndexRef.current % CHART_COLORS.length]);
      colorIndexRef.current++;
    }
    return map.get(pid)!;
  }, []);

  const loadTasks = async () => {
    try {
      const data = await fetchTasks();

      // Before updating data, snapshot hidden state from current chart
      const chart = chartRef.current;
      if (chart) {
        const labels = chart.data.labels as string[] | undefined;
        if (labels) {
          const meta = chart.getDatasetMeta(0);
          labels.forEach((label, i) => {
            const element = meta.data[i] as any;
            if (element?.hidden) {
              hiddenNamesRef.current.add(label);
            } else {
              hiddenNamesRef.current.delete(label);
            }
          });
        }
      }

      setTasks(data);
      setError(null);
    } catch (err) {
      setError('Не вдалося з\'єднатися з бекендом');
      console.error(err);
    }
  };

  useEffect(() => {
    loadTasks();
    const interval = setInterval(loadTasks, POLLING_INTERVAL);
    return () => clearInterval(interval);
  }, []);

 const chartData = useMemo(() => {
    // Колір для аномалії (неоново-червоний)
    const ANOMALY_COLOR = '#FF0033'; 
    const ANOMALY_BORDER = '#FFCC00';

    return {
      labels: tasks.map((t) => t.name),
      datasets: [
        {
          label: 'Memory Usage',
          data: tasks.map((t) => t.memUsage),
          
          // ТУТ ГОЛОВНА МАГІЯ:
          backgroundColor: tasks.map((t) => 
            t.isAnomaly 
              ? ANOMALY_COLOR // Якщо аномалія - червоний
              : getColorForName(t.pid) // Якщо норма - звичайний
          ),
          
          // Можна також підсвітити рамку
          borderColor: tasks.map(t => t.isAnomaly ? ANOMALY_BORDER : '#ffffff'),
          
          // Аномальні сектори можна зробити трохи товстішими в рамці
          borderWidth: tasks.map(t => t.isAnomaly ? 3 : 1),
        },
      ],
    };
  }, [tasks, getColorForName]);

  // After chart data updates, restore hidden state
  useEffect(() => {
    const chart = chartRef.current;
    if (!chart) return;

    const labels = chart.data.labels as string[] | undefined;
    if (!labels) return;

    const meta = chart.getDatasetMeta(0);
    labels.forEach((label, i) => {
      if (meta.data[i]) {
        (meta.data[i] as any).hidden = hiddenNamesRef.current.has(label);
      }
    });

    chart.update('none');
  }, [chartData]);

  const options = getChartOptions();

  if (error) return <div className={styles.error}>{error}</div>;

  return (
    <div className={styles.container}>
      <h2 className={styles.title}>System Process Monitor (RAM Usage)</h2>

      {tasks.some(t => t.isAnomaly) && (
        <div className={styles.alertBox}>
          ⚠️ Warning: Memory Leak detected in: {tasks.filter(t => t.isAnomaly).map(t => t.name).join(', ')}
        </div>
      )}

      <div className={styles.chartWrapper}>
        <Doughnut ref={chartRef} data={chartData} options={options} />
      </div>
      
      <div className={styles.tableContainer}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>Process Name</th>
              <th>Usage (MB)</th>
              <th>PID</th>
            </tr>
          </thead>
          <tbody>
            {tasks.map((task, idx) => (
              <tr key={idx}>
                <td>{task.name}</td>
                <td>{task.usage}</td>
                <td>{task.pid}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ProcessMonitor;
