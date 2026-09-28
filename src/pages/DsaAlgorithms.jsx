import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import CodeViewer from '../components/CodeViewer';
import { BookingLinkedList } from '../dsa/BookingLinkedList';
import {
  SEAT_STATUS,
  countByStatus,
  createSeatArray,
} from '../dsa/SeatArray';
import { binarySearchByBookingId, linearSearchFirst } from '../dsa/Search';
import { MERGE_SORT_META, sortById } from '../dsa/Sort';
import { buildOptimalBST } from '../dsa/OBST';
import {
  binarySearchTrace,
  byBookingId,
  linearSearchTrace,
  mergeSortWithTrace,
} from '../dsa/demoTraces';

import seatArraySource from '../dsa/SeatArray.js?raw';
import linkedListSource from '../dsa/BookingLinkedList.js?raw';
import queueSource from '../dsa/BookingQueue.js?raw';
import searchSource from '../dsa/Search.js?raw';
import sortSource from '../dsa/Sort.js?raw';
import obstSource from '../dsa/OBST.js?raw';
import appContextSource from '../context/AppContext.jsx?raw';

const FACULTY_STEPS = [
  {
    n: 1,
    title: 'Seat Selection',
    detail: 'The trip seat map is an array of seat objects. Selecting a seat updates that index (Available → Selected). Confirming a booking writes Booked.',
    href: '/seats',
    linkLabel: 'Open Search (then pick a trip)',
    to: '/search',
    dsa: 'Array',
  },
  {
    n: 2,
    title: 'Booking Created',
    detail: 'confirmBooking() inserts a node into BookingLinkedList and persists voyage_bookings_v1.',
    to: '/bookings',
    linkLabel: 'Open My Bookings',
    dsa: 'Singly Linked List',
  },
  {
    n: 3,
    title: 'Booking Request',
    detail: 'Clicking Select Seats on Search Results enqueue()s a FIFO request. Waitlist uses the same queue.',
    to: '/results',
    linkLabel: 'Open Search Results',
    dsa: 'Queue',
  },
  {
    n: 4,
    title: 'Booking Records Sorted',
    detail: 'My Bookings and Binary Search first call mergeSort (sortByDate / sortByName / sortById).',
    to: '/bookings',
    linkLabel: 'Open My Bookings',
    dsa: 'Merge Sort',
  },
  {
    n: 5,
    title: 'Booking Search',
    detail: 'Typing in My Bookings runs linearSearch. DSA Analysis / this page run binarySearch after sorting IDs.',
    to: '/bookings',
    linkLabel: 'Open My Bookings',
    dsa: 'Linear / Binary Search',
  },
];

