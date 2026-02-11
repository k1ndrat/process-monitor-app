import { useEffect, useState } from 'react';
import {
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip
} from 'recharts';
import type { TTask } from '../../../types';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];

const ProcessMonitor = () => {
  const [tasks, setTasks] = useState<TTask[]>([]);
  const [error, setError] = useState<string | null>(null);

  const fetchTasks = async () => {
    try {
      const response = await fetch('http://localhost:3001/api/tasks');
      if (!response.ok) throw new Error('Помилка сервера');
      const data: TTask[] = await response.json();
      setTasks(data);
      setError(null);
    } catch (err) {
      setError('Не вдалося з’єднатися з бекендом');
      console.error(err);
    }
  };

  useEffect(() => {
    fetchTasks();
    const interval = setInterval(fetchTasks, 1000); 
    return () => clearInterval(interval);
  }, []);

  if (error) return <div style={{ color: 'red', padding: '20px' }}>{error}</div>;

  return (
    <div style={{ padding: '20px', textAlign: 'center' }}>
      <h2>System Process Monitor (RAM Usage)</h2>
      
      <div style={{ width: '100%', height: '500px' }}>
        <ResponsiveContainer>
          <PieChart>
          <Pie
            data={tasks}
            cx="50%"
            cy="50%"
            
            innerRadius="60%" 
            outerRadius="80%" 
            
            paddingAngle={5}
            dataKey="memUsage"
            nameKey="name"
            isAnimationActive={false}
            label={(props: any) => {
              const { name, percent } = props;
              return `${name ?? 'Unknown'} ${(Number(percent) * 100).toFixed(0)}%`;
            }}
          >
            {tasks.map((_, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>

          <Tooltip 
            formatter={(value: number | string | undefined) => {
              const numValue = Number(value) || 0;
              return [`${(numValue / 1024).toFixed(2)} MB`, 'Memory'];
            }} 
          />
          
          <Legend verticalAlign="bottom" height={36}/>
        </PieChart>
        </ResponsiveContainer>
      </div>

      <div style={{ marginTop: '20px' }}>
        <table style={{ margin: '0 auto', borderCollapse: 'collapse', width: '80%' }}>
          <thead>
            <tr style={{ backgroundColor: '#f4f4f4' }}>
              <th style={tableHeaderStyle}>Process Name</th>
              <th style={tableHeaderStyle}>Usage (MB)</th>
            </tr>
          </thead>
          <tbody>
            {tasks.map((task, idx) => (
              <tr key={idx} style={{ borderBottom: '1px solid #ddd' }}>
                <td style={tableCellStyle}>{task.name}</td>
                <td style={tableCellStyle}>{task.usage}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

const tableHeaderStyle = { padding: '12px', border: '1px solid #ddd' };
const tableCellStyle = { padding: '8px', border: '1px solid #ddd' };

export default ProcessMonitor;