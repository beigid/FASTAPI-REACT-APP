import React from 'react';

const Navbar = ({ token, onLogout }) => {
  return (
    <nav className='navbar navbar-dark bg-primary mb-3'>
      <div className='container-fluid'>
        <span className="navbar-brand">Finance App</span>
        {token && (
          <button className="btn btn-outline-light" onClick={onLogout}>
            Logout
          </button>
        )}
      </div>
    </nav>
  )
};

export default Navbar