import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { createSeatArray, countByStatus, SEAT_STATUS, getSeatById, createIndexMap } from '../dsa/SeatArray';
import { binarySearchByBookingId, linearSearchFirst } from '../dsa/Search';
import { MERGE_SORT_META, sortById } from '../dsa/Sort';

export default function DsaAnalysis() {
  const { bookings, queueItems, processQueue, showToast, seatMaps } = useApp();
  const [lookupId, setLookupId] = useState(bookings[0]?.id || '');

  const sampleSeats = useMemo(() => {
    const keys = Object.keys(seatMaps);
    if (keys.length) return seatMaps[keys[0]];
    return createSeatArray('bus', 'demo-seed');
  }, [seatMaps]);

  const indexMap = useMemo(() => createIndexMap(sampleSeats), [sampleSeats]);
  const sampleSeat = getSeatById(sampleSeats, sampleSeats[0]?.id, indexMap);

  const sorted = useMemo(() => sortById(bookings), [bookings]);
  const binary = lookupId ? binarySearchByBookingId(sorted, lookupId.trim()) : { item: null, index: -1 };
  const linear = lookupId
    ? linearSearchFirst(bookings, (b) => b.id === lookupId.trim())
    : { item: null, index: -1 };

  return (
    <section className="section">
      <div className="container">
        <h2>DSA Analysis</h2>
        <p className="muted" style={{ marginBottom: 18 }}>
          Structures used in this project are real classes and algorithms, not placeholders. Live snapshots update as you
          book and cancel.{' '}
          <Link to="/dsa-algorithms">Open DSA Algorithms</Link> for source mapping and faculty demos.
        </p>
        <div className="dsa-grid">
          <article className="card dsa-card">
            <h3>Array</h3>
            <p className="muted">Purpose: Seat representation. Each trip-date stores an array of seat objects.</p>
            <div className="complexity">Access → O(1) via index map</div>
          </article>
          <article className="card dsa-card">
            <h3>Linked List</h3>
            <p className="muted">Purpose: Dynamic booking records. insert() at tail, search/delete by id.</p>
            <div className="complexity">Insertion → O(1) at tail pointer</div>
          </article>
          <article className="card dsa-card">
            <h3>Queue</h3>
            <p className="muted">Purpose: Waiting / booking requests when Select Seats or waitlist is used.</p>
            <div className="complexity">Enqueue → O(1) · Dequeue → O(1) amortized</div>
          </article>
          <article className="card dsa-card">
            <h3>Searching</h3>
            <p className="muted">Purpose: Find bookings and trips. My Bookings uses linear search while typing.</p>
            <div className="complexity">Linear Search → O(n) · Binary Search → O(log n) on sorted IDs</div>
          </article>
          <article className="card dsa-card">
            <h3>Sorting</h3>
            <p className="muted">
              Purpose: Organize booking records. Algorithm: {MERGE_SORT_META.name} ({MERGE_SORT_META.time}, space{' '}
              {MERGE_SORT_META.space}, stable).
            </p>
            <div className="complexity">sortByName / sortByDate / sortById</div>
          </article>
        </div>

        <h3 style={{ marginTop: 28 }}>Live: Seat array</h3>
        <div className="card live-box">
          <p className="muted">
            {sampleSeats.length} seats · available {countByStatus(sampleSeats, SEAT_STATUS.AVAILABLE)} · booked{' '}
            {countByStatus(sampleSeats, SEAT_STATUS.BOOKED)}
          </p>
          <p>
            O(1) sample access: {sampleSeat?.id} → {sampleSeat?.status}
          </p>
          {sampleSeats.slice(0, 24).map((s) => (
            <span className="chip" key={s.id}>
              {s.id}:{s.status[0]}
            </span>
          ))}
        </div>

        <h3 style={{ marginTop: 28 }}>Live: Booking linked list</h3>
        <div className="card live-box">
          {bookings.length === 0 ? (
            <p className="muted">List is empty. Confirm a booking to insert a node.</p>
          ) : (
            bookings.map((b, i) => (
              <div key={b.id}>
                Node {i + 1}: {b.id} → {b.from}-{b.to} [{b.status}] · seats {(b.seats || []).join(', ')} ·{' '}
                {b.passengerCount || (b.passengers || []).length || 0} passenger
                {(b.passengerCount || (b.passengers || []).length || 0) === 1 ? '' : 's'}
              </div>
            ))
          )}
        </div>

        <h3 style={{ marginTop: 28 }}>Live: Booking queue</h3>
        <div className="card live-box">
          {queueItems.length === 0 ? (
            <p className="muted">Queue is empty. Click Select Seats on a result to enqueue a request.</p>
          ) : (
            queueItems.map((item, i) => {
              const n = Number(item.passengers) || 1;
              return (
                <div key={`${item.queuedAt}-${i}`}>
                  {i === 0 ? 'HEAD' : i} · {item.kind} · {item.route} · {item.date} · {n} passenger
                  {n === 1 ? '' : 's'}
                </div>
              );
            })
          )}
          <button
            className="btn btn-ghost"
            type="button"
            style={{ marginTop: 10 }}
            onClick={() => {
              const item = processQueue();
              showToast(item ? `Dequeued ${item.kind} for ${item.route}` : 'Queue is empty.', item ? 'success' : 'error');
            }}
          >
            Dequeue next request
          </button>
        </div>

        <h3 style={{ marginTop: 28 }}>Live: Search (linear + binary)</h3>
        <div className="card" style={{ padding: 16 }}>
          <div className="field">
            <label>Booking ID</label>
            <input value={lookupId} onChange={(e) => setLookupId(e.target.value)} placeholder="BK2026…" />
          </div>
          <p style={{ marginTop: 10 }}>
            Linear search index: {linear.index} {linear.item ? `found ${linear.item.id}` : '(not found)'}
          </p>
          <p>
            Binary search (after merge sort by id) index: {binary.index}{' '}
            {binary.item ? `found ${binary.item.id}` : '(not found — data is sorted by id first)'}
          </p>
        </div>
      </div>
    </section>
  );
}
