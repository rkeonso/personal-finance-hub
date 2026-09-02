import TransactionItem from './TransactionItem';

export default function TransactionList({ transactions, onDelete }) {
  if (transactions.length === 0) {
    return (
      <div className="empty-state">
        <p>No transactions recorded yet. Add one above to get started!</p>
      </div>
    );
  }

  return (
    <ul className="history-list">
      {transactions.map((transaction) => (
        <TransactionItem 
          key={transaction.id} 
          transaction={transaction} 
          onDelete={onDelete} 
        />
      ))}
    </ul>
  );
}