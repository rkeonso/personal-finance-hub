//  select dom elements
const form = document.getElementById('transaction-form');
const descriptionInput = document.getElementById('description');
const amountInput = document.getElementById('amount');
const typeSelect = document.getElementById('type');

// grab cards
const balanceDisplay = document.getElementById('total-balance');
const incomeDisplay = document.getElementById('total-income');
const expenseDisplay = document.getElementById('total-expenses');
const transactionList = document.getElementById('transaction-list');

// check if transactions exist in localStorage, if not, initialize an empty array
let transactions = localStorage.getItem('budgetTransactions') !== null 
  ? JSON.parse(localStorage.getItem('budgetTransactions')) 
  : [];

function updateSummary() {
  let incomeTotal = 0;
  let expenseTotal = 0;

  // Loop through all entries to calculate separate totals
  transactions.forEach(transaction => {
    if (transaction.type === 'income') {
      incomeTotal += transaction.amount;
    } else if (transaction.type === 'expense') {
      expenseTotal += transaction.amount;
    }
  });

  const netBalance = incomeTotal - expenseTotal;

  // Update the HTML display values formatted cleanly to 2 decimal places
  incomeDisplay.textContent = `$${incomeTotal.toFixed(2)}`;
  expenseDisplay.textContent = `$${expenseTotal.toFixed(2)}`;
  
  // Format the Net Balance and handle negative numbers cleanly
  if (netBalance >= 0) {
    balanceDisplay.textContent = `$${netBalance.toFixed(2)}`;
  } else {
    balanceDisplay.textContent = `-$${Math.abs(netBalance).toFixed(2)}`;
  }
}

function renderList() {
  // Clear the existing list items (removes our old temporary HTML mock item)
  transactionList.innerHTML = '';

  // Loop through our array database, new html created
  transactions.forEach(transaction => {
    const li = document.createElement('li');
    
    // Add the structural class names we built inside our style.css file
    li.className = `history-item ${transaction.type}`;

    // Format the prefix symbol for income vs expense
    const symbol = transaction.type === 'income' ? '+' : '-';

    li.innerHTML = `
      <span>${transaction.type === 'income' ? '🟢' : '🔴'} ${transaction.description}</span>
      <span>${symbol}$${transaction.amount.toFixed(2)}</span>
    `;

    // Inject this new list item 
    transactionList.appendChild(li);
  });
}

function saveToLocalStorage() {
    localStorage.setItem('budgetTransactions', JSON.stringify(transactions));
}

function init() {
    renderList();
    updateSummary();
}

form.addEventListener('submit', function (event) {
  event.preventDefault();

  if (descriptionInput.value.trim() === '' || amountInput.value === '' || typeSelect.value === '') {
    alert('Please fill out all fields completely.');
    return;
  }

  const newTransaction = {
    id: Date.now(),
    description: descriptionInput.value.trim(),
    amount: parseFloat(amountInput.value),
    type: typeSelect.value
  };

  transactions.push(newTransaction);

  renderList();
  updateSummary();
  saveToLocalStorage();

  form.reset(); // clear form inputs
});

init();
