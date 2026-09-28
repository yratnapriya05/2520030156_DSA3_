import { createContext, useContext, useMemo, useRef, useState } from 'react';
import { BookingLinkedList } from '../dsa/BookingLinkedList';
import { BookingQueue } from '../dsa/BookingQueue';
import {
  SEAT_STATUS,
  cloneSeats,
  countByStatus,
  createSeatArray,
  setManySeatStatus,
  uniqueSeatIds,
} from '../dsa/SeatArray';
import { loadJSON, resetAllStorage, saveJSON, STORAGE_KEYS } from '../utils/storage';
import { computeFare, generateBookingId, tripSeatKey } from '../utils/format';
import { getTripById } from '../data/trips';

const AppContext = createContext(null);

const defaultAccount = {
  name: 'Guest Traveller',
  email: 'guest@voyage.demo',
};

function hydrateList() {
  const list = new BookingLinkedList();
  list.fromArray(loadJSON(STORAGE_KEYS.bookings, []));
  return list;
}

function hydrateQueue() {
  const queue = new BookingQueue();
  queue.fromArray(loadJSON(STORAGE_KEYS.queue, []));
  return queue;
}

export function AppProvider({ children }) {
  const [bookingList] = useState(() => hydrateList());
  const [queue] = useState(() => hydrateQueue());
  const [bookings, setBookings] = useState(() => bookingList.toArray());
  const [queueItems, setQueueItems] = useState(() => queue.toArray());
  const [seatMaps, setSeatMaps] = useState(() => loadJSON(STORAGE_KEYS.seats, {}));
  const [search, setSearchState] = useState(() => loadJSON(STORAGE_KEYS.search, null));
  const [draft, setDraftState] = useState(() => loadJSON(STORAGE_KEYS.draft, null));
  const [account, setAccount] = useState(() => loadJSON(STORAGE_KEYS.account, defaultAccount));
  const [toast, setToast] = useState(null);
  const [modal, setModal] = useState(null);
  const seatMapsRef = useRef(seatMaps);
  seatMapsRef.current = seatMaps;

  const persistBookings = (list) => {
    const arr = list.toArray();
    saveJSON(STORAGE_KEYS.bookings, arr);
    setBookings(arr);
  };

  const persistQueue = () => {
    const arr = queue.toArray();
    saveJSON(STORAGE_KEYS.queue, arr);
    setQueueItems(arr);
  };

  const persistSeats = (maps) => {
    saveJSON(STORAGE_KEYS.seats, maps);
    setSeatMaps(maps);
  };

  const showToast = (message, type = 'success') => {
    setToast({ message, type, id: Date.now() });
  };

  const setSearch = (value) => {
    saveJSON(STORAGE_KEYS.search, value);
    setSearchState(value);
  };

  const setDraft = (value) => {
    if (value) saveJSON(STORAGE_KEYS.draft, value);
    else saveJSON(STORAGE_KEYS.draft, null);
    setDraftState(value);
  };

  const getSeats = (tripId, date, type) => {
    const key = tripSeatKey(tripId, date);
    const maps = seatMapsRef.current;
    if (maps[key]) return cloneSeats(maps[key]);
    return createSeatArray(type, key);
  };

  const availableCount = (tripId, date, type) => {
    const seats = getSeats(tripId, date, type);
    return countByStatus(seats, SEAT_STATUS.AVAILABLE);
  };

  const enqueueRequest = (request) => {
    queue.enqueue({
      ...request,
      queuedAt: new Date().toISOString(),
    });
    persistQueue();
  };

  const processQueue = () => {
    const item = queue.dequeue();
    persistQueue();
    return item;
  };

  const clearQueue = () => {
    queue.fromArray([]);
    persistQueue();
  };

  const confirmBooking = ({ trip, date, seats, passengers, paymentMethod }) => {
    const seatIds = uniqueSeatIds(seats);
    const passengerList = Array.isArray(passengers)
      ? passengers.filter((p) => p && typeof p === 'object')
      : [];
    const linked = seatIds.map((seat, i) => ({
      ...(passengerList[i] || {}),
      seat,
    }));
    if (!seatIds.length || linked.length !== seatIds.length || linked.length < 1) {
      return { ok: false, error: 'mismatch' };
    }

    const key = tripSeatKey(trip.id, date);
    const maps = seatMapsRef.current;
    const current = maps[key] || createSeatArray(trip.type, key);
    const conflicting = seatIds.filter((id) => {
      const found = current.find((s) => s.id === id);
      return !found || found.status === SEAT_STATUS.BOOKED;
    });
    if (conflicting.length) {
      return { ok: false, error: 'seats', seats: conflicting };
    }

    const bookedSeats = setManySeatStatus(current, seatIds, SEAT_STATUS.BOOKED);
    persistSeats({ ...maps, [key]: bookedSeats });

    const fare = computeFare(trip.price, seatIds.length);
    const id = generateBookingId(bookingList.toArray().map((b) => b.id));
    const record = {
      id,
      tripId: trip.id,
      type: trip.type,
      operator: trip.operator,
      from: trip.from,
      to: trip.to,
      date,
      departure: trip.departure,
      arrival: trip.arrival,
      duration: trip.duration,
      seats: seatIds,
      passengerCount: linked.length,
      passengers: linked,
      paymentMethod,
      base: fare.base,
      taxes: fare.taxes,
      total: fare.total,
      status: 'Confirmed',
      createdAt: new Date().toISOString(),
    };
    bookingList.insert(record);
    persistBookings(bookingList);

    const waiting = queue.toArray();
    const idx = waiting.findIndex((item) => item.tripId === trip.id && item.date === date);
    if (idx === 0) {
      queue.dequeue();
    } else if (idx > 0) {
      const nextQueue = waiting.filter((_, i) => i !== idx);
      queue.fromArray(nextQueue);
    }
    persistQueue();
    setDraft(null);
    return { ok: true, booking: record };
  };

  const cancelBooking = (bookingId) => {
    const booking = bookingList.search(bookingId);
    if (!booking) return { ok: false, error: 'missing' };
    if (booking.status === 'Cancelled') return { ok: false, error: 'already' };

    const updated = bookingList.update(bookingId, (item) => ({
      ...item,
      status: 'Cancelled',
      cancelledAt: new Date().toISOString(),
    }));

    const key = tripSeatKey(booking.tripId, booking.date);
    const maps = seatMapsRef.current;
    const current = maps[key];
    const releasedIds = uniqueSeatIds(booking.seats);
    if (current) {
      const released = setManySeatStatus(current, releasedIds, SEAT_STATUS.AVAILABLE);
      persistSeats({ ...maps, [key]: released });
    } else {
      const trip = getTripById(booking.tripId);
      if (trip) {
        const generated = createSeatArray(trip.type, key);
        const released = setManySeatStatus(generated, releasedIds, SEAT_STATUS.AVAILABLE);
        persistSeats({ ...maps, [key]: released });
      }
    }

    persistBookings(bookingList);
    return { ok: true, booking: updated };
  };

  const resetDemo = () => {
    resetAllStorage();
    bookingList.fromArray([]);
    queue.fromArray([]);
    setBookings([]);
    setQueueItems([]);
    setSeatMaps({});
    setSearchState(null);
    setDraftState(null);
    setAccount(defaultAccount);
    showToast('Demo data has been reset.', 'success');
  };

  const updateAccount = (next) => {
    saveJSON(STORAGE_KEYS.account, next);
    setAccount(next);
  };

  const value = useMemo(
    () => ({
      bookings,
      bookingList,
      queue,
      queueItems,
      seatMaps,
      search,
      setSearch,
      draft,
      setDraft,
      account,
      updateAccount,
      toast,
      setToast,
      showToast,
      modal,
      setModal,
      getSeats,
      availableCount,
      enqueueRequest,
      processQueue,
      clearQueue,
      confirmBooking,
      cancelBooking,
      resetDemo,
    }),
    [bookings, queueItems, seatMaps, search, draft, account, toast, modal],
  );

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within AppProvider');
  return ctx;
}
