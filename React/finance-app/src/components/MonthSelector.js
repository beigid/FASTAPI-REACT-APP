import React from 'react';

const MONTHS = [
  'January','February','March','April','May','June',
  'July','August','September','October','November','December'
];

const MonthSelector = ({ selectedMonth, selectedYear, onChange }) => {
  const handlePrev = () => {
    if (selectedMonth === 1) {
      onChange(12, selectedYear - 1);
    } else {
      onChange(selectedMonth - 1, selectedYear);
    }
  };

  const handleNext = () => {
    if (selectedMonth === 12) {
      onChange(1, selectedYear + 1);
    } else {
      onChange(selectedMonth + 1, selectedYear);
    }
  };

  return (
    <div className="month-selector">
      <button className="month-nav-btn" onClick={handlePrev} aria-label="Previous month">
        ‹
      </button>
      <div className="month-label">
        <span className="month-name">{MONTHS[selectedMonth - 1]}</span>
        <span className="month-year">{selectedYear}</span>
      </div>
      <button className="month-nav-btn" onClick={handleNext} aria-label="Next month">
        ›
      </button>
    </div>
  );
};

export default MonthSelector;