/**
 * Linear search — O(n). Used for trip filters and booking text search.
 */
export function linearSearch(array, predicate) {
  const results = [];
  for (let i = 0; i < array.length; i += 1) {
    if (predicate(array[i], i)) results.push(array[i]);
  }
  return results;
}

export function linearSearchFirst(array, predicate) {
  for (let i = 0; i < array.length; i += 1) {
    if (predicate(array[i], i)) {
      return { item: array[i], index: i };
    }
  }
  return { item: null, index: -1 };
}

/**
 * Binary search — O(log n).
 * The array MUST already be sorted by booking id (ascending).
 */
export function binarySearchByBookingId(sortedBookings, bookingId) {
  let low = 0;
  let high = sortedBookings.length - 1;
  while (low <= high) {
    const mid = (low + high) >> 1;
    const id = sortedBookings[mid].id;
    if (id === bookingId) return { item: sortedBookings[mid], index: mid, comparisons: 0 };
    if (id < bookingId) low = mid + 1;
    else high = mid - 1;
  }
  return { item: null, index: -1 };
}

export function filterTrips(trips, { from, to, type }) {
  const source = from.trim().toLowerCase();
  const dest = to.trim().toLowerCase();
  return linearSearch(trips, (trip) => {
    const fromOk = trip.from.toLowerCase() === source;
    const toOk = trip.to.toLowerCase() === dest;
    const typeOk = !type || type === 'all' || trip.type === type;
    return fromOk && toOk && typeOk;
  });
}

export function searchBookings(bookings, query) {
  const q = query.trim().toLowerCase();
  if (!q) return bookings;
  return linearSearch(bookings, (booking) => {
    const seats = (booking.seats || []).join(' ').toLowerCase();
    const names = (booking.passengers || [])
      .map((p) => `${p.name || ''} ${p.seat || ''}`)
      .join(' ')
      .toLowerCase();
    return (
      booking.id.toLowerCase().includes(q) ||
      names.includes(q) ||
      booking.to.toLowerCase().includes(q) ||
      booking.from.toLowerCase().includes(q) ||
      (booking.operator || '').toLowerCase().includes(q) ||
      seats.includes(q.toUpperCase().toLowerCase()) ||
      seats.includes(q)
    );
  });
}
