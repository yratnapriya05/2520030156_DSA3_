import { formatINR } from '../utils/format';

export default function BookingSummary({ trip, date, seats, passengers, fare, onContinue, continueLabel = 'Continue' }) {
  const passengerCount = Array.isArray(passengers) ? passengers.length : Number(passengers) || 0;
  return (
    <aside className="card summary">
      <h3>Booking Summary</h3>
      <div style={{ fontWeight: 800 }}>
        {trip.from} → {trip.to}
      </div>
      <p className="muted" style={{ fontSize: 13, marginTop: 4 }}>
        {date} · {trip.departure} – {trip.arrival}
      </p>
      <div className="summary-row">
        <span>Passengers</span>
        <strong>{passengerCount}</strong>
      </div>
      <div className="summary-row">
        <span>Seats</span>
        <strong>{seats.length ? seats.join(', ') : '—'}</strong>
      </div>
      <div className="summary-row">
        <span>Base fare</span>
        <span>{formatINR(fare.base)}</span>
      </div>
      <div className="summary-row">
        <span>Taxes</span>
        <span>{formatINR(fare.taxes)}</span>
      </div>
      <div className="summary-row summary-total">
        <span>Total</span>
        <span>{formatINR(fare.total)}</span>
      </div>
      {onContinue && (
        <button className="btn btn-primary btn-block" type="button" onClick={onContinue} style={{ marginTop: 12 }}>
          {continueLabel}
        </button>
      )}
    </aside>
  );
}
