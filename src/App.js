import React from 'react';
import { AuthProvider } from './context/AuthContext';
import ToastProvider from './components/NotificationToast';
import FossApp from './foss';
import 'aos/dist/aos.css';
import 'font-awesome/css/font-awesome.min.css';

const App = () => {
  return (
    <AuthProvider>
      <ToastProvider>
        <FossApp/>
      </ToastProvider>
    </AuthProvider>
  );
};

export default App;
