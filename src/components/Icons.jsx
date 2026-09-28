export function BusIcon() {
  return <span aria-hidden>🚌</span>;
}
export function FlightIcon() {
  return <span aria-hidden>✈️</span>;
}
export function TrainIcon() {
  return <span aria-hidden>🚆</span>;
}

export function TransportIcon({ type }) {
  if (type === 'flight') return <FlightIcon />;
  if (type === 'train') return <TrainIcon />;
  return <BusIcon />;
}
