import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { AppProvider } from './context/AppContext';
import Layout from './components/Layout';
import Home from './pages/Home';
import SearchPage from './pages/SearchPage';
import SearchResults from './pages/SearchResults';
import SeatSelection from './pages/SeatSelection';
import PassengerDetails from './pages/PassengerDetails';
import Payment from './pages/Payment';
import Confirmation from './pages/Confirmation';
import MyBookings from './pages/MyBookings';
import BookingDetail from './pages/BookingDetail';
import DsaAnalysis from './pages/DsaAnalysis';
import DsaAlgorithms from './pages/DsaAlgorithms';
import Account from './pages/Account';

export default function App() {
  return (
    <AppProvider>
      <BrowserRouter>
        <Routes>
          <Route element={<Layout />}>
            <Route path="/" element={<Home />} />
            <Route path="/search" element={<SearchPage />} />
            <Route path="/results" element={<SearchResults />} />
            <Route path="/seats/:tripId" element={<SeatSelection />} />
            <Route path="/passengers" element={<PassengerDetails />} />
            <Route path="/payment" element={<Payment />} />
            <Route path="/confirmation/:bookingId" element={<Confirmation />} />
            <Route path="/bookings" element={<MyBookings />} />
            <Route path="/bookings/:bookingId" element={<BookingDetail />} />
            <Route path="/dsa" element={<DsaAnalysis />} />
            <Route path="/dsa-algorithms" element={<DsaAlgorithms />} />
            <Route path="/account" element={<Account />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </AppProvider>
  );
}
