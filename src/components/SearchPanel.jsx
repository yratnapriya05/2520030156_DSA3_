import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { CITIES } from '../data/trips';
import { todayISO } from '../utils/format';
import { parsePassengerCount, searchPassengerMax, validateSearch } from '../utils/validate';
import { useApp } from '../context/AppContext';

export default function SearchPanel({ compact = false, defaults }) {
  const navigate = useNavigate();
  const { search, setSearch, showToast } = useApp();
  const [form, setForm] = useState({
    from: defaults?.from || 'Hyderabad',
    to: defaults?.to || 'Bangalore',
    date: defaults?.date || todayISO(),
    passengers: parsePassengerCount(defaults?.passengerCount ?? defaults?.passengers, 1),
    type: defaults?.type || 'bus',
  });
  const [errors, setErrors] = useState({});

  const passengerMax = Math.min(20, searchPassengerMax(form.type));
  const passengerChoices = Array.from({ length: passengerMax }, (_, i) => i + 1);

  const onChange = (e) => {
    const { name, value } = e.target;
    const parsed = name === 'passengers' ? parsePassengerCount(value, 1) : value;
    setForm((prev) => {
      const next = { ...prev, [name]: parsed };
      if (name === 'type') {
        const cap = Math.min(20, searchPassengerMax(parsed));
        if (Number(next.passengers) > cap) next.passengers = cap;
      }
      if (name === 'passengers' || name === 'type') {
        const count = parsePassengerCount(next.passengers, 1);
        setSearch({
          ...(search || {}),
          ...next,
          passengers: count,
          passengerCount: count,
        });
      }
      return next;
    });
  };

  const onSubmit = (e) => {
    e.preventDefault();
    const nextErrors = validateSearch(form);
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length) {
      showToast('Please correct the search form.', 'error');
      return;
    }
    const count = parsePassengerCount(form.passengers, 1);
    const payload = { ...form, passengers: count, passengerCount: count };
    setSearch(payload);
    navigate('/results');
  };

  return (
    <section className="search-panel">
      <h2>Search Your Journey</h2>
      <form className="search-grid" onSubmit={onSubmit}>
        <div className="field">
          <label htmlFor="from">From</label>
          <select id="from" name="from" value={form.from} onChange={onChange}>
            {CITIES.map((city) => (
              <option key={city}>{city}</option>
            ))}
          </select>
          {errors.from && <div className="field-error">{errors.from}</div>}
        </div>
        <div className="field">
          <label htmlFor="to">To</label>
          <select id="to" name="to" value={form.to} onChange={onChange}>
            {CITIES.map((city) => (
              <option key={city}>{city}</option>
            ))}
          </select>
          {errors.to && <div className="field-error">{errors.to}</div>}
        </div>
        <div className="field">
          <label htmlFor="date">Date</label>
          <input id="date" type="date" name="date" min={todayISO()} value={form.date} onChange={onChange} />
          {errors.date && <div className="field-error">{errors.date}</div>}
        </div>
        <div className="field">
          <label htmlFor="passengers">Passengers</label>
          <select id="passengers" name="passengers" value={form.passengers} onChange={onChange}>
            {passengerChoices.map((n) => (
              <option key={n} value={n}>
                {n} {n === 1 ? 'passenger' : 'passengers'}
              </option>
            ))}
          </select>
          {errors.passengers && <div className="field-error">{errors.passengers}</div>}
        </div>
        <div className="field">
          <label htmlFor="type">Transport Type</label>
          <select id="type" name="type" value={form.type} onChange={onChange}>
            <option value="all">All</option>
            <option value="bus">Bus</option>
            <option value="flight">Flight</option>
            <option value="train">Train</option>
          </select>
        </div>
        <button className="btn btn-primary" type="submit">
          Search Trips
        </button>
      </form>
      {compact ? null : (
        <p className="muted" style={{ marginTop: 12, fontSize: 13 }}>
          Try Hyderabad → Bangalore on today&apos;s date for bus, flight and train results.
        </p>
      )}
    </section>
  );
}
