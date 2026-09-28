import { todayISO } from './format';
import { generateSeatsForType, uniqueSeatIds } from '../dsa/SeatArray';

export function parsePassengerCount(value, fallback = 1) {
  const n = Number(value);
  if (Number.isInteger(n) && n >= 1) return n;
  return fallback;
}

export function searchPassengerMax(type) {
  if (!type || type === 'all') return 20;
  return generateSeatsForType(type).length;
}

export function validateSearch({ from, to, date, passengers, type }) {
  const errors = {};
  if (!from) errors.from = 'Please select a departure city.';
  if (!to) errors.to = 'Please select a destination city.';
  if (from && to && from === to) errors.to = 'Destination must be different from origin.';
  if (!date) errors.date = 'Please choose a travel date.';
  else if (date < todayISO()) {
    errors.date = 'Travel date cannot be in the past.';
  }
  const count = Number(passengers);
  if (!Number.isInteger(count) || count < 1) {
    errors.passengers = 'At least 1 passenger is required.';
  } else {
    const typeMax = searchPassengerMax(type);
    if (count > typeMax) {
      errors.passengers = `You can select up to ${typeMax} passengers for this transport type.`;
    }
  }
  if (!type) errors.type = 'Please choose a transport type.';
  return errors;
}

/**
 * Passenger count must stay an integer. Never treat a details array as a cap of 1,
 * and never use a leftover passengerCount: 1 when seats were already chosen.
 */
export function resolvePassengerCount(source) {
  if (!source) return 1;
  if (Array.isArray(source.seats) && source.seats.length > 1) {
    const fromSeats = uniqueSeatIds(source.seats).length;
    if (fromSeats >= 1) {
      const declared = Number(source.passengerCount);
      if (Number.isInteger(declared) && declared >= fromSeats) return declared;
      return fromSeats;
    }
  }
  const fromCount = Number(source.passengerCount);
  if (Number.isInteger(fromCount) && fromCount >= 1) return fromCount;
  if (Array.isArray(source.passengers) && source.passengers.length && typeof source.passengers[0] === 'object') {
    return Math.max(1, source.passengers.length);
  }
  const fromPassengers = Number(source.passengers);
  if (Number.isInteger(fromPassengers) && fromPassengers >= 1) return fromPassengers;
  if (Array.isArray(source.seats) && source.seats.length >= 1) return uniqueSeatIds(source.seats).length;
  return 1;
}

export function passengerDetailList(source) {
  if (!source) return [];
  if (Array.isArray(source.passengers) && source.passengers.some((p) => p && typeof p === 'object')) {
    return source.passengers.filter((p) => p && typeof p === 'object');
  }
  return [];
}

export function attachSeatsToPassengers(passengers, seats) {
  const ids = uniqueSeatIds(seats);
  const list = Array.isArray(passengers) ? passengers.filter((p) => p && typeof p === 'object') : [];
  return ids.map((seat, i) => ({
    name: '',
    age: '',
    gender: '',
    phone: '',
    email: '',
    ...(list[i] || {}),
    seat,
  }));
}

export function tooFewSeatsMessage() {
  return 'Please select seats for all passengers.';
}

export function tooManySeatsMessage(count) {
  const n = parsePassengerCount(count, 1);
  return `You can select only ${n} seats for ${n} passenger${n === 1 ? '' : 's'}.`;
}

export function seatMatchMessage(count) {
  const n = parsePassengerCount(count, 1);
  return `Please select ${n} seat${n === 1 ? '' : 's'} for ${n} passenger${n === 1 ? '' : 's'}.`;
}

export function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
}

export function isValidPhone(phone) {
  return /^[6-9]\d{9}$/.test(phone.trim());
}

export function validatePassengers(passengers) {
  const errors = passengers.map(() => ({}));
  let valid = true;

  passengers.forEach((p, i) => {
    if (!p.name || p.name.trim().length < 3) {
      errors[i].name = 'Enter full name (min 3 characters).';
      valid = false;
    }
    const age = Number(p.age);
    if (!age || age < 1 || age > 120) {
      errors[i].age = 'Enter a valid age between 1 and 120.';
      valid = false;
    }
    if (!p.gender) {
      errors[i].gender = 'Select gender.';
      valid = false;
    }
    if (!isValidPhone(p.phone || '')) {
      errors[i].phone = 'Enter a valid 10-digit Indian mobile number.';
      valid = false;
    }
    if (!isValidEmail(p.email || '')) {
      errors[i].email = 'Enter a valid email address.';
      valid = false;
    }
  });

  return { valid, errors };
}
