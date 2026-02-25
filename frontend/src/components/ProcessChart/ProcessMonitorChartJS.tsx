import {
  ArcElement,
  Chart as ChartJS,
  Legend,
  Tooltip
} from 'chart.js';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Doughnut } from 'react-chartjs-2';
import { io } from 'socket.io-client';
import type { TTask } from '../../../../types';
import { getChartOptions } from '../../config/chartConfig';
import { API_BASE_URL, CHART_COLORS } from '../../constants';
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

  useEffect(() => {
    const socket = io(API_BASE_URL || 'http://localhost:3001');

    socket.on('connect', () => {
      setError(null);
    });

    socket.on('tasks', (data: TTask[]) => {
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
    });

    socket.on('connect_error', (err) => {
      setError('Не вдалося з\'єднатися з бекендом');
      console.error(err);
    });

    return () => {
      socket.disconnect();
    };
  }, []);

 const chartData = useMemo(() => {
    const ANOMALY_COLOR = '#FF0033'; 
    const ANOMALY_BORDER = '#FFCC00';

    return {
      labels: tasks.map((t) => t.name),
      datasets: [
        {
          label: 'Memory Usage',
          data: tasks.map((t) => t.memUsage),
          
          backgroundColor: tasks.map((t) => 
            t.isAnomaly 
              ? ANOMALY_COLOR 
              : getColorForName(t.pid) 
          ),
          
          borderColor: tasks.map(t => t.isAnomaly ? ANOMALY_BORDER : '#ffffff'),
          
          borderWidth: tasks.map(t => t.isAnomaly ? 3 : 1),
        },
      ],
    };
  }, [tasks, getColorForName]);

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
      <div className={styles.header}>
        <h2 className={styles.title}>Моніторинг системних процесів</h2>
        <span className={styles.count}>Всього: {tasks.length}</span>
      </div>

      {tasks.some(t => t.isAnomaly) && (
        <div className={styles.alertBox}>
          ⚠️ Увага: Виявлено витік пам'яті у: {tasks.filter(t => t.isAnomaly).map(t => t.name).join(', ')}
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
