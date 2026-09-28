import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { getTripById } from '../data/trips';
import { computeFare, formatINR } from '../utils/format';
import { attachSeatsToPassengers, passengerDetailList } from '../utils/validate';
import { uniqueSeatIds } from '../dsa/SeatArray';

const METHODS = [
  { id: 'upi', label: 'UPI', hint: 'Pay with any UPI app (demo)' },
  { id: 'card', label: 'Card', hint: 'Visa, Mastercard, RuPay (demo)' },
  { id: 'netbanking', label: 'Net Banking', hint: 'All major banks (demo)' },
];

export default function Payment() {
  const { draft, confirmBooking, showToast } = useApp();
  const navigate = useNavigate();
  const trip = draft ? getTripById(draft.tripId) : null;
  const [method, setMethod] = useState('upi');
  const [loading, setLoading] = useState(false);

  const seats = uniqueSeatIds(draft?.seats);
  const passengerList = attachSeatsToPassengers(passengerDetailList(draft), seats);
  if (!draft || !trip || passengerList.length === 0 || passengerList.length !== seats.length) {
    return (
      <section className="section">
        <div className="container card empty">
          <h3>Nothing to pay</h3>
          <p>Complete seat selection and passenger details first.</p>
        </div>
      </section>
    );
  }

  const fare = computeFare(trip.price, seats.length);

  const pay = () => {
    setLoading(true);
    setTimeout(() => {
      const result = confirmBooking({
        trip,
        date: draft.date,
        seats,
        passengers: passengerList,
        paymentMethod: method,
      });
      setLoading(false);
      if (!result.ok && result.error === 'duplicate') {
        showToast(`A confirmed booking already exists (${result.existingId}).`, 'error');
        return;
      }
      if (!result.ok && result.error === 'mismatch') {
        showToast('Seat count must match the number of passengers.', 'error');
        navigate(`/seats/${trip.id}`);
        return;
      }
      if (!result.ok && result.error === 'seats') {
        showToast('One or more seats were just booked. Please select again.', 'error');
        navigate(`/seats/${trip.id}`);
        return;
      }
      if (!result.ok) {
        showToast('Could not complete booking.', 'error');
        return;
      }
      showToast('Payment successful.');
      navigate(`/confirmation/${result.booking.id}`);
    }, 1200);
  };

  return (
    <section className="section">
      <div className="container" style={{ maxWidth: 640 }}>
        <h2>Demo payment</h2>
        <p className="muted">No real payment gateway is connected. Choose a method and confirm.</p>
        <div className="card" style={{ padding: 22, marginTop: 18 }}>
          {loading ? (
            <div style={{ padding: 32, textAlign: 'center' }}>
              <div className="spinner" />
              <p className="muted" style={{ marginTop: 12 }}>
                Processing payment…
              </p>
            </div>
          ) : (
            <>
              <div className="pay-options">
                {METHODS.map((m) => (
                  <label key={m.id} className={`pay-option ${method === m.id ? 'active' : ''}`}>
                    <input type="radio" name="pay" checked={method === m.id} onChange={() => setMethod(m.id)} />
                    <div>
                      <strong>{m.label}</strong>
                      <div className="muted" style={{ fontSize: 13 }}>
                        {m.hint}
                      </div>
                    </div>
                  </label>
                ))}
              </div>
              <div className="summary-row summary-total">
                <span>Amount payable</span>
                <span>{formatINR(fare.total)}</span>
              </div>
              <button className="btn btn-primary btn-block" type="button" onClick={pay} style={{ marginTop: 16 }}>
                Pay & Confirm Booking
              </button>
            </>
          )}
        </div>
      </div>
    </section>
  );
}
