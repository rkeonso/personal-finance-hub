export default function SummaryCard({ title, amount, type }) {
  const isBalance = type === "balance";
  const cardClass = isBalance ? "card card-primary" : `card card-${type}`;

  const formattedAmount = amount < 0 
    ? `-$${Math.abs(amount).toFixed(2)}` 
    : `$${amount.toFixed(2)}`;

  return (
    <article className={cardClass}>
      <span className="card-title">{title}</span>
      <p className="card-amount">{formattedAmount}</p>
    </article>
  );
}