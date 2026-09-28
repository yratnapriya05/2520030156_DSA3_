/**
 * Step tracers for viva demos. They follow the same control flow as the
 * production functions in Search.js and Sort.js without changing those files.
 */

function merge(left, right, compare) {
  const out = [];
  let i = 0;
  let j = 0;
  while (i < left.length && j < right.length) {
    if (compare(left[i], right[j]) <= 0) {
      out.push(left[i]);
      i += 1;
    } else {
      out.push(right[j]);
      j += 1;
    }
  }
  while (i < left.length) {
    out.push(left[i]);
    i += 1;
  }
  while (j < right.length) {
    out.push(right[j]);
    j += 1;
  }
  return out;
}

export function mergeSortWithTrace(array, compare, traces = []) {
  const source = array ? array.slice() : [];
  if (source.length <= 1) {
    traces.push({ type: 'base', values: source.map(labelOf) });
    return { sorted: source, traces };
  }
  const mid = Math.floor(source.length / 2);
  const leftPart = source.slice(0, mid);
  const rightPart = source.slice(mid);
  traces.push({
    type: 'divide',
    values: source.map(labelOf),
    left: leftPart.map(labelOf),
    right: rightPart.map(labelOf),
  });
  const left = mergeSortWithTrace(leftPart, compare, traces).sorted;
  const right = mergeSortWithTrace(rightPart, compare, traces).sorted;
  const merged = merge(left, right, compare);
  traces.push({
    type: 'merge',
    left: left.map(labelOf),
    right: right.map(labelOf),
    merged: merged.map(labelOf),
  });
  return { sorted: merged, traces };
}

function labelOf(item) {
  if (item == null) return String(item);
  if (typeof item === 'string' || typeof item === 'number') return String(item);
  return item.id || JSON.stringify(item);
}

export function linearSearchTrace(array, targetId) {
  const steps = [];
  for (let i = 0; i < array.length; i += 1) {
    const id = array[i]?.id;
    const hit = id === targetId;
    steps.push({ index: i, id, hit });
    if (hit) return { found: true, index: i, item: array[i], steps };
  }
  return { found: false, index: -1, item: null, steps };
}

export function binarySearchTrace(sortedBookings, bookingId) {
  const steps = [];
  let low = 0;
  let high = sortedBookings.length - 1;
  while (low <= high) {
    const mid = (low + high) >> 1;
    const id = sortedBookings[mid].id;
    let move = 'found';
    if (id === bookingId) {
      steps.push({ low, high, mid, id, compare: `${id} === ${bookingId}`, move });
      return { found: true, index: mid, item: sortedBookings[mid], steps };
    }
    if (id < bookingId) {
      move = 'right (low = mid + 1)';
      steps.push({ low, high, mid, id, compare: `${id} < ${bookingId}`, move });
      low = mid + 1;
    } else {
      move = 'left (high = mid - 1)';
      steps.push({ low, high, mid, id, compare: `${id} > ${bookingId}`, move });
      high = mid - 1;
    }
  }
  return { found: false, index: -1, item: null, steps };
}

export function byBookingId(a, b) {
  return a.id.localeCompare(b.id);
}
