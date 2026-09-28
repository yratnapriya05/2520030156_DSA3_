import { useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { searchBookings } from '../dsa/Search';
import { sortByDate, sortByName } from '../dsa/Sort';
import { formatINR, transportLabel } from '../utils/format';

export default function MyBookings() {
  const { bookings, cancelBooking, setModal, showToast } = useApp();
  const [query, setQuery] = useState('');
  const [sort, setSort] = useState('date');
  const navigate = useNavigate();

  const filtered = useMemo(() => {
    const found = searchBookings(bookings, query);
    return sort === 'name' ? sortByName(found) : sortByDate(found);
  }, [bookings, query, sort]);

  const requestCancel = (booking) => {
    setModal({
      title: 'Cancel booking',
      message: 'Are you sure you want to cancel this booking?',
      onConfirm: () => {
        const result = cancelBooking(booking.id);
        if (result.ok) showToast('Booking cancelled successfully.');
        else if (result.error === 'already') showToast('This booking is already cancelled.', 'error');
        else showToast('Booking could not be cancelled.', 'error');
      },
    });
  };

  return (
    <section className="section">
      <div className="container">
        <h2>My Bookings</h2>
        <div className="bookings-search">
          <span className="search-ico">🔍</span>
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search bookings… ID, passenger, destination or seat"
          />
        </div>
        <div className="field" style={{ maxWidth: 220, marginBottom: 16 }}>
          <label>Sort</label>
          <select value={sort} onChange={(e) => setSort(e.target.value)}>
            <option value="date">By date (merge sort)</option>
            <option value="name">By passenger name (merge sort)</option>
          </select>
        </div>
        {filtered.length === 0 ? (
          <div className="card empty">
            <h3>No bookings found</h3>
            <p>
              {bookings.length === 0
                ? 'You have not booked a trip yet.'
                : 'Nothing matches this search. Try a booking ID, name, city or seat number.'}
            </p>
          </div>
        ) : (
          filtered.map((b) => (
            <article className="card booking-card" key={b.id}>
              <div>
                <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
                  <strong>{b.id}</strong>
                  <span className={`status ${b.status}`}>{b.status}</span>
                </div>
                <div className="route-title" style={{ marginTop: 6 }}>
                  {b.from} → {b.to}
                </div>
                <div className="trip-meta">
                  <span>{b.date}</span>
                  <span>{transportLabel(b.type)}</span>
                  <span>
                    {(b.passengers || []).length || b.passengerCount || b.seats.length} passenger
                    {((b.passengers || []).length || b.passengerCount || b.seats.length) === 1 ? '' : 's'}
                  </span>
                  <span>Seats {(b.seats || []).join(', ')}</span>
                  <span>
                    {(b.passengers || [])
                      .map((p, i) => `${p.name}${p.seat || b.seats?.[i] ? ` (${p.seat || b.seats[i]})` : ''}`)
                      .join(' · ') || '—'}
                  </span>
                  <span>{formatINR(b.total)}</span>
                </div>
              </div>
              <div className="actions">
                <button className="btn btn-ghost" type="button" onClick={() => navigate(`/bookings/${b.id}`)}>
                  View
                </button>
                {b.status === 'Confirmed' && (
                  <button className="btn btn-danger" type="button" onClick={() => requestCancel(b)}>
                    Cancel Booking
                  </button>
                )}
              </div>
            </article>
          ))
        )}
        <p className="muted" style={{ marginTop: 8 }}>
          Search uses linear scan of the booking linked list. Sorting uses merge sort.
        </p>
        <Link to="/" className="btn btn-primary" style={{ marginTop: 12 }}>
          Book a trip
        </Link>
      </div>
    </section>
  );
}
