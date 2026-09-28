import { useState } from 'react';
import { useApp } from '../context/AppContext';

export default function Account() {
  const { account, updateAccount, resetDemo, showToast } = useApp();
  const [form, setForm] = useState(account);

  return (
    <section className="section">
      <div className="container">
        <h2>My Account</h2>
        <div className="card account-card" style={{ marginTop: 16 }}>
          <div className="field" style={{ marginBottom: 12 }}>
            <label>Full name</label>
            <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
          </div>
          <div className="field">
            <label>Email</label>
            <input value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
          </div>
          <button
            className="btn btn-primary"
            type="button"
            style={{ marginTop: 16 }}
            onClick={() => {
              updateAccount(form);
              showToast('Account saved.');
            }}
          >
            Save
          </button>
        </div>
        <div className="card account-card" style={{ marginTop: 16 }}>
          <h3>Demo reset</h3>
          <p className="muted">Clears bookings, seat occupancy, search draft and the waiting queue from localStorage.</p>
          <button className="btn btn-danger" type="button" style={{ marginTop: 12 }} onClick={resetDemo}>
            Reset demo data
          </button>
        </div>
      </div>
    </section>
  );
}
