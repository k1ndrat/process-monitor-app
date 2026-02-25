import { useEffect, useState } from 'react';
import { io } from 'socket.io-client';
import type { TSystemMetrics } from '../../../../types';
import { API_BASE_URL } from '../../constants';
import styles from './SystemMetrics.module.scss';

const SystemMetrics = () => {
  const [metrics, setMetrics] = useState<TSystemMetrics | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const socket = io(API_BASE_URL);

    socket.on('connect', () => setError(null));

    socket.on('system_metrics', (data: TSystemMetrics) => {
      setMetrics(data);
    });

    socket.on('connect_error', () => {
      setError('Зв\'язок із сервером втрачено');
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  if (error) return <div className={styles.error}>{error}</div>;
  if (!metrics) return <div className={styles.loading}>Збір системних метрик...</div>;

  const getFillColor = (usage: number) => {
    if (usage > 85) return '#FF4444'; // Небезпечно
    if (usage > 60) return '#FFC107'; // Увага
    return '#4CAF50'; // Норма
  };

  return (
    <div className={styles.container}>
      <h2 className={styles.title}>Системні ресурси</h2>
      
      <div className={styles.chartsGrid}>
        {/* CPU Chart */}
        <div className={styles.chartCard}>
          <div className={styles.chartHeader}>
            <h3>Процесор (CPU)</h3>
            <span className={styles.percentage}>{metrics.cpuUsage}%</span>
          </div>
          
          <div className={styles.barContainer}>
            <div 
              className={styles.barFill} 
              style={{ 
                height: `${metrics.cpuUsage}%`, 
                backgroundColor: getFillColor(metrics.cpuUsage) 
              }} 
            />
          </div>
        </div>

        {/* RAM Chart */}
        <div className={styles.chartCard}>
          <div className={styles.chartHeader}>
            <h3>Оперативна пам'ять (RAM)</h3>
            <span className={styles.percentage}>{metrics.ramUsage}%</span>
          </div>
          <div className={styles.subtext}>
            {metrics.ramUsedGb} ГБ / {metrics.ramTotalGb} ГБ
          </div>
          
          <div className={styles.barContainer}>
            <div 
              className={styles.barFill} 
              style={{ 
                height: `${metrics.ramUsage}%`, 
                backgroundColor: getFillColor(metrics.ramUsage) 
              }} 
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default SystemMetrics;