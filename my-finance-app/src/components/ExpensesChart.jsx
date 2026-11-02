import React, { useMemo } from 'react';
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
} from 'recharts';

const COLORS = [
  '#4f46e5', // Indigo
  '#06b6d4', // Cyan
  '#10b981', // Emerald
  '#f59e0b', // Amber
  '#ef4444', // Red
  '#8b5cf6', // Purple
  '#ec4899', // Pink
  '#64748b', // Slate
];

const CustomTooltip = ({ active, payload }) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload; // Access raw data payload securely
    const val = Number(data.value || 0);
    return (
      <div style={{
        backgroundColor: '#1e293b',
        color: '#f8fafc',
        padding: '8px 12px',
        borderRadius: '8px',
        fontSize: '13px',
        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.15)',
        border: '1px solid #334155'
      }}>
        <p style={{ margin: 0, fontWeight: 600 }}>{data.name}</p>
        <p style={{ margin: 0, color: '#38bdf8' }}>
          ${val.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
        </p>
      </div>
    );
  }
  return null;
};

export default function ExpensesChart({ summaryData = [], rawTransactions = [] }) {
  // Memoize chart calculations to freeze the array reference and block rendering loops
  const processedChartData = useMemo(() => {
    const categoryMap = {};

    if (Array.isArray(rawTransactions) && rawTransactions.length > 0) {
      rawTransactions.forEach((t) => {
        const type = (t.type || '').toUpperCase();
        if (type === 'EXPENSE' || type === 'DEBIT') {
          const cat = t.category || 'Uncategorized';
          const parsedAmount = parseFloat(t.amount || 0);
          if (!isNaN(parsedAmount) && parsedAmount > 0) {
            categoryMap[cat] = (categoryMap[cat] || 0) + parsedAmount;
          }
        }
      });
    }

    return Object.entries(categoryMap)
      .map(([category, amount]) => ({
        name: category,
        value: Number(amount.toFixed(2)),
      }))
      .sort((a, b) => b.value - a.value);
  }, [rawTransactions]); // Only recalculates when the transaction history changes

  if (processedChartData.length === 0) {
    return (
      <div style={{
        height: '280px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: '#94a3b8',
        fontSize: '14px',
        fontStyle: 'italic',
      }}>
        No expense data available to display
      </div>
    );
  }

  return (
    <div style={{ width: '100%', height: '300px', minHeight: '300px' }}>
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Tooltip content={<CustomTooltip />} />
          <Legend
            verticalAlign="bottom"
            height={36}
            formatter={(value) => (
              <span style={{ color: '#475569', fontSize: '13px', fontWeight: 500 }}>
                {value}
              </span>
            )}
          />
          <Pie
            data={processedChartData}
            dataKey="value"
            nameKey="name"
            cx="50%"
            cy="45%"
            innerRadius={60}
            outerRadius={90}
            paddingAngle={4}
          >
            {processedChartData.map((entry, index) => (
              <Cell key={`cell-${entry.name}-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}
