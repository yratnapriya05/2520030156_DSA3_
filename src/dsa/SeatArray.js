/** Seat statuses used across the UI and persistence layer. */
export const SEAT_STATUS = {
  AVAILABLE: 'available',
  SELECTED: 'selected',
  BOOKED: 'booked',
};

/**
 * Array-based seat representation.
 * Access by index is O(1). Lookup by id uses an index map for O(1) access.
 */
export function createIndexMap(seats) {
  const map = Object.create(null);
  for (let i = 0; i < seats.length; i += 1) {
    map[seats[i].id] = i;
  }
  return map;
}

export function getSeatById(seats, id, indexMap) {
  const map = indexMap || createIndexMap(seats);
  const index = map[id];
  if (index === undefined) return null;
  return seats[index];
}

export function setSeatStatus(seats, id, status) {
  const next = seats.map((seat) => ({ ...seat }));
  const map = createIndexMap(next);
  const index = map[id];
  if (index === undefined) return next;
  next[index] = { ...next[index], status };
  return next;
}

export function setManySeatStatus(seats, ids, status) {
  const idSet = new Set(ids);
  return seats.map((seat) => (idSet.has(seat.id) ? { ...seat, status } : { ...seat }));
}

export function uniqueSeatIds(ids) {
  const seen = new Set();
  const out = [];
  if (!ids) return out;
  for (let i = 0; i < ids.length; i += 1) {
    const id = ids[i];
    if (id == null || seen.has(id)) continue;
    seen.add(id);
    out.push(id);
  }
  return out;
}

export function countByStatus(seats, status) {
  let count = 0;
  for (let i = 0; i < seats.length; i += 1) {
    if (seats[i].status === status) count += 1;
  }
  return count;
}

export function cloneSeats(seats) {
  return seats.map((seat) => ({ ...seat }));
}

function hashSeed(seed) {
  let h = 2166136261;
  for (let i = 0; i < seed.length; i += 1) {
    h ^= seed.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

/** Deterministic occupancy so demos look realistic before any bookings exist. */
export function applySeededOccupancy(seats, seed, ratio = 0.22) {
  const h = hashSeed(seed);
  return seats.map((seat, i) => {
    const n = (h + i * 9973) % 1000;
    const booked = n < Math.floor(ratio * 1000);
    return {
      ...seat,
      status: booked ? SEAT_STATUS.BOOKED : SEAT_STATUS.AVAILABLE,
    };
  });
}

export function generateBusSeats() {
  const seats = [];
  const rows = 10;
  const cols = ['A', 'B', 'C'];
  for (let row = 1; row <= rows; row += 1) {
    for (const col of cols) {
      seats.push({
        id: `${row}${col}`,
        label: `${row}${col}`,
        row,
        col,
        side: col === 'C' ? 'right' : 'left',
        status: SEAT_STATUS.AVAILABLE,
        kind: 'seat',
      });
    }
  }
  return seats;
}

export function generateFlightSeats() {
  const seats = [];
  const rows = 12;
  const cols = ['A', 'B', 'C', 'D', 'E', 'F'];
  for (let row = 1; row <= rows; row += 1) {
    for (const col of cols) {
      seats.push({
        id: `${row}${col}`,
        label: `${row}${col}`,
        row,
        col,
        side: col <= 'C' ? 'left' : 'right',
        status: SEAT_STATUS.AVAILABLE,
        kind: 'seat',
      });
    }
  }
  return seats;
}

export function generateTrainSeats() {
  const seats = [];
  const bays = 6;
  const berths = [
    { col: 'LB', side: 'left', name: 'Lower' },
    { col: 'MB', side: 'left', name: 'Middle' },
    { col: 'UB', side: 'left', name: 'Upper' },
    { col: 'SL', side: 'right', name: 'Side Lower' },
    { col: 'SU', side: 'right', name: 'Side Upper' },
  ];
  for (let bay = 1; bay <= bays; bay += 1) {
    for (const berth of berths) {
      const id = `${bay}${berth.col}`;
      seats.push({
        id,
        label: `${bay} ${berth.col}`,
        row: bay,
        col: berth.col,
        side: berth.side,
        berth: berth.name,
        status: SEAT_STATUS.AVAILABLE,
        kind: 'berth',
      });
    }
  }
  return seats;
}

export function generateSeatsForType(type) {
  if (type === 'flight') return generateFlightSeats();
  if (type === 'train') return generateTrainSeats();
  return generateBusSeats();
}

export function createSeatArray(type, seed) {
  const seats = generateSeatsForType(type);
  return applySeededOccupancy(seats, seed);
}
