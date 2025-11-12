import React from 'react';
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
import CircleCursor from './components/CircleCursor';

const App = () => {
  return (
    <AuthProvider>
      <BrowserRouter>
        <CircleCursor />
        <Routes>
          <Route path="/" element={<FossApp />} />
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
