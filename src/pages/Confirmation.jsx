import { Link, useParams } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { formatINR, transportLabel } from '../utils/format';
import { downloadTicket } from '../utils/ticket';

export default function Confirmation() {
  const { bookingId } = useParams();
  const { bookingList } = useApp();
  const booking = bookingList.search(bookingId);

  if (!booking) {
    return (
      <section className="section">
        <div className="container card empty">
          <h3>Booking not found</h3>
          <p>We could not find this booking id.</p>
          <Link to="/bookings" className="btn btn-primary" style={{ marginTop: 16 }}>
            My Bookings
          </Link>
        </div>
      </section>
    );
  }

  const roster = (booking.passengers || []).map((p, i) => ({
    name: p.name,
    seat: p.seat || booking.seats?.[i],
  }));

  return (
    <section className="section">
      <div className="container">
        <div className="success-hero">
          <div className="check">✓</div>
          <h2>Booking Confirmed</h2>
          <p className="muted">Your e-ticket is ready. Keep the booking ID for support.</p>
        </div>
        <article className="ticket">
          <div className="ticket-band">
            <span>VOYAGE E-TICKET</span>
            <span>{booking.id}</span>
          </div>
          <div className="ticket-body">
            <div className="muted">
              {transportLabel(booking.type)} · {booking.operator}
            </div>
            <div className="ticket-route">
              {booking.from} → {booking.to}
            </div>
            <div className="ticket-grid">
              <div style={{ gridColumn: '1 / -1' }}>
                <div className="label">Passengers &amp; seats</div>
                <ul className="passenger-roster">
                  {roster.map((row, i) => (
                    <li key={`${row.seat}-${i}`}>
                      Passenger {i + 1}: {row.name} · Seat {row.seat || '—'}
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <div className="label">Date</div>
                <div>{booking.date}</div>
              </div>
              <div>
                <div className="label">Time</div>
                <div>
                  {booking.departure} – {booking.arrival}
                </div>
              </div>
              <div>
                <div className="label">All seat numbers</div>
                <div>{(booking.seats || []).join(', ')}</div>
              </div>
              <div>
                <div className="label">Transportation</div>
                <div>{transportLabel(booking.type)}</div>
              </div>
              <div>
                <div className="label">Total Amount</div>
                <div>{formatINR(booking.total)}</div>
              </div>
            </div>
          </div>
        </article>
        <div className="actions" style={{ justifyContent: 'center' }}>
          <Link className="btn btn-dark" to={`/bookings/${booking.id}`}>
            View Booking
          </Link>
          <button className="btn btn-primary" type="button" onClick={() => downloadTicket(booking)}>
            Download Ticket
          </button>
          <Link className="btn btn-ghost" to="/">
            Back to Home
          </Link>
        </div>
      </div>
    </section>
  );
}
