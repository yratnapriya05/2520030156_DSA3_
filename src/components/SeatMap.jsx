function SeatButton({ seat, visualStatus, onToggle }) {
  const disabled = seat.status === 'booked';
  return (
    <button
      type="button"
      className={`seat ${visualStatus}`}
      disabled={disabled}
      aria-pressed={visualStatus === 'selected'}
      onClick={() => {
        if (disabled) return;
        onToggle(seat);
      }}
      title={seat.berth ? `${seat.label} · ${seat.berth}` : seat.label}
    >
      {seat.label}
    </button>
  );
}

function groupByRow(seats) {
  const rows = [];
  const map = new Map();
  seats.forEach((seat) => {
    if (!map.has(seat.row)) {
      const row = [];
      map.set(seat.row, row);
      rows.push(row);
    }
    map.get(seat.row).push(seat);
  });
  return rows;
}

export default function SeatMap({ type, seats, selectedIds, onToggle }) {
  const selected = new Set(selectedIds);
  const visual = (seat) => {
    if (seat.status === 'booked') return 'booked';
    if (selected.has(seat.id)) return 'selected';
    return 'available';
  };

  const rows = groupByRow(seats);

  return (
    <div className="coach">
      <div className="coach-label">{type === 'flight' ? 'FRONT' : type === 'train' ? 'COACH A1' : 'DRIVER'}</div>
      {rows.map((rowSeats) => {
        const left = rowSeats.filter((s) => s.side === 'left');
        const right = rowSeats.filter((s) => s.side === 'right');
        return (
          <div className="seat-row" key={rowSeats[0].row}>
            {left.map((seat) => (
              <SeatButton key={seat.id} seat={seat} visualStatus={visual(seat)} onToggle={onToggle} />
            ))}
            <div className="aisle" aria-hidden />
            {right.map((seat) => (
              <SeatButton key={seat.id} seat={seat} visualStatus={visual(seat)} onToggle={onToggle} />
            ))}
          </div>
        );
      })}
      <div className="legend">
        <span>
          <i className="dot available" /> Available
        </span>
        <span>
          <i className="dot selected" /> Selected
        </span>
        <span>
          <i className="dot booked" /> Booked
        </span>
      </div>
    </div>
  );
}
