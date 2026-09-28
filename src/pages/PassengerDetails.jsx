import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { getTripById } from '../data/trips';
import { computeFare } from '../utils/format';
import { uniqueSeatIds } from '../dsa/SeatArray';
import { attachSeatsToPassengers, resolvePassengerCount, validatePassengers } from '../utils/validate';
import BookingSummary from '../components/BookingSummary';

function emptyPassenger() {
  return { name: '', age: '', gender: '', phone: '', email: '', seat: '' };
}

function initialPassengers(draft, account) {
  const seats = uniqueSeatIds(draft?.seats);
  const linked = attachSeatsToPassengers(draft?.passengers, seats);
  return linked.map((p, i) => {
    const base = { ...emptyPassenger(), ...p, seat: seats[i] };
    if (i === 0) {
      return {
        ...base,
        name: base.name || (account?.name === 'Guest Traveller' ? '' : account?.name || ''),
        email: base.email || account?.email || '',
      };
    }
    return base;
  });
}

export default function PassengerDetails() {
  const { draft, setDraft, showToast, account } = useApp();
  const navigate = useNavigate();
  const trip = draft ? getTripById(draft.tripId) : null;
  const seats = uniqueSeatIds(draft?.seats);
  const count = seats.length || resolvePassengerCount(draft);
  const [passengers, setPassengers] = useState(() => initialPassengers(draft, account));
  const [errors, setErrors] = useState([]);

  if (!draft || !trip) {
    return (
      <section className="section">
        <div className="container card empty">
          <h3>Select seats first</h3>
          <p>Passenger details are collected after a seat map selection.</p>
        </div>
      </section>
    );
  }

  const fare = computeFare(trip.price, seats.length);
  const cards =
    passengers.length === seats.length ? passengers : initialPassengers(draft, account);

  const update = (index, field, value) => {
    setPassengers((prev) => {
      const source = prev.length === seats.length ? prev : initialPassengers(draft, account);
      return source.map((p, i) => (i === index ? { ...p, [field]: value } : p));
    });
  };

  const submit = () => {
    const linked = attachSeatsToPassengers(cards, seats);
    if (linked.length !== count || seats.length !== count || linked.length === 0) {
      showToast('Please select seats for all passengers.', 'error');
      return;
    }
    const result = validatePassengers(linked);
    setErrors(result.errors);
    if (!result.valid) {
      showToast('Please complete passenger details.', 'error');
      return;
    }
    setDraft({
      ...draft,
      passengerCount: linked.length,
      seats,
      passengers: linked,
    });
    navigate('/payment');
  };

  return (
    <section className="section">
      <div className="container">
        <h2>Passenger details</h2>
        <p className="muted" style={{ marginBottom: 18 }}>
          Enter details for each traveller. Each passenger is linked to one selected seat.
        </p>
        <div className="seat-layout-wrap">
          <div>
            {cards.map((p, i) => (
              <div className="card form-card" key={p.seat || seats[i] || i}>
                <h3 style={{ marginBottom: 12 }}>
                  Passenger {i + 1} · Seat {p.seat || seats[i]}
                </h3>
                <div className="form-grid">
                  <div className="field">
                    <label>Full Name</label>
                    <input value={p.name} onChange={(e) => update(i, 'name', e.target.value)} />
                    {errors[i]?.name && <div className="field-error">{errors[i].name}</div>}
                  </div>
                  <div className="field">
                    <label>Age</label>
                    <input value={p.age} onChange={(e) => update(i, 'age', e.target.value)} inputMode="numeric" />
                    {errors[i]?.age && <div className="field-error">{errors[i].age}</div>}
                  </div>
                  <div className="field">
                    <label>Gender</label>
                    <select value={p.gender} onChange={(e) => update(i, 'gender', e.target.value)}>
                      <option value="">Select</option>
                      <option>Female</option>
                      <option>Male</option>
                      <option>Other</option>
                    </select>
                    {errors[i]?.gender && <div className="field-error">{errors[i].gender}</div>}
                  </div>
                  <div className="field">
                    <label>Phone Number</label>
                    <input value={p.phone} onChange={(e) => update(i, 'phone', e.target.value)} />
                    {errors[i]?.phone && <div className="field-error">{errors[i].phone}</div>}
                  </div>
                  <div className="field">
                    <label>Email</label>
                    <input value={p.email} onChange={(e) => update(i, 'email', e.target.value)} />
                    {errors[i]?.email && <div className="field-error">{errors[i].email}</div>}
                  </div>
                </div>
              </div>
            ))}
          </div>
          <BookingSummary
            trip={trip}
            date={draft.date}
            seats={seats}
            passengers={count}
            fare={fare}
            onContinue={submit}
            continueLabel="Continue to payment"
          />
        </div>
      </div>
    </section>
  );
}
