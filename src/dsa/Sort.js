/**
 * Merge sort — O(n log n) time, O(n) extra space.
 * Used to order booking records before binary search and on the DSA dashboard.
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

export function mergeSort(array, compare) {
  if (!array || array.length <= 1) return array ? array.slice() : [];
  const mid = Math.floor(array.length / 2);
  const left = mergeSort(array.slice(0, mid), compare);
  const right = mergeSort(array.slice(mid), compare);
  return merge(left, right, compare);
}

function passengerName(booking) {
  return (booking.passengers || [])
    .map((p) => p.name || '')
    .join(' ')
    .toLowerCase();
}

export function sortByName(bookings) {
  return mergeSort(bookings, (a, b) => passengerName(a).localeCompare(passengerName(b)));
}

export function sortByDate(bookings) {
  return mergeSort(bookings, (a, b) => {
    const da = `${a.date || ''} ${a.departure || ''}`;
    const db = `${b.date || ''} ${b.departure || ''}`;
    return da.localeCompare(db);
  });
}

export function sortById(bookings) {
  return mergeSort(bookings, (a, b) => a.id.localeCompare(b.id));
}

export function sortByAmount(bookings) {
  return mergeSort(bookings, (a, b) => (a.total || 0) - (b.total || 0));
}

export const MERGE_SORT_META = {
  name: 'Merge Sort',
  time: 'O(n log n)',
  space: 'O(n)',
  stable: true,
};
