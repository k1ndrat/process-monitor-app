import {
  ArcElement,
  Chart as ChartJS,
  Legend,
  Tooltip
} from 'chart.js';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Doughnut } from 'react-chartjs-2';
import type { TTrafficData } from '../../../../types';
import { getChartOptions } from '../../config/chartConfig';
import { API_BASE_URL, CHART_COLORS } from '../../constants';
import styles from './TrafficMonitor.module.scss';

ChartJS.register(ArcElement, Tooltip, Legend);

const TrafficMonitor = () => {
  const [trafficResponse, setTrafficResponse] = useState<TTrafficData | null>(null);
  const [duration, setDuration] = useState<number>(15);
  const [interfaceIndex, setInterfaceIndex] = useState<number>(5);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const colorMapRef = useRef<Map<string, string>>(new Map());
  const colorIndexRef = useRef(0);
  const hiddenNamesRef = useRef<Set<string>>(new Set());
  const chartRef = useRef<ChartJS<'doughnut'> | null>(null);

  const getColorForName = useCallback((processName: string) => {
    const map = colorMapRef.current;
    if (!map.has(processName)) {
      map.set(processName, CHART_COLORS[colorIndexRef.current % CHART_COLORS.length]);
      colorIndexRef.current++;
    }
    return map.get(processName)!;
  }, []);

  const fetchTrafficData = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch(`${API_BASE_URL}/api/traffic?duration=${duration}&interfaceIndex=${interfaceIndex}`);
      if (!response.ok) {
        throw new Error(`Помилка отримання даних: ${response.status} ${response.statusText}`);
      }
      const data: TTrafficData = await response.json();
      
      // Update hidden elements state just like ProcessMonitorChartJS
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

      setTrafficResponse(data);
    } catch (err: any) {
      setError(err.message || 'Не вдалося підключитися');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchTrafficData();
  }, []);

  const chartData = useMemo(() => {
    const items = trafficResponse?.data || [];
    return {
      labels: items.map((t) => t.process),
      datasets: [
        {
          label: 'Total Traffic (KB)',
          data: items.map((t) => t.total_kb),
          backgroundColor: items.map((t) => getColorForName(t.process)),
          borderColor: items.map(() => '#ffffff'),
          borderWidth: items.map(() => 1),
        },
      ],
    };
  }, [trafficResponse, getColorForName]);

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

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h2 className={styles.title}>Мережевий Трафік Процесів</h2>
        {trafficResponse && (
          <span className={styles.count}>
            Усього процесів: {trafficResponse.data.length}
          </span>
        )}
      </div>

      <div className={styles.controls}>
        <label className={styles.label}>
          Тривалість (сек):
          <input 
            type="number" 
            value={duration} 
            onChange={(e) => setDuration(Number(e.target.value))}
            min="1"
            max="120"
            className={styles.input}
          />
        </label>
        <label className={styles.label}>
          Мережа:
          <select 
            value={interfaceIndex} 
            onChange={(e) => setInterfaceIndex(Number(e.target.value))}
            className={styles.select}
          >
            <option value={5}>Ethernet (5)</option>
            <option value={6}>Wi-Fi (6)</option>
          </select>
        </label>
        <button 
          onClick={fetchTrafficData} 
          disabled={isLoading}
          className={styles.button}
        >
          {isLoading ? 'Збираємо дані...' : 'Оновити статистику'}
        </button>
      </div>

      {error && <div className={styles.error}>{error}</div>}

      {trafficResponse && !isLoading && (
        <div className={styles.metadataBox}>
          <p><strong>Початок:</strong> {new Date(trafficResponse.metadata.startTime).toLocaleString()}</p>
          <p><strong>Завершення:</strong> {new Date(trafficResponse.metadata.endTime).toLocaleString()}</p>
          <p><strong>Проміжок часу:</strong> {trafficResponse.metadata.durationSeconds} сек.</p>
        </div>
      )}

      {isLoading && (
        <div className={styles.loadingBox}>
          Очікуйте... Дані збираються за {duration} секунд.
        </div>
      )}

      {trafficResponse?.data.length === 0 && !isLoading && !error && (
        <div className={styles.alertBox}>Даних про трафік не знайдено за цей період.</div>
      )}

      <div className={styles.chartWrapper} style={{ display: trafficResponse?.data.length && !isLoading ? 'block' : 'none' }}>
        <Doughnut ref={chartRef} data={chartData} options={options} />
      </div>
      
      {trafficResponse?.data.length && !isLoading ? (
        <div className={styles.tableContainer}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Process Name</th>
                <th>PID</th>
                <th>Sent (KB)</th>
                <th>Received (KB)</th>
                <th>Total (KB)</th>
              </tr>
            </thead>
            <tbody>
              {trafficResponse.data.map((task, idx) => (
                <tr key={idx}>
                  <td>{task.process}</td>
                  <td>{task.pid || 'N/A'}</td>
                  <td>{task.sent_kb}</td>
                  <td>{task.recv_kb}</td>
                  <td>{task.total_kb}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : null}
    </div>
  );
};

export default TrafficMonitor;
