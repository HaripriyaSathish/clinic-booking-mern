import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import AppRoutes from './routes/AppRoutes';
import { BookingProvider } from './context/BookingContext';

export default function App() {
  return (
    <BookingProvider>
      <AppRoutes />
      <ToastContainer position="top-right" autoClose={3000} />
    </BookingProvider>
  );
}
