import { useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { getTripById } from '../data/trips';
import { useApp } from '../context/AppContext';
import SeatMap from '../components/SeatMap';
import BookingSummary from '../components/BookingSummary';
import { computeFare } from '../utils/format';
import { countByStatus, SEAT_STATUS, uniqueSeatIds } from '../dsa/SeatArray';
import {
  parsePassengerCount,
  resolvePassengerCount,
  tooFewSeatsMessage,
  tooManySeatsMessage,
} from '../utils/validate';

export default function SeatSelection() {
  const { tripId } = useParams();
  const navigate = useNavigate();
  const { search, setSearch, getSeats, setDraft, showToast, seatMaps } = useApp();
  const trip = getTripById(tripId);
  const [selected, setSelected] = useState([]);

  const seats = useMemo(() => {
    if (!trip || !search) return [];
    return getSeats(trip.id, search.date, trip.type);
  }, [trip, search, getSeats, seatMaps]);

  const available = countByStatus(seats, SEAT_STATUS.AVAILABLE);
  const passengerCount = resolvePassengerCount(search);

  if (!search) {
    return (
      <section className="section">
        <div className="container card empty">
          <h3>Missing search details</h3>
          <p>Please search for a trip first.</p>
        </div>
      </section>
    );
  }

  if (!trip) {
    return (
      <section className="section">
        <div className="container card empty">
          <h3>Trip not found</h3>
          <p>This service is no longer available.</p>
        </div>
      </section>
    );
  }

  const fare = computeFare(trip.price, selected.length);
  const remaining = Math.max(0, passengerCount - selected.length);

  const persistCount = (next) => {
    setSearch({ ...search, passengers: next, passengerCount: next });
  };

  const setPassengerCount = (raw) => {
    const next = parsePassengerCount(raw, 0);
    if (next < 1) return;
    if (available > 0 && next > available) {
      showToast(
        `Only ${available} seat${available === 1 ? '' : 's'} available. You cannot select ${next} passengers.`,
        'error',
      );
      return;
    }
    persistCount(next);
    setSelected((prev) => uniqueSeatIds(prev).slice(0, next));
  };

  const toggle = (seat) => {
    if (seat.status === SEAT_STATUS.BOOKED) {
      showToast('This seat is already booked.', 'error');
      return;
    }
    const current = uniqueSeatIds(selected);
    if (current.includes(seat.id)) {
      setSelected(current.filter((id) => id !== seat.id));
      return;
    }
    if (current.length >= passengerCount) {
      showToast(tooManySeatsMessage(passengerCount), 'error');
      return;
    }
    setSelected(uniqueSeatIds([...current, seat.id]));
  };

  const continueNext = () => {
    const seatsChosen = uniqueSeatIds(selected);
    if (seatsChosen.length < passengerCount) {
      showToast(tooFewSeatsMessage(), 'error');
      return;
    }
    if (seatsChosen.length > passengerCount) {
      showToast(tooManySeatsMessage(passengerCount), 'error');
      return;
    }
    if (available === 0) {
      showToast('No available seats on this trip.', 'error');
      return;
    }
    const bookedIds = new Set(seats.filter((s) => s.status === SEAT_STATUS.BOOKED).map((s) => s.id));
    if (seatsChosen.some((id) => bookedIds.has(id))) {
      showToast('One or more selected seats are unavailable.', 'error');
      return;
    }
    persistCount(passengerCount);
    setDraft({
      tripId: trip.id,
      date: search.date,
      passengerCount,
      seats: seatsChosen,
    });
    navigate('/passengers');
  };

  return (
    <section className="section">
      <div className="container">
        <h2>Choose Your Seats</h2>
        <p className="muted" style={{ margin: '6px 0 20px' }}>
          {trip.from} → {trip.to} · {trip.departure} – {trip.arrival} · {trip.operator}
        </p>
        {available === 0 ? (
          <div className="card empty">
            <h3>No available seats</h3>
            <p>Every seat on this departure is booked. Try another service.</p>
          </div>
        ) : (
          <div className="seat-layout-wrap">
            <div className="card seat-board">
              <div className="seat-count-bar">
                <div className="field" style={{ maxWidth: 220, margin: 0 }}>
                  <label htmlFor="seat-passenger-count">Passengers</label>
                  <select
                    id="seat-passenger-count"
                    value={Math.min(passengerCount, available)}
                    onChange={(e) => setPassengerCount(e.target.value)}
                  >
                    {Array.from({ length: available }, (_, i) => i + 1).map((n) => (
                      <option key={n} value={n}>
                        {n} {n === 1 ? 'passenger' : 'passengers'}
                      </option>
                    ))}
                  </select>
                </div>
                <p className="seat-match-msg">
                  {remaining === 0
                    ? `All ${passengerCount} seats selected.`
                    : `Select ${remaining} more seat${remaining === 1 ? '' : 's'} (${selected.length} of ${passengerCount}).`}
                </p>
              </div>
              <SeatMap type={trip.type} seats={seats} selectedIds={selected} onToggle={toggle} />
            </div>
            <BookingSummary
              trip={trip}
              date={search.date}
              seats={selected}
              passengers={passengerCount}
              fare={fare}
              onContinue={continueNext}
            />
          </div>
        )}
      </div>
    </section>
  );
}
