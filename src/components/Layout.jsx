import { Outlet } from 'react-router-dom';
import Navbar from './Navbar';
import Footer from './Footer';
import Toast from './Toast';
import Modal from './Modal';

export default function Layout() {
  return (
    <div className="app-shell">
      <Navbar />
      <main className="page">
        <Outlet />
      </main>
      <Footer />
      <Toast />
      <Modal />
    </div>
  );
}
