import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import { Doughnut } from 'react-chartjs-2';

// Register required modules for Chart.js
ChartJS.register(ArcElement, Tooltip, Legend);

export default function ExpenseChart({ transactions }) {
  // Filter for expenses only
  const expenses = transactions.filter((t) => t.type === 'expense');

  if (expenses.length === 0) {
    return (
      <div className="chart-card empty-chart">
        <p>No expense data available to display.</p>
      </div>
    );
  }

  // Group expense amounts by category using derived state
  const categoryTotals = expenses.reduce((acc, item) => {
    acc[item.category] = (acc[item.category] || 0) + item.amount;
    return acc;
  }, {});

  const categories = Object.keys(categoryTotals);
  const amounts = Object.values(categoryTotals);

  // Configure Chart Data
  const chartData = {
    labels: categories,
    datasets: [
      {
        label: 'Expenses ($)',
        data: amounts,
        backgroundColor: [
          '#ef4444', // Red
          '#f59e0b', // Amber
          '#3b82f6', // Blue
          '#10b981', // Green
          '#8b5cf6', // Purple
        ],
        borderWidth: 1,
      },
    ],
  };

  return (
    <div className="chart-card">
      <h3>Expense Breakdown</h3>
      <div style={{ maxWidth: '300px', margin: '0 auto' }}>
        <Doughnut data={chartData} />
      </div>
    </div>
  );
}