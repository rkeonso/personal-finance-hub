import { useState } from 'react';

export default function TransactionForm({ onAddTransaction }) {
  const [description, setDescription] = useState("");
  const [amount, setAmount] = useState("");
  const [type, setType] = useState("");
  const [category, setCategory] = useState("");
  const [error, setError] = useState(""); // Inline UI/UX error state

  const handleSubmit = (e) => {
    e.preventDefault();

    // 1. Validation & Early Return
    if (!description.trim() || !amount || parseFloat(amount) <= 0 || !type || !category) {
      setError("Please fill out all fields with valid values.");
      return;
    }

    // Clear error if validation passes
    setError("");

    // 2. Create new transaction object
    const newTransaction = {
      id: Date.now(),
      description: description.trim(),
      amount: parseFloat(amount),
      type,
      category
    };

    // 3. Send to parent (<App/>)
    onAddTransaction(newTransaction);

    // 4. Reset form state
    setDescription("");
    setAmount("");
    setType("");
    setCategory("");
  };

  return (
    <form onSubmit={handleSubmit} className="transaction-form">
      <h3>Add New Transaction</h3>

      {/* Inline UX Error Banner */}
      {error && <p className="error-message" style={{ color: '#ef4444', fontSize: '0.875rem' }}>{error}</p>}

      <div className="form-control">
        <label htmlFor="description">Description</label>
        <input 
          id="description"
          type="text" 
          placeholder="e.g., Groceries, Salary"
          value={description} 
          onChange={(e) => setDescription(e.target.value)} 
        />
      </div>

      <div className="form-control">
        <label htmlFor="amount">Amount ($)</label>
        <input 
          id="amount"
          type="number" 
          step="0.01"
          placeholder="0.00"
          value={amount} 
          onChange={(e) => setAmount(e.target.value)} 
        />
      </div>

      <div className="form-control">
        <label htmlFor="type">Transaction Type</label>
        <select id="type" value={type} onChange={(e) => setType(e.target.value)}>
          <option value="" disabled>Select type...</option>
          <option value="income">Income (+)</option>
          <option value="expense">Expense (-)</option>
        </select>
      </div>

      <div className="form-control">
        <label htmlFor="category">Category</label>
        <select id="category" value={category} onChange={(e) => setCategory(e.target.value)}>
          <option value="" disabled>Select category...</option>
          <option value="Salary">Salary</option>
          <option value="Food">Food</option>
          <option value="Entertainment">Entertainment</option>
          <option value="Utilities">Utilities</option>
          <option value="Other">Other</option>
        </select>
      </div>

      <button type="submit" className="btn-submit">Add Transaction</button>
    </form>
  );
}