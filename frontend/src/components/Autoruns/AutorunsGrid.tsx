import { useEffect, useState } from 'react';
import type { TAutorun } from '../../../../types'; // Переконайся, що шлях правильний
import { fetchAutoruns } from '../../services/api'; // Твоя функція для запиту на бекенд
import AutorunCard from './AutorunCard';
import styles from './AutorunsGrid.module.scss';

const AutorunsGrid = () => {
  const [autoruns, setAutoruns] = useState<TAutorun[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const loadAutoruns = async () => {
    try {
      setIsLoading(true);
      const data = await fetchAutoruns();
      setAutoruns(data);
      setError(null);
    } catch (err) {
      setError('Не вдалося завантажити дані автозавантаження');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadAutoruns();
  }, []);

  if (error) return <div className={styles.error}>{error}</div>;

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h2 className={styles.title}>Автозавантаження системи</h2>
        <span className={styles.count}>Всього: {autoruns.length}</span>
      </div>
      
      {isLoading ? (
        <div className={styles.loading}>Завантаження даних та іконок... Це може зайняти кілька секунд.</div>
      ) : (
        <div className={styles.grid}>
          {autoruns.map((autorun, index) => (
            <AutorunCard 
              key={`${autorun.entryName}-${index}`} 
              item={autorun} 
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default AutorunsGrid;