function scrollToId(id) {
  const el = document.getElementById(id);
  if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

function ObstTree({ node }) {
  if (!node) return <span className="muted">—</span>;
  if (node.type === 'dummy') {
    return <div className="bst-dummy">{node.label}</div>;
  }
  return (
    <div className="bst-branch">
      <div className="bst-key">{String(node.key)}</div>
      <div className="bst-kids">
        <ObstTree node={node.left} />
        <ObstTree node={node.right} />
      </div>
    </div>
  );
}

function MatrixTable({ table, n, fromRow = 1, toRow, fromCol = 0, toCol, format = (v) => v }) {
  const rows = [];
  const endRow = toRow ?? n;
  const endCol = toCol ?? n;
  for (let i = fromRow; i <= endRow; i += 1) {
    const cells = [];
    for (let j = fromCol; j <= endCol; j += 1) {
      const raw = table[i] ? table[i][j] : undefined;
      const show = raw === undefined || raw === Number.POSITIVE_INFINITY ? '—' : format(raw);
      cells.push(
        <td key={`${i}-${j}`}>{show}</td>,
      );
    }
    rows.push(
      <tr key={i}>
        <th>{i}</th>
        {cells}
      </tr>,
    );
  }
  const headers = [];
  for (let j = fromCol; j <= endCol; j += 1) headers.push(<th key={j}>{j}</th>);
  return (
    <div className="table-wrap">
      <table className="algo-table compact-table">
        <thead>
          <tr>
            <th />
            {headers}
          </tr>
        </thead>
        <tbody>{rows}</tbody>
      </table>
    </div>
  );
}

export default function DsaAlgorithms() {
  const {
    bookings,
    queueItems,
    enqueueRequest,
    processQueue,
    clearQueue,
    seatMaps,
    draft,
    search,
    showToast,
  } = useApp();

  const [codePanel, setCodePanel] = useState(null);
  const [wherePanel, setWherePanel] = useState(null);
  const [facultyOpen, setFacultyOpen] = useState(false);

  const [llOverride, setLlOverride] = useState(null);
  const [llId, setLlId] = useState('');
  const [llMsg, setLlMsg] = useState('');

  const [linearId, setLinearId] = useState('');
  const [linearRun, setLinearRun] = useState(null);

  const [binaryId, setBinaryId] = useState('');
  const [binaryRun, setBinaryRun] = useState(null);

  const [sortRun, setSortRun] = useState(null);

  const [obstKeys, setObstKeys] = useState('k1, k2, k3, k4');
  const [obstP, setObstP] = useState('0.1, 0.2, 0.4, 0.3');
  const [obstQ, setObstQ] = useState('0.05, 0.1, 0.05, 0.05, 0.1');
  const [obstResult, setObstResult] = useState(null);
  const [obstError, setObstError] = useState('');

  const llNodes = llOverride ?? bookings;
  const sampleBookingId = bookings[0]?.id || '';

  useEffect(() => {
    const id = window.location.hash.replace('#', '');
    if (id) {
      const t = setTimeout(() => scrollToId(id), 80);
      return () => clearTimeout(t);
    }
    return undefined;
  }, []);

  const liveSeats = useMemo(() => {
    const keys = Object.keys(seatMaps);
    let seats;
    let sourceLabel;
    if (search?.from && keys.length) {
      const match = keys.find((k) => k.includes(search.date || '')) || keys[0];
      seats = seatMaps[match];
      sourceLabel = `Persisted map ${match} (localStorage voyage_seats_v1)`;
    } else if (keys.length) {
      seats = seatMaps[keys[0]];
      sourceLabel = `Persisted map ${keys[0]} (localStorage voyage_seats_v1)`;
    } else {
      seats = createSeatArray('bus', 'demo-seed');
      sourceLabel = 'No persisted trip yet — showing the same seeded bus array used when a trip is first opened.';
    }
    const selectedSet = new Set(draft?.seats || []);
    const decorated = seats.map((s) => ({
      ...s,
      display:
        selectedSet.has(s.id) && s.status !== SEAT_STATUS.BOOKED
          ? 'selected'
          : s.status,
    }));
    return { seats: decorated, sourceLabel };
  }, [seatMaps, draft, search]);

  const refreshListFromLive = () => {
    setLlOverride(null);
    setLlMsg('Working copy reset from the live BookingLinkedList.');
  };

  const workingList = () => {
    const list = new BookingLinkedList();
    list.fromArray(llNodes);
    return list;
  };

  const insertLlDemo = () => {
    const list = workingList();
    const id = `DEMO${Date.now().toString().slice(-6)}`;
    list.insert({
      id,
      from: search?.from || 'Demo',
      to: search?.to || 'City',
      status: 'Demo',
      seats: ['—'],
      passengers: [{ name: 'Working-copy node' }],
    });
    setLlOverride(list.toArray());
    setLlMsg(`insert() added ${id} using BookingLinkedList. This copy is not written to localStorage.`);
  };

  const searchLl = () => {
    const list = workingList();
    const target = llId.trim() || sampleBookingId;
    const found = list.search(target);
    setLlMsg(found ? `search() found ${found.id} (${found.from} → ${found.to})` : `search() returned null for ${target || '(empty)'}`);
  };

  const deleteLl = () => {
    const list = workingList();
    const target = llId.trim() || sampleBookingId;
    const ok = list.delete(target);
    setLlOverride(list.toArray());
    setLlMsg(ok ? `delete() removed ${target}. Live tickets are unchanged.` : `delete() did not find ${target}.`);
  };

  const enqueueDemo = () => {
    enqueueRequest({
      kind: 'dsa-demo',
      tripId: 'demo',
      date: search?.date || 'n/a',
      passengers: 1,
      route: search ? `${search.from} → ${search.to}` : 'DSA Algorithms demo request',
    });
    showToast('Enqueued a booking request on the live FIFO queue.', 'success');
  };

  const dequeueLive = () => {
    const item = processQueue();
    showToast(item ? `Dequeued ${item.kind} · ${item.route}` : 'Queue is empty.', item ? 'success' : 'error');
  };

  const runLinear = () => {
    const target = linearId.trim() || sampleBookingId;
    const traced = linearSearchTrace(bookings, target);
    const real = linearSearchFirst(bookings, (b) => b.id === target);
    setLinearRun({ ...traced, realIndex: real.index });
  };

  const runBinary = () => {
    const target = binaryId.trim() || sampleBookingId;
    const unsorted = bookings.map((b) => b.id);
    const sorted = sortById(bookings);
    const traced = binarySearchTrace(sorted, target);
    const real = binarySearchByBookingId(sorted, target);
    setBinaryRun({
      unsorted,
      sortedIds: sorted.map((b) => b.id),
      ...traced,
      realIndex: real.index,
    });
  };

  const runMerge = () => {
    const original = bookings.map((b) => b.id);
    const { sorted, traces } = mergeSortWithTrace(bookings, byBookingId);
    const viaProject = sortById(bookings).map((b) => b.id);
    setSortRun({ original, traces, sorted: sorted.map((b) => b.id), viaProject });
  };

  const parseNums = (text) =>
    text
      .split(/[, ]+/)
      .map((s) => s.trim())
      .filter(Boolean)
      .map(Number);

  const runObst = () => {
    try {
      const keys = obstKeys.split(',').map((s) => s.trim()).filter(Boolean);
      const p = parseNums(obstP);
      const q = parseNums(obstQ);
      if (keys.length < 1) throw new Error('Enter at least one key.');
      if (p.some((n) => Number.isNaN(n)) || q.some((n) => Number.isNaN(n))) {
        throw new Error('Probabilities must be numbers.');
      }
      const result = buildOptimalBST(keys, p, q);
      setObstResult({ ...result, keys, p, q });
      setObstError('');
    } catch (err) {
      setObstResult(null);
      setObstError(err.message || 'Invalid OBST input');
    }
  };

  const openCode = (payload) => {
    setCodePanel(payload);
    setTimeout(() => scrollToId('source-code'), 50);
  };

  const openWhere = (payload) => {
    setWherePanel(payload);
    setTimeout(() => scrollToId('where-used-panel'), 50);
  };

  const cards = [
    {
      id: 'array',
      name: 'Array',
      where: 'Seat maps on Seat Selection; persisted in voyage_seats_v1',
      purpose: 'Each seat is an array element with status available / selected / booked.',
      complexity: 'Access O(1)',
      badge: 'Used in Project',
      course: false,
    },
    {
      id: 'linked-list',
      name: 'Singly Linked List',
      where: 'Confirmed bookings via BookingLinkedList in AppContext',
      purpose: 'Dynamic booking records: insert at tail, search/delete/update by id.',
      complexity: 'Insert O(1) · Search/Delete O(n)',
      badge: 'Used in Project',
      course: false,
    },
    {
      id: 'queue',
      name: 'Queue (FIFO)',
      where: 'Search Results → Select Seats / waitlist (enqueueRequest)',
      purpose: 'Booking and waitlist requests are processed first-in, first-out.',
      complexity: 'Enqueue O(1) · Dequeue O(1) amortized',
      badge: 'Used in Project',
      course: false,
    },
    {
      id: 'linear-search',
      name: 'Linear Search',
      where: 'My Bookings search box; trip filter on Search Results',
      purpose: 'Scan booking/trip records sequentially until a match.',
      complexity: 'O(n)',
      badge: 'Used in Project',
      course: false,
    },
    {
      id: 'merge-sort',
      name: 'Merge Sort',
      where: 'My Bookings sort; DSA Analysis before binary search',
      purpose: 'Stable O(n log n) ordering of booking records.',
      complexity: 'Time O(n log n) · Space O(n)',
      badge: 'Used in Project',
      course: false,
    },
    {
      id: 'binary-search',
      name: 'Binary Search',
      where: 'DSA Analysis after sortById (merge sort)',
      purpose: 'Find a booking ID on the already-sorted list.',
      complexity: 'O(log n)',
      badge: 'Used in Project',
      course: false,
    },
    {
      id: 'obst',
      name: 'OBST',
      where: 'Not in the booking workflow',
      purpose: 'DSA-3 course algorithm (dynamic programming). Separate demo only.',
      complexity: 'O(n³)',
      badge: 'Course Algorithm Demo',
      course: true,
    },
  ];

  return (
    <section className="section">
      <div className="container">
        <div className="dsa-hero-card card">
          <p className="code-kicker">Voyage · Seat Selection System</p>
          <h2>DSA Algorithms Used in Our Project</h2>
          <p className="muted" style={{ marginTop: 8, maxWidth: '62ch' }}>
            Mapping DSA concepts to real Seat Booking System operations
          </p>
          <p className="muted" style={{ marginTop: 10 }}>
            Claims below match the source under <code>src/dsa</code> and <code>src/context/AppContext.jsx</code>.
            OBST is labelled as a course demonstration because it is not called from booking, seats, or search.
          </p>
          <div className="actions" style={{ marginTop: 16 }}>
            <button className="btn btn-dark" type="button" onClick={() => setFacultyOpen((v) => !v)}>
              Faculty Demo Mode
            </button>
            <Link className="btn btn-ghost" to="/dsa">
              Open DSA Analysis
            </Link>
          </div>
        </div>

        {facultyOpen ? (
          <div className="card faculty-panel">
            <h3>Faculty Demo Mode</h3>
            <p className="muted">Walk the booking pipeline in order. Each step is a real module in this app.</p>
            <div className="faculty-steps">
              {FACULTY_STEPS.map((step, i) => (
                <div key={step.n} className="faculty-step">
                  <div className="faculty-n">STEP {step.n}</div>
                  <strong>{step.title}</strong>
                  <div className="chip">{step.dsa}</div>
                  <p className="muted">{step.detail}</p>
                  <Link className="btn btn-ghost" to={step.to}>
                    {step.linkLabel}
                  </Link>
                  {i < FACULTY_STEPS.length - 1 ? <div className="faculty-arrow">↓</div> : null}
                </div>
              ))}
            </div>
          </div>
        ) : null}

        <h3 className="dsa-section-title">DSA Algorithms Used</h3>
        <div className="dsa-grid algo-cards">
          {cards.map((c) => (
            <article className="card dsa-card" key={c.id}>
              <span className={`usage-badge ${c.course ? 'course' : 'used'}`}>{c.badge}</span>
              <h3>{c.name}</h3>
              <p className="muted">
                <strong>Where:</strong> {c.where}
              </p>
              <p className="muted">
                <strong>Purpose:</strong> {c.purpose}
              </p>
              <div className="complexity">{c.complexity}</div>
              <div className="actions" style={{ marginTop: 12 }}>
                <button className="btn btn-ghost" type="button" onClick={() => scrollToId(c.id)}>
                  View Implementation
                </button>
                <button className="btn btn-primary" type="button" onClick={() => scrollToId(`${c.id}-demo`)}>
                  Run Demo
                </button>
                <button
                  className="btn btn-ghost"
                  type="button"
                  onClick={() => {
                    scrollToId(c.id);
                    openWhere(c);
                  }}
                >
                  Where is it used?
                </button>
              </div>
            </article>
          ))}
        </div>

        <h3 className="dsa-section-title">Algorithm Mapping</h3>
        <div className="table-wrap card" style={{ padding: 0, overflow: 'auto' }}>
          <table className="algo-table">
            <thead>
              <tr>
                <th>DSA Concept</th>
                <th>Where Used in Project</th>
                <th>Actual Implementation</th>
                <th>Complexity</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>Array</td>
                <td>Seat management / Seat Selection</td>
                <td>src/dsa/SeatArray.js</td>
                <td>O(1) access</td>
              </tr>
              <tr>
                <td>Singly Linked List</td>
                <td>Booking records (confirm / cancel)</td>
                <td>src/dsa/BookingLinkedList.js</td>
                <td>Insert O(1), Search/Delete O(n)</td>
              </tr>
              <tr>
                <td>Queue</td>
                <td>Select Seats + waitlist requests</td>
                <td>src/dsa/BookingQueue.js</td>
                <td>O(1) enqueue / dequeue</td>
              </tr>
              <tr>
                <td>Linear Search</td>
                <td>My Bookings filter; trip search</td>
                <td>src/dsa/Search.js · linearSearch()</td>
                <td>O(n)</td>
              </tr>
              <tr>
                <td>Merge Sort</td>
                <td>My Bookings sort; sort before binary search</td>
                <td>src/dsa/Sort.js · mergeSort()</td>
                <td>O(n log n) time, O(n) space</td>
              </tr>
              <tr>
                <td>Binary Search</td>
                <td>Lookup on IDs after merge sort (DSA Analysis)</td>
                <td>src/dsa/Search.js · binarySearchByBookingId()</td>
                <td>O(log n)</td>
              </tr>
              <tr>
                <td>OBST</td>
                <td>Not used in booking — course demo only</td>
                <td>src/dsa/OBST.js (demonstration module)</td>
                <td>O(n³)</td>
              </tr>
            </tbody>
          </table>
        </div>

        <div id="where-used-panel">
          {wherePanel ? (
            <div className="card live-box" style={{ marginTop: 18 }}>
              <h3>Where is {wherePanel.name} used?</h3>
              <WhereDetails
                card={wherePanel}
                onCode={openCode}
                sources={{
                  seatArraySource,
                  linkedListSource,
                  queueSource,
                  searchSource,
                  sortSource,
                  obstSource,
                  appContextSource,
                }}
              />
            </div>
          ) : null}
        </div>

        <h3 className="dsa-section-title">Actual Project Usage + Live Demonstrations</h3>

        <article id="array" className="card algo-section">
          <div className="section-head">
            <h3>Seat Array</h3>
            <span className="usage-badge used">Used in Project</span>
          </div>
          <p>
            The seat layout is represented using an array where each seat stores its current state such as Available,
            Selected, or Booked.
          </p>
          <p className="muted">{liveSeats.sourceLabel}</p>
          <div className="complexity">Array Access: O(1)</div>
          <div id="array-demo" className="live-box" style={{ marginTop: 12 }}>
            {liveSeats.seats.slice(0, 48).map((s) => (
              <span className={`chip seat-chip ${s.display}`} key={s.id}>
                Seat {s.label || s.id} → {s.display === 'available' ? 'Available' : s.display === 'booked' ? 'Booked' : 'Selected'}
              </span>
            ))}
            {liveSeats.seats.length > 48 ? (
              <p className="muted">Showing 48 of {liveSeats.seats.length} seats.</p>
            ) : null}
            <p style={{ marginTop: 10 }}>
              Available {liveSeats.seats.filter((s) => s.display === 'available').length}
              {' · '}
              Selected {liveSeats.seats.filter((s) => s.display === 'selected').length}
              {' · '}
              Booked {countByStatus(liveSeats.seats, SEAT_STATUS.BOOKED)}
              {' · '}
              Draft seats {(draft?.seats || []).join(', ') || 'none'}
            </p>
          </div>
          <div className="actions" style={{ marginTop: 12 }}>
            <button
              className="btn btn-ghost"
              type="button"
              onClick={() =>
                openCode({
                  algorithm: 'Array',
                  file: 'src/dsa/SeatArray.js',
                  fn: 'createSeatArray / getSeatById / setSeatStatus',
                  explanation: 'Seat generation and O(1) index-map access used by Seat Selection.',
                  code: seatArraySource,
                })
              }
            >
              View Code
            </button>
            <Link className="btn btn-primary" to="/search">
              Open Seat Selection (search a trip)
            </Link>
          </div>
        </article>

        <article id="linked-list" className="card algo-section">
          <div className="section-head">
            <h3>Singly Linked List</h3>
            <span className="usage-badge used">Used in Project</span>
          </div>
          <p>
            Each confirmed booking is represented as a node containing booking information and a reference to the next
            booking. Live storage: <code>voyage_bookings_v1</code> hydrated into <code>BookingLinkedList</code>.
          </p>
          <div className="complexity">Insert (tail) O(1) · Search O(n) · Delete O(n) · Traverse O(n)</div>
          <div id="linked-list-demo" className="ll-row">
            {llNodes.length === 0 ? (
              <span className="muted">NULL — confirm a booking to insert the first node.</span>
            ) : (
              <>
                {llNodes.map((b) => (
                  <span key={b.id} className="ll-node">
                    <strong>{b.id}</strong>
                    <span className="muted">
                      {b.from}→{b.to} · {b.status}
                    </span>
                  </span>
                ))}
                <span className="ll-null">NULL</span>
              </>
            )}
          </div>
          <p className="muted" style={{ marginTop: 10 }}>
            Live list length: {bookings.length}. Demo insert/delete run on a working copy of the same node class so
            confirmed tickets are not overwritten.
          </p>
          <div className="field" style={{ maxWidth: 320, marginTop: 8 }}>
            <label>Booking ID (search / delete)</label>
            <input value={llId} onChange={(e) => setLlId(e.target.value)} placeholder={sampleBookingId || 'BK…'} />
          </div>
          <div className="actions" style={{ marginTop: 10 }}>
            <button className="btn btn-primary" type="button" onClick={insertLlDemo}>
              Insert Booking
            </button>
            <button className="btn btn-ghost" type="button" onClick={searchLl}>
              Search Booking
            </button>
            <button className="btn btn-danger" type="button" onClick={deleteLl}>
              Delete / Cancel (copy)
            </button>
            <button className="btn btn-ghost" type="button" onClick={refreshListFromLive}>
              Reload live list
            </button>
          </div>
          {llMsg ? <p style={{ marginTop: 8 }}>{llMsg}</p> : null}
          <div className="actions" style={{ marginTop: 12 }}>
            <button
              className="btn btn-ghost"
              type="button"
              onClick={() =>
                openCode({
                  algorithm: 'Singly Linked List',
                  file: 'src/dsa/BookingLinkedList.js',
                  fn: 'insert / search / delete / traverse',
                  explanation: 'Same class AppContext uses in confirmBooking() and cancelBooking().',
                  code: linkedListSource,
                })
              }
            >
              View Code
            </button>
            <Link className="btn btn-primary" to="/bookings">
              Open My Bookings
            </Link>
          </div>
        </article>

        <article id="queue" className="card algo-section">
          <div className="section-head">
            <h3>Queue</h3>
            <span className="usage-badge used">Used in Project</span>
          </div>
          <p>
            First In → First Out. Search Results calls <code>enqueueRequest</code> when you choose Select Seats or when
            a waitlist is created. This is the live queue in localStorage <code>voyage_queue_v1</code> — not a toy
            structure disconnected from booking.
          </p>
          <div className="complexity">Enqueue → O(1) · Dequeue → O(1) amortized</div>
          <div id="queue-demo" className="queue-viz">
            <div className="queue-end">FRONT</div>
            {queueItems.length === 0 ? (
              <span className="muted">empty</span>
            ) : (
              queueItems.map((item, i) => (
                <span className="queue-node" key={`${item.queuedAt}-${i}`}>
                  {item.kind} · {item.route}
                </span>
              ))
            )}
            <div className="queue-end">REAR</div>
          </div>
          <div className="actions" style={{ marginTop: 12 }}>
            <button className="btn btn-primary" type="button" onClick={enqueueDemo}>
              Enqueue Request
            </button>
            <button className="btn btn-ghost" type="button" onClick={dequeueLive}>
              Dequeue Request
            </button>
            <button className="btn btn-danger" type="button" onClick={() => { clearQueue(); showToast('Queue cleared.', 'success'); }}>
              Clear Queue
            </button>
            <button
              className="btn btn-ghost"
              type="button"
              onClick={() =>
                openCode({
                  algorithm: 'Queue',
                  file: 'src/dsa/BookingQueue.js',
                  fn: 'enqueue / dequeue',
                  explanation: 'FIFO queue used by AppContext.enqueueRequest and processQueue.',
                  code: queueSource,
                })
              }
            >
              View Code
            </button>
            <Link className="btn btn-ghost" to="/results">
              Open Search Results
            </Link>
          </div>
        </article>

        <article id="linear-search" className="card algo-section">
          <div className="section-head">
            <h3>Linear Search</h3>
            <span className="usage-badge used">Used in Project</span>
          </div>
          <p>
            Linear Search checks elements sequentially until the required booking is found. My Bookings uses{' '}
            <code>searchBookings()</code> (which calls <code>linearSearch</code>) on the live linked-list array.
          </p>
          <div className="complexity">Time Complexity: O(n)</div>
          <div id="linear-search-demo" className="field" style={{ maxWidth: 360, marginTop: 10 }}>
            <label>Search Booking ID</label>
            <input value={linearId} onChange={(e) => setLinearId(e.target.value)} placeholder={sampleBookingId || 'BK2026…'} />
          </div>
          <div className="actions" style={{ marginTop: 10 }}>
            <button className="btn btn-primary" type="button" onClick={runLinear}>
              Run Linear Search
            </button>
            <button
              className="btn btn-ghost"
              type="button"
              onClick={() =>
                openCode({
                  algorithm: 'Linear Search',
                  file: 'src/dsa/Search.js',
                  fn: 'linearSearch / linearSearchFirst / searchBookings',
                  explanation: 'Production scan used by My Bookings and trip filtering.',
                  code: searchSource,
                })
              }
            >
              View Code
            </button>
            <Link className="btn btn-ghost" to="/bookings">
              Open My Bookings
            </Link>
          </div>
          {linearRun ? (
            <div className="live-box" style={{ marginTop: 12 }}>
              {linearRun.steps.map((s) => (
                <div key={s.index} className={s.hit ? 'step-hit' : ''}>
                  Checking index {s.index} → {s.id}
                  {s.hit ? ' · Found' : ''}
                </div>
              ))}
              <p style={{ marginTop: 8 }}>
                {linearRun.found
                  ? `Found at index ${linearRun.index} (linearSearchFirst agrees: ${linearRun.realIndex})`
                  : 'Booking not found'}
              </p>
            </div>
          ) : (
            <p className="muted" style={{ marginTop: 8 }}>
              {bookings.length ? `${bookings.length} live booking(s) will be scanned.` : 'No bookings yet — search will scan an empty array.'}
            </p>
          )}
        </article>

        <article id="merge-sort" className="card algo-section">
          <div className="section-head">
            <h3>Merge Sort</h3>
            <span className="usage-badge used">Used in Project</span>
          </div>
          <p>
            Booking records are sorted with merge sort before binary search, and on My Bookings (by date or passenger
            name). Algorithm: {MERGE_SORT_META.name} ({MERGE_SORT_META.time}, space {MERGE_SORT_META.space}).
          </p>
          <div id="merge-sort-demo" className="actions" style={{ marginTop: 10 }}>
            <button className="btn btn-primary" type="button" onClick={runMerge}>
              Run Merge Sort on live bookings
            </button>
            <button
              className="btn btn-ghost"
              type="button"
              onClick={() =>
                openCode({
                  algorithm: 'Merge Sort',
                  file: 'src/dsa/Sort.js',
                  fn: 'mergeSort / sortById',
                  explanation: 'Same comparator path DSA Analysis uses before binary search.',
                  code: sortSource,
                })
              }
            >
              View Code
            </button>
            <Link className="btn btn-ghost" to="/bookings">
              Open My Bookings
            </Link>
          </div>
          {sortRun ? (
            <div className="live-box" style={{ marginTop: 12 }}>
              <p>
                <strong>Original:</strong> {sortRun.original.join(', ') || '(empty)'}
              </p>
              {sortRun.traces.map((t, i) => (
                <p key={i}>
                  {t.type === 'divide' && (
                    <>
                      Divide: [{t.values.join(', ')}] → [{t.left.join(', ')}] | [{t.right.join(', ')}]
                    </>
                  )}
                  {t.type === 'merge' && (
                    <>
                      Merge: [{t.left.join(', ')}] + [{t.right.join(', ')}] → [{t.merged.join(', ')}]
                    </>
                  )}
                  {t.type === 'base' && <>Base: [{t.values.join(', ')}]</>}
                </p>
              ))}
              <p>
                <strong>Sorted:</strong> {sortRun.sorted.join(', ') || '(empty)'}
              </p>
              <p className="muted">sortById() result: {sortRun.viaProject.join(', ') || '(empty)'}</p>
            </div>
          ) : (
            <p className="muted" style={{ marginTop: 8 }}>Run the demo to divide and merge the current booking IDs.</p>
          )}
        </article>

        <article id="binary-search" className="card algo-section">
          <div className="section-head">
            <h3>Binary Search</h3>
            <span className="usage-badge used">Used in Project</span>
          </div>
          <p>
            Binary search is used only after booking IDs are sorted with merge sort (<code>sortById</code>), matching
            DSA Analysis. The array must already be ordered by id.
          </p>
          <div className="complexity">Time Complexity: O(log n)</div>
          <div id="binary-search-demo" className="field" style={{ maxWidth: 360, marginTop: 10 }}>
            <label>Search Booking ID</label>
            <input value={binaryId} onChange={(e) => setBinaryId(e.target.value)} placeholder={sampleBookingId || 'BK2026…'} />
          </div>
          <div className="actions" style={{ marginTop: 10 }}>
            <button className="btn btn-primary" type="button" onClick={runBinary}>
              Sort then Run Binary Search
            </button>
            <button
              className="btn btn-ghost"
              type="button"
              onClick={() =>
                openCode({
                  algorithm: 'Binary Search',
                  file: 'src/dsa/Search.js',
                  fn: 'binarySearchByBookingId',
                  explanation: 'Requires a list already sorted by booking id (see Sort.js).',
                  code: searchSource,
                })
              }
            >
              View Code
            </button>
            <Link className="btn btn-ghost" to="/dsa">
              Open DSA Analysis
            </Link>
          </div>
          {binaryRun ? (
            <div className="live-box" style={{ marginTop: 12 }}>
              <p>
                <strong>Unsorted IDs:</strong> {binaryRun.unsorted.join(', ') || '(empty)'}
              </p>
              <p>
                <strong>After merge sort:</strong> {binaryRun.sortedIds.join(', ') || '(empty)'}
              </p>
              {binaryRun.steps.map((s, i) => (
                <div key={i}>
                  Low = {s.low} · High = {s.high} · Mid = {s.mid} · Compare {s.compare} · {s.move}
                </div>
              ))}
              <p style={{ marginTop: 8 }}>
                {binaryRun.found
                  ? `Booking Found at sorted index ${binaryRun.index} (binarySearchByBookingId: ${binaryRun.realIndex})`
                  : 'Booking Not Found'}
              </p>
            </div>
          ) : (
            <p className="muted" style={{ marginTop: 8 }}>The run always sorts with merge sort first, then binary-searches.</p>
          )}
        </article>

        <h3 className="dsa-section-title">Course Algorithm Demonstrations</h3>
        <article id="obst" className="card algo-section">
          <div className="section-head">
            <h3>Course Algorithm – OBST</h3>
            <span className="usage-badge course">Course Algorithm Demonstration – not part of the core booking workflow</span>
          </div>
          <p>
            <strong>Status:</strong> Not directly used in the current booking workflow.
          </p>
          <p className="muted">
            OBST is a DSA-3 course algorithm, but it is not required for the current seat-booking workflow. Search uses
            linear scan and (after sort) binary search on IDs — not an optimal BST of keys.
          </p>
          <div className="complexity">Dynamic Programming · Time O(n³) · Space O(n²)</div>
          <div id="obst-demo" className="form-card" style={{ marginTop: 14, border: 'none', padding: 0 }}>
            <div className="field">
              <label>Keys</label>
              <input value={obstKeys} onChange={(e) => setObstKeys(e.target.value)} />
            </div>
            <div className="field" style={{ marginTop: 8 }}>
              <label>Successful search probabilities (p)</label>
              <input value={obstP} onChange={(e) => setObstP(e.target.value)} />
            </div>
            <div className="field" style={{ marginTop: 8 }}>
              <label>Unsuccessful search probabilities (q)</label>
              <input value={obstQ} onChange={(e) => setObstQ(e.target.value)} />
            </div>
            <div className="actions" style={{ marginTop: 12 }}>
              <button className="btn btn-primary" type="button" onClick={runObst}>
                Generate Optimal BST
              </button>
              <button
                className="btn btn-ghost"
                type="button"
                onClick={() =>
                  openCode({
                    algorithm: 'OBST (course demo)',
                    file: 'src/dsa/OBST.js',
                    fn: 'buildOptimalBST',
                    explanation: 'CLRS DP. Imported only by this page — not by AppContext or booking pages.',
                    code: obstSource,
                  })
                }
              >
                View Code
              </button>
            </div>
            {obstError ? <p className="field-error">{obstError}</p> : null}
            {obstResult ? (
              <div style={{ marginTop: 16 }}>
                <p>
                  Selected Optimal Root: <strong>{String(obstResult.optimalRoot)}</strong> (1-based index{' '}
                  {obstResult.optimalRootIndex})
                </p>
                <p>
                  Total Optimal Cost: <strong>{Number(obstResult.cost).toFixed(4)}</strong>
                </p>
                <h4 style={{ margin: '14px 0 6px' }}>1. Cost Matrix e[i][j]</h4>
                <MatrixTable
                  table={obstResult.costTable}
                  n={obstResult.n}
                  fromRow={1}
                  toRow={obstResult.n + 1}
                  fromCol={0}
                  toCol={obstResult.n}
                  format={(v) => (typeof v === 'number' ? v.toFixed(3) : v)}
                />
                <h4 style={{ margin: '14px 0 6px' }}>2. Root Matrix root[i][j]</h4>
                <MatrixTable
                  table={obstResult.rootTable}
                  n={obstResult.n}
                  fromRow={1}
                  toRow={obstResult.n}
                  fromCol={1}
                  toCol={obstResult.n}
                />
                <h4 style={{ margin: '14px 0 6px' }}>4–5. Final Binary Search Tree</h4>
                <div className="bst-canvas">
                  <ObstTree node={obstResult.tree} />
                </div>
              </div>
            ) : null}
          </div>
        </article>

        <h3 id="source-code" className="dsa-section-title">
          Source Code
        </h3>
        {codePanel ? (
          <CodeViewer {...codePanel} />
        ) : (
          <p className="muted">Use View Code on any algorithm to load the real file from disk (Vite raw import).</p>
        )}
      </div>
    </section>
  );
}

function WhereDetails({ card, onCode, sources }) {
  const map = {
    array: {
      file: 'src/dsa/SeatArray.js',
      fn: 'createSeatArray, getSeatById, setManySeatStatus',
      also: 'src/pages/SeatSelection.jsx, src/context/AppContext.jsx',
      code: sources.seatArraySource,
      to: '/search',
      link: 'Open Search',
    },
    'linked-list': {
      file: 'src/dsa/BookingLinkedList.js',
      fn: 'insert, search, delete, update',
      also: 'src/context/AppContext.jsx · confirmBooking / cancelBooking',
      code: sources.linkedListSource,
      to: '/bookings',
      link: 'Open My Bookings',
    },
    queue: {
      file: 'src/dsa/BookingQueue.js',
      fn: 'enqueue, dequeue',
      also: 'src/pages/SearchResults.jsx · enqueueRequest; src/context/AppContext.jsx',
      code: sources.queueSource,
      to: '/results',
      link: 'Open Search Results',
    },
    'linear-search': {
      file: 'src/dsa/Search.js',
      fn: 'linearSearch, searchBookings, filterTrips',
      also: 'src/pages/MyBookings.jsx, src/pages/SearchResults.jsx',
      code: sources.searchSource,
      to: '/bookings',
      link: 'Open My Bookings',
    },
    'merge-sort': {
      file: 'src/dsa/Sort.js',
      fn: 'mergeSort, sortById, sortByDate, sortByName',
      also: 'src/pages/MyBookings.jsx, src/pages/DsaAnalysis.jsx',
      code: sources.sortSource,
      to: '/dsa',
      link: 'Open DSA Analysis',
    },
    'binary-search': {
      file: 'src/dsa/Search.js',
      fn: 'binarySearchByBookingId',
      also: 'src/pages/DsaAnalysis.jsx (after sortById)',
      code: sources.searchSource,
      to: '/dsa',
      link: 'Open DSA Analysis',
    },
    obst: {
      file: 'src/dsa/OBST.js',
      fn: 'buildOptimalBST',
      also: 'Imported only by src/pages/DsaAlgorithms.jsx — not part of booking.',
      code: sources.obstSource,
      to: '/dsa-algorithms',
      link: 'Stay on this page',
    },
  };
  const info = map[card.id];
  if (!info) return null;
  return (
    <div>
      <p>
        <strong>File:</strong> {info.file}
      </p>
      <p>
        <strong>Function:</strong> {info.fn}
      </p>
      <p className="muted">{info.also}</p>
      <p>{card.purpose}</p>
      <div className="actions" style={{ margin: '10px 0' }}>
        <button
          className="btn btn-ghost"
          type="button"
          onClick={() =>
            onCode({
              algorithm: card.name,
              file: info.file,
              fn: info.fn,
              explanation: info.also,
              code: info.code,
            })
          }
        >
          Show source
        </button>
        <Link className="btn btn-primary" to={info.to}>
          {info.link}
        </Link>
      </div>
    </div>
  );
}
