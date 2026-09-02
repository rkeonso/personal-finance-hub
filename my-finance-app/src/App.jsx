import { useState, useEffect } from 'react';
import SummaryCard from './components/SummaryCard';
import TransactionForm from './components/TransactionForm';
import TransactionList from './components/TransactionList';
import ExpensesChart from "./components/ExpensesChart";

export default function App() {
  // 1. Initial State from localStorage
  const [transactions, setTransactions] = useState(() => {
    const savedData = localStorage.getItem('budgetTransactions');
    return savedData ? JSON.parse(savedData) : [];
  });

  // Active filter state
  const [activeFilter, setActiveFilter] = useState('all');

  // 2. useEffect: Sync transactions to localStorage on every change
  useEffect(() => {
    localStorage.setItem('budgetTransactions', JSON.stringify(transactions));
  }, [transactions]);

  // Handlers
  const handleAddTransaction = (newTransaction) => {
    setTransactions((prev) => [newTransaction, ...prev]);
  };

  const handleDeleteTransaction = (id) => {
    setTransactions((prev) => prev.filter((item) => item.id !== id));
  };

  // Summary Metrics (always calculated from full transactions list)
  const incomeTotal = transactions
    .filter((item) => item.type === 'income')
    .reduce((acc, item) => acc + item.amount, 0);

  const expenseTotal = transactions
    .filter((item) => item.type === 'expense')
    .reduce((acc, item) => acc + item.amount, 0);

  const netBalance = incomeTotal - expenseTotal;

  // 3. Derived State: Filtered transactions array for display
  const filteredTransactions = activeFilter === 'all'
    ? transactions
    : transactions.filter((item) => item.category === activeFilter);

  const categories = ['all', 'Salary', 'Food', 'Entertainment', 'Utilities', 'Other'];

  return (
    <main className="dashboard-container">
      <header className="dashboard-header">
        <h1>Personal Finance Hub</h1>
        <p>Manage your finances effectively and efficiently in real-time.</p>
      </header>

      {/* Financial Summary */}
      <section className="summary-section">
        <SummaryCard title="Net Balance" amount={netBalance} type="balance" />
        <SummaryCard title="Total Income" amount={incomeTotal} type="income" />
        <SummaryCard title="Total Expenses" amount={expenseTotal} type="expense" />
      </section>

       <ExpensesChart transactions={transactions} />
      {/* Transaction Input Form */}
      <TransactionForm onAddTransaction={handleAddTransaction} />

      {/* History Ledger Section */}
      <section className="history-section">
        <h2>Transaction History</h2>

        {/* 4 & 5. Filter Button Bar */}
        <div className="filter-container" style={{ margin: '1rem 0' }}>
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveFilter(cat)}
              className={`filter-btn ${activeFilter === cat ? 'active' : 'inactive'}`}
            >
              {cat === 'all' ? 'Show All' : cat}
            </button>
          ))}
        </div>

        {/* Render filtered items */}
        <TransactionList 
          transactions={filteredTransactions} 
          onDelete={handleDeleteTransaction} 
        />
       
      </section>
    </main>
  );
}