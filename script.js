//  select dom elements
const form = document.getElementById('transaction-form');
const descriptionInput = document.getElementById('description');
const amountInput = document.getElementById('amount');
const transactionList = document.getElementById('transaction-list');
const typeSelect = document.getElementById('type');

let transactions = []; //  memory array to hold all transactions

form.addEventListener('submit', function (event) {
    event.preventDefault(); // stops reloading of page

    if (descriptionInput.value.trim() === '' || amountInput.value === '' || typeSelect.value === '') {
        alert ('Please fill out all fields completely');
        return;
    }

    const newTransaction = {
        id: Date.now(),
        description: descriptionInput.value.trim(),
        amount: parseFloat(amountInput.value),
        type: typeSelect.value
    };

    transactions.push(newTransaction);
    console.log('Current Transactions Array: ', transactions); // to test
    form.reset();
});


