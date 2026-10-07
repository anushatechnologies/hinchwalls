import { Outlet } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import Header from '../components/Header';
import Footer from '../components/Footer';
import CartDrawer from '../components/CartDrawer';

export default function MainLayout() {
  return (
    <div className="min-h-screen flex flex-col bg-warm-white">
      <Header />
      <CartDrawer />
      <main className="flex-1">
        <Outlet />
      </main>
      <Footer />
      <Toaster
        position="bottom-right"
        toastOptions={{
          style: {
            background: '#2c2c2c',
            color: '#faf8f5',
            fontSize: '14px',
            borderRadius: '10px',
          },
        }}
      />
    </div>
  );
}
