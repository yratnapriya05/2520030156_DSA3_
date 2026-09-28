import { useNavigate } from 'react-router-dom';
import SearchPanel from '../components/SearchPanel';
import { useApp } from '../context/AppContext';
import { todayISO } from '../utils/format';

export default function Home() {
  const navigate = useNavigate();
  const { setSearch } = useApp();

  const book = (type) => {
    setSearch({
      from: 'Hyderabad',
      to: 'Bangalore',
      date: todayISO(),
      passengers: 1,
      passengerCount: 1,
      type,
    });
    navigate('/results');
  };

  return (
    <>
      <section className="hero">
        <div className="container">
          <h1>Find your journey. Choose your seat. Travel comfortably.</h1>
          <p className="lead">
            Select your preferred transportation, explore available seats and complete your booking in a few simple
            steps.
          </p>
          <div className="mode-grid">
            <article className="mode-card">
              <div>
                <div className="mode-icon">🚌</div>
                <h3>Bus</h3>
                <p>City-to-city coaches with 2+1 seating, live availability and operator ratings.</p>
              </div>
              <button className="btn btn-primary" type="button" onClick={() => book('bus')}>
                Book Now
              </button>
            </article>
            <article className="mode-card">
              <div>
                <div className="mode-icon">✈️</div>
                <h3>Flight</h3>
                <p>Short-haul aircraft maps with aisle between C and D, just like a real cabin.</p>
              </div>
              <button className="btn btn-primary" type="button" onClick={() => book('flight')}>
                Book Now
              </button>
            </article>
            <article className="mode-card">
              <div>
                <div className="mode-icon">🚆</div>
                <h3>Train</h3>
                <p>Coach berths with lower, middle, upper and side seats you can actually reserve.</p>
              </div>
              <button className="btn btn-primary" type="button" onClick={() => book('train')}>
                Book Now
              </button>
            </article>
          </div>
        </div>
      </section>
      <div className="container">
        <SearchPanel />
      </div>
      <section className="section">
        <div className="container">
          <h2>Why travellers use Voyage</h2>
          <p className="muted" style={{ margin: '8px 0 20px' }}>
            Built as a complete booking product: search, seat arrays, payments (demo) and cancellations that release seats.
          </p>
          <div className="dsa-grid">
            <article className="card dsa-card">
              <h3>Real seat maps</h3>
              <p className="muted">Every seat is generated from an array. Booked seats stay disabled after refresh.</p>
            </article>
            <article className="card dsa-card">
              <h3>Transparent fares</h3>
              <p className="muted">Base fare plus 5% tax, totaled live as you pick seats.</p>
            </article>
            <article className="card dsa-card">
              <h3>Cancellable tickets</h3>
              <p className="muted">Cancel from My Bookings and those seats return to available immediately.</p>
            </article>
          </div>
        </div>
      </section>
    </>
  );
}
