import { TransportIcon } from './Icons';
import { formatINR } from '../utils/format';

export default function TripCard({ trip, available, onSelect }) {
  return (
    <article className="card trip-card">
      <div className="trip-icon">
        <TransportIcon type={trip.type} />
      </div>
      <div>
        <div className="route-title">
          {trip.from} → {trip.to}
        </div>
        <div style={{ fontWeight: 700, marginTop: 4 }}>{trip.operator}</div>
        <div className="trip-meta">
          <span>
            {trip.departure} — {trip.arrival}
          </span>
          <span>{trip.duration}</span>
          <span className="stars">★ {trip.rating}</span>
          <span>{available} seats available</span>
        </div>
      </div>
      <div style={{ textAlign: 'right' }}>
        <div className="price">{formatINR(trip.price)}</div>
        <button className="btn btn-primary" type="button" onClick={onSelect} style={{ marginTop: 10 }}>
          Select Seats
        </button>
      </div>
    </article>
  );
}
