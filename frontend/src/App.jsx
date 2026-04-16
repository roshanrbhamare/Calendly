import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { ToastProvider } from './components/Toast';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import CreateEvent from './pages/CreateEvent';
import EditEvent from './pages/EditEvent';
import Availability from './pages/Availability';
import Meetings from './pages/Meetings';
import BookingFlow from './pages/BookingFlow';
import BookingConfirmation from './pages/BookingConfirmation';

function ThemeSwitcher() {
    const location = useLocation();
    useEffect(() => {
        const path = location.pathname;
        if (path === '/create-event' || path.startsWith('/edit-event') || path.startsWith('/book') || path === '/booking-confirmed') {
            document.documentElement.classList.remove('dark');
        } else {
            document.documentElement.classList.add('dark');
        }
    }, [location.pathname]);
    return null;
}

function App() {
  return (
    <ToastProvider>
      <Router>
        <ThemeSwitcher />
        <Routes>
          <Route path="/" element={<Layout><Dashboard /></Layout>} />
          <Route path="/create-event" element={<Layout><CreateEvent /></Layout>} />
          <Route path="/edit-event/:slug" element={<Layout><EditEvent /></Layout>} />
          <Route path="/availability" element={<Layout><Availability /></Layout>} />
          <Route path="/meetings" element={<Layout><Meetings /></Layout>} />
          
          {/* Public routes - no sidebar layout */}
          <Route path="/book/:slug" element={<BookingFlow />} />
          <Route path="/booking-confirmed" element={<BookingConfirmation />} />
        </Routes>
      </Router>
    </ToastProvider>
  );
}

export default App;
