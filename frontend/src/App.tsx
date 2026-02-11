import { NavLink, Route, Routes } from 'react-router-dom';
import styles from './App.module.scss';
import ProcessGrid from './components/ProcessGrid';
import ProcessMonitor from './components/ProcessMonitorChartJS';

function App() {
  return (
    <>
      <nav className={styles.nav}>
        <NavLink 
          to="/" 
          className={({ isActive }: { isActive: boolean }) => `${styles.link} ${isActive ? styles.active : ''}`}
        >
          Chart View
        </NavLink>
        <NavLink 
          to="/grid" 
          className={({ isActive }: { isActive: boolean }) => `${styles.link} ${isActive ? styles.active : ''}`}
        >
          Grid View
        </NavLink>
      </nav>

      <Routes>
        <Route path="/" element={<ProcessMonitor />} />
        <Route path="/grid" element={<ProcessGrid />} />
      </Routes>
    </>
  );
}

export default App;
