import React from 'react';
import type { TTask } from '../../../../types';
import styles from './ProcessCard.module.scss';

interface ProcessCardProps {
  task: TTask;
  color: string;
}

const formatProcessMemory = (kb: number): string => {
  if (!kb || kb === 0) return '0 KB';
  
  const k = 1024;
  const sizes = ['KB', 'MB', 'GB', 'TB'];
  
  const i = Math.floor(Math.log(kb) / Math.log(k));

  const index = i < 0 ? 0 : i;

  return parseFloat((kb / Math.pow(k, index)).toFixed(1)) + ' ' + sizes[index];
};

const ProcessCard: React.FC<ProcessCardProps> = ({ task, color }) => {
  const isAnomaly = task.isAnomaly;

  return (
    <div 
      className={`${styles.card} ${isAnomaly ? styles.anomaly : ''}`}
      style={{ borderTopColor: isAnomaly ? '#FF0033' : color }}
    >
      <div className={styles.header}>
        <h3 className={styles.name} title={task.name}>{task.name}</h3>
        <span className={styles.pid}>PID: {task.pid}</span>
      </div>
      
      <div className={styles.body}>
        <div className={styles.metric}>
          <span className={styles.label}>Пам'ять:</span>
          <span className={styles.value}>{task.usage}</span>
        </div>
        
				<div className={styles.statsGrid}>
          <div className={styles.statItem}>
            <span className={styles.statLabel}>Середнє:</span>
            <span className={styles.statValue}>{formatProcessMemory(task.mean)}</span>
          </div>
          <div className={styles.statItem}>
            <span className={styles.statLabel}>Відхилення:</span>
            <span className={styles.statValue}>±{formatProcessMemory(task.stdDev)}</span>
          </div>
        </div>

      </div>
    </div>
  );
};

export default ProcessCard;
