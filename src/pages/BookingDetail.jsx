import { Link, useNavigate, useParams } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { formatINR, transportLabel } from '../utils/format';
import { downloadTicket } from '../utils/ticket';

export default function BookingDetail() {
  const { bookingId } = useParams();
  const { bookingList, cancelBooking, setModal, showToast } = useApp();
  const booking = bookingList.search(bookingId);
  const navigate = useNavigate();

  if (!booking) {
    return (
      <section className="section">
        <div className="container card empty">
          <h3>Invalid booking search</h3>
          <p>No record exists for this ID.</p>
          <Link to="/bookings" className="btn btn-ghost" style={{ marginTop: 12 }}>
            Back
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
        <article className="ticket">
          <div className="ticket-band">
            <span>VOYAGE E-TICKET</span>
            <span>{booking.id}</span>
          </div>
          <div className="ticket-body">
            <span className={`status ${booking.status}`}>{booking.status}</span>
            <div className="ticket-route" style={{ marginTop: 10 }}>
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
                <div className="label">Transportation</div>
                <div>
                  {transportLabel(booking.type)} · {booking.operator}
                </div>
              </div>
              <div>
                <div className="label">Date / Time</div>
                <div>
                  {booking.date} · {booking.departure}
                </div>
              </div>
              <div>
                <div className="label">Seats</div>
                <div>{booking.seats.join(', ')}</div>
              </div>
              <div>
                <div className="label">Amount</div>
                <div>{formatINR(booking.total)}</div>
              </div>
              <div>
                <div className="label">Payment</div>
                <div>{booking.paymentMethod}</div>
              </div>
            </div>
          </div>
        </article>
        <div className="actions" style={{ justifyContent: 'center' }}>
          <button className="btn btn-primary" type="button" onClick={() => downloadTicket(booking)}>
            Download Ticket
          </button>
          {booking.status === 'Confirmed' && (
            <button
              className="btn btn-danger"
              type="button"
              onClick={() =>
                setModal({
                  title: 'Cancel booking',
                  message: 'Are you sure you want to cancel this booking?',
                  onConfirm: () => {
                    const result = cancelBooking(booking.id);
                    if (result.ok) {
                      showToast('Booking cancelled successfully.');
                      navigate('/bookings');
                    }
                  },
                })
              }
            >
              Cancel Booking
            </button>
          )}
          <Link className="btn btn-ghost" to="/bookings">
            All bookings
          </Link>
        </div>
      </div>
    </section>
  );
}
