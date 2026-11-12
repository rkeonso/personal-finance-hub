export default function SummaryCard({ title, amount, type }) {
  const isBalance = type === "balance";
  const cardClass = isBalance ? "card card-primary" : `card card-${type}`;

  const formattedNumber = Math.abs(amount).toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

  const formattedAmount = amount < 0 ? `-$${formattedNumber}` : `$${formattedNumber}`;

  return (
    <article className={cardClass}>
      <span className="card-title">{title}</span>
      <p className="card-amount">{formattedAmount}</p>
    </article>
  );
}
