export default function TransactionItem({ transaction, onDelete }) {
  const { id, description, amount, type, category } = transaction;

  const isIncome = type === 'income';
  const formattedAmount = isIncome 
    ? `+$${amount.toFixed(2)}` 
    : `-$${Math.abs(amount).toFixed(2)}`;

  return (
    <li className={`history-item history-item--${type}`}>
      <div className="item-details">
        <span className={`status-badge ${type}`}>
          {isIncome ? '▲ In' : '▼ Out'}
        </span>
        <span className="item-description">{description}</span>
        <span className="item-category">({category})</span>
      </div>

      <div className="item-actions">
        <span className={`item-amount ${type}`}>{formattedAmount}</span>
        <button 
          type="button"
          onClick={() => onDelete(id)} 
          className="btn-delete"
          aria-label={`Delete ${description}`}
        >
          ✕
        </button>
      </div>
    </li>
  );
}