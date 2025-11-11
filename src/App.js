import React, { useEffect, useState } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import 'aos/dist/aos.css';
import 'font-awesome/css/font-awesome.min.css';
import FossApp from './foss';
import { AuthProvider } from './context/AuthContext';
import Login from './pages/Login';
import Register from './pages/Register';
import SelectRole from './pages/SelectRole';
import MentorDashboard from './pages/MentorDashboard';
import OfficeDashboard from './pages/OfficeDashboard';
import Events from './pages/Events';
import EventRegistration from './pages/EventRegistration';
import ProtectedRoute from './components/ProtectedRoute';
import CarCursor from './components/CarCursor';

const App = () => {
  const [isMobileCursor, setIsMobileCursor] = useState(false);

  useEffect(() => {
    const evaluate = () => {
      if (typeof window === 'undefined') {
        setIsMobileCursor(false);
        return;
      }
      setIsMobileCursor(window.innerWidth < 768);
    };
    evaluate();
    window.addEventListener('resize', evaluate);
    return () => window.removeEventListener('resize', evaluate);
  }, []);

  return (
    <AuthProvider>
      <BrowserRouter>
        <CarCursor mode="car" isMobile={isMobileCursor} />
        <Routes>
          <Route path="/" element={<FossApp cursorMode="car" isMobileCursor={isMobileCursor} />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route
            path="/select-role"
            element={
              <ProtectedRoute>
                <SelectRole />
              </ProtectedRoute>
            }
          />
          <Route
            path="/mentor"
            element={
              <ProtectedRoute requireRole="mentor">
                <MentorDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/office"
            element={
              <ProtectedRoute requireRole="office_bearer">
                <OfficeDashboard />
              </ProtectedRoute>
            }
          />
          <Route path="/events" element={<Events />} />
          <Route path="/events/:id" element={<EventRegistration />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
};

export default App;
