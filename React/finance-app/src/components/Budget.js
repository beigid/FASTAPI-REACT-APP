import React, {useState, useEffect, useCallback, useMemo} from 'react';
import { toast } from 'react-toastify';
import api from '../api';

const formatMoney = (n) => {
  const num = Number(n || 0);
  return num.toLocaleString(undefined, { style: 'currency', currency: 'USD' });
};

const Budget = ({ token, selectedMonth, selectedYear, filteredTransactions }) => {
  const [budget, setBudget] = useState(null);
  const [budgetInput, setBudgetInput] = useState('');
  const [loading, setLoading] = useState(true);

  const headers = useMemo(
    () => ({ Authorization: `Bearer ${token}` }),
    [token]
  );

  const fetchBudget = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get('/budget/', {
        headers,
        params: { month: selectedMonth, year: selectedYear }
      });
      setBudget(res.data);
    } catch (err) {
      console.error('Failed to fetch budget', err);
    } finally {
      setLoading(false);
    }
  }, [selectedMonth, selectedYear, headers]);

  useEffect(() => {
    fetchBudget();
  }, [fetchBudget]);

  const handleSetBudget = async () => {
    const amount = parseFloat(budgetInput);
    if (!amount || amount <= 0) return toast.error('Enter a valid amount');
    try {
      await api.post('/budget/', { amount, month: selectedMonth, year: selectedYear }, { headers });
      toast.success('Budget set!');
      setBudgetInput('');
      await fetchBudget();
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Failed to set budget');
    }
  };

  const handleDeleteBudget = async () => {
    if (!window.confirm('Remove budget for this month?')) return;
    try {
      await api.delete(`/budget/${budget.id}`, { headers });
      toast.success('Budget removed');
      setBudget(null);
    } catch (err) {
      toast.error('Failed to delete budget');
    }
  };

  // Calculate totals from filtered transactions
  const { expenses, income } = filteredTransactions.reduce(
    (acc, t) => {
      const amt = Number(t.amount || 0);
      if (t.is_income) acc.income += amt;
      else acc.expenses += amt;
      return acc;
    },
    { expenses: 0, income: 0 }
  );

  const remaining = budget ? budget.amount - expenses + income : null;
  const spentPercent = budget ? Math.min((expenses / budget.amount) * 100, 100) : 0;
  const isOverBudget = remaining !== null && remaining < 0;

  if (loading) {
    return (
      <div className="card border-0 shadow-sm mt-3">
        <div className="card-body text-muted small">Loading budget...</div>
      </div>
    );
  }

  // No budget set yet
  if (!budget) {
    return (
      <div className="card border-0 shadow-sm mt-3">
        <div className="card-body">
          <div className="fw-semibold mb-1">Monthly Budget</div>
          <div className="text-muted small mb-3">No budget set for this month.</div>
          <div className="d-flex gap-2">
            <div className="input-group input-group-sm">
              <span className="input-group-text">$</span>
              <input
                type="number"
                className="form-control"
                placeholder="Enter budget"
                value={budgetInput}
                onChange={(e) => setBudgetInput(e.target.value)}
                min="0"
              />
            </div>
            <button className="btn btn-primary btn-sm text-nowrap" onClick={handleSetBudget}>
              Set Budget
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="card border-0 shadow-sm mt-3">
      <div className="card-body">
        <div className="d-flex justify-content-between align-items-start mb-3">
          <div className="fw-semibold">Monthly Budget</div>
          <button
            className="btn btn-link btn-sm text-danger p-0"
            onClick={handleDeleteBudget}
          >
            <i className="bi bi-trash"></i>
          </button>
        </div>

        <div className="d-flex justify-content-between mb-2">
          <div>
            <div className="text-muted small">Budget</div>
            <div className="fw-semibold">{formatMoney(budget.amount)}</div>
          </div>
          <div className="text-end">
            <div className="text-muted small">Expenses</div>
            <div className="fw-semibold text-danger">{formatMoney(expenses)}</div>
          </div>
          <div className="text-end">
            <div className="text-muted small">Income</div>
            <div className="fw-semibold text-success">{formatMoney(income)}</div>
          </div>
          <div className="text-end">
            <div className="text-muted small">Remaining</div>
            <div className={`fw-semibold ${isOverBudget ? 'text-danger' : 'text-success'}`}>
              {formatMoney(remaining)}
            </div>
          </div>
        </div>

        <div className="progress" style={{ height: 6 }}>
          <div
            className={`progress-bar ${isOverBudget ? 'bg-danger' : 'bg-success'}`}
            style={{ width: `${spentPercent}%`, transition: 'width 0.4s ease' }}
          />
        </div>
        <div className="text-muted small mt-1">
          {spentPercent.toFixed(0)}% of budget spent
        </div>
      </div>
    </div>
  );
};

export default Budget;