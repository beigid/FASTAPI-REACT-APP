import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { toast } from 'react-toastify';
import api from '../api';

const formatMoney = (n) => {
  const num = Number(n || 0);
  return num.toLocaleString(undefined, { style: 'currency', currency: 'USD' });
};

const parseDateForSort = (t) => {
  const ms = new Date(t.date).getTime();
  return Number.isNaN(ms) ? 0 : ms;
};

const monthKey = (dateStr) => {
  if (!dateStr) return 'No date';
  const d = new Date(dateStr);
  if (Number.isNaN(d.getTime())) return 'No date';
  return d.toLocaleString(undefined, { month: 'long', year: 'numeric' });
};

const Transactions = ({ token }) => {
  const [transactions, setTransactions] = useState([]);
  const [groupByMonth, setGroupByMonth] = useState(true);

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
      const response = await api.get('/transactions', { headers });
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
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: value,
    }));
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.post('/transactions', formData, { headers });
      toast.success("Transaction created!");
      await fetchTransactions();

      setFormData({
        amount: '',
        category: '',
        description: '',
        is_income: false,
        date: ''
      });
    } catch (error) {
      console.error('Failed to create transaction', error);
    }
  };

  const deleteTransaction = async (transaction) => {
    const confirmed = window.confirm(
      `Delete "${transaction.description || transaction.category}"?`
    );

    if (!confirmed) return;

    try {
      const res = await api.delete(`/transactions/${transaction.id}`, { headers });
      await fetchTransactions();
      toast.success(res.data.message);
    } catch (error) {
      toast.error("Something went wrong deleting this transaction.");
    }
  };

  const sorted = useMemo(() => {
    return [...transactions].sort((a, b) => parseDateForSort(b) - parseDateForSort(a));
  }, [transactions]);

  const grouped = useMemo(() => {
    if (!groupByMonth) return { All: sorted };
    return sorted.reduce((acc, t) => {
      const key = monthKey(t.date);
      acc[key] = acc[key] || [];
      acc[key].push(t);
      return acc;
    }, {});
  }, [sorted, groupByMonth]);

  const totals = useMemo(() => {
    let income = 0;
    let expense = 0;
    for (const t of transactions) {
      const amt = Number(t.amount || 0);
      if (t.is_income) income += amt;
      else expense += amt;
    }
    return { income, expense, net: income - expense };
  }, [transactions]);

  return (
    <div className="container py-4">
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

              <div className="form-check form-switch m-0">
                <input
                  className="form-check-input"
                  type="checkbox"
                  id="groupByMonth"
                  checked={groupByMonth}
                  onChange={() => setGroupByMonth((v) => !v)}
                />
                <label className="form-check-label" htmlFor="groupByMonth">
                  Group by month
                </label>
              </div>
            </div>
          </div>

          {/* Budget placeholder */}
          <div className="card border-0 shadow-sm mt-3">
            <div className="card-body d-flex align-items-center justify-content-between">
              <div>
                <div className="fw-semibold">Budget (next)</div>
                <div className="text-muted small">
                  Put a monthly budget card here (left/right/top) and tie it to the selected month.
                </div>
              </div>
              <button className="btn btn-outline-primary btn-sm" disabled>
                Set budget
              </button>
            </div>
          </div>
        </div>

        {/* Form card */}
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
                    <label className="form-check-label" htmlFor="is_income">
                      Income
                    </label>
                  </div>

                  <span className={formData.is_income ? 'badge text-bg-success' : 'badge text-bg-danger'}>
                    {formData.is_income ? 'Income' : 'Expense'}
                  </span>
                </div>

                <button type="submit" className="btn btn-primary w-100">
                  Add transaction
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>

      {/* Transactions list card */}
      <div className="card border-0 shadow-sm">
        <div className="card-body">
          <div className="d-flex align-items-center justify-content-between mb-3">
            <div className="fw-semibold">Transactions</div>
            <div className="text-muted small">{transactions.length} total</div>
          </div>

          {Object.entries(grouped).map(([groupName, items]) => (
            <div key={groupName} className="mb-4">
              {groupByMonth && (
                <div className="text-muted small mb-2">{groupName}</div>
              )}

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
                  {items.map((t, idx) => (
                    <tr key={t.id}>
                      <td className="text-muted">{t.date || '—'}</td>
                      <td>
                        <div className="fw-semibold">{t.description || '—'}</div>
                        <div className="text-muted small">
                          {t.is_income ? 'Income' : 'Expense'}
                        </div>
                      </td>
                      <td>
                          <span className="badge rounded-pill text-bg-light">
                            {t.category || 'Uncategorized'}
                          </span>
                      </td>
                      <td className={`text-end fw-semibold ${t.is_income ? 'text-success' : 'text-danger'}`}>
                        {t.is_income ? '+' : '-'}{formatMoney(t.amount)}
                      </td>
                      <td className="text-end action-cell">
                        <button
                          className="delete-icon-btn"
                          onClick={() => deleteTransaction(t)}
                        >
                          <i className="bi bi-trash"></i>
                        </button>
                      </td>
                    </tr>
                  ))}
                  </tbody>
                </table>
              </div>
            </div>
          ))}

          {sorted.length === 0 && (
            <div className="text-muted">No transactions yet.</div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Transactions;