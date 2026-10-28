import { Routes, Route } from 'react-router-dom';
import Home from '../pages/Home';
import DoctorDetail from '../pages/DoctorDetail';
import DoctorsPage from '../pages/DoctorsPage';
import DepartmentDetail from '../pages/DepartmentDetail';
import BookingSuccess from '../pages/BookingSuccess';

import Login from '../admin/pages/Login';
import AdminLayout from '../admin/components/AdminLayout';
import ProtectedRoute from '../admin/components/ProtectedRoute';
import Dashboard from '../admin/pages/Dashboard';
import Appointments from '../admin/pages/Appointments';
import Doctors from '../admin/pages/Doctors';
import DoctorSchedules from '../admin/pages/DoctorSchedules';
import Departments from '../admin/pages/Departments';
import HeroEditor from '../admin/pages/HeroEditor';
import AboutEditor from '../admin/pages/AboutEditor';
import Stats from '../admin/pages/Stats';
import Services from '../admin/pages/Services';
import Testimonials from '../admin/pages/Testimonials';
import Gallery from '../admin/pages/Gallery';
import FAQs from '../admin/pages/FAQs';
import Timings from '../admin/pages/Timings';
import Messages from '../admin/pages/Messages';
import SiteSettings from '../admin/pages/SiteSettings';

export default function AppRoutes() {
  return (
    <Routes>
      {/* Public website */}
      <Route path="/" element={<Home />} />
      <Route path="/doctors" element={<DoctorsPage />} />
      <Route path="/doctors/:slug" element={<DoctorDetail />} />
      <Route path="/departments/:slug" element={<DepartmentDetail />} />
      <Route path="/booking-success" element={<BookingSuccess />} />

      {/* Admin panel */}
      <Route path="/admin/login" element={<Login />} />
      <Route path="/admin" element={<ProtectedRoute><AdminLayout /></ProtectedRoute>}>
        <Route index element={<Dashboard />} />
        <Route path="appointments" element={<Appointments />} />
        <Route path="doctors" element={<Doctors />} />
        <Route path="schedules" element={<DoctorSchedules />} />
        <Route path="departments" element={<Departments />} />
        <Route path="hero" element={<HeroEditor />} />
        <Route path="about" element={<AboutEditor />} />
        <Route path="stats" element={<Stats />} />
        <Route path="services" element={<Services />} />
        <Route path="testimonials" element={<Testimonials />} />
        <Route path="gallery" element={<Gallery />} />
        <Route path="faqs" element={<FAQs />} />
        <Route path="timings" element={<Timings />} />
        <Route path="messages" element={<Messages />} />
        <Route path="settings" element={<SiteSettings />} />
      </Route>
    </Routes>
  );
}
