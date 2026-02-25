import React from 'react';
import type { TAutorun } from '../../../../types';
import styles from './AutorunCard.module.scss';

interface AutorunCardProps {
  item: TAutorun;
}

const AutorunCard: React.FC<AutorunCardProps> = ({ item }) => {
  // Визначаємо рівень небезпеки для кольору картки
  const hasVirus = item.virusTotalDetections !== null && item.virusTotalDetections > 0;
  const isUnverified = !item.isVerified;
  
  let statusColor = '#4CAF50'; // Зелений (Безпечно)
  if (hasVirus) statusColor = '#FF0033'; // Червоний (Вірус)
  else if (isUnverified) statusColor = '#FFC107'; // Жовтий (Невідомий видавець)

  const isEnabled = item.state?.toLowerCase() === 'enabled';

  return (
    <div className={styles.card} style={{ borderTopColor: statusColor }}>
      <div className={styles.header}>
        <div className={styles.titleArea}>
          {item.iconBase64 ? (
            <img src={item.iconBase64} alt="icon" className={styles.icon} />
          ) : (
            <div className={styles.iconPlaceholder}>⚙️</div>
          )}
          <div className={styles.nameBlock}>
            <h3 className={styles.name} title={item.entryName}>{item.entryName}</h3>
            <span className={styles.company} title={item.company || item.description}>
              {item.company || item.description || 'Невідома компанія'}
            </span>
          </div>
        </div>
        <div className={`${styles.stateBadge} ${isEnabled ? styles.enabled : styles.disabled}`}>
          {isEnabled ? 'Увімкнено' : 'Вимкнено'}
        </div>
      </div>
      
      <div className={styles.body}>
        <div className={styles.infoRow}>
          <span className={styles.label}>Видавець:</span>
          <span className={`${styles.value} ${isUnverified ? styles.warningText : styles.safeText}`}>
            {item.isVerified ? '✅ Підтверджено' : '⚠️ Не підтверджено'}
          </span>
        </div>

        <div className={styles.infoRow}>
          <span className={styles.label}>VirusTotal:</span>
          {item.virusTotalDetections !== null ? (
            <a 
              href={item.virusTotalLink || '#'} 
              target="_blank" 
              rel="noreferrer"
              className={`${styles.vtBadge} ${hasVirus ? styles.vtDanger : styles.vtSafe}`}
            >
              {item.virusTotalDetections} / {item.virusTotalTotal}
            </a>
          ) : (
            <span className={styles.vtUnknown}>Не перевірено</span>
          )}
        </div>

        {/* <div className={styles.pathBlock}>
          <span className={styles.label}>Шлях до файлу:</span>
          <div className={styles.path} title={item.imagePath}>
            {item.imagePath || 'Не вказано'}
          </div>
        </div> */}

				{/* НОВИЙ БЛОК: Локація в реєстрі / системі */}
        <div className={styles.pathBlock}>
          <span className={styles.label}>Розташування (Реєстр):</span>
          <div className={styles.path} title={item.location}>
            {item.location || 'Не вказано'}
          </div>
        </div>

        {/* БЛОК: Шлях до файлу */}
        <div className={styles.pathBlock}>
          <span className={styles.label}>Шлях до файлу:</span>
          <div className={styles.path} title={item.imagePath}>
            {item.imagePath || 'Не вказано'}
          </div>
        </div>

        {/* НОВИЙ БЛОК: Точна команда запуску */}
        <div className={styles.pathBlock}>
          <span className={styles.label}>Команда запуску:</span>
          <div className={styles.path} title={item.launchCommand}>
            {item.launchCommand || 'Не вказано'}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AutorunCard;