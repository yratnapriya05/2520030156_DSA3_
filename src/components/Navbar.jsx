import { NavLink, Link } from 'react-router-dom';
import { useState } from 'react';
import { useApp } from '../context/AppContext';

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const { account } = useApp();

  const close = () => setOpen(false);

  return (
    <header className="navbar">
      <div className="container nav-inner">
        <Link to="/" className="brand" onClick={close}>
          <span className="brand-mark">V</span>
          Voyage
        </Link>
        <button className="hamburger" type="button" aria-label="Menu" onClick={() => setOpen((v) => !v)}>
          <span />
          <span />
          <span />
        </button>
        <nav className={`nav-links ${open ? 'open' : ''}`}>
          <NavLink to="/" end onClick={close}>
            Home
          </NavLink>
          <NavLink to="/search" onClick={close}>
            Search Trips
          </NavLink>
          <NavLink to="/bookings" onClick={close}>
            My Bookings
          </NavLink>
          <NavLink to="/dsa" onClick={close}>
            DSA Analysis
          </NavLink>
          <NavLink to="/dsa-algorithms" onClick={close}>
            DSA Algorithms
          </NavLink>
          <NavLink to="/account" className="nav-account" onClick={close}>
            {account?.name?.split(' ')[0] || 'My Account'}
          </NavLink>
        </nav>
      </div>
    </header>
  );
}
