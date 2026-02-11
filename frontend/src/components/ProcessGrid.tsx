import { useEffect, useRef, useState } from 'react';
import type { TTask } from '../../../types';
import { CHART_COLORS, POLLING_INTERVAL } from '../constants';
import { fetchTasks } from '../services/api';
import ProcessCard from './ProcessCard';
import styles from './ProcessGrid.module.scss';

const ProcessGrid = () => {
  const [tasks, setTasks] = useState<TTask[]>([]);
  const [error, setError] = useState<string | null>(null);
  
  // Keep consistent colors for processes
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

  const loadTasks = async () => {
    try {
      const data = await fetchTasks();
      setTasks(data);
      setError(null);
    } catch (err) {
      setError('Не вдалося завантажити процеси');
    }
  };

  useEffect(() => {
    loadTasks();
    const interval = setInterval(loadTasks, POLLING_INTERVAL);
    return () => clearInterval(interval);
  }, []);

  if (error) return <div className={styles.error}>{error}</div>;

  return (
    <div className={styles.container}>
      <h2 className={styles.title}>Process Monitor Grid</h2>
      <div className={styles.grid}>
        {tasks.map((task) => (
          <ProcessCard 
            key={task.pid} 
            task={task} 
            color={getColorForName(task.pid)} 
          />
        ))}
      </div>
    </div>
  );
};

export default ProcessGrid;
