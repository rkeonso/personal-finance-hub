import api from './client';

// Authentication
export const registerUser = async (email, password) => {
  const { data } = await api.post('/auth/register', { email, password });
  return data;
};

export const loginUser = async (email, password) => {
  const { data } = await api.post('/auth/login', { email, password });
  return data;
};

export const logoutUser = async () => {
  const { data } = await api.post('/auth/logout');
  return data;
};

// Transactions
export const fetchTransactions = async () => {
  const { data } = await api.get('/transactions');
  return data;
};

export const createTransaction = async (transactionData) => {
  const { data } = await api.post('/transactions', transactionData);
  return data;
};

export const fetchMonthlySummary = async (year) => {
  const { data } = await api.get('/transactions/monthly-summary', {
    params: { year },
  });
  return data;
};

// CSV Upload
export const uploadTransactionsCSV = async (file) => {
  const formData = new FormData();
  formData.append('file', file);

  const { data } = await api.post('/transactions/upload-csv', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return data;
};