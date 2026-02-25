import { NavLink, Route, Routes } from 'react-router-dom';
import styles from './App.module.scss';
import AutorunsGrid from './components/Autoruns/AutorunsGrid';
import ProcessMonitor from './components/ProcessChart/ProcessMonitorChartJS';
import ProcessGrid from './components/ProcessGrid/ProcessGrid';
import SystemMetrics from './components/SystemMetrics/SystemMetrics';
import WhoisViewer from './components/WhoIs/WhoIs';

function App() {
  return (
    <>
      <nav className={styles.nav}>
        <NavLink 
          to="/" 
          className={({ isActive }: { isActive: boolean }) => `${styles.link} ${isActive ? styles.active : ''}`}
        >
          Графік процесів
        </NavLink>
        <NavLink 
          to="/grid" 
          className={({ isActive }: { isActive: boolean }) => `${styles.link} ${isActive ? styles.active : ''}`}
        >
          Список процесів
        </NavLink>
        <NavLink 
          to="/autoruns" 
          className={({ isActive }: { isActive: boolean }) => `${styles.link} ${isActive ? styles.active : ''}`}
        >
          Автозавантаження
        </NavLink>
        <NavLink 
          to="/whois" 
          className={({ isActive }: { isActive: boolean }) => `${styles.link} ${isActive ? styles.active : ''}`}
        >
          Хто є хто?
        </NavLink>
        <NavLink 
          to="/metrics" 
          className={({ isActive }: { isActive: boolean }) => `${styles.link} ${isActive ? styles.active : ''}`}
        >
          Метрики
        </NavLink>
      </nav>

      <Routes>
        <Route path="/" element={<ProcessMonitor />} />
        <Route path="/grid" element={<ProcessGrid />} />
        <Route path="/autoruns" element={<AutorunsGrid />} />
        <Route path="/whois" element={<WhoisViewer />} />
        <Route path="/metrics" element={<SystemMetrics />} />
      </Routes>
    </>
  );
}

export default App;
