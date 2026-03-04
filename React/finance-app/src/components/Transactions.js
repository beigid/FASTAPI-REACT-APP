import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { toast } from 'react-toastify';
import api from '../api';
import Budget from './Budget';
import MonthSelector from './MonthSelector';

const formatMoney = (n) => {
  const num = Number(n || 0);
  return num.toLocaleString(undefined, { style: 'currency', currency: 'USD' });
};

const parseDateForSort = (t) => {
  const ms = new Date(t.date).getTime();
  return Number.isNaN(ms) ? 0 : ms;
};

const Transactions = ({ token }) => {
  const now = new Date();
  const [selectedMonth, setSelectedMonth] = useState(now.getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(now.getFullYear());
  const [transactions, setTransactions] = useState([]);

  const [formData, setFormData] = useState({
    amount: '',
    category: '',
    description: '',
    is_income: false,
    date: ''
  });

  const headers = useMemo(
    () => ({ Authorization: `Bearer ${token}` }),
    [token]
  );

  const fetchTransactions = useCallback(async () => {
    if (!token) return;
    try {
      const response = await api.get('/transactions/', { headers });
      setTransactions(response.data || []);
    } catch (error) {
      console.error('Failed to fetch', error);
    }
  }, [token, headers]);

  useEffect(() => {
    fetchTransactions();
  }, [fetchTransactions]);

  const handleInputChange = (e) => {
    const value = e.target.type === 'checkbox' ? e.target.checked : e.target.value;
    setFormData((prev) => ({ ...prev, [e.target.name]: value }));
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.post('/transactions/', formData, { headers });
      toast.success('Transaction created!');
      await fetchTransactions();
      setFormData({ amount: '', category: '', description: '', is_income: false, date: '' });
    } catch (error) {
      console.error('Failed to create transaction', error);
    }
  };

  const deleteTransaction = async (transaction) => {
    const confirmed = window.confirm(`Delete "${transaction.description || transaction.category}"?`);
    if (!confirmed) return;
    try {
      const res = await api.delete(`/transactions/${transaction.id}`, { headers });
      await fetchTransactions();
      toast.success(res.data.message);
    } catch (error) {
      toast.error('Something went wrong deleting this transaction.');
    }
  };

  const filteredTransactions = useMemo(() => {
    return transactions.filter((t) => {
      if (!t.date) return false;
      const [year, month] = t.date.split('-').map(Number);
      return month === selectedMonth && year === selectedYear;
    });
  }, [transactions, selectedMonth, selectedYear]);

  const sorted = useMemo(() => {
    return [...filteredTransactions].sort((a, b) => parseDateForSort(b) - parseDateForSort(a));
  }, [filteredTransactions]);

  const totals = useMemo(() => {
    let income = 0;
    let expense = 0;
    for (const t of filteredTransactions) {
      const amt = Number(t.amount || 0);
      if (t.is_income) income += amt;
      else expense += amt;
    }
    return { income, expense, net: income - expense };
  }, [filteredTransactions]);

  return (
    <div className="container py-4">

      <MonthSelector
        selectedMonth={selectedMonth}
        selectedYear={selectedYear}
        onChange={(month, year) => {
          setSelectedMonth(month);
          setSelectedYear(year);
        }}
      />

      <div className="row g-3 mb-3">
        <div className="col-12 col-lg-8">
          <div className="card border-0 shadow-sm">
            <div className="card-body d-flex flex-column flex-md-row gap-3 align-items-md-center justify-content-between">
              <div>
                <div className="text-muted small">Net</div>
                <div className="h4 mb-0">{formatMoney(totals.net)}</div>
              </div>
              <div className="d-flex gap-4">
                <div className="text-end">
                  <div className="text-muted small">Income</div>
                  <div className="fw-semibold text-success">{formatMoney(totals.income)}</div>
                </div>
                <div className="text-end">
                  <div className="text-muted small">Expenses</div>
                  <div className="fw-semibold text-danger">{formatMoney(totals.expense)}</div>
                </div>
              </div>
            </div>
          </div>

          <Budget
            token={token}
            selectedMonth={selectedMonth}
            selectedYear={selectedYear}
            filteredTransactions={filteredTransactions}
          />
        </div>

        <div className="col-12 col-lg-4">
          <div className="card border-0 shadow-sm">
            <div className="card-body">
              <div className="fw-semibold mb-3">Add transaction</div>
              <form onSubmit={handleFormSubmit}>
                <div className="mb-3">
                  <label htmlFor="amount" className="form-label">Amount</label>
                  <div className="input-group">
                    <span className="input-group-text">$</span>
                    <input
                      type="text"
                      className="form-control"
                      id="amount"
                      name="amount"
                      onChange={handleInputChange}
                      value={formData.amount}
                      placeholder="0.00"
                      inputMode="decimal"
                      required
                    />
                  </div>
                </div>
                <div className="mb-3">
                  <label htmlFor="category" className="form-label">Category</label>
                  <input
                    type="text"
                    className="form-control"
                    id="category"
                    name="category"
                    onChange={handleInputChange}
                    value={formData.category}
                    placeholder="e.g. Groceries"
                    required
                  />
                </div>
                <div className="mb-3">
                  <label htmlFor="description" className="form-label">Description</label>
                  <input
                    type="text"
                    className="form-control"
                    id="description"
                    name="description"
                    onChange={handleInputChange}
                    value={formData.description}
                    placeholder="Optional note"
                  />
                </div>
                <div className="mb-3">
                  <label htmlFor="date" className="form-label">Date</label>
                  <input
                    type="date"
                    className="form-control"
                    id="date"
                    name="date"
                    onChange={handleInputChange}
                    value={formData.date}
                  />
                </div>
                <div className="d-flex align-items-center justify-content-between mb-3">
                  <div className="form-check form-switch">
                    <input
                      className="form-check-input"
                      type="checkbox"
                      id="is_income"
                      name="is_income"
                      onChange={handleInputChange}
                      checked={formData.is_income}
                    />
                    <label className="form-check-label" htmlFor="is_income">Income</label>
                  </div>
                  <span className={formData.is_income ? 'badge text-bg-success' : 'badge text-bg-danger'}>
                    {formData.is_income ? 'Income' : 'Expense'}
                  </span>
                </div>
                <button type="submit" className="btn btn-primary w-100">Add transaction</button>
              </form>
            </div>
          </div>
        </div>
      </div>

      <div className="card border-0 shadow-sm">
        <div className="card-body">
          <div className="d-flex align-items-center justify-content-between mb-3">
            <div className="fw-semibold">Transactions</div>
            <div className="text-muted small">{sorted.length} total</div>
          </div>

          {sorted.length === 0 ? (
            <div className="text-muted">No transactions for this month.</div>
          ) : (
            <div className="table-responsive">
              <table className="table align-middle table-hover mb-0">
                <thead>
                <tr className="text-muted small">
                  <th style={{ width: 140 }}>Date</th>
                  <th>Description</th>
                  <th style={{ width: 160 }}>Category</th>
                  <th className="text-end" style={{ width: 140 }}>Amount</th>
                  <th style={{ width: 80 }}></th>
                </tr>
                </thead>
                <tbody>
                {sorted.map((t) => (
                  <tr key={t.id}>
                    <td className="text-muted">{t.date || '—'}</td>
                    <td>
                      <div className="fw-semibold">{t.description || '—'}</div>
                      <div className="text-muted small">{t.is_income ? 'Income' : 'Expense'}</div>
                    </td>
                    <td>
                        <span className="badge rounded-pill text-bg-light">
                          {t.category || 'Uncategorized'}
                        </span>
                    </td>
                    <td className={`text-end fw-semibold ${t.is_income ? 'text-success' : 'text-danger'}`}>
                      {t.is_income ? '+' : '-'}{formatMoney(t.amount)}
                    </td>
                    <td className="text-end">
                      <button className="delete-icon-btn" onClick={() => deleteTransaction(t)}>
                        <i className="bi bi-trash"></i>
                      </button>
                    </td>
                  </tr>
                ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Transactions;