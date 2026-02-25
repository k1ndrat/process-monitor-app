import { useState, type SubmitEvent } from 'react';
import type { TWhoisData } from '../../../../types'; // Твій шлях
import { fetchWhois } from '../../services/api'; // Твоя функція запиту до бекенду
import styles from './WhoisViewer.module.scss';

const WhoisViewer = () => {
  const [domain, setDomain] = useState('');
  const [whoisData, setWhoisData] = useState<TWhoisData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSearch = async (e: SubmitEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!domain.trim()) return;

    try {
      setIsLoading(true);
      setError(null);
      setWhoisData(null);
      // Припускаємо, що твоя API функція приймає домен
      const data = await fetchWhois(domain);
      setWhoisData(data);
    } catch (err) {
      setError('Не вдалося отримати дані WHOIS. Перевірте домен.');
    } finally {
      setIsLoading(false);
    }
  };

  // Хелпер для форматування дат
  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'Невідомо';
    return new Date(dateString).toLocaleDateString('uk-UA', {
      year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit'
    });
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h2 className={styles.title}>WHOIS Інформація</h2>
      </div>

      <form onSubmit={handleSearch} className={styles.searchForm}>
        <input
          type="text"
          placeholder="Введіть домен (напр. google.com)"
          value={domain}
          onChange={(e) => setDomain(e.target.value)}
          className={styles.input}
        />
        <button type="submit" disabled={isLoading} className={styles.button}>
          {isLoading ? 'Пошук...' : 'Знайти'}
        </button>
      </form>

      {error && <div className={styles.error}>{error}</div>}

      {whoisData && !isLoading && (
        <div className={styles.resultGrid}>
          {/* Картка 1: Основна інфа */}
          <div className={styles.card}>
            <h3>🌐 Основна інформація</h3>
            <div className={styles.infoRow}><span className={styles.label}>Домен:</span> <span className={styles.valueHighlight}>{whoisData.domainName}</span></div>
            <div className={styles.infoRow}><span className={styles.label}>Реєстратор:</span> <span className={styles.value}>{whoisData.registrar || '-'}</span></div>
            <div className={styles.infoRow}><span className={styles.label}>Власник:</span> <span className={styles.value}>{whoisData.organization || 'Приховано / Невідомо'}</span></div>
            <div className={styles.infoRow}><span className={styles.label}>Abuse Email:</span> <span className={styles.value}>{whoisData.abuseEmail || '-'}</span></div>
          </div>

          {/* Картка 2: Дати */}
          <div className={styles.card}>
            <h3>📅 Дати</h3>
            <div className={styles.infoRow}><span className={styles.label}>Створено:</span> <span className={styles.value}>{formatDate(whoisData.creationDate)}</span></div>
            <div className={styles.infoRow}><span className={styles.label}>Оновлено:</span> <span className={styles.value}>{formatDate(whoisData.updatedDate)}</span></div>
            <div className={styles.infoRow}>
              <span className={styles.label}>Закінчується:</span> 
              <span className={`${styles.value} ${styles.warningText}`}>{formatDate(whoisData.expirationDate)}</span>
            </div>
          </div>

          {/* Картка 3: Name Servers */}
          <div className={styles.card}>
            <h3>🖥️ Name Servers</h3>
            <div className={styles.list}>
              {whoisData.nameServers.length > 0 ? (
                whoisData.nameServers.map((ns, i) => <div key={i} className={styles.listItem}>{ns}</div>)
              ) : (
                <span>Не знайдено</span>
              )}
            </div>
          </div>

          {/* Картка 4: Статуси */}
          <div className={styles.card}>
            <h3>🔒 Статуси домену</h3>
            <div className={styles.badgesWrapper}>
              {whoisData.statuses.length > 0 ? (
                whoisData.statuses.map((status, i) => (
                  <span key={i} className={styles.statusBadge}>{status}</span>
                ))
              ) : (
                <span>Немає статусів</span>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default WhoisViewer;