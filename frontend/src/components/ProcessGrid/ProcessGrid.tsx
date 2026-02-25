import { useEffect, useRef, useState } from 'react';
import { io } from 'socket.io-client';
import type { TTask } from '../../../../types';
import { API_BASE_URL, CHART_COLORS } from '../../constants';
import ProcessCard from './ProcessCard';
import styles from './ProcessGrid.module.scss';

const ProcessGrid = () => {
  const [tasks, setTasks] = useState<TTask[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true); 

  const colorMapRef = useRef<Map<string, string>>(new Map());
  const colorIndexRef = useRef(0);

  const getColorForName = (pid: string) => {
    const map = colorMapRef.current;
    if (!map.has(pid)) {
      map.set(pid, CHART_COLORS[colorIndexRef.current % CHART_COLORS.length]);
      colorIndexRef.current++;
    }
    return map.get(pid)!;
  };

  useEffect(() => {
    const socket = io(API_BASE_URL);

    socket.on('connect', () => {
      setError(null);
    });

    socket.on('tasks', (data: TTask[]) => {
      setTasks(data);
      setIsLoading(false); 
      setError(null);
    });

    socket.on('connect_error', (err) => {
      setError('Не вдалося завантажити процеси');
      setIsLoading(false);
      console.error(err);
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  if (error) return <div className={styles.error}>{error}</div>;

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h2 className={styles.title}>Моніторинг процесів</h2>
        <span className={styles.count}>Всього: {tasks.length}</span>
      </div>

      {isLoading ? (
        <div className={styles.loading}>Завантаження процесів...</div>
      ) : (
      <div className={styles.grid}>
        {tasks.map((task) => (
          <ProcessCard 
            key={task.pid} 
            task={task} 
            color={getColorForName(task.pid)} 
          />
        ))}
      </div>
      )}
    </div>
  );
};

export default ProcessGrid;
