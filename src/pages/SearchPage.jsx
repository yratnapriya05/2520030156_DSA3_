import SearchPanel from '../components/SearchPanel';
import { useApp } from '../context/AppContext';

export default function SearchPage() {
  const { search } = useApp();
  return (
    <section className="section">
      <div className="container">
        <h2>Search Trips</h2>
        <p className="muted" style={{ marginBottom: 16 }}>
          Enter origin, destination, date and transport type. Results are filtered with linear search over the trip array.
        </p>
        <SearchPanel defaults={search || undefined} />
      </div>
    </section>
  );
}
