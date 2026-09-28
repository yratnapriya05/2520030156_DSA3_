export function generateBookingId(existingIds = []) {
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, '0');
  const d = String(now.getDate()).padStart(2, '0');
  const set = new Set(existingIds);

  for (let i = 0; i < 50; i += 1) {
    const n = String(Math.floor(Math.random() * 10000)).padStart(4, '0');
    const id = `BK${y}${m}${d}${n}`;
    if (!set.has(id)) return id;
  }
  return `BK${y}${m}${d}${Date.now().toString().slice(-4)}`;
}

export function tripSeatKey(tripId, date) {
  return `${tripId}::${date}`;
}

export function formatINR(amount) {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(amount);
}

export function todayISO() {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

export function formatDisplayDate(iso) {
  if (!iso) return '—';
  const [y, m, d] = iso.split('-').map(Number);
  const date = new Date(y, m - 1, d);
  return date.toLocaleDateString('en-IN', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

export function computeFare(basePrice, seatCount) {
  const base = basePrice * seatCount;
  const taxes = Math.round(base * 0.05);
  return { base, taxes, total: base + taxes };
}

export function transportLabel(type) {
  if (type === 'flight') return 'Flight';
  if (type === 'train') return 'Train';
  return 'Bus';
}
