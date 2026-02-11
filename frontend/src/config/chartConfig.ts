import type { TooltipItem } from 'chart.js';
import { formatTooltipLabel } from '../utils/formatters';

export const getChartOptions = () => ({
  responsive: true,
  maintainAspectRatio: false,
  animation: {
    duration: 0,
  },
  cutout: '60%',
  plugins: {
    legend: {
      position: 'bottom' as const,
      labels: {
        padding: 20,
        boxWidth: 12,
      },
    },
    tooltip: {
      callbacks: {
        label: function (context: TooltipItem<'doughnut'>) {
          const label = context.label || '';
          const value = context.raw as number;
          return formatTooltipLabel(label, value);
        },
      },
    },
  },
});
