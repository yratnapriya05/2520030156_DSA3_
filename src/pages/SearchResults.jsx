import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { TRIPS } from '../data/trips';
import { filterTrips } from '../dsa/Search';
import { useApp } from '../context/AppContext';
import SearchPanel from '../components/SearchPanel';
import TripCard from '../components/TripCard';
import { formatDisplayDate } from '../utils/format';
import { resolvePassengerCount } from '../utils/validate';

export default function SearchResults() {
  const { search, availableCount, enqueueRequest, showToast } = useApp();
  const navigate = useNavigate();

  const passengerCount = resolvePassengerCount(search);

  const results = useMemo(() => {
    if (!search) return [];
    return filterTrips(TRIPS, search);
  }, [search]);

  if (!search) {
    return (
      <section className="section">
        <div className="container">
          <div className="card empty">
            <h3>Start with a search</h3>
            <p>Use the form below to find buses, flights and trains.</p>
          </div>
          <div style={{ marginTop: 20 }}>
            <SearchPanel />
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="section">
      <div className="container">
        <SearchPanel defaults={search} compact />
        <div className="results-toolbar" style={{ marginTop: 28 }}>
          <div>
            <h2>
              {search.from} → {search.to}
            </h2>
            <p className="muted">
              {formatDisplayDate(search.date)} · {passengerCount} passenger
              {passengerCount > 1 ? 's' : ''} · {results.length} trip{results.length === 1 ? '' : 's'}
            </p>
          </div>
        </div>
        {results.length === 0 ? (
          <div className="card empty">
            <h3>No trips found</h3>
            <p>No services match this route, date and transport type. Modify your search and try again.</p>
          </div>
        ) : (
          results.map((trip) => {
            const available = availableCount(trip.id, search.date, trip.type);
            return (
              <TripCard
                key={trip.id}
                trip={trip}
                available={available}
                onSelect={() => {
                  if (available < passengerCount) {
                    enqueueRequest({
                      kind: 'waitlist',
                      tripId: trip.id,
                      date: search.date,
                      passengers: passengerCount,
                      route: `${trip.from} → ${trip.to}`,
                    });
                    showToast(
                      `Only ${available} seat${available === 1 ? '' : 's'} left on this trip. Choose another service or lower the passenger count.`,
                      'error',
                    );
                    return;
                  }
                  enqueueRequest({
                    kind: 'booking',
                    tripId: trip.id,
                    date: search.date,
                    passengers: passengerCount,
                    route: `${trip.from} → ${trip.to}`,
                  });
                  navigate(`/seats/${trip.id}`);
                }}
              />
            );
          })
        )}
      </div>
    </section>
  );
}
