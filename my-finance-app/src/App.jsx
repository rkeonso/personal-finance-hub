import { useState, useEffect } from 'react';
import SummaryCard from './components/SummaryCard';
import CsvUploader from './components/CsvUploader';
import { fetchTransactions, fetchMonthlySummary, createTransaction, loginUser } from './api/services'; // Added createTransaction import
import TransactionForm from './components/TransactionForm';
import TransactionList from './components/TransactionList';
import ExpensesChart from "./components/ExpensesChart";

export default function App() {
  const [showUploader, setShowUploader] = useState(false);
  const [transactions, setTransactions] = useState([]);
  const [chartData, setChartData] = useState([]); //  Added chartData state from Dashboard
  const [isLoading, setIsLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState('all');

const handleAutoLogin = async () => {
  try {
    // Replace with a valid test account registered in your database
    const session = await loginUser('test@example.com', 'password123');
    
    // If your client setup uses localStorage to persist tokens:
    if (session.token) {
      localStorage.setItem('token', session.token);
    }
    
    // Now that we are logged in, load your financial data
    await loadData();
  } catch (err) {
    console.error('Authentication failed:', err);
  }
};

// Swap your initial data-loading useEffect block with this one:
useEffect(() => {
  handleAutoLogin();
}, []);


  // 3. Consolidated loading function using Promise.all
  const loadData = async () => {
    try {
      setIsLoading(true);
      const [txList, summary] = await Promise.all([
        fetchTransactions(),
        fetchMonthlySummary(new Date().getFullYear()),
      ]);
      setTransactions(txList);
      setChartData(summary);
    } catch (err) {
      console.error('Failed to load dashboard data:', err);
    } finally {
      setIsLoading(false);
    }
  };


  // Handlers
  const handleAddTransaction = async (formData) => {
    try {
      const newTransaction = await createTransaction(formData);
      setTransactions((prev) => [newTransaction, ...prev]);
      
      // Optional: Refresh summary/chart data when a new manual transaction is added
      const summary = await fetchMonthlySummary(new Date().getFullYear());
      setChartData(summary);
    } catch (err) {
      console.error('Failed to create transaction:', err);
      alert('Error saving transaction. Please try again.');
    }
  };

  const handleDeleteTransaction = (id) => {
    setTransactions((prev) => prev.filter((item) => item.id !== id));
  };

  // Summary Metrics
  const incomeTotal = transactions
    .filter((item) => (item.type || '').toUpperCase() === 'INCOME')
    .reduce((acc, item) => acc + Math.abs(parseFloat(item.amount || 0)), 0);

  const expenseTotal = transactions
    .filter((item) => (item.type || '').toUpperCase() === 'EXPENSE')
    .reduce((acc, item) => acc + Math.abs(parseFloat(item.amount || 0)), 0);

  const netBalance = incomeTotal - expenseTotal;

  // Derived State for Filtering
  const filteredTransactions = activeFilter === 'all'
    ? transactions
    : transactions.filter((item) => item.category === activeFilter);

  const categories = ['all', 'Salary', 'Food', 'Entertainment', 'Utilities', 'Other'];



  return (
    <main className="dashboard-container" style={{ maxWidth: '1000px', margin: '0 auto', padding: '24px' }}>
      <header className="dashboard-header">
        <h1>Personal Finance Hub</h1>
        <p>Manage your finances effectively and efficiently in real-time.</p>

        {/* Toggle Button */}
        <button
          onClick={() => setShowUploader((prev) => !prev)}
          className="px-4 py-2 text-sm font-medium border border-gray-300 rounded-lg shadow-sm hover:bg-gray-50 transition-colors flex items-center gap-2"
        >
          {showUploader ? '✕ Close Import' : '📁 Import CSV'}
        </button>
      </header>

      {/* CONDITIONAL RENDER: CsvUploader ONLY goes here */}
      {showUploader && (
        <div className="mb-6">
          <CsvUploader onUploadSuccess={() => { 
            loadData();
            setShowUploader(false)
          }}
          />
        </div>
      )}

      {/* Financial Summary Cards */}
      <section className="summary-section">
        <SummaryCard title="Net Balance" amount={netBalance} type="balance" />
        <SummaryCard title="Total Income" amount={incomeTotal} type="income" />
        <SummaryCard title="Total Expenses" amount={expenseTotal} type="expense" />
      </section>

      {/* Expenses Chart (Now using the rich data fetched from loadData) */}
      <ExpensesChart summaryData={chartData} rawTransactions={transactions} />
      
      {/* Transaction Input Form */}
      <TransactionForm onAddTransaction={handleAddTransaction} />

      {/* History Ledger Section */}
      <section className="history-section" style={{ marginTop: '24px' }}>
        <h2>Transaction History ({transactions.length})</h2>

        {/* Filter Button Bar */}
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

        {/* Render filtered items or fallback UI */}
        {isLoading ? (
          <p>Loading transactions...</p>
        ) : filteredTransactions.length === 0 ? (
          <p style={{ color: '#64748b' }}>No transactions recorded yet. Drop a CSV above or add one manually!</p>
        ) : (
          <TransactionList 
            transactions={filteredTransactions} 
            onDelete={handleDeleteTransaction} 
          />
        )}


      </section>
    </main>
  );
}
