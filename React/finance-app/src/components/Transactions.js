import React, { useState, useEffect, useCallback } from 'react';
import api from '../api';

const Transactions = ({ token }) => {
  const [transactions, setTransactions] = useState([]);
  const [formData, setFormData] = useState({
    amount: '',
    category: '',
    description: '',
    is_income: false,
    date: ''
  });

  const fetchTransactions = useCallback(async () => {
    if (!token) return;

    try {
      const response = await api.get('/transactions', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setTransactions(response.data);
    } catch (error) {
      console.error("Failed to fetch", error);
    }
  }, [token]);

  useEffect(() => {
    fetchTransactions();
  }, [fetchTransactions]);

  const handleInputChange = (e) => {
    const value = e.target.type === 'checkbox' ? e.target.checked : e.target.value;
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: value,
    }));
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.post('/transactions', formData, {
        headers: { Authorization: `Bearer ${token}` }
      });

      await fetchTransactions();

      setFormData({
        amount: '',
        category: '',
        description: '',
        is_income: false,
        date: ''
      });
    } catch (error) {
      console.error("Failed to post", error);
    }
  };

  return (
    <div>
      <div className="container">
        <form onSubmit={handleFormSubmit}>
          {/* ... your form inputs stay exactly the same ... */}
          <div className='mb-3 mt-3'>
            <label htmlFor='amount' className='form-label'>
              Amount
              <input type="text" className="form-control" id='amount' name='amount' onChange={handleInputChange} value={formData.amount}/>
            </label>
          </div>

          <div className='mb-3'>
            <label htmlFor='category' className='form-label'>
              Category
              <input type="text" className="form-control" id='category' name='category' onChange={handleInputChange} value={formData.category}/>
            </label>
          </div>

          <div className='mb-3'>
            <label htmlFor='description' className='form-label'>
              Description
              <input type="text" className="form-control" id='description' name='description' onChange={handleInputChange} value={formData.description}/>
            </label>
          </div>

          <div className='mb-3'>
            <label htmlFor='is_income' className='form-label'>
              Income?
              <input type="checkbox" id='is_income' name='is_income' onChange={handleInputChange} checked={formData.is_income}/>
            </label>
          </div>

          <div className='mb-3'>
            <label htmlFor='date' className='form-label'>
              Date
              <input type="text" id='date' name='date' onChange={handleInputChange} value={formData.date}/>
            </label>
          </div>

          <button type='submit' className='btn btn-primary'> Submit </button>
        </form>

        <table className={'table table-striped table-bordered table-hover mt-4'}>
          <thead>
          <tr>
            <th>Amount</th>
            <th>Category</th>
            <th>Description</th>
            <th>Income</th>
            <th>Date</th>
          </tr>
          </thead>
          <tbody>
          {transactions.map((transaction, index) => (
            <tr key={index}>
              <td>{transaction.amount}</td>
              <td>{transaction.category}</td>
              <td>{transaction.description}</td>
              <td>{transaction.is_income ? 'True' : 'False'}</td>
              <td>{transaction.date}</td>
            </tr>
          ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Transactions;