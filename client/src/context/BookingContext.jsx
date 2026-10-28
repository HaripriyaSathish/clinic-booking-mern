import { createContext, useCallback, useContext, useState } from 'react';
import Modal from '../components/common/Modal';
import AppointmentForm from '../components/booking/AppointmentForm';

const BookingContext = createContext(null);

// Any component can call openBooking() (optionally with { department_id, doctor_id }) to show the form
export function BookingProvider({ children }) {
  const [state, setState] = useState({ open: false, prefill: {} });

  const openBooking = useCallback((prefill = {}) => setState({ open: true, prefill }), []);
  const closeBooking = useCallback(() => setState((s) => ({ ...s, open: false })), []);

  return (
    <BookingContext.Provider value={{ openBooking, closeBooking }}>
      {children}
      <Modal open={state.open} onClose={closeBooking} title="Book an appointment">
        <AppointmentForm prefill={state.prefill} onClose={closeBooking} />
      </Modal>
    </BookingContext.Provider>
  );
}

export const useBooking = () => useContext(BookingContext);
