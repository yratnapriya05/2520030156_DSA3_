export function downloadTicket(booking) {
  const seats = (booking.seats || []).join(', ');
  const names = (booking.passengers || [])
    .map((p, i) => {
      const seat = p.seat || (booking.seats || [])[i];
      return seat ? `${p.name} (Seat ${seat})` : p.name;
    })
    .join(', ');
  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <title>Ticket ${booking.id}</title>
  <style>
    body { font-family: Georgia, serif; background: #f3f1ea; padding: 32px; color: #1b1b1b; }
    .ticket { max-width: 640px; margin: 0 auto; background: #fff; border: 1px solid #d9d2c5;
      border-radius: 16px; overflow: hidden; box-shadow: 0 12px 40px rgba(0,0,0,.08); }
    .band { background: #0b3d4a; color: #f7e7c3; padding: 18px 24px; display: flex; justify-content: space-between; }
    .body { padding: 24px; }
    h1 { font-size: 22px; margin: 0 0 8px; }
    .muted { color: #666; font-size: 13px; }
    .grid { display: grid; grid-template-columns: 1fr 1fr; gap: 12px 20px; margin-top: 18px; }
    .label { font-size: 11px; letter-spacing: .08em; text-transform: uppercase; color: #888; }
    .value { font-size: 16px; margin-top: 2px; }
    .route { font-size: 26px; margin: 8px 0 0; }
    .foot { border-top: 1px dashed #ccc; margin-top: 24px; padding-top: 16px; display: flex; justify-content: space-between; }
    @media print { body { background: #fff; } }
  </style>
</head>
<body>
  <div class="ticket">
    <div class="band">
      <strong>VOYAGE E-TICKET</strong>
      <span>${booking.id}</span>
    </div>
    <div class="body">
      <div class="muted">${(booking.type || 'bus').toUpperCase()} · ${booking.operator}</div>
      <div class="route">${booking.from} → ${booking.to}</div>
      <div class="grid">
        <div><div class="label">Passenger(s)</div><div class="value">${names}</div></div>
        <div><div class="label">Date</div><div class="value">${booking.date}</div></div>
        <div><div class="label">Departure</div><div class="value">${booking.departure}</div></div>
        <div><div class="label">Arrival</div><div class="value">${booking.arrival}</div></div>
        <div><div class="label">Seats</div><div class="value">${seats}</div></div>
        <div><div class="label">Status</div><div class="value">${booking.status}</div></div>
      </div>
      <div class="foot">
        <div class="muted">Demo ticket · Seat Selection System</div>
        <div class="value">INR ${booking.total}</div>
      </div>
    </div>
  </div>
  <script>window.onload = () => setTimeout(() => window.print(), 300);</script>
</body>
</html>`;

  const blob = new Blob([html], { type: 'text/html' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `${booking.id}-ticket.html`;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}